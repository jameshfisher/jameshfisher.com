---
title: "How to remove duplicates from an unsorted linked list"
tags: ["ctci", "programming", "c"]
---

Question 2.1 of _Cracking the Coding Interview_:

> Write code to remove duplicates from an unsorted linked list.
> How would you solve this problem if a temporary buffer is not allowed?

Here's a solution in C:

```c
{% include "ctci/2_1.c" %}
```

This is `O(n^2)`.
I don't see a way to improve on this without using extra memory,
which the question doesn't allow.