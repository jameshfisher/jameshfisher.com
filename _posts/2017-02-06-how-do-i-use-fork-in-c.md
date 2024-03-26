---
title: How do I use `fork` in C?
tags:
  - c
  - posix
  - system-calls
  - programming
taggedAt: '2024-03-26'
---

The only way to create a new process in UNIX is with the `fork` system call, which duplicates the current process. Example:

```c
#include <stdio.h>
#include <unistd.h>
int main(void) {
  pid_t pid = fork();
  if (pid == 0) {
    printf("I'm the child process.\n");
  } else {
    printf("I'm the parent process; the child got pid %d.\n", pid);
  }
  return 0;
}
```

This prints:

```
% ./a.out
I'm the parent process; the child got pid 45055.
I'm the child process.
```

A call to `fork()` instructs the operating system to duplicate the calling process. The new process is identical, with one main difference: the new process gets a new process ID, and this ID is returned to the caller of `fork()`. The new process is returned the value `0`, by which it knows that it is the child, because `0` is not a valid process ID.

Notice we get one line of output from each process. The order of the lines here is non-deterministic, since they come from different processes! We receive both lines because both processes' `stdout` descriptor reference the same pipe. The `fork()` system call copies all of the parent process's descriptors, including the standard pipes (`stdin`, `stdout`, and `stderr`).

The `fork` system call is often combined with `execve` as a way to start a new process from a program file. I'll cover `fork/execve` in a future post.
