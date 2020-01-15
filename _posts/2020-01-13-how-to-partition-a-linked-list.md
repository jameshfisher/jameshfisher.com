---
title: "How to partition a linked list"
tags: ["ctci", "programming", "c"]
---

Question 2.4 of _Cracking the Coding Interview_:

> Write code to partition a linked list around a value `x`,
> such that all nodes less than `x`
> come before all nodes greater than or equal to `x`.

We'll build two new linked lists,
one for values less than `x`,
and another for values greater than or equal to `x`.
When we're done, we'll return the concatenation of these lists.

We can build the new linked lists from the nodes of the input list.
We'll "pop" each node off the input list,
and "push" it onto one of the two new lists.
This is treating the lists as stacks.
This reverses the order of the elements,
but that's fine according to the question.

To concatenate the lists,
we can run through the first list until we find the end,
then link it to the start of the second list.
But an optimization is to remember the tail of the first list,
so we don't have to iterate through to find the tail.

This runs in `O(length of input)`,
which is optimal.

Here's an implementation in C:

```c
{% include ctci/2_4.c %}
```