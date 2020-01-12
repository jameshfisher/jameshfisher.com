---
title: "How to percent-encode strings in-place"
tags: ["ctci", "programming", "c"]
---

Question 1.4 of _Cracking the Coding Interview_:

> Write a method to replace all spaces in a string with `"%20"`.
> You may assume that the string has sufficient space at the end of the string to hold the additional characters,
> and that you are given the "true" length of the string.

The question doesn't state it,
but this is a simplification of
[percent-encoding](https://en.wikipedia.org/wiki/Percent-encoding),
but where we only replace the space character.

The solution is trickier than it sounds,
because the question is asking us to update the string _in-place_.
The replacement string, `"%20"`,
is longer than the string to replace, `" "`.
Iterating from the start of the string doesn't work well:
you either have to over-write the next characters in the string (which is just wrong),
or you have to make space by shifting the remaining characters to the right (which is inefficient).

The solution is to start from the _end_ of the string,
where we're told we have space.
So in a first pass,
we find the index that will be the _new_ end of the string.
Then in a second pass, we work from there backwards.

Here's a solution in C.

```c
{% include ctci/1_4.c %}
```

This runs in linear time,
This is optimal,
because we at least have to _look at_ every character,
which is already linear time.
