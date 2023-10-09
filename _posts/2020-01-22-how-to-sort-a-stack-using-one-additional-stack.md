---
title: "How to sort a stack using one additional stack"
tags: ["ctci", "programming", "haskell"]
---

Question 3.6 of _Cracking the Coding Interview_:

> Write a program to sort a stack in ascending order (with biggest items on top). 
> You may use at most one additional stack to hold items, 
> but you may not copy the elements into any other data structure (such as an array). 
> The stack supports the following operations: `push` , `pop`, `peek` and `isEmpty`.

Imagine you're a Turing machine, reading a tape.
You have constant-time access to the tape under the machine head,
but to read the tape at a far-away location,
you need to scan to it.

We can model the tape using two stacks.
One stack represents the tape to the left of the machine head,
and one stack represents the tape to the right.
The top of each stack is the value closest to the head.
To move the machine head,
we pop a value from one stack,
and push it onto the other stack.

With this Turing-machine model of memory,
how do do you sort the values in memory?
One way is to do a [bubble sort](https://en.wikipedia.org/wiki/Bubble_sort):
move from left to right,
swapping adjacent values if they're out of order.
Once we do a full sweep without any swaps,
the list is sorted.

Here's an implementation in Haskell:

```haskell
{% include "ctci/3_6.hs" %}
```