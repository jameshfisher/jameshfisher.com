---
title: Implementing a queue using a linked list
tags:
  - queue
  - linked-list
  - ctci
  - programming
  - c
  - data-structures
  - algorithms
  - computer-science
taggedAt: '2024-03-26'
summary: >-
  The head is the front of the
  queue, allowing efficient dequeue.
  The tail is the back of the list.
  To enqueue efficiently, we keep a reference to the tail.
---

A "queue" is an abstract data type
that provides `enqueue` and `dequeue` operations
which behave like a queue of people.
There are many ways to implement a queue,
but a natural way is with a "linked list".

A linked list is a concrete data type
consisting of "nodes" in a chain.
To implement a queue,
we need to keep references to both ends of the linked list:
the "head" and the "tail".
But which should be the "front" of the list,
the "head" or the "tail"?

The answer is:
the head should be the front of the list.
This allows us to update the front
when dequeueing,
because it holds a pointer to the new front of the list.

Here's an implementation in C:

```c
{% include "ctci/3_queue.c" %}
```
