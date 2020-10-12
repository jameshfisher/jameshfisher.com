---
title: "WebRTC group chat hello world"
tags: ["programming", "web", "webrtc"]
---

In the following `iframe` is a chat room.
[It's hosted here](https://jameshfisher.github.io/webrtc-anonymous-group-chat/build/),
and here's [the code on GitHub](https://github.com/jameshfisher/webrtc-anonymous-group-chat).
This post is my notes on how I built it.

<div>
  <iframe src="https://jameshfisher.github.io/webrtc-anonymous-group-chat/build/" style="width: 100%; height: 300px;"></iframe>
</div>

The chat messages themselves are sent via WebRTC data channels.
Each client has an `RTCPeerConnection` to each other client,
and each peer connection has a `RTCDataChannel`.

To establish peer connections,
we need a signalling mechanism.
In principle, we can use anything as the signalling mechanism;
[in this old post]({% post_url 2017-01-16-tiny-serverless-webrtc %}),
I show how to connect two peers by copy-pasting the signalling messages between them.
In this app, I will use [Ably](https://www.ably.io/)'s publish/subscribe system
to send the signaling messages.

When a page loads, generates a fresh random ID like `abc` for itself.
It then subscribes to an Ably channel called `global`, 
and broadcasts a "hello" message with its ID on the `global` channel.
From this point, we could just use the `global` channel as the medium for chat messages,
and ignore WebRTC.
But instead we only use Ably to establish peer-to-peer connections.

Note, importantly, that we're identifying _clients_,
not _users_.
A user could have many simultaneous clients.
If we want to introduce a "user" concept,
we would do this on top of the "client" concept.

Anyone can directly send a message to a client ID.
To achieve this, each client subscribes to its own Ably channel like `client-abc`.
Anyone who wants to talk to client `abc` can publish a message on `client-abc`.
Each message can contain the recipient ID.
(Yes, this is a security hole: a client can forge the sender of a message.)
In this way, clients can talk to each other privately,
without using the `global` channel.

When a client receives a "hello" message,
it responds to the sender with its own ID.
This establishes their knowledge of each other,
and establishes the "signalling channel" between them,
which consists of their two per-client Ably channels.

Once this signalling channel is established,
the clients can attempt to set up a peer connection.
Setting up a peer connection is asymmetric:
there is always a _caller_ and a _callee_.
I choose the convention that a client responding to a "hello" message becomes the caller.
The caller is expected to create an _offer_ and send it to the callee.
The callee is then expected to create an _answer_ and send it back to the caller.
(Actually, the clients may need several rounds of negotiation.
I don't fully understand how this works.)
This process establishes an agreed _session description_,
which describes the `MediaStream`s and `DataChannels` that will be used.

Simultaneously,
the clients exchange "ICE candidates".
An ICE candidate is a potential way to connect to the client
(for example, via `127.0.0.1`, or via a proxy).
Confusingly,
this connectivity information is _also_ included in the session description.
Also confusingly,
the WebRTC API suggests that ICE candidates are exchanged in parallel to session descriptions,
but [this is not entirely the case](https://stackoverflow.com/questions/38198751/domexception-error-processing-ice-candidate):
you have to set the remote session description before you can add ICE candidates,
so you may need to buffer the ICE candidates.

When a client goes away,
its peers _eventually_ notice:
the `RTCPeerConnection` state changes to `disconnected` after a few seconds.
I don't yet know how disconnections are detected, 
or whether they can be detected more cleanly and speedily.

(You might wonder: why am I using Ably,
when I used to work at [Pusher](https://pusher.com/) on a competitor product?
The main reason is that
Ably lets me configure permissions so that 
clients can publish and subscribe without an authentication step.
This is great for making "serverless" applications like this one.)
