---
title: What is the `UINT64_C` macro in C?
tags:
  - c
  - macros
  - programming
taggedAt: '2024-03-26'
summary: >-
  The `UINT64_C` macro appends the `ULL` suffix to a 64-bit unsigned
  integer literal, converting it to the appropriate type.
---

I saw this code:

```c
bool contains_zero_byte(uint64 v) {
  return (((v)-UINT64_C(0x0101010101010101))
        & ~(v)&UINT64_C(0x8080808080808080));
}
```

What is `UINT64_C(0x0101010101010101)` doing? `UINT64_C` is a macro defined as:

```c
// Appends the correct suffix to a 64-bit unsigned integer literal.
#define UINT64_C(c) c ## ULL
```

The `##` token instructs the preprocessor to "paste together" the tokens on either side of it. So `UINT64_C(0x0101010101010101)` results in the output `0x0101010101010101ULL`.

But what is `ULL` in `0x0101010101010101ULL`? I'll write more about these suffixes in the next post.
