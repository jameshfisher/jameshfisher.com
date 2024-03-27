---
title: What are TCP sequence numbers?
tags:
  - programming
  - networking
summary: >-
  TCP uses sequence numbers to map unordered IP packets to an ordered byte
  stream. The sequence number field is 32 bits, but wraps around to 0 after
  reaching the max value. The sender chooses a random "initial sequence number"
  during the connection handshake.
---

A TCP connection is a method of transmitting two byte streams,
one stream in each direction.
To map the unordered, unreliable bytes in IP packets to the ordered bytes in this stream,
each byte in each stream is identified by a _sequence number_.
Each TCP packet contains a segment of the stream as its payload.
The TCP header contains the sequence number of the first byte in this segment.
TCP packets can contain an acknowledgement,
which is the sequence number of the next byte the sender expects to receive
(and thus, an acknowledgement of receiving all bytes prior to that).

The sequence number field is 32 bits.
Naively, this means each byte stream can be up to 2<sup>32</sup> bytes,
or 4.3 gigabytes, long.
Does this mean you can't use a plain TCP connection to download a file larger than 4.3 gigabytes?
No: when the sequence number 2<sup>32</sup> is reached,
the sequence number wraps around to zero again!

Because of this wrap-around,
bytes in the stream don't actually have a unique identifying sequence number.
How then can we identify which byte a packet is talking about?
The answer strictly is "we can't".
(To mitigate this, TCP can use timestamps to identify old packets,
so as to discard them.
More about that attack another time.)

You might expect the first byte in the stream to have index 0, or 1.
But it does not!
Instead, the sender chooses a random "initial sequence number" (ISN)
during the connection handshake.
(This complication is apparently to mitigate an attack
whereby an attacker can impersonate another IP address,
if the attacker is able to forge the source IP address of the IP packets it sends.
Again, I'll cover that another time.)

`tcpdump` can show the initial sequence number in a TCP header.
In the following, we see the first packet sent by the TCP client,
with `seq 3112279261` (The four bytes `b981 9cdd` in the hexdump output).

```
22:09:04.387241 IP (tos 0x0, ttl 64, id 33056, offset 0, flags [DF], proto TCP (6), length 60)
    127.0.0.1.56742 > 127.0.0.2.12345: Flags [S], cksum 0xfe31 (incorrect -> 0x212f), seq 3112279261, win 43690, options [mss 65495,sackOK,TS val 29629949 ecr 0,nop,wscale 6], length 0
	0x0000:  4500 003c 8120 4000 4006 bb98 7f00 0001  E..<..@.@.......
	0x0010:  7f00 0002 dda6 3039 b981 9cdd 0000 0000  ......09........
	0x0020:  a002 aaaa fe31 0000 0204 ffd7 0402 080a  .....1..........
	0x0030:  01c4 1dfd 0000 0000 0103 0306            ............
```

We see next that the server sends its own random ISN (`seq 3504942089`),
and acknowledges the client's initial sequence number by sending `ack 3112279262`.
Notice that this is one more than the ISN!
Thus, the initial sequence number is not actually the identifier for the first byte in the sequence;
it's the number just prior to that.

```
22:09:04.387254 IP (tos 0x0, ttl 64, id 0, offset 0, flags [DF], proto TCP (6), length 60)
    127.0.0.2.12345 > 127.0.0.1.56742: Flags [S.], cksum 0xfe31 (incorrect -> 0x046a), seq 3504942089, ack 3112279262, win 43690, options [mss 65495,sackOK,TS val 29629949 ecr 29629949,nop,wscale 6], length 0
	0x0000:  4500 003c 0000 4000 4006 3cb9 7f00 0002  E..<..@.@.<.....
	0x0010:  7f00 0001 3039 dda6 d0e9 2c09 b981 9cde  ....09....,.....
	0x0020:  a012 aaaa fe31 0000 0204 ffd7 0402 080a  .....1..........
	0x0030:  01c4 1dfd 01c4 1dfd 0103 0306            ............
22:09:04.387266 IP (tos 0x0, ttl 64, id 33057, offset 0, flags [DF], proto TCP (6), length 52)
```
