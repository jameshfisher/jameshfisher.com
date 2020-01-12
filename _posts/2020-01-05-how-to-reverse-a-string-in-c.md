---
title: "How to reverse a string in C"
tags: ["ctci", "programming", "c"]
---

Question 1.2 of _Cracking the Coding Interview_:

> Implement a function `void reverse(char* str)` in C or C++
> which reverses a null-terminated string.

This is (implicitly) asking for an in-place reversal of the string.
We start by finding the end of the string (or equivalently, its length).
Then we swap the last character and the first character,
and repeat this working our way in towards the middle of the string.
We stop when the string remaining to reverse
is zero or one characters long
(note that a one-character string reversed is itself).

Here's a solution in C:

```c
{% include ctci/1_2.c %}
```

