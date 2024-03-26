---
title: What type should I use to count objects in C?
tags:
  - c
  - programming
taggedAt: '2024-03-26'
---

You often need to count objects in memory: for example, if you have a linked list, and you want to keep or calculate the length. What datatype should you use for this?

The right answer is `uintptr_t`: the unsigned integral type which is guaranteed to be able to hold a pointer. Why? Because the worst case for "number of objects in memory" is that each object is a single byte, and they are packed into the entire address space. How many bytes are there in the address space? It's exactly the largest possible pointer value. The smallest type capable of storing "the largest possible pointer value" is of course a pointer. But using a pointer as a counter is unconventional: we would be doing arithmetic with it. Instead, we use `uintptr_t`, the integer value of the size as a pointer.
