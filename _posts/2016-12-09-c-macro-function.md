---
title: What are 'macro functions' in C?
tags:
  - macros
  - c
  - programming
taggedAt: '2024-03-26'
---

In C, the `#define` preprocessor command has two different forms. One form replaces tokens. Another form replaces function calls.

Examples of the difference:

```c
// A simple replacement macro:
#define FOO 3
// A function macro:
#define INCR(x) (x++)
```
