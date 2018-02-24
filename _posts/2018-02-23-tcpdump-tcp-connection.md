---
title: "Running `tcpdump` on a TCP connection"
tags: ["programming", "unix"]
---

The `tcpdump` program is badly named:
it can capture much more than TCP traffic!
But let's see `tcpdump` in its original use
to view a small TCP conversation.

The conversation is going to be on the local machine
over the loopback interface using TCP port 12345.
So let's start listening for that:

```console
$ sudo tcpdump -i lo -v -X -n 'tcp port 12345'
tcpdump: listening on lo, link-type EN10MB (Ethernet), capture size 262144 bytes
```

For the TCP server and client, I'll use `nc` ("netcat").
I'll start the server listening on `127.0.0.2:12345`.
(`127.0.0.2` is configured to go to the loopback interface.
This helps clarify client and server in our `tcpdump` logs.)
To start this server, use `nc -l`:

```console
$ nc -l 127.0.0.2 12345
```

`nc -l` tells the OS that it wants to receive new TCP connections to `127.0.0.2:12345`.
Nothing has happened on the network yet!
Next, open a connection to this TCP server:

```
$ nc 127.0.0.2 12345
```

Our `nc` programs show no output,
but `tcpdump` shows activity!:

```
22:09:04.387241 IP (tos 0x0, ttl 64, id 33056, offset 0, flags [DF], proto TCP (6), length 60)
    127.0.0.1.56742 > 127.0.0.2.12345: Flags [S], cksum 0xfe31 (incorrect -> 0x212f), seq 3112279261, win 43690, options [mss 65495,sackOK,TS val 29629949 ecr 0,nop,wscale 6], length 0
	0x0000:  4500 003c 8120 4000 4006 bb98 7f00 0001  E..<..@.@.......
	0x0010:  7f00 0002 dda6 3039 b981 9cdd 0000 0000  ......09........
	0x0020:  a002 aaaa fe31 0000 0204 ffd7 0402 080a  .....1..........
	0x0030:  01c4 1dfd 0000 0000 0103 0306            ............
22:09:04.387254 IP (tos 0x0, ttl 64, id 0, offset 0, flags [DF], proto TCP (6), length 60)
    127.0.0.2.12345 > 127.0.0.1.56742: Flags [S.], cksum 0xfe31 (incorrect -> 0x046a), seq 3504942089, ack 3112279262, win 43690, options [mss 65495,sackOK,TS val 29629949 ecr 29629949,nop,wscale 6], length 0
	0x0000:  4500 003c 0000 4000 4006 3cb9 7f00 0002  E..<..@.@.<.....
	0x0010:  7f00 0001 3039 dda6 d0e9 2c09 b981 9cde  ....09....,.....
	0x0020:  a012 aaaa fe31 0000 0204 ffd7 0402 080a  .....1..........
	0x0030:  01c4 1dfd 01c4 1dfd 0103 0306            ............
22:09:04.387266 IP (tos 0x0, ttl 64, id 33057, offset 0, flags [DF], proto TCP (6), length 52)
    127.0.0.1.56742 > 127.0.0.2.12345: Flags [.], cksum 0xfe29 (incorrect -> 0xd558), ack 1, win 683, options [nop,nop,TS val 29629949 ecr 29629949], length 0
	0x0000:  4500 0034 8121 4000 4006 bb9f 7f00 0001  E..4.!@.@.......
	0x0010:  7f00 0002 dda6 3039 b981 9cde d0e9 2c0a  ......09......,.
	0x0020:  8010 02ab fe29 0000 0101 080a 01c4 1dfd  .....)..........
	0x0030:  01c4 1dfd                                ....
```

This is a lot of output!
We asked `tcpdump` for a lot of output.
We used `-v` for verbose, and
`-X` to "print the data of each packet (minus its link level header) in hex and ASCII".
Let's interpret this output.

There are three blocks here, corresponding to three IP packets.
This is the "TCP three-way handshake".
The goal of this process is to establish a connection.
Connection establishment is like a legal contract.
Each party must agree to the contract,
and have a copy of the other party's agreement to the contract.
The contract content could be thought of as

> `127.0.0.1` and `127.0.0.2` shall transmit two byte streams between each other.
> `127.0.0.1` shall send a byte stream from port `56742` to port `12345` on `127.0.0.2`,
> and the first byte in this stream shall have number `3112279261`.
> `127.0.0.2` shall send a byte stream from port `12345` to port `56742` on `127.0.0.1`,
> and the first byte in this stream shall have number `3504942089`.

Next, I told the client `nc` to send the string `hi, do you sell donuts?`.
Here's the `tcpdump` output:

```
22:12:18.253405 IP (tos 0x0, ttl 64, id 33058, offset 0, flags [DF], proto TCP (6), length 76)
    127.0.0.1.56742 > 127.0.0.2.12345: Flags [P.], cksum 0xfe41 (incorrect -> 0x169c), seq 1:25, ack 1, win 683, options [nop,nop,TS val 29678415 ecr 29629949], length 24
	0x0000:  4500 004c 8122 4000 4006 bb86 7f00 0001  E..L."@.@.......
	0x0010:  7f00 0002 dda6 3039 b981 9cde d0e9 2c0a  ......09......,.
	0x0020:  8018 02ab fe41 0000 0101 080a 01c4 db4f  .....A.........O
	0x0030:  01c4 1dfd 6869 2c20 646f 2079 6f75 2073  ....hi,.do.you.s
	0x0040:  656c 6c20 646f 6e75 7473 3f0a            ell.donuts?.
22:12:18.253424 IP (tos 0x0, ttl 64, id 12791, offset 0, flags [DF], proto TCP (6), length 52)
    127.0.0.2.12345 > 127.0.0.1.56742: Flags [.], cksum 0xfe29 (incorrect -> 0x5a9b), ack 25, win 683, options [nop,nop,TS val 29678415 ecr 29678415], length 0
	0x0000:  4500 0034 31f7 4000 4006 0aca 7f00 0002  E..41.@.@.......
	0x0010:  7f00 0001 3039 dda6 d0e9 2c0a b981 9cf6  ....09....,.....
	0x0020:  8010 02ab fe29 0000 0101 080a 01c4 db4f  .....).........O
	0x0030:  01c4 db4f                                ...O
```

