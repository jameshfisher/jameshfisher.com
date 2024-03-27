---
title: What is `realloc` in C?
tags:
  - c
  - programming
  - memory-management
taggedAt: '2024-03-26'
summary: '`realloc` resizes an allocated memory block, copying contents if necessary.'
---

In C, the most fundamental dynamic memory functions are `malloc` and `free`, provided in `stdlib.h`. The `malloc` ("memory allocate") function allocates a block of memory on the heap; the `free` function frees it again. Their signatures are:

```c
void* malloc(size_t size);
void free(void* ptr);
```

But there are a couple more: `calloc` and `realloc`.

```c
void* calloc(size_t how_many, size_t num_elements);
void* realloc(void* original, size_t new_size);
```

The `calloc` ("clear alloc") function behaves like `malloc`, with two differences:

* Instead of a raw `size_t`, it takes two `size_t`s: the first representing the number of objects in an array, and the second representing the size of each object in the array. It then allocates space for such an array.
* It zeroes the allocated memory.

The `realloc` ("reallocate") function takes a pointer to an allocated block, and attempts to expand/contract that block to the new size. If it cannot, it allocates the requested size elsewhere, and copies the old version to it. If the new size is larger than the old, then the trailing memory is uninitialized.
