---
title: What is `size_t` for? How do I iterate over an object in C?
tags:
  - c
  - programming
taggedAt: '2024-03-26'
---

The `size_t` type is used to represent the size of objects in memory. As examples, it is the type of the return value of the `sizeof` operator, and of the `strlen` function. This means that it is an unsigned integral type. Its specific size is platform-dependent; the size is chosen to be large enough to represent all sizes on that platform.

Here's an example from [Modern C](http://icube-icps.unistra.fr/img_auth.php/d/db/ModernC.pdf):

```c
for (size_t i = 0; i < 5; ++i) {
  printf(
    "element %zu is %g, \tits square is %g\n",
    i,
    A[i],
    A[i]*A[i]
  );
}
```

I found the `size_t i` interesting, because I would have just used `int`. Using `size_t` for an array index seems slightly odd, because the index is not "the size of an object".

Why then are we using `size_t` to index into an array? Because `size_t` is guaranteed to be large enough to represent all possible indices into the array. Consider the worst case: array `A` is the largest possible object, and is an array of bytes (the shortest addressable value). Then the largest index into `A` is the number of bytes in the largest possible object - which is precisely `SIZE_MAX`, the largest value of type `size_t`. So `size_t` is the smallest type which is guaranteed to always be large enough. We could use a smaller type than `size_t` if we have specific information about the size of `A`. Otherwise, use `size_t`.

(Other sources say we can use `size_t` to count things in memory. I'm not so sure. This assumes that the largest object size is the entire address space.)
