---
title: What is a 'binary-safe' string?
tags:
  - c
  - programming
taggedAt: '2024-03-26'
summary: >-
  C strings use null-terminated byte arrays, which cannot represent arbitrary
  binary data. Binary-safe strings explicitly store the length, allowing them to
  represent any sequence of bytes.
---

What do people mean when they say "binary-safe strings"? In C, strings are traditionally represented as a pointer to bytes, i.e. `char*`, where the array of bytes is terminated by a "null byte" (i.e. `'\0'`, i.e. `0`). This representation has the disadvantage that your string of bytes cannot itself contain a null byte, and so this structure cannot represent arbitrary strings of bytes. That is, C-strings are not "binary-safe".

Binary-safe strings in C are typically implemented with an explicit known length. Something like:

```c
struct bytestring {
  size_t len;
  unsigned char * bytes;
};
```
