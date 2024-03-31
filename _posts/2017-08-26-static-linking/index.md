---
title: What is static linking in C?
tags: []
summary: >-
  Static linking in C involves compiling a library and main program separately,
  then linking the object files together into an executable.
---

An example of static linking.
We have a library and a main program:

```c
// lib.c
int add(int a, int b) { return a + b; }
```

```c
#include <stdio.h>
int add(int, int);
int main() {
  printf("2+3=%d\n", add(2,3));
  return 0;
}
```

The main program declares the existence of the functions in the library.
The library defines those functions.
We can compile these separately into their own `.o` files,
then link them together into an executable:

```
$ clang -c main.c -o main.o
$ clang -c lib.c -o lib.o
$ clang main.o lib.o
$ ./a.out
2+3=5
```

The linking phase (which here we do with `clang`)
looks at the symbols in the object files.
We can show those symbols using `nm`:

```
$ nm main.o
                 U _add
0000000000000000 T _main
                 U _printf
$ nm lib.o
0000000000000000 T _add
```

The output from `nm` is unclear. Here's how to read it:

```
$ nm main.o
_add is undefined
_main is defined in the text section at 0000000000000000
_printf is undefined
$ nm lib.o
_add is defined in the text section at 0000000000000000
```

The linker works purely with names such as `_add` and `_printf`.
The linker is not aware of types.
If two object files have different expectations from the symbol,
the program will not behave.
For example, changing `main.c` to the following causes no compilation errors,
but causes a segmentation fault when running:

```c
#include <stdio.h>
char* add(char*, char*);
int main() {
  printf("%s\n", add("foo","bar"));
  return 0;
}
```
