---
title: "How to find the middle of a linked list"
tags: ["programming", "c"]
---

Just like my post on 
[How to find the kth last node of a linked list]({% post_url 2020-01-11-how-to-find-kth-last-node-of-a-linked-list %}),
there are some boring ways to find the middle of a linked list,
but at least one exciting way,
and it again uses a trick called the "runner".
We set up _two_ pointers into the linked list,
`fast` and `slow`.
They will both iterate over the list,
but for each jump made by the `slow` pointer,
the `fast` pointer will make two jumps.
Then, when `fast` reaches the end of the list,
`slow` will be half-way through!

Note that a list only has a "middle" element
if there are an odd number of nodes!
When we try to skip the `fast` pointer by 2,
but there's only one node left,
we know that the list has an odd number of nodes,
and we can return the `slow` pointer.
Otherwise,
we return `NULL`.

Here's an implementation in C:

```c
{% include ctci/2_7_2.c %}
```

Here's a similar implementation in Haskell:

```haskell
{% include ctci/2_7_2.hs %}
```