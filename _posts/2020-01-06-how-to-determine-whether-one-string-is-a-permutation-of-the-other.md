---
title: Determine whether one string is a permutation of the other
tags:
  - ctci
  - programming
  - c
---

Question 1.3 of _Cracking the Coding Interview_:

> Given two strings, write a method to decide if one is a permutation of the other.

Two strings are a "permutation" if they contain the same distribution of characters.
So one solution is to build this distribution for each string,
and check whether those distributions are the same.
For example, `"hello"` and `"ehlol"` are permutations of each other,
because they both have the same character distribution,
`{e: 1, h: 1, l: 2, o: 1}`.

Here's a solution in C.
It represents the character distribution as an `int[255]`,
where `distrib[c]` gives the count of the character `c`.

```c
{% include "ctci/1_3.c" %}
```

This runs in `O(len(a)+len(b))` and uses constant memory.
This is optimal,
because we at least have to _look at_ every character,
which is already linear time.

The other "obvious" solution
is to sort both strings and check they're the same.
But this is less efficient,
and harder to implement in C.
