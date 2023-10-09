---
title: "How to partition a linked list"
tags: ["ctci", "programming", "c"]
---

Question 2.4 of _Cracking the Coding Interview_:

> Write code to partition a linked list around a value `x`,
> such that all nodes less than `x`
> come before all nodes greater than or equal to `x`.

My first approach built two new lists:
one for values less than `x`,
and another for values greater than or equal to `x`.
When we're done, I returned the concatenation of these lists.
To concatenate the two lists efficiently,
I remembered the tail of the first list.

Then I read the answer,
and found a simpler implementation:
you only have to build one new list!
When you find a value less than `x`,
you put the node at the head of the list;
otherwise,
you append the node at the tail.
To make append constant-time,
you keep a pointer to the `tail`.
This runs in `O(length of input)`,
which is optimal.

Here's an implementation in C:

```c
{% include "ctci/2_4.c" %}
```