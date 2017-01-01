---
title: restrict keyword in C
---

Take this example:

```c
char* realpath(const char *restrict, char *restrict);
```

`realpath(path, realpath)` canonicalizes the filepath `path` and puts the result in the buffer `realpath`. If `realpath == NULL`, it allocates a new string and returns a pointer to it.

In C, `restrict` is a "type qualifier". (Other things in this category are `const` and `volatile`). This means, for some type `T`, we can write `T restrict` to get another type. For example, `char const * restrict` is a type.

Actually, it only applies to pointer types, i.e. `T * restrict`. So `int restrict` is invalid, but `int * restrict` is valid.

In a function, a parameter `T * restrict p` means that the allocated object pointed at by `p` is _only_ pointed at by `p`. That is, during the execution of the function body, the only way to access `*p` is via `p` itself (also allowing for pointer manipulation like `p++`). Other variables in scope, such as other function parameters, or global variables, do not point at `*p`; nor does the memory graph available from those variables contain any pointers to `*p`.

The compiler can then make some optimizations.

Ref: https://en.wikipedia.org/wiki/Restrict
