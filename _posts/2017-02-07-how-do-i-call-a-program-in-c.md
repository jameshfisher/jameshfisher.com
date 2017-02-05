---
title: "How do I call a program from C?"
---

TL;DR: to call a program from C, use `fork` then `execve`. There is no way to directly start a new process from a program file; instead, we must `fork` (clone) the current process, then in child process, we must `execve` the program file to replace the child with the desired program. Example:

```c
#include <stdio.h>
#include <unistd.h>
int main(void) {
  printf("Hello from parent process!\n");
  pid_t pid = fork();
  if (pid == 0) {
    // Child process
    char* argv[] = { "./sub", NULL };
    char* envp[] = { NULL };
    execve("./sub", argv, envp);
    perror("Could not execve");
    return 1;
  } else {
    // Parent process
    printf("Hello again parent process!\n");
    return 0;
  }
}
```

We can wrap this up into a function, `call`:

```c
#include <stdlib.h>
#include <stdio.h>
#include <unistd.h>

pid_t call(char* argv[]) {
  pid_t pid = fork();
  if (pid == 0) {
    char* envp[] = { NULL };
    execve(argv[0], argv, envp);
    perror("Could not execve");
    exit(1);
  } else {
    return pid;
  }
}

int main(void) {
  printf("Hello from parent process!\n");
  char* argv[] = { "./sub", NULL };
  pid_t pid = call(argv);
  printf("New process got pid: %d\n", pid);
  return 0;
}
```

This prints:

```
% ./a.out
Hello from parent process!
New process got pid: 47816
Sub program started with args: ./sub
Sub program environment:
```

You might wish to set up the standard pipes for the new process so that you can write to the child process's standard input, and read from its output pipes. I'll cover that in a future post.
