---
title: What is `ssize_t` in C?
tags:
  - size_t
  - ssize_t
  - system-calls
  - c
  - programming
  - posix
taggedAt: '2024-03-26'
summary: >-
  `ssize_t` is a signed version of `size_t`, used to represent return values
  from system calls that may need to indicate error with `-1`.
---

[I previously covered the `size_t` type in C](/2016/11/29/size_t_iterator/), which is used to represent the size of an allocated block of memory. But lots of C functions use a type called `ssize_t`. What's that? What is the extra `s`?

In short, `ssize_t` is the same as `size_t`, but is a signed type - read `ssize_t` as "signed `size_t`". `ssize_t` is able to represent the number `-1`, which is returned by several system calls and library functions as a way to indicate error. For example, the `read` and `write` system calls:

```c
#include <sys/types.h>
#include <unistd.h>

ssize_t read(int fildes, void *buf, size_t nbyte);
ssize_t write(int fildes, const void *buf, size_t nbyte);
```
