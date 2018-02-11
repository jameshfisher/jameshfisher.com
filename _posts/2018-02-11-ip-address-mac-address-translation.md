---
title: "How does an IP address get translated to a MAC address?"
tags: ["programming", "networking"]
---

For an IP packet to be sent, it must be encapsulated in an Ethernet frame.
The Ethernet frame contains the source and destination "MAC addresses".
We can see these MAC addresses in each frame
by using `tcpdump` with the `-e` flag.
Here's a normal `tcpdump` at the IP level:

```console
$ sudo tcpdump -n -i eth0 'udp port 53'
tcpdump: verbose output suppressed, use -v or -vv for full protocol decode
listening on eth0, link-type EN10MB (Ethernet), capture size 262144 bytes
20:45:48.333534 IP 10.27.0.171.38930 > 8.8.8.8.53: 23412+ [1au] A? google.com. (39)
20:45:48.344833 IP 8.8.8.8.53 > 10.27.0.171.38930: 23412 1/0/1 A 172.217.5.238 (55)
```

To generate those two lines, I ran `dig @8.8.8.8 google.com`.
You can see the query to `8.8.8.8`, then the response.
But if we add `-e`, we get Ethernet-level info:

```console
$ sudo tcpdump -en -i eth0 'udp port 53'
tcpdump: verbose output suppressed, use -v or -vv for full protocol decode
listening on eth0, link-type EN10MB (Ethernet), capture size 262144 bytes
20:42:09.816353 0a:dc:c7:f3:44:fe > 0a:b9:eb:4d:d2:a4, ethertype IPv4 (0x0800), length 81: 10.27.0.171.59324 > 8.8.8.8.53: 24499+ [1au] A? google.com. (39)
20:42:09.826878 0a:b9:eb:4d:d2:a4 > 0a:dc:c7:f3:44:fe, ethertype IPv4 (0x0800), length 97: 8.8.8.8.53 > 10.27.0.171.59324: 24499 1/0/1 A 172.217.5.238 (55)
```

`tcpdump -e` shows a conversation between two MAC addresses,
`0a:dc:c7:f3:44:fe` and `0a:b9:eb:4d:d2:a4`.
What are these?

The MAC address `0a:dc:c7:f3:44:fe` is my Ethernet card's address.
This is hardcoded in the hardware.
(Actually, many network cards support changing the MAC address,
but the important point is that the card is in control of its own address,
and doesn't have it assigned or leased from some other party.)
I can see the address for this card with:

```console
$ ifconfig eth0
eth0      Link encap:Ethernet  HWaddr 0a:dc:c7:f3:44:fe
          inet addr:10.27.0.171  Bcast:10.27.0.255  Mask:255.255.255.0
          ...
```

But what is `0a:b9:eb:4d:d2:a4`?
This is _not_ the MAC address of `8.8.8.8`;
it's the MAC address of the local "internet gateway".
There is a mapping from IP address to MAC address,
and we can see our machine's knowledge of this mapping using the `arp` tool:

```console
$ arp -nai eth0
? (10.27.0.119) at 0a:68:c0:8b:6f:58 [ether] on eth0
? (10.27.0.117) at 0a:6a:03:53:30:2c [ether] on eth0
? (10.27.0.214) at 0a:db:3a:fe:f1:aa [ether] on eth0
? (10.27.0.2) at 0a:b9:eb:4d:d2:a4 [ether] on eth0
? (10.27.0.1) at 0a:b9:eb:4d:d2:a4 [ether] on eth0
```

Notice in passing that the MAC address `0a:b9:eb:4d:d2:a4` owns at least two IP addresses,
`10.27.0.1` and `10.27.0.2`.
These addresses are used for different purposes;
`10.27.0.1` is the internet gateway,
while `10.27.0.2` is a DNS server.
When `dig` sends its packet to IP `8.8.8.8`,
the OS determines that `8.8.8.8` is not on the local network,
and so it should go to the internet gateway, `10.27.0.1`.
To send the packet to `10.27.0.1`,
it looks up the associated MAC address, `0a:b9:eb:4d:d2:a4`.

But where does this mapping come from?
The output shown by the `arp` tool is the "ARP cache".
It's a cache of mappings which have been found via ARP,
the "Address Resolution Protocol".
ARP sits above Ethernet, just like IP does,
and `tcpdump` can show us ARP packets too:

```console
$ sudo tcpdump -e -n -i eth0 'arp'
tcpdump: verbose output suppressed, use -v or -vv for full protocol decode
listening on eth0, link-type EN10MB (Ethernet), capture size 262144 bytes
22:04:56.033927 0a:dc:c7:f3:44:fe > ff:ff:ff:ff:ff:ff, ethertype ARP (0x0806), length 42: Request who-has 10.27.0.1 tell 10.27.0.171, length 28
22:04:56.033955 0a:b9:eb:4d:d2:a4 > 0a:dc:c7:f3:44:fe, ethertype ARP (0x0806), length 42: Reply 10.27.0.1 is-at 0a:b9:eb:4d:d2:a4, length 28
22:05:19.726821 0a:b9:eb:4d:d2:a4 > ff:ff:ff:ff:ff:ff, ethertype ARP (0x0806), length 42: Request who-has 10.27.0.171 tell 10.27.0.1, length 28
22:05:19.726832 0a:dc:c7:f3:44:fe > 0a:b9:eb:4d:d2:a4, ethertype ARP (0x0806), length 42: Reply 10.27.0.171 is-at 0a:dc:c7:f3:44:fe, length 28
```

Here we see that ARP is request-response.
There are packets like "Request who-has 10.27.0.1",
and replies like "Reply 10.27.0.1 is-at 0a:b9:eb:4d:d2:a4".
Notice our machine makes the request by sending it to the MAC address `ff:ff:ff:ff:ff:ff`,
which is a "broadcast address".
The reply comes back from `0a:b9:eb:4d:d2:a4`,
the same machine which hosts the internet gateway and DNS server.
It seems our machine trusts the response packet;
ARP doesn't have any forgery protection.

Notice a later request-response cycle
asking for the MAC address for `10.27.0.171`.
This time, it's the gateway asking for the address,
and our machine replies, saying "it's me".
