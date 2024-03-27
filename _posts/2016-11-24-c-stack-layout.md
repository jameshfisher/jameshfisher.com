---
title: How is the stack laid out in C?
tags:
  - c
  - programming
taggedAt: '2024-03-26'
summary: >-
  The stack layout in C includes function arguments, return address, and local
  variables. Addresses decrease as you go through the arguments, and the stack
  grows downward with each function call.
---

What does the stack look like?

Where does the compiler put function arguments?

```c
int main(int argc, char* argv[]) {
  printf("&argc: %p\n", &argc);
  printf("&argv: %p\n", &argv);
  return 0;
}
```

This prints:

```
&argc: 0x7fff5dfd47e8
&argv: 0x7fff5dfd47e0
```

(Here, we're using the `%p` format specifier for pointer types.)

The addresses decrease as we go through the arguments: `&arg1 < &arg2 < ... < &argn`. This is an implementation detail: C does not define how the arguments are laid out in memory.

Next, what happens when a function calls another? Let's build up the stack:

```c
void test(int i) {
  printf("Nested %d times; &i: %p\n", i, &i);
  if (i == 5) {
    return;
  } else {
    test(i+1);
  }
}

int main(int argc, char* argv[]) {
  test(0);
  return 0;
}
```

This prints:

```
Nested 0 times; &i: 0x7fff536f17cc
Nested 1 times; &i: 0x7fff536f17ac
Nested 2 times; &i: 0x7fff536f178c
Nested 3 times; &i: 0x7fff536f176c
Nested 4 times; &i: 0x7fff536f174c
Nested 5 times; &i: 0x7fff536f172c
```

The stack grows down: each call is shifted 32 bytes down the stack. This means the stack frame for `test` is 32 bytes.

Another component of the stack frame is the return value. When we write `return 5`, this places the value `5` at a location on the stack. Where? C does not gives us easy access to this, but there is a non-standard GCC function `__builtin_return_address` which does.

```c
int test(int i1, int i2) {
  void* return_addr = __builtin_return_address(0);
  printf("&return: %p\n", return_addr);
  printf("&i1:     %p\n", (void*) &i1);
  printf("&i2:     %p\n", (void*) &i2);
  return 2;
}
```

```
&return: 0x10dd82f59
&i1:     0x7fff51e7d7bc
&i2:     0x7fff51e7d7b8
```

Heh, the return address is at the bottom of memory - not on the stack at all? What happens when we put values there? Answer: it blows up! Probably very-undefined-behavior?

What is in this stack frame? It depends on the _calling convention_. More about that in the future ...
