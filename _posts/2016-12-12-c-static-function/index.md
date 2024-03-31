---
title: What are `static` functions in C?
tags:
  - semantics
  - c
  - programming
taggedAt: '2024-03-26'
summary: >-
  `static` functions in C are only callable within the translation unit they are
  defined in, not across the whole program.
---

Basically, this is yet another meaning of `static`. When you write `static` preceding a function declaration, its meaning is "this function is only callable within this translation unit".

A "translation unit" is the input which corresponds to an object file (`foo.o`) as output. In C, this is usually a `foo.c` file. Or more precisely, it's the output after running the preprocessor on `foo.c`.
