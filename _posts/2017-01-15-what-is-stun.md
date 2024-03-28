---
title: What is STUN?
tags:
  - webrtc
  - networking
  - internet-protocol
taggedAt: '2024-03-26'
summary: >-
  STUN is a protocol that allows clients to discover their public IP address and
  port, enabling peer-to-peer connections in WebRTC.
---

**TL;DR: STUN is a "What is my IP?" service**

WebRTC lets web applications talk to each other directly, peer-to-peer, with no intermediate server. The technology enabling this is called STUN. But what is STUN? What does it do? How does it work?

First let's look at the browser's traditional role. The browser is traditionally an HTTP client which connects to HTTP servers. These HTTP servers have known addresses. For example, I can ask a google.com web server to serve me the Google homepage:

```
% nc google.com 80
GET /
HTTP/1.0 302 Found
...
```

We can use this traditional client-server architecture to build a chat server. Let's say Bob wants to talk to Alice, so they use a web app which they both know is at `https://chat.com`. The goal is that everyone who loads `https://chat.com` in their browser can chat to everyone else who loads `https://chat.com`. We would solve this by using the `chat.com` server as a centralized pub/sub service. This means each client would have a TCP connection to the `chat.com` server, and when the server receives a message on a connection, it would then copy the message to every other connection.

This client-server architecture works because the servers have publicly known addresses with known TCP ports. All of the connections in the traditional architecture are made from a client to the server, and this works because the clients know how to find the `chat.com` service.

Now let's imagine we want to move this to a P2P architecture, so clients send their messages directly to each other. A client opening a connection to another client is more tricky, because neither client has a publicly known address or port for the other client to connect to.

But there's a simple way to discover a client's address: the server knows it! When a client opens a connection to the server, the client advertises its IP address. So the server could broadcast this IP address to all other clients. Then the clients could open a connection to it.

This is roughly how [Session Traversal Utilities for NAT](https://tools.ietf.org/html/rfc5389) works.

But it doesn't _quite_ work that way. First, the clients discover their public address by connecting to a STUN server, and getting a response detailing the public return address of the request. It's essentially a "What is my IP?" service! Then the client sends its STUN-discovered address to other services, such as the `chat.com` server, which can broadcast the address to other clients. An example public STUN server runs at `stun.l.google.com`, which anyone can use.

Second, STUN usually works over UDP. The `stun.l.google.com` server works on UDP port `19302`. This is unusual; the standard STUN port is `3478`.

We can see our public UDP port with a tool called "Stuntman":

```bash
% brew install stuntman
% stunclient --verbosity 10 stun.l.google.com 19302
Resolved stun.l.google.com to 74.125.140.127:0
config.fBehaviorTest = false
config.fFilteringTest = false
config.timeoutSeconds = 0
config.uMaxAttempts = 0
config.addrServer = 74.125.140.127:19302
socketconfig.addrLocal = 0.0.0.0:0
Sending message to 74.125.140.127:19302
Got response (32 bytes) from 74.125.140.127:19302 on interface 192.168.1.2:53417
Binding test: success
Local address: 192.168.1.2:53417
Mapped address: 46.208.87.95:53417
```
