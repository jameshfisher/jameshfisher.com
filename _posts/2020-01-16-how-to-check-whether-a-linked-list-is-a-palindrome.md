---
title: "How to check whether a linked list is a palindrome"
tags: ["ctci", "programming", "c", "haskell"]
---

Question 2.7 of _Cracking the Coding Interview_:

> Implement a function to check if a linked list is a palindrome.

One way to implement this is by comparing the list
to its reverse
(actually, this is almost tautological).
This solution is linear-time, and linear-space,
which is not bad.
But there are solutions which are constant-space -
here is one of them.

To start, we'll find the middle node of the linked list.
Then from the middle, we'll work outwards in both directions,
comparing the node values pairwise.

[To find the middle node of the list](/2020/01/15/how-to-find-the-middle-of-a-linked-list/),
we can use the "runner" trick:
have a `slow` pointer and a `fast` pointer,
where the `fast` pointer advances two nodes
for every one node that the `slow` pointer advances.
When `fast` reaches the end, `slow` is in the middle.

From the middle node,
we need to be able to march back up to the start of the list,
to compare each value.
So we need to also [reverse the first half of the list](/2020/01/14/how-to-reverse-a-linked-list/).
We do this while we advance the `slow` pointer.

We need to know whether the list has an odd number of nodes (with a middle node),
or an even number of nodes (and thus no middle node).
We can determine this by how many nodes are left when we hit the end with the fast pointer.
If there are an odd number of nodes,
we just skip the middle node in the list comparison that follows.

Finally, we should fix up the links in the list that we've mutated,
and leave it as we found it.

I found it helpful to first write an implementation in Haskell:

```haskell
{% include "ctci/2_7.hs" %}
```

I then wrote an implementation in C,
which follows the same algorithm:

```c
{% include "ctci/2_7.c" %}
```
