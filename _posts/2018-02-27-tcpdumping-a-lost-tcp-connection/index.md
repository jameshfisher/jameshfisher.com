---
title: What does Linux do with a lost TCP connection?
tags:
  - programming
  - unix
  - networking
summary: >-
  Linux uses exponential backoff to retry dropped TCP connections, with
  a configurable retry limit.
---

We can simulate a dropped TCP connection using two virtual machines.
I have two machines, `tcpserver` and `tcpclient`.
On `tcpserver`, I run `nc -l 0.0.0.0 -p 12345`,
listening on TCP port `12345` for a new connection.
Then from `tcpclient`, I run `tcpdump` to spy on our connection:

```console
jim@tcpclient:~$ sudo tcpdump -i eth1 -n 'tcp port 12345'
tcpdump: verbose output suppressed, use -v or -vv for full protocol decode
listening on eth1, link-type EN10MB (Ethernet), capture size 262144 bytes
```

From `tcpclient`, I start a new connection:

```console
jim@tcpclient:~$ nc 192.168.33.10 12345
hello
hi
```

I immediately see the TCP three-way handshake:

```
14:47:25.710372 IP 192.168.33.11.60739 > 192.168.33.10.12345: Flags [S], seq 3041775903, win 29200, options [mss 1460,sackOK,TS val 4637 ecr 0,nop,wscale 6], length 0
14:47:25.710675 IP 192.168.33.10.12345 > 192.168.33.11.60739: Flags [S.], seq 2649418967, ack 3041775904, win 28960, options [mss 1460,sackOK,TS val 5194 ecr 4637,nop,wscale 6], length 0
14:47:25.710695 IP 192.168.33.11.60739 > 192.168.33.10.12345: Flags [.], ack 1, win 457, options [nop,nop,TS val 4637 ecr 5194], length 0
```

With `netstat`, I can see the TCP connection state on the client.
It's `ESTABLISHED`, and the TCP buffers are empty.
All is healthy:

```console
jim@tcpclient:~$ sudo netstat -tpn
Active Internet connections (w/o servers)
Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name
tcp        0      0 192.168.33.11:60739     192.168.33.10:12345     ESTABLISHED 2060/nc
```

Next, I pause the `tcpserver` VM (in VirtualBox).
This simulates the server dying, or the network dying, or the server cutting off the client uncleanly.
`tcpdump` and `netstat` detect nothing!
No data is being transferred, so all seems normal.
Now send some bytes from the client connection, e.g. `is anyone there?`.
`nc` gives no indication that the bytes are not sent,
but we can see this from `netstat` ...

```console
jim@tcpclient:~$ sudo netstat -tpn
Active Internet connections (w/o servers)
Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name
tcp        0     17 192.168.33.11:60739     192.168.33.10:12345     ESTABLISHED 2060/nc
```

The connection is still `ESTABLISHED`,
but notice that the `Send-Q` has 17 bytes in it, i.e. the string `"is anyone there?\n"`.
With `tcpdump`, we can see the OS repeatedly trying to send these bytes:

```
14:53:10.384563 IP 192.168.33.11.60739 > 192.168.33.10.12345: Flags [P.], seq 22:39, ack 6, win 457, options [nop,nop,TS val 90806 ecr 87171], length 17
14:53:10.589005 IP 192.168.33.11.60739 > 192.168.33.10.12345: Flags [P.], seq 22:39, ack 6, win 457, options [nop,nop,TS val 90857 ecr 87171], length 17
14:53:10.792272 IP 192.168.33.11.60739 > 192.168.33.10.12345: Flags [P.], seq 22:39, ack 6, win 457, options [nop,nop,TS val 90908 ecr 87171], length 17
14:53:11.201529 IP 192.168.33.11.60739 > 192.168.33.10.12345: Flags [P.], seq 22:39, ack 6, win 457, options [nop,nop,TS val 91010 ecr 87171], length 17
14:53:12.015841 IP 192.168.33.11.60739 > 192.168.33.10.12345: Flags [P.], seq 22:39, ack 6, win 457, options [nop,nop,TS val 91214 ecr 87171], length 17
14:53:13.653392 IP 192.168.33.11.60739 > 192.168.33.10.12345: Flags [P.], seq 22:39, ack 6, win 457, options [nop,nop,TS val 91623 ecr 87171], length 17
14:53:16.922019 IP 192.168.33.11.60739 > 192.168.33.10.12345: Flags [P.], seq 22:39, ack 6, win 457, options [nop,nop,TS val 92440 ecr 87171], length 17
14:53:23.464003 IP 192.168.33.11.60739 > 192.168.33.10.12345: Flags [P.], seq 22:39, ack 6, win 457, options [nop,nop,TS val 94076 ecr 87171], length 17
14:53:36.535794 IP 192.168.33.11.60739 > 192.168.33.10.12345: Flags [P.], seq 22:39, ack 6, win 457, options [nop,nop,TS val 97344 ecr 87171], length 17
```

Notice the timestamps:
it tries again after 204ms, 203ms, 409ms, 814ms, 1637ms, 3268ms, 6541ms, 13071ms ...
this is exponential backoff,
doubling each time.

Linux eventually gives up after 15 retries.
This works out at around 30 minutes.
The number of retries is configurable as `/proc/sys/net/ipv4/tcp_retries2`.
One can edit it with `echo 5 > /proc/sys/net/ipv4/tcp_retries2`.

When Linux gives up,
the connection goes directly from `ESTABLISHED` to disappearing entirely.
This transition seems to be omitted from the TCP state transition diagrams I've seen.
