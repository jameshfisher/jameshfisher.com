---
title: Pointer to middle of allocation, part 1
---

The Redis "Simple Dynamic String" is a length-prefixed string, roughly like this:

```c
struct sds {
  size_t len;
  char buf[];
};
```

If you have a pointer to an `sds` object, where in the allocation does the pointer point to? You would think ot points to the beginning: this is how C normally works, and this is how `malloc` and `free` work. But Redis does things differently: instead, it passes around pointers to the `buf` field, of type `char*`:

```
                 |
                 v
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
| len           | buf                               |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+

```

Why? So that Redis can then use its SDS strings as normal C-strings, passing them to C functions (`strcpy`, `strcmp`, and so on).
