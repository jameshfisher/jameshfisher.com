---
title: What is the happened-before relation?
tags:
  - concurrency
  - programming
  - computer-science
taggedAt: '2024-03-26'
summary: >-
  The happened-before relation models time in distributed systems, where events at different locations may not have a total order. It defines time using causality.
---

We're used to thinking of _time_ as a total order: given two events, one happened before the other. At my desk, I sit down before I turn on my computer. All the things happening to _you_ have a total order, because you're a timeline. _Sitting down at my desk_ and _turning on my computer_ happened at _the same place_ (my desk). Because of this, they have a total order. This total order is nicely tracked by the clock on my desk. If you compared the reading of that clock at both events, you would find that the time at which I sat at my desk was _less than_ the time I turned on my computer.

But once we look at "distributed systems", where events can happen in multiple places, it gets weird. Do I sit down at my desk before Eve sits down at hers in New York? It seems hard to tell. Distributed systems literature says it's not necessarily the case that one happened before the other. It's not just that it's _hard to tell_ whether I sat down before Eve: the events can happen "concurrently", or "at the same time".

What does "concurrent" mean? It does _not_ mean that "the clock on my wall read the same as the clock on the New York office wall". "Time" in distributed systems is not about wall clocks!

Instead, "time" in distributed systems is all about _causality_. Let's say I sit down, then phone Eve; and Eve only sits down after I call her. We then know that I sat down first, because I _caused_ Eve to sit down (if you squint). Typically, cause-and-effect is modelled as "message-passing". If I send Eve a message, then my sending the message causes Eve to receive the message. In the "distributed systems" definition, Jim calling Eve "happened before" Eve picking up.

So we have two ways to determine whether A happened before B:

1. A and B happened at the same place, and the wall clock says A happened before B.
2. A was a "send message", and B was the corresponding "receive message".

Let's apply this to our example, where we have four events:

* **A**: Jim sits down.
* **B**: Jim calls Eve.
* **C**: Eve picks up.
* **D**: Eve sits down.

Because A and B happened in the same place (Jim's desk), we can use Rule 1 to say that _A happened before B_. Because B was a "send message" and C was a "receive message", we can use Rule 2 to say that _B happened before C_. Because C and D happened in the same place (Eve's desk), we can use Rule 1 again to say that _C happened before D_.

So, A happened before D! Well, actually, we need one more rule for this:

3. (Transitivity) If A happened before B, and B happened before C, then A happened before C.

We now have all the pieces of the "happened-before relation" (as originally defined by Leslie Lamport). This relation is supposed to capture our sense of time, or our sense of causality, and basically asserts that time and causality are the same things.

To visualize such events in "time", we usually draw diagrams like this:

![message-passing processes](./message-passing-processes.png)

Here, P, Q and R are "processes". In our example, "Jim's desk" and "Eve's desk" are processes: things fixed in position. The arrows are messages being passed between processes. In our example, Jim calling Eve would be modelled as a message.

It's important to understand that these "processes" and "messages" are really not specific to computing! The happened-before relation is more a model of physics. Computers, being part of the same world, are of course subject to the same rules.
