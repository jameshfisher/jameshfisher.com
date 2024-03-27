---
title: How to delete a node from the middle of a linked list
tags:
  - ctci
  - programming
  - c
---

Question 2.3 of _Cracking the Coding Interview_:

> Implement an algorithm to delete a node in the middle of a single linked list,
> given only access to that node. Example:
> 
> * Input: the node `c` from the linked list `a->b->c->d->e`
> * Output: nothing is returned,
>   but the new linked list looks like `a->b->d->e`

Here's a diagram of the memory layout
that we're given:

```
            node
              |
              v
a ---> b ---> c ---> d ---> e
```

Because we don't have access to `b`,
we can't free `c`'s memory,
as this would cause `b->next` to be a dangling pointer:

```
            node
              |
              v
a ---> b ~~~>        d ---> e
```

Therefore, this question is a bit contrived:
a sensible API for deleting node `c`
would give you access to `b`.
But let's press on.

Instead of freeing `c`'s memory,
we'll have to free a different node's memory.
We have access to `d` via `c->next` ...
and we know that `d` exists,
because the question tells us `c` is somewhere in the middle of the linked list.
So, what if we deleted `d` instead?!:

```
            node
              |
              v
a ---> b ---> c ----------> e
```

This is wrong,
but it would be right if only
the value at the third node was `d` instead of `c`!
So here's the idea:
overwrite `c`'s contents with `d`'s contents,
_then_ remove the node that contained `d`.
So we copy the value `d` over:

```
            node   next
              |      |
              v      v
a ---> b ---> d ---> d ---> e
```

Then copy `d`'s `next` pointer over:

```
            node   next
              |      |
              v      v
a ---> b ---> d      d ---> e
              |             ^
              |             |
              +-------------+
```

Then finally free `d`:

```
            node   next
              |      |
              v      v
a ---> b ---> d             e
              |             ^
              |             |
              +-------------+
```

Here's an implementation in C:

```c
{% include "ctci/2_3.c" %}
```
