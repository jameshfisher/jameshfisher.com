---
title: Does C allow pointer arithmetic?
tags:
  - c
  - programming
  - undefined-behavior
  - semantics
taggedAt: '2024-03-26'
summary: >-
  Computing a pointer to unowned memory
  invokes undefined behavior, even without dereferencing!
---

Does C allow pointer arithmetic? For example, if we have some `int*`, can we add that value to another value, to get another pointer?

We can, but the spec is actually quite restrictive in what we can do. Many operations invoke undefined behavior.

First, and obviously, dereferencing a pointer to unowned memory invokes UB.

But the standard goes further: you're not even allowed to _compute_ a pointer to unowned memory.

Let's say I have:

```c
int vals[10];
int* at_vals_2  = &vals[2];  // OK
int* at_vals_9  = &vals[9];  // OK
int* at_vals_9  = &vals[9];  // OK
int* at_vals_10 = at_vals_9  + 1;  // OK
int* at_vals_11 = at_vals_10 + 1;  // UNDEFINED BEHAVIOR!!!!
```

The last line invokes UB, even though we never dereferenced the pointer!

Wait - why did `at_vals_10` not also invoke UB? After all, `vals[10]` is out of bounds. The reason is that the standard allows for this specific case: computing a pointer to the point immediately after the end of an array.

I find it rather disturbing that I can invoke UB so easily. The notion of "computing" a pointer seems not quite well-defined.

Am I computing the pointer if I write:

```c
int* at_vals_1000 = &vals[1000];
```

Am I computing the pointer if I write:

```c
int* some_pointer = (int*) 10000;
```

Am I computing the pointer if I write:

```c
int* at_vals_11 = false  ?  &vals[2]  :  at_vals_10 + 1;
```

Am I computing the pointer if I write:

```c
int* some_pointer;
```

and leaving the value uninitialized?
