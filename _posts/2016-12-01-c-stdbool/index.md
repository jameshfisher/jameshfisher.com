---
title: Does C have booleans?
tags:
  - c
  - programming
taggedAt: '2024-03-26'
summary: >-
  C99 introduced the `stdbool.h` header, providing `bool`, `true`, and `false`
  for boolean values, building on the `_Bool` type.
---

In C99, we have the header `stdbool.h`. The important contents are:

```c
#define bool _Bool
#define true 1
#define false 0
```

The `true` and `false` are simple, but what is this `_Bool`? It's a reserved keyword, and a type much like `int`, etc.
