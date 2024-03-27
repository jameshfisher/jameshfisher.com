---
title: How to rotate a square matrix in-place
tags:
  - ctci
  - programming
  - c
---

Question 1.6 of _Cracking the Coding Interview_:

> Given an image represented by an NxN matrix, 
> where each pixel in the image is 4 bytes, 
> write a method to rotate the image by 90 degrees. 
> Can you do this in place?

For any given point `pt` in the square,
we can rotate it 90 degrees (clockwise)
with the formula:

```c
int new_x = width - 1 - old_y;
int new_y = old_x;
```

We can use this repeatedly on a point
to get its three equivalent points.
We can then this to rotate the values at all four points:

```c
Pt pt2 = rotate_pt(pt1);
Pt pt3 = rotate_pt(pt2);
Pt pt4 = rotate_pt(pt3);

Px tmp = m[pt1];
m[pt1] = m[pt4];
m[pt4] = m[pt3];
m[pt3] = m[pt2];
m[pt2] = tmp;
```

If we apply this procedure to all points in the top-left corner,
it rotates the entire matrix.
There's just a little subtlety:
when `N` is odd,
we include the central column,
but omit the central row.
Note also that when `N` is odd,
there's a central pixel
that doesn't need to be rotated,
and our procedure doesn't touch it at all.

Here's my solution in C:

```c
{% include "ctci/1_6.c" %}
```

This runs in `O(n^2)`,
i.e. linear time in the size of the array,
which is optimal,
because we at least have to look at all the pixels.
