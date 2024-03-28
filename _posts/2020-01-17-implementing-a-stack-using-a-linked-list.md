---
title: Implementing a stack using a linked list
tags:
  - ctci
  - programming
  - c
summary: >-
  The head of the list is the top of the stack.
---

A "stack" is an abstract data type
that provides `push` and `pop` operations
which behave like "a stack of plates".
There are many ways to implement a stack,
but a very natural way is with a "linked list".
A linked list is a concrete data type
consisting of "nodes" in a chain.
The head of the list represents the top of the stack.
Here's an implementation in C:

```c
{% include "ctci/3_stack.c" %}
```
