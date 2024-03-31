---
title: What is an `extern` function in C?
tags: []
summary: >-
  In C, function declarations are implicitly `extern`, meaning they have
  external linkage. The `static` keyword can be used to give a function internal linkage instead.
---

Earlier I showed the C `extern` keyword applied to variable declarations.
More generally, `extern` can be applied to declarations.
There are two kinds of thing you can declare in C: variables and functions.
So the `extern` keyword can also be applied to function declarations.
For example:

```c
extern int incr(int);
extern int add(int a, int b) { return a+b; }
```

Applied to a function declaration, the `extern` keyword in fact does nothing:
the declaration `extern int incr(int)` is exactly the same as `int incr(int)`.
This is because _all_ function declarations have an implicit `extern` applied!
This also applies to function _definitions_:
the function definition `int incr(int x) { return x+1; }`
is implicitly `extern int incr(int x) { return x+1; }`.
So, you have been using `extern`, whether you knew it or not.

For this reason, the following program yields an ugly linker error instead of a compiler error:

```c
#include <stdio.h>
int incr(int);
int main() {
  printf("incr(5) = %d\n", incr(5));
}
```

```
$ clang main.c
Undefined symbols for architecture x86_64:
  "_incr", referenced from:
      _main in main-b06e2c.o
ld: symbol(s) not found for architecture x86_64
clang: error: linker command failed with exit code 1 (use -v to see invocation)
```

Why is it the case that all C function declarations are implicitly `extern`?
If it were possible to declare a C function without making it extern,
the above program could generate a higher-level compiler error, like this:

```
$ clang main.c
main.c:2:1: error: function 'incr' declared but not defined
  int incr(int);
```

In fact, it _is_ possible to declare a non-`extern` function,
and it is done with the `static` keyword:

```c
#include <stdio.h>
static int incr(int);
int main() {
  printf("incr(5) = %d\n", incr(5));
}
```

```
$ clang main.c
main.c:2:12: warning: function 'incr' has internal linkage but is not defined [-Wundefined-internal]
static int incr(int);
           ^
main.c:4:28: note: used here
  printf("incr(5) = %d\n", incr(5));
```

In effect, `static` undoes the work of the implicit `extern`.
In my opinion this is a flaw in the C language.
The semantics should be the same as with C variables:
default to non-external; become external when `extern` is applied.
The `static` keyword then becomes unnecessary.

|                                 | externed?                             |
|---------------------------------|---------------------------------------|
| `int incr(int);`                | yes, _but this is a language flaw_    |
| `extern int incr(int);`         | yes                                   |
| `static int incr(int);`         | no, _but this shouldn't be necessary_ |
| `static extern int incr(int);`  | _this is not possible_                |
