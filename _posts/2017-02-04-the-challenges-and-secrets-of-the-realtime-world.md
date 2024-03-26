---
title: 'FOSDEM: The Challenges and Secrets of the Realtime World'
tags:
  - fosdem
  - realtime
  - programming
  - networking
taggedAt: '2024-03-26'
---

Summary:

> This is a simple, high-level introduction to "realtime". Many apps have "realtime" aspects: Periscope, Gett (taxis), various IoT things, drones. How can we do realtime? Not by polling!! There are many "realtime protocols" - HTTP streaming, HTTP long polling, HTTP/2, Kafka, WebSocket, XMPP. The common element is TCP - they are all a layer on top of a TCP socket. HTTP long polling is very popular. In usual implementation, the client makes a request signalling interest in something, and the server only responds once an interesting thing happens. The client then immediately makes another request. To avoid dropping messages, the re-request should include a timestamp or sequence number. This also accounts for connectivity issues - especially on mobile, connections drop frequently, and ideally should be re-connected transparently. Most/all of these have a concept of "channels", or "topics", or "interests" - a thing which clients can "publish" and "subscribe" to. Scaling pub/sub (in PubNub's case) means operating multiple servers, and connecting clients to their closest server using GeoDNS. You then need some way to communicate publishes between those servers.
