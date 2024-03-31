---
title: What is the routing table in Linux?
tags: []
summary: >-
  When a packet arrives, Linux determines which network interface should handle
  it. It uses the first rule in the routing table that matches the destination address. Surprisingly, all `127.0.0.0/8` addresses go to the loopback interface.
---

You may have used the IP address `127.0.0.1` before.
You may not have used `127.0.0.2`.
What is this?
Try it out by listening on this IP address:

```console
$ nc -l 127.0.0.2 1234
```

Now, from the same machine, you can open a TCP connection,
and have a conversation:

```console
$ nc 127.0.0.2 1234
hello!
hey
```

This was new to me!
How is this working?
Let's see what's going on at the IP packet level
using `tcpdump`:

```console
$ sudo tcpdump -n -i lo
tcpdump: verbose output suppressed, use -v or -vv for full protocol decode
listening on lo, link-type EN10MB (Ethernet), capture size 262144 bytes
00:41:53.550184 IP 127.0.0.1.39070 > 127.0.0.2.1234: Flags [S], seq 273312456, win 43690, options [mss 65495,sackOK,TS val 633989 ecr 0,nop,wscale 6], length 0
00:41:53.550192 IP 127.0.0.2.1234 > 127.0.0.1.39070: Flags [S.], seq 858890764, ack 273312457, win 43690, options [mss 65495,sackOK,TS val 633989 ecr 633989,nop,wscale 6], length 0
00:41:53.550200 IP 127.0.0.1.39070 > 127.0.0.2.1234: Flags [.], ack 1, win 683, options [nop,nop,TS val 633989 ecr 633989], length 0
```

All traffic happens over the `lo` interface, or "loopback".
I was aware that packets to `127.0.0.1` would go to the loopback interface,
but it seems that packets to `127.0.0.2` also go to the loopback interface.
Notice that `127.0.0.1` is still used as the IP address opening the connection,
and `127.0.0.1` is used in the response packets.
How does this happen?

Linux has some procedures to determine which network interface should get a packet.
This procedure is called "routing".
Linux determines the route based on the destination IP address of the packet.
The procedure uses the Linux "routing policy database",
which is a list of rules.
We can see that list with the `ip` tool:

```console
$ ip rule show
0:	from all lookup local
32766:	from all lookup main
32767:	from all lookup default
```

Linux visits each of these rules in order
until one of them determines a route.
So Linux first runs the rule `from all lookup local`.
This says to look in the table called `local`.
We can see that table with another `ip` command:

```console
$ ip route show table local
broadcast 10.0.2.0 dev eth0  proto kernel  scope link  src 10.0.2.15
local 10.0.2.15 dev eth0  proto kernel  scope host  src 10.0.2.15
broadcast 10.0.2.255 dev eth0  proto kernel  scope link  src 10.0.2.15
broadcast 127.0.0.0 dev lo  proto kernel  scope link  src 127.0.0.1
local 127.0.0.0/8 dev lo  proto kernel  scope host  src 127.0.0.1
local 127.0.0.1 dev lo  proto kernel  scope host  src 127.0.0.1
broadcast 127.255.255.255 dev lo  proto kernel  scope link  src 127.0.0.1
```

Our packet with destination `127.0.0.2` matches the following route:

```
local 127.0.0.0/8 dev lo  proto kernel  scope host  src 127.0.0.1
```

`127.0.0.2` matches the subnet `127.0.0.0/8`, i.e. `127.*.*.*`.
(So we could even have used the address `127.42.43.45`.)
`dev lo` says, "put this packet on the loopback device."
