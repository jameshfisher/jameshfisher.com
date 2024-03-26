---
title: Determine if a string has all unique characters
tags:
  - ctci
  - programming
  - c
  - algorithms
  - data-structures
  - time-complexity
taggedAt: '2024-03-26'
---

Question 1.1 of _Cracking the Coding Interview_:

> Implement an algorithm to determine if a string has all unique characters.
> What if you cannot use additional data structures?

Here's a recursive solution.
If the string is empty, all characters are unique.
Otherwise, split the string into `head` and `tail`;
if `head` does not occur in `tail`,
and all characters in `tail` are unique,
then the full string is unique.

Here's a solution in C:

```c
{% include "ctci/1_1.c" %}
```

CTCI argues that this algorithm is `O(n^2)`
where `n` is the length of the string.
I disagree and claim it's `O(n)`,
because there are only 255 possible bytes.
The worst-case input is something like `[1,2,3,...,253,254,255,255,255,...,255]`,
which causes 254 full iterations over the full string.
This can be brought down to `O(1)`
with an initial check:
if the string is longer than 255 bytes,
there must be a duplicated character,
by the [pigeonhole principle](https://en.wikipedia.org/wiki/Pigeonhole_principle).