Two packets are exchanged: the client's message to the server in the first packet,
then a second packet acknowledging the message.
You can see the message in the hexdump output;
notice it includes a trailing newline character sent by `nc`.

Next, I typed `no, sorry, try donuts.com` from the server.
The same process happens in reverse:
a message from the server to the client,
then an acknowledgement.
Notice both acknowledgement packets are 52 bytes (the first, IP line says `length 52`),
despite not having any message payload (the second, TCP line says `length 0`).

```
22:16:15.346758 IP (tos 0x0, ttl 64, id 12792, offset 0, flags [DF], proto TCP (6), length 78)
    127.0.0.2.12345 > 127.0.0.1.56742: Flags [P.], cksum 0xfe43 (incorrect -> 0x9d71), seq 1:27, ack 25, win 683, options [nop,nop,TS val 29737689 ecr 29678415], length 26
	0x0000:  4500 004e 31f8 4000 4006 0aaf 7f00 0002  E..N1.@.@.......
	0x0010:  7f00 0001 3039 dda6 d0e9 2c0a b981 9cf6  ....09....,.....
	0x0020:  8018 02ab fe43 0000 0101 080a 01c5 c2d9  .....C..........
	0x0030:  01c4 db4f 6e6f 2c20 736f 7272 792e 2074  ...Ono,.sorry..t
	0x0040:  7279 2064 6f6e 7574 732e 636f 6d0a       ry.donuts.com.
22:16:15.346782 IP (tos 0x0, ttl 64, id 33059, offset 0, flags [DF], proto TCP (6), length 52)
    127.0.0.1.56742 > 127.0.0.2.12345: Flags [.], cksum 0xfe29 (incorrect -> 0x8b6b), ack 27, win 683, options [nop,nop,TS val 29737689 ecr 29737689], length 0
	0x0000:  4500 0034 8123 4000 4006 bb9d 7f00 0001  E..4.#@.@.......
	0x0010:  7f00 0002 dda6 3039 b981 9cf6 d0e9 2c24  ......09......,$
	0x0020:  8010 02ab fe29 0000 0101 080a 01c5 c2d9  .....)..........
	0x0030:  01c5 c2d9                                ....
```

Finally I hit `Ctrl-D` on the server process, sending `EOF`.
This caused three more packets:

```
22:16:50.176655 IP (tos 0x0, ttl 64, id 12793, offset 0, flags [DF], proto TCP (6), length 52)
    127.0.0.2.12345 > 127.0.0.1.56742: Flags [F.], cksum 0xfe29 (incorrect -> 0x6967), seq 27, ack 25, win 683, options [nop,nop,TS val 29746396 ecr 29737689], length 0
	0x0000:  4500 0034 31f9 4000 4006 0ac8 7f00 0002  E..41.@.@.......
	0x0010:  7f00 0001 3039 dda6 d0e9 2c24 b981 9cf6  ....09....,$....
	0x0020:  8011 02ab fe29 0000 0101 080a 01c5 e4dc  .....)..........
	0x0030:  01c5 c2d9                                ....
22:16:50.176690 IP (tos 0x0, ttl 64, id 33060, offset 0, flags [DF], proto TCP (6), length 52)
    127.0.0.1.56742 > 127.0.0.2.12345: Flags [F.], cksum 0xfe29 (incorrect -> 0x4763), seq 25, ack 28, win 683, options [nop,nop,TS val 29746396 ecr 29746396], length 0
	0x0000:  4500 0034 8124 4000 4006 bb9c 7f00 0001  E..4.$@.@.......
	0x0010:  7f00 0002 dda6 3039 b981 9cf6 d0e9 2c25  ......09......,%
	0x0020:  8011 02ab fe29 0000 0101 080a 01c5 e4dc  .....)..........
	0x0030:  01c5 e4dc                                ....
22:16:50.176698 IP (tos 0x0, ttl 64, id 12794, offset 0, flags [DF], proto TCP (6), length 52)
    127.0.0.2.12345 > 127.0.0.1.56742: Flags [.], cksum 0xfe29 (incorrect -> 0x4763), ack 26, win 683, options [nop,nop,TS val 29746396 ecr 29746396], length 0
	0x0000:  4500 0034 31fa 4000 4006 0ac7 7f00 0002  E..41.@.@.......
	0x0010:  7f00 0001 3039 dda6 d0e9 2c25 b981 9cf7  ....09....,%....
	0x0020:  8010 02ab fe29 0000 0101 080a 01c5 e4dc  .....)..........
	0x0030:  01c5 e4dc                                ....
```

This is similar to another three-way handshake,
agreeing the end of the connection.

There's a huge amount I didn't cover here!
More blog posts necessary.
