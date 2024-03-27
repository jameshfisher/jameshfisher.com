---
title: Run-length encoding in C
tags:
  - ctci
  - programming
  - c
---

Question 1.5 of _Cracking the Coding Interview_:

> Implement a method to perform basic string compression using the counts of repeated characters.
> For example, the string `aabcccccaaa` would become `a2b1c5a3`.
> If the "compressed" string would not become smaller than the original string,
> your method should return the original string.
> You can assume the string has only upper and lower case letters (a-z).

The question doesn't name it,
but this is [_run-length encoding_](https://en.wikipedia.org/wiki/Run-length_encoding).
(The exception for longer strings is not traditional run-length encoding, however.
It's also a rather ugly API.)

Here's a solution in C.
An interesting property of the C implementation
is that it needs to calculate the length of the returned string
before it actually generates that string,
in order to `malloc` a string of the appropriate size.
The algorithm consists of two passes which look very similar,
but where the second pass actually adds characters to the string,
the first pass just increments a string length counter.

A handy API for this is `snprintf(NULL, 0, ...)`,
which returns the length of the string that `sprintf` _would have_ printed
if given a real string to print to.

```c
{% include "ctci/1_5.c" %}
```

This implementation is constant-time in the length of the input,
which is optimal.
