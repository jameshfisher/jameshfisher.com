---
title: What is the TCP three-way handshake?
draft: true
tags: []
---

There are three blocks here, corresponding to three IP packets.
This is the "TCP three-way handshake".
The goal of this process is to establish a connection.

Connection establishment is like a legal contract.
Each party must agree to the contract,
and have a copy of the other party's agreement to the contract.
The contract content could be thought of as

> `127.0.0.1` and `127.0.0.2` shall transmit two byte streams between each other.
> `127.0.0.1` shall send a byte stream from port `56742` to port `12345` on `127.0.0.2`.
> `127.0.0.2` shall send a byte stream from port `12345` to port `56742` on `127.0.0.1`.

The first packet is the client requesting a connection.
But the connection contract can't be achieved with a single "open connection" packet.
TCP works over IP, where there is no guaranteed delivery;
thus the client cannot know that the server received the "open connection" packet.
Also, the server might choose to deny the connection even if it receives the request!

The client wishes to know whether the the server has accepted the connection.
This acceptance is called "acknowledgement" in TCP,
and this is the second packet in the handshake:
the server acknowledges the connection.

Doesn't it seem like two packets are enough to establish the connection?
A legal contract could work this way.
But two packets are not enough, because the "connection contract"
actually consists of a couple more facts:

> The first byte in the byte stream from `127.0.0.1:56742` shall have number `3112279261`.
> The first byte in the byte stream from `127.0.0.2:12345` shall have number `3504942089`.

These numbers `3112279261` and `3504942089` are "initial sequence numbers".
You can see them in the `tcpdump` output.
An initial sequence number is chosen at random by its source host,
e.g. `127.0.0.1` chose `3112279261` at random
and `127.0.0.2` chose `3504942089` at random.
Thus the full contract is not written by the client;
it is only known after the server responds.
This means the server now wants a response from the client,
acknowledging the server's initial sequence number.
This is the third packet in the three-way handshake.

(Why do we have these random initial sequence numbers?
I'll cover that some other time.)
