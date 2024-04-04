---
title: What is `extern` in C?
summary: >-
  `extern` declares a variable without defining it, allowing the linker to find
  the definition elsewhere. This is useful when a variable is declared in one
  file but defined in another.
tags:
  - extern
  - c
  - semantics
  - programming
taggedAt: '2024-04-04'
---

C has a keyword `extern`.
For example:

```c
#include <stdio.h>
int main() {
  extern int x;
  printf("x = %d\n", x);
}
```

Note the `extern` on the `x`.
What does this do?
Let's compile it to find out:

```
$ clang main.c
Undefined symbols for architecture x86_64:
  "_x", referenced from:
      _main in main-18e659.o
ld: symbol(s) not found for architecture x86_64
clang: error: linker command failed with exit code 1 (use -v to see invocation)
```

To understand this error, we need to understand `extern`.
`extern` is a keyword which can be applied to declarations.
For examples:

```c
extern int x;
extern char * errstr;
```

To understand `extern`, we must first understand a distinction between _declaration_, _definition_, and _initialization_.
Take this example:

```c
int x = 5;
```

The above line does _three_ things:
it says that `x` exists and has type `int`;
it allocates memory for `x` (enough for an `int`),
and finally it gives that memory the initial value `5`.
These three parts are called _declaration_, _definition_, and _initialization_:
the variable _declaration_ asserts the existence of the variable with a given type,
the variable _definition_ allocates memory for that variable,
and the variable _initialization_ gives that memory an initial value.
We often declare, define, and initialize a variable all together, as above.
However, we do not have to do all three of these things at once!

|                 | declares?   | defines?   | initializes? |
|-----------------|-------------|------------|--------------|
| `int x = 5;`    | yes         | yes        | yes, `5`     |
| `int x;`        | yes         | yes        | no           |
| `extern int x;` | yes         | no         | no           |

Marking a C variable `extern` declares the variable without defining it.
That is, no memory is allocated for it at that point in the program.
Something elsewhere has to define the variable.

That "something elsewhere" is left to the _linker_ to find.
Notice that the error message from `clang` is not a _compiler_ error, it is a _linker_ error.
When running `clang main.c`, you run the compiler, then the linker.
The compilation stage compiled successfully, but the link stage failed because it failed to find `_x`.
We can see that the compilation stage succeeds by compiling without linking, using the `-c` flag:

```
$ clang -c main.c
$ ls
main.c	main.o
```

We can then see that the link stage fails by running the link stage on the `main.o`:

```
$ clang main.o
Undefined symbols for architecture x86_64:
  "_x", referenced from:
      _main in main.o
ld: symbol(s) not found for architecture x86_64
clang: error: linker command failed with exit code 1 (use -v to see invocation)
```

Object files, like `main.o`, have a _symbol table_.
This table describes the things defined in the object file,
as well as things that the object file expects from elsewhere.
We can see this symbol table with the `nm` tool:

```
$ nm main.o
0000000000000000 T _main
                 U _printf
                 U _x
```

The `T _main` says that `main.o` defines one symbol, `_main`.
The `U _printf` and `U _x` says that `main.o` declares, but does not define,
the symbols `_printf` and `_x`.
Thus, `main.o` expects the linker to find `_printf` and `_x`.
The `clang` linker successfully finds `_printf` by linking with the C standard library.
However, the linker does not find `_x` anywhere, and thus it complains.

To fix the error, we need to define `_x` somewhere.
We can do that in a separate object file, like this:

```
// x.c
int x = 5;  // define and initialize x
```

```
$ clang -c x.c
$ nm x.o
0000000000000000 D _x
$ clang main.o x.o
$ ./a.out
x = 5
```
