---
title: "WebRTC API basics"
---

I created [this tiny serverless WebRTC chat app](https://jameshfisher.github.io/serverless-webrtc/index.html). Let's see how it works.

The big picture is that Alice and Bob want to chat. Alice is going to begin the chat, and invite Bob to it. Alice and Bob use a STUN server to discover their own public addresses. They will exchange their public addresses in some other way (e.g. copy-paste) in order to chat.

To begin, the `RTCPeerConnection` class is still hidden behind vendor prefixes, so let's find it:

```js
var RTCPeerConnection = window.RTCPeerConnection || webkitRTCPeerConnection || mozRTCPeerConnection;
```

Next, we make a new `RTCPeerConnection`. This takes an `RTCConfiguration` dictionary as a argument:

```js
var peerConn = new RTCPeerConnection({'iceServers': [{'urls': ['stun:stun.l.google.com:19302']}]});
```

The `peerConn` object "represents a WebRTC connection between the local computer and a remote peer". Let's look at that `RTCConfiguration` argument in more detail:

```js
{
  'iceServers': [
    {
      'urls': [
        'stun:stun.l.google.com:19302'
      ]
    }
  ]
}
```

There are many possible options, but we only pass `iceServers`. This is a list of `RTCIceServer` objects, each representing a STUN or TURN server. We only care about STUN here, so we only pass a single STUN server. We choose the Google-operated server at `stun.l.google.com`, running on UDP port 19302.

Both Alice and Bob create their own `peerConn`. Now they diverge. Alice adds a "data channel" to the peer connection:

```js
var dataChannel = peerConn.createDataChannel('test');
```

A peer connection can have multiple channels, and each channel is independent (e.g. ordering and reliability guarantees apply per-channel). The argument to `createDataChannel` is a human-readable name for the channel; we've chosen `'test'`.

There's an optional second argument: an `RTCDataChannelInit` dictionary, where we can configure the semantics of the channel (whether it's ordered or reliable). I'll cover that in a future post.

Next Alice sets a listener for ICE candidates:

```js
peerConn.onicecandidate = (e) => { /* ... */ };
```

This function is called whenever the `icecandidate` event occurs on `peerConn`. I'll explain it soon.

Next, Alice calls

```js
peerConn.createOffer({})
```

This "initiates the creation of an offer which includes information about the WebRTC session, and any candidates already gathered by the ICE agent, for the purpose of being sent over the signaling channel to a potential peer to request a connection". Let's break that down:

* the "WebRTC session" is the peer connection between the local computer and the remote one
* the "ICE agent" is a thing running on the local computer which attempts to find addresses via which remote computers can connect to it, and which can be given addresses of remote computers to which it will try to connect. The ICE agents on the local and remote computers work together to try to establish a good P2P connection.
* "ICE candidates" are possible addresses of a machine, found by the ICE agent. "Candidates" generally haven't been verified to be connectable from the other machine.
* The "signaling channel" is the way the ICE agents talk to each other. In WebRTC, there is no defined way for ICE agents to talk to each other, and this is deliberate. As such, the signaling channel is something that the developer has to provide. Each application talks to the ICE agent via callbacks: the application tells the ICE agent when it has an ICE message, and the ICE agent tells the application when it wants to send an ICE message. For us, the signaling channel is copy-paste!

Now let's explain that `peerConn.onicecandidate`. This function is called by the local ICE agent when it wants to send a message to the remote ICE agent via the signaling channel. More specifically, this function occurs when an `RTCIceCandidate` is added to `peerConn`, e.g. because a STUN server told us about one of our possible public addresses.

Here's our full `onicecandidate` handler:

```js
peerConn.onicecandidate = (e) => {
  if (e.candidate == null) {
    console.log("Get joiners to call: ", "join(", JSON.stringify(peerConn.localDescription), ")");
  }
};
```

This handler is not typical. Normally, it would look like:

```js
peerConn.onicecandidate = (e) => {
  mySignallingChannel.send(e.candidate);  // E.g. this could be via Pusher
};
```

That `e` is an `RTCPeerConnectionIceEvent`. Its important property is `e.candidate`, which is either `null` or an `RTCIceCandidate`. If `e.candidate == null`, this signifies that the local ICE agent has finished gathering candidates. Otherwise, the application is expected to deliver the candidate to the remote ICE agent via the signaling channel.

In our serverless system, we do not deliver the candidate every time the function is called. This could require many copy-pastes! Instead, we wait until all ICE candidates have been gathered, and deliver them all at once. This works because each ICE candidate is added to the `peerConn.localDescription` when the ICE candidate finds it.

The `onicecandidate` handler is not called until the ICE candidate starts gathering. It appears the ICE candidate only starts gathering once we call `peerConn.createOffer`:

```js
peerConn.createOffer({})
```

(The options dictionary here is unimportant.)

The `peerConn.createOffer({})` returns a promise of an `RTCSessionDescription`. This "session description" describes some media streams that would be exchanged by the peers. Alice immediately sets the description on her `RTCPeerConnection`:

```js
peerConn.createOffer({}).then((desc) => peerConn.setLocalDescription(desc))
```

I'll describe the code for Bob in a future post.
