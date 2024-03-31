---
title: Implementing a queue using two stacks
tags:
  - ctci
  - programming
  - haskell
summary: >-
  Implement a queue using two stacks, with one stack for the back of the queue
  and one for the front. Reverse the back stack onto the front stack when
  dequeuing to maintain the queue order.
---

Question 3.5 of _Cracking the Coding Interview_:

> Implement a `MyQueue` class which implements a queue using two stacks.

First, let's try this with one stack,
which we'll call `queueBack`.
We'll treat the top of the stack as the back of the queue:
so enqueueing an element is just pushing it on the stack.
But when we need to to dequeue an element,
we need to access to the bottom of the stack.

One way to access the bottom of a stack
is to reverse the stack.
And one way to reverse a stack
is to repeatedly pop items off of it,
pushing them onto a second stack.
Notice that the top of this second stack
then contains the front of the queue,
in the right order to be dequeued.
So let's call this second stack `queueFront`.

So we have two stacks,
`queueBack` and `queueFront`,
with easy access to the back and the front of the queue!
The only issue arises when we need to `dequeue`
but `queueFront` is empty.
In this case, we reverse `queueBack` onto `queueFront`
before continuing.
This means `dequeue` is a linear-time operation.

There are better algorithms than this.
In a language with mutation,
you could just keep pointers to the `head` and `tail` of a linked list.
This will give you a queue with constant-time `dequeue` and `enqueue`,
which is optimal.
In a functional language,
you could use a balanced tree,
which will give you logarithmic-time `dequeue` and `enqueue`.

Regardless, here's an implementation in Haskell:

```haskell
{% include "ctci/3_5.hs" %}
```
