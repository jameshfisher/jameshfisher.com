---
title: How does reliability work in `RTCDataChannel`?
tags:
  - webrtc
  - networking
  - programming
taggedAt: '2024-03-26'
summary: >-
  The `RTCDataChannel` API lets us configure the delivery guarantees, including the
  `ordered`, `maxPacketLifeTime`, and `maxRetransmits` properties.
---

When we create a data channel, we pass some options:

```
dataChannel = RTCPeerConnection.createDataChannel(label[, options]);
```

The options dictionary has three interesting properties relating to network guarantees:

```
dictionary RTCDataChannelInit {
    boolean         ordered = true;
    unsigned short  maxPacketLifeTime;
    unsigned short  maxRetransmits;
    // ...
};
```

These properties are not independent! The spec explains:

> A RTCDataChannel can be configured to operate in different reliability modes. A reliable channel ensures that the data is delivered at the other peer through retransmissions. An unreliable channel is configured to either limit the number of retransmissions ( maxRetransmits ) or set a time during which transmissions (including retransmissions) are allowed ( maxPacketLifeTime ). These properties can not be used simultaneously and an attempt to do so will result in an error. Not setting any of these properties results in a reliable channel.

So a reliable channel is given by `{ ordered: true, maxPacketLifeTime: null, maxRetransmits: null }`. Changing any of these values results in an "unreliable" channel, of which there are several types.

The first property, `ordered`, says whether "data will be delivered in order." This presumably means each message is assigned a sequence number, and messages received out-of-order will result in either buffering or discarding.

The other properties, `maxPacketLifeTime` and `maxRetransmits`, provide a policy for when a sender will give up trying to send a message - that is, they specify "partial reliability". They "cannot be used simultaneously": they are two different kinds of policy, and we must choose one or the other. The one we do not use must be set to `null`.

The `maxPacketLifeTime` property "limits the time during which the channel will transmit or retransmit data if not acknowledged." More precisely, it is "the length of the time window (in milliseconds) during which transmissions and retransmissions may occur in unreliable mode". The sender will give up sending the message at the point that this lifetime expires.

The `maxRetransmits` property is "the maximum number of retransmissions that are attempted in unreliable mode".

So here are the possible interesting patterns for `RTCDataChannelInit`:

```js
var tcpLike           = { ordered: true,  maxPacketLifeTime: null, maxRetransmits: null };
var ??                = { ordered: true,  maxPacketLifeTime: null, maxRetransmits: 0    };
                      = { ordered: true,  maxPacketLifeTime:    0, maxRetransmits: null };
var signalPerSecond   = { ordered: true,  maxPacketLifeTime: 1000, maxRetransmits: null };
var ??                = { ordered: true,  maxPacketLifeTime: null, maxRetransmits: 5    };
var ??                = { ordered: true,  maxPacketLifeTime: 1000, maxRetransmits: null };
var imageTransfer     = { ordered: false, maxPacketLifeTime: null, maxRetransmits: null };
var udpLike           = { ordered: false, maxPacketLifeTime: null, maxRetransmits: 0    };
                      = { ordered: false, maxPacketLifeTime:    0, maxRetransmits: null };
var ??                = { ordered: false, maxPacketLifeTime: null, maxRetransmits: 5    };
var ??                = { ordered: false, maxPacketLifeTime: 1000, maxRetransmits: null };
```

I'm not sure how _deduplication of messages_ fits in. `ordered: true` must deduplicate, but if `ordered: false`, can the receiving application receive a message multiple times?

How are these actually implemented? A guess. Reliability is implemented at the sender (buffer for retransmit to receiver). Ordering is implemented at the receiver (buffer for release to receiving application).

On the receiver side: ACK all messages. If unordered, keep no state and release all messages to the application (thus admitting possible duplication of messages). If ordered, we must keep some state, depending on whether reliable. If reliable, keep a buffer of incoming messages, and only release them to the application sequentially. If unreliable, only keep a "highest sequence number seen"; release messages with a higher sequence number, and discard the rest.

On the sender side: If totally unreliable (UDP-like), keep no state. Else, keep a list of unacknowledged messages.  If totally reliable (TCP), only remove from the list on ACK. Else either `maxPacketLifeTime` or `maxRetransmits` are set, and they determine what to do when we consider retransmission (at an ACK timeout). If `maxPacketLifeTime` is set, keep a timestamp for each message. If `maxRetransmits` is set, increment a retransmission counter for each message.
