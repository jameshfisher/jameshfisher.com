---
title: "What are Lamport timestamps?"
---

[I wrote about the happened-before relation]({% post_url 2017-02-10-happened-before %}) and [about processes and messages in this model]({% post_url 2017-02-11-are-processes-and-messages-different %}). Happened-before gives us a way to think about time and causality. But how can we _measure_ those things?

"Lamport timestamps" are one method to measure time and causality. The idea is that each process/message carries a _timestamp_, and that we can compare these timestamps as a way to determine whether one event happened-before another (i.e., whether the first event could have caused the second). Consider the following process diagram:

![message-passing processes](/assets/2017-02-10-happened-before/message-passing-processes.png)

Lamport has us annotate each line in the diagram with a natural number (the timestamp), like so:

![Lamport timestamp example](/assets/2017-02-12-lamport-timestamps/lamport-timestamps-example.png)

Each timestamp is generated from the previous ones. So for a sent message, the new process timestamp and the sent message timestamp are the result of the previous process timestamp. And for a received message, the new process timestamp is the result of the previous process timestamp and the inbound message's timestamp.

The important property in these events is that _the new timestamps are bigger than the old ones_. From this, the algorithm is clear:

```c
int timestamp;

void send_message(char* msg, int to) {
  timestamp++;
  write(to, mk_msg(msg, timestamp));
}

void on_receive_message(msg_t msg) {
  timestamp = max(timestamp, msg.timestamp + 1);
}
```

For processes, you can see the timestamp as a monotonically increasing "last event timestamp", and for messages, you can see the timestamp as an immutable "timestamp of the event that caused this message". Events are sending messages or receiving messages. (We could add "internal process events" to this model, but Lamport chooses not to.) So the above diagram represents these event timestamps:

![Lamport timestamp events example](/assets/2017-02-12-lamport-timestamps/lamport-timestamp-events.png)

What's the _point_ of all this? The point is to separate events into layers:

![Lamport timestamp layers](/assets/2017-02-12-lamport-timestamps/lamport-timestamp-layers.png)

These layers correspond to each's process's observation of the passing of time (i.e. "time" as interpreted by the happened-before relation). Similarly, we can see the timestamp as counting the _longest path of events leading to this event_.

What is the relationship between the Lamport timestamp and the happened-before relation? Formally, it's that:

> If event A happened-before event B, then the timestamp of A is less than the timestamp of B.

We can write "event A happened-before event B" as _A → B_, and "the timestamp of A" as _T(A)_, so we can write

> A → B ⇒ T(A) < T(B)

Why is this so? _A → B_ means "_B_ is reachable from _A_ by following messages". For each possible path from _A_ to _B_, every step in the path increases the timestamp by at least one.

Is this property useful? Superficially, no, because we'd like the implication to go the other way. But the implication doesn't work the other way. We can show that

> T(A) < T(B) ⤃ A → B

 We can see this by example: see the event _3_ in process _Q_ and the event _1_ in process _R_. These events are concurrent by the happened-before relation (i.e., _A ↛ B_), but it's not the case that _3 < 1_.

However, we _can_ use the implication in the contra-positive:

> T(A) <= T(B) ⇒ B ↛ A

Or, in English, "If the timestamp of _A_ is less than or equal to the timestamp of _B_, then B did not happen-before _A_."

It should be clear that the relationship between the Lamport timestamp and the happened-before relation is not one-to-one, because timestamps are _totally ordered_ (they're natural numbers, using the ordinary < relation), whereas the happened-before relation only gives us a partial order, where events can be concurrent.

From equality of timestamps, we _can_ conclude that two events are concurrent. That is:

> T(A) = T(B) ⇒ A ↮ B

This is a consequence of the contra-positive.

In summary, by comparing timestamps, we get


> T(A) < T(B) ⇒ B did not happen-before A (equivalently, A might have happened-before B)
>
> T(A) = T(B) ⇒ A and B are concurrent

We can also see Lamport timestamps in a diagram which removes the process/message distinction.

![Lamport timestamp particles](/assets/2017-02-12-lamport-timestamps/lamport-timestamps-particles.png)

Here, the algorithm is simpler:

```
To split a process, create two processes, each with timestamp T(P)+1
To join processes, create a new process with timestamp max(all timestamps)+1
```
