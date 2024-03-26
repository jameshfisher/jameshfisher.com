---
title: What is the difference between C constants and C literals?
tags:
  - c
  - programming
  - semantics
taggedAt: '2024-03-26'
---

**TL;DR: In C, literals (of which there are only string literals) are lvalues; we can take their address. All other "literals" (numbers, characters) are _constants_ in C; this means they are rvalues and we cannot take their address.**

In languages other than C, I tend to use "constant" and "literal" interchangeably. In C, they mean different things.


```c
// Some constants
int i = 5;        // `5` is a constant
char c = 'x';     // `x` is a constant
uint64_t j = 45;  // `45` is a constant
char * s = NULL;  // `NULL` is a constant

// Some literals (actually, just string literals)
char * str = "hello";  // "hello" is a string literal
```

A _literal_ is an lvalue: an expression with an address. This is why we have "string literals" and not "string constants". The string literal is allocated in memory; we can take its address.

A _constant_ is an rvalue: an expression without an address. Numbers and characters are literals. Taking the address of `45` has no meaning.
