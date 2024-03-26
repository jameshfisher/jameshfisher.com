---
title: How can I do modulo with a bitmask in C?
tags:
  - bitwise-operations
  - optimization
  - c
  - programming
taggedAt: '2024-03-26'
---

Are you doing `i % n`, where `n` is a power of two? There's a neat alternative way to do that: `i & (n-1)`. See how it works by choosing `n == 8`, so `i % 8` is the same as `i & 7`. `7` is `0b111`, so `i & 0b111` removes all but the three least significant bits. For instance, `14 % 8 == 6`. But `14 & 7 == 0b1110 & 0b0111 == 0b0110 == 0b110 = 6`.

For example, you might use this when implementing a ring buffer with power-of-two length.
