---
title: How to check if a binary tree is balanced
tags:
  - ctci
  - programming
  - haskell
summary: >-
  An O(n) algorithm to check if a binary tree is balanced, by passing
  up the height from recursive calls.
---

Question 4.1 of _Cracking the Coding Interview_:

> Implement a function to check if a binary tree is balanced.
> For the purposes of this question,
> a balanced tree is defined to be a tree such that
> the heights of the two subtrees of any node never differ by more than one.

To implement this,
we can just translate the English definition
into a given programming language.
Here it is in Haskell:

```haskell
{% include "ctci/4_1_naive.hs" %}
```

This naive translation gives an `O(n*log(n))` algorithm,
which is not too bad.
But it does a linear-time amount of work at each node
to calculate the heights of each subtree.
But we can reduce the work at each node to constant time,
by passing up a `height` from the recursive calls.
This gives us an `O(n)` algorithm:

```haskell
{% include "ctci/4_1.hs" %}
```

How did I work out that the naive algorithm is `O(n*log(n))`?
I actually did it by noticing "this looks like a sorting algorithm",
in that it makes recursive sub-calls then does a linear amount of work,
then remembering that "these sorting algorithms are `O(n*log(n))`.
A more principled way is to write out the recurrence relation,
`T(n) = 2*T(n/2) + n`,
then use [magic master theorem](https://www.nayuki.io/page/master-theorem-solver-javascript).
I'm sure I'll have to learn the master theorem properly in a future question from this book.
