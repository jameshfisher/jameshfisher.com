---
title: How does `ping` work?
tags:
  - programming
  - networking
---

You may have used `ping` before,
perhaps to check whether a machine is accessible,
or to check whether you're online.
It looks like this:

```console
$ ping google.com
PING google.com (172.217.7.238) 56(84) bytes of data.
64 bytes from iad23s58-in-f14.1e100.net (172.217.7.238): icmp_seq=1 ttl=48 time=0.742 ms
64 bytes from iad23s58-in-f14.1e100.net (172.217.7.238): icmp_seq=2 ttl=48 time=0.690 ms
64 bytes from iad23s58-in-f14.1e100.net (172.217.7.238): icmp_seq=3 ttl=48 time=0.705 ms
64 bytes from iad23s58-in-f14.1e100.net (172.217.7.238): icmp_seq=4 ttl=48 time=0.700 ms
64 bytes from iad23s58-in-f14.1e100.net (172.217.7.238): icmp_seq=5 ttl=48 time=0.711 ms
^C
--- google.com ping statistics ---
5 packets transmitted, 5 received, 0% packet loss, time 3998ms
rtt min/avg/max/mdev = 0.690/0.709/0.742/0.034 ms
```

What is `ping` doing?
A clue is in the output, e.g. `icmp_seq=1`.
The `ping` program uses a protocol called ICMP,
or "Internet Control Message Protocol".

The ICMP protocol sits above IP - all ICMP messages are wrapped in an IP message.
ICMP is distinct from TCP, UDP, and other IP protocols.
ICMP has a distinguished position: it has IP protocol number `1`.

The `tcpdump` program can filter by IP protocol.
The expression `icmp` will exclude everything except ICMP packets.
Here are the ICMP packets exchanged by `ping google.com`:

```console
$ sudo tcpdump -n 'icmp'
tcpdump: verbose output suppressed, use -v or -vv for full protocol decode
listening on eth0, link-type EN10MB (Ethernet), capture size 262144 bytes
19:50:49.344020 IP 10.27.0.171 > 172.217.7.238: ICMP echo request, id 27581, seq 1, length 64
19:50:49.344758 IP 172.217.7.238 > 10.27.0.171: ICMP echo reply, id 27581, seq 1, length 64
19:50:50.343020 IP 10.27.0.171 > 172.217.7.238: ICMP echo request, id 27581, seq 2, length 64
19:50:50.343705 IP 172.217.7.238 > 10.27.0.171: ICMP echo reply, id 27581, seq 2, length 64
19:50:51.342515 IP 10.27.0.171 > 172.217.7.238: ICMP echo request, id 27581, seq 3, length 64
19:50:51.343214 IP 172.217.7.238 > 10.27.0.171: ICMP echo reply, id 27581, seq 3, length 64
19:50:52.342531 IP 10.27.0.171 > 172.217.7.238: ICMP echo request, id 27581, seq 4, length 64
19:50:52.343223 IP 172.217.7.238 > 10.27.0.171: ICMP echo reply, id 27581, seq 4, length 64
19:50:53.342522 IP 10.27.0.171 > 172.217.7.238: ICMP echo request, id 27581, seq 5, length 64
19:50:53.343226 IP 172.217.7.238 > 10.27.0.171: ICMP echo reply, id 27581, seq 5, length 64
```

Each line in `ping`'s output corresponds to
an "echo request" packet followed by an "echo reply".

Unlike TCP and UDP, ICMP has no notion of "ports".
Ports in TCP and UDP help identify separate conversations,
and let the operating system delegate those conversations to processes.
Instead, each ICMP echo packet has an "identifier" and "sequence number".
The identifier in the above conversation is `27581`.
If you run `ping` again, a different identifier will be chosen.
The sequence number starts at `1` and increments by echo request.
The echo reply matches the sequence number of the echo request.

Notice that `ping google.com` doesn't require `sudo`.
By running `strace ping google.com`, we can see how `ping` is able to send ICMP packets:

```console
$ strace ping google.com
...
capset({_LINUX_CAPABILITY_VERSION_3, 0}, {CAP_NET_RAW, CAP_NET_ADMIN|CAP_NET_RAW, 0}) = 0
socket(PF_INET, SOCK_RAW, IPPROTO_ICMP) = 3
capset({_LINUX_CAPABILITY_VERSION_3, 0}, {0, CAP_NET_ADMIN|CAP_NET_RAW, 0}) = 0
...
```

The process is able to create a `SOCK_RAW` socket by obtaining the `CAP_NET_RAW` capability.
The process obtains `CAP_NET_RAW`, creates the `IPPROTO_ICMP` socket, then gives up that capability.
