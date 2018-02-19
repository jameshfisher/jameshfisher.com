---
title: "How to make a system call in C"
tags: ["programming", "c"]
---

Here's how we might write "hello world" in C:

```c
#include <stdio.h>
int main(void) {
  printf("hello, world!\n");
  return 0;
}
```

The above program uses `printf`,
which under the hood makes a system call to write those bytes to stdout.
We can see this using `strace`:

```console
$ cc hello.c
$ strace ./a.out
...
write(1, "hello, world!\n", 14)         = 14
...
```

`strace` conveniently shows us these system calls using C syntax.
We can use that expression in our program instead of using `printf`:

```c
#include <unistd.h>
int main(void) {
  write(1, "hello, world!\n", 14);
  return 0;
}
```

But `write(...)` here is a C function call, not a system call!
`write` is a wrapper around the system call,
and its implementation varies depending on the OS.
The program above works on Linux and on macOS for this reason.

But what is the function `write` doing?
Going one level deeper,
we can call the `syscall` function with the same arguments,
plus the argument `SYS_write` specifying the system call number:

```c
#include <unistd.h>
#include <sys/syscall.h>
int main(void) {
  syscall(SYS_write, 1, "hello, world!\n", 14);
  return 0;
}
```

What is `SYS_write`?
We can print it out:

```c
#include <stdio.h>
#include <sys/syscall.h>
int main(void) {
  printf("%d\n", SYS_write);
  return 0;
}
```

On Linux x86-64, this prints `1`. On macOS, it prints `4`.
We're now in the realms of OS-dependence and architecture-dependence.
Now what is is `syscall(...)` doing?
[It's defined in assembly!](https://github.com/bminor/glibc/blob/9a123ff05d624f429aa31fce10a8276a52a11f0d/sysdeps/unix/sysv/linux/x86_64/syscall.S)

```gas
.text
ENTRY (syscall)
movq %rdi, %rax		/* Syscall number -> rax.  */
movq %rsi, %rdi		/* shift arg1 - arg5.  */
movq %rdx, %rsi
movq %rcx, %rdx
movq %r8, %r10
movq %r9, %r8
movq 8(%rsp),%r9	/* arg6 is on the stack.  */
syscall			/* Do the system call.  */
cmpq $-4095, %rax	/* Check %rax for error.  */
jae SYSCALL_ERROR_LABEL	/* Jump to error handler if error.  */
ret			/* Return to caller.  */

PSEUDO_END (syscall)
```

`syscall(...)` puts its arguments in the right registers for the system call,
then performs the system call with the `syscall` assembly instruction.
We can do this ourselves in C
using some magic GCC inline assembly!

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
