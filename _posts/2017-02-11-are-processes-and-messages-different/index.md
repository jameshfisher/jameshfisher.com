---
title: Are processes and messages different?
tags:
  - concurrency
  - computer-science
taggedAt: '2024-03-26'
summary: >-
  Processes and messages can be unified - processes are just very slow messages,
  and message passing can be seen as splitting and fusing atoms.
---

[Yesterday I described the "happened-before" relation](/2017/02/10/happened-before/). I showed this typical "interaction diagram" illustrating "processes" interacting with "messages":

![message-passing processes](/assets/2017-02-10-happened-before/message-passing-processes.png)

This model of the world proposes two fundamentally different things: "processes" and "messages". But it's interesting to try to unify them. Processes in the diagram just look like very slow messages! We could also draw the world this way:

![processes and messages](./processes-and-messages.png)

Here, "sending a message" is like "splitting the atom": what was one becomes many, and the many go their separate ways. "Receiving a message" is like atomic fusion: what were two become one again. There is no distinction in this model between "processes" and "messages"; there are only _atoms_.

On physical grounds, we could add a "big bang" to this diagram. There's a clear computing analogy here: process forking! What was one process becomes many, and they follow their own timelines.

![processes and messages with big bang](./big-bang.png)
