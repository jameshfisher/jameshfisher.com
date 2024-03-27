---
title: Hello world in C inline assembly
tags:
  - programming
  - c
  - assembly
---

Here's an unusual "hello, world" in C:

```c
int main(void) {
  register int    syscall_no  asm("rax") = 1;
  register int    arg1        asm("rdi") = 1;
  register char*  arg2        asm("rsi") = "hello, world!\n";
  register int    arg3        asm("rdx") = 14;
  asm("syscall");
  return 0;
}
```

```console
$ cc hello.c
$ ./a.out
hello, world!
```

This C program doesn't use any C standard library functions.
An ordinary "hello world" program might use `printf`,
ultimately making the `write` system call.
The above program bypasses this
and makes the system call more directly
using "inline assembly".
This program works on Linux x86-64,
but because assembly is so non-portable,
probably doesn't work on most other systems.

Inline assembly is written using the syntax form `asm(...)`.
The above program uses this in a couple of ways.
First, the statement `asm("syscall");`
injects a `syscall` assembly instruction
at that point in the program.
The `syscall` instruction expects a system call number in register `rax`.
The program arranges for `rax` to hold the value `1`,
the system call number for `write`.
It arranges this by declaring the local variable `syscall_no` as `register`,
and specifically marking this register variable to be stored in register `rax`
using `asm("rax")`.
The arguments for the `write` system call
are put in `rdi`, `rsi` and `rdx`
using the same feature.

In the statement `asm("syscall")`,
the string `"syscall"` is assembly in "gas" (GNU ASsembler) syntax.
We can write longer partions of assembly here.
For example, we can prepare the registers `rax`, `rdi` and `rdx`
using `mov` instructions instead of C variables:

```c
int main(void) {
  register char* arg2 asm("rsi") = "hello, world!\n";
  asm("mov $1, %rax; mov $1, %rdi; mov $14, %rdx; syscall;");
  return 0;
}
```

Can we convert the `rsi` value to a `mov` instruction, too?
This is trickier, because we don't know its exact value.
The value of `rsi` is the second argument to `write`,
a pointer to the bytes to be written.
So `rsi` should be given the pointer to the statically allocated string `"hello, world!\n"`.
How do we get that pointer value into our assembly code?
To do so,
we'll need to switch to "extended `asm`",
a more advanced feature which I'll cover another time.
