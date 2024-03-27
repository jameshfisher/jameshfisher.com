---
title: How to find kth last node of a linked list
tags:
  - ctci
  - programming
  - c
---

Question 2.2 of _Cracking the Coding Interview_:

> Implement an algorithm to find the kth to last element of a singly linked list.

There are some boring ways to answer this question,
but at least one exciting way.

Boring answer 1:
if we know the length _l_ of the list in advance,
we can just skip over _l_ - 1 - _k_ nodes.

Boring answer 2:
if we don't know the length of the list in advance,
we can count all the nodes first to find its length,
then skip over _l_ - 1 - _k_ nodes.

The more exciting answer uses a trick called the "runner".
We set up _two_ pointers into the list,
_k_ nodes apart from each other,
starting at the start of the list.
Then we iterate until the leading pointer hits the end.
Then the trailing pointer is _k_ nodes from the end!

Here's an implementation in C:

```c
{% include "ctci/2_2.c" %}
```
