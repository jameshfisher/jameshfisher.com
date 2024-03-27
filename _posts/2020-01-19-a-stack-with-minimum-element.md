---
title: A stack with minimum element
tags:
  - ctci
  - programming
  - c
summary: >-
  A stack with a `min` operation that runs in O(1) time. Store the
  current minimum alongside each element, or use run-length encoding to compress
  the stack of minimums.
---

Question 3.2 of _Cracking the Coding Interview_:

> How would you design a stack which,
> in addition to `push` and `pop`,
> also has a function `min` which returns the minimum element?
> `push`, `pop` and `min` should all operate in O(1) time.

Without the requirement that `min` should operate in O(1) time,
we could use a normal stack,
with a `min` operation that searches the entire stack.

To make `min` O(1),
we need to always have the pre-calculated minimum to hand.
How about just in a variable `min`?
We can update this when a new value `x` is pushed,
with `min = x < min ? x : min`.

But unfortunately,
`pop` doesn't work:
when popping off the `min` value,
we need to know the new `min` value,
but can't search the entire stack
while still providing an O(1) `pop`.
We not only need to have the pre-calculated `min`,
but all the previous `min`s too!

A simple way to implement this is to store the `min` at each node,
alongside the value.
Here's an implementation in C:

```c
{% include "ctci/3_2.c" %}
```

A cleverer implementation recognizes that the `min` doesn't change often,
so we can compress the representation.
The way I thought to do this was to [run-length encode](/2020/01/08/run-length-encoding-in-c/)
the stack of `min`s:
keep a stack of `(min, counter)` tuples.
Instead of pushing the same `min`,
you increment the counter.

Again, here's an implementation in C:

```c
{% include "ctci/3_2_rle.c" %}
```

The book has a different optimization method.
It also keeps a separate stack for the `min`s,
and pushes a value to the `min` stack
if the value is less than _or equal to_ the current `min`.
This method has an annoying worst-case, though:
when the `min` is pushed repeatedly onto the stack,
it's stored every time instead of just incrementing a counter.
