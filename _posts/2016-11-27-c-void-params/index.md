---
title: What does `void` mean as a function parameter in C?
tags:
  - c
  - programming
  - semantics
taggedAt: '2024-03-26'
summary: >-
  `void` in a C function parameter list means the function takes no arguments,
  whereas an empty list allows for an unspecified number of arguments.
---

What is the difference between

```c
int foo(void);
```

and

```c
int foo();
```

I thought: nothing. But there is: the former takes no arguments, whereas the latter takes _an unspecified number of_ arguments!

The difference is illustrated by calling the function with different numbers of arguments. This compiles (but emits a warning):

```c
int foo() { return 4; }

int main(void) {
  foo("bar");
  return 0;
}
```

whereas this does not compile:

```c
int foo(void) { return 4; }

int main(void) {
  foo("bar");
  return 0;
}
```

```
% clang void_fn.c
void_fn.c:4:7: error: too many arguments to function call, expected 0, have 1
  foo("bar");
  ~~~ ^~~~~
void_fn.c:1:1: note: 'foo' declared here
int foo(void) { return 4; }
^
1 error generated.
```
