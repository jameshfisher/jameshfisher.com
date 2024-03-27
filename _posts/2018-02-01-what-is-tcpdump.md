---
title: What is `tcpdump`?
tags:
  - programming
  - unix
---

Say I make a DNS request:

```
$ dig +short @8.8.8.8 google.com
216.58.206.46
```

What went over the network?
We can find out with a program called `tcpdump`!
`tcpdump` is a command-line program
which can prints everything that goes over a network interface on a UNIX box.
Let's see an example, getting all DNS traffic.
DNS requests go over UDP port 53.
We ask `tcpdump` for this using the expression `udp and port 53`:

```
$ sudo tcpdump -n 'udp and port 53'
tcpdump: data link type PKTAP
tcpdump: verbose output suppressed, use -v or -vv for full protocol decode
listening on pktap, link-type PKTAP (Apple DLT_PKTAP), capture size 262144 bytes
23:21:50.909488 IP 192.168.1.4.61988 > 192.168.1.254.53: 61163+ [1au] A? google.com. (39)
23:21:50.929583 IP 192.168.1.254.53 > 192.168.1.4.61988: 61163 1/0/1 A 216.58.208.142 (55)
```

The output shows exactly two UDP packets.
One for the DNS request,
the next for the response.

You'll notice that `tcpdump` is terribly named!
It does not just dump TCP; it can dump all manner of network activity:
UDP, IP, ICMP, Ethernet, and many others.
