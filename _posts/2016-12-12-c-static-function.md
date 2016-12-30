---
title: C static functions
---

Basically, this is yet another meaning of `static`. When you write `static` preceding a function declaration, its meaning is "this function is only callable within this translation unit".

A "translation unit" is the input which corresponds to an object file (`foo.o`) as output. In C, this is usually a `foo.c` file. Or more precisely, it's the output after running the preprocessor on `foo.c`.
