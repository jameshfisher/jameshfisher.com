---
title: 'How do I call a program in C, setting up standard pipes?'
tags:
  - c
  - programming
  - pipes
  - posix
  - fave
taggedAt: '2024-03-26'
summary: >-
  A C function to create a new process, set up its standard input/output/error
  pipes, and return a struct containing the process ID and pipe file
  descriptors.
---

Earlier I showed [how to call a program in C](/2017/02/07/how-do-i-call-a-program-in-c/). This works by first forking the current process, then replacing the child process with the new program image. But how do we talk to this new process? We must set up the new process's standard pipes (standard in, out, error). This is a fair bit of work.

Here's the original `call` function, which starts a new process but does not set up its pipes (or do any error checking):

```c
pid_t call(char* argv[]) {
  pid_t pid = fork();
  if (pid == 0) {
    char* envp[] = { NULL };
    execve(argv[0], argv, envp);
  } else {
    return pid;
  }
}
```

Our updated function will have the following new signature, writing the new process's information into a struct. The struct contains descriptors for the write-end of the subprocess's standard-in pipe (so we can write to the subprocess), and descriptors for the read-ends of the subprocess's standard-out and standard-error pipes (so we can read back from the subprocess).

```c
struct subprocess {
  pid_t pid;
  int stdin;
  int stdout;
  int stderr;
};

void call(char* argv[], struct subprocess * p) {
  // ...
}
```

We'll call the function like this:

```c
struct subprocess proc;
call(argv, &proc);
```

Before forking, we must create the new pipes. We create three new pipes, which we'll later connect up to the expected descriptors.

```c
void mk_pipe(int fds[2]) {
  if (pipe(fds) == -1) { perror("Could not create pipe"); exit(1); }
}

void call(char* argv[], struct subprocess * p) {
  int child_in[2]; int child_out[2]; int child_err[2];
  mk_pipe(child_in); mk_pipe(child_out); mk_pipe(child_err);
  pid_t pid = fork();
  // ...
}
```

After forking, the file descriptor table is cloned. This means both processes have the same references to every pipe. Recap which pipes we have: those for the parent process (its standard in, out, and error) and those for the child (the ones we just created). Each of those pipes has a read end and a write end. After forking, here is how both processes can refer to those pipe ends:

| pipe end               | parent      | child
| ---------------------- | ----------- | ---------
| parent stdin (read)    | `0`         | `0`
| parent stdout (write)  | `1`         | `1`
| parent stderr (write)  | `2`         | `2`
| child stdin (read)     | `stdin[0]`  | `stdin[0]`
| child stdin (write)    | `stdin[1]`  | `stdin[1]`
| child stdout (read)    | `stdout[0]` | `stdout[0]`
| child stdout (write)   | `stdout[1]` | `stdout[1]`
| child stderr (read)    | `stderr[0]` | `stderr[0]`
| child stderr (write)   | `stderr[1]` | `stderr[1]`

![start state](/assets/2017-02-17-pipes/start.svg)

What a mess! This needs some reshuffling:

* The parent wants to access its pipe ends via the `proc` struct; not via the tuple arrays.
* The child wants to access its pipe ends via standard file descriptors 0, 1 and 2; not via the tuple arrays.
* The child should not have access to the parent's standard pipes.
* Each pipe end should only have one reference; not two. We must close the non-owner's references.

It should end up like this:

| pipe end               | parent        | child
| ---------------------- | ------------- | ---------
| parent stdin (read)    | `0`           | -
| parent stdout (write)  | `1`           | -
| parent stderr (write)  | `2`           | -
| child stdin (read)     | -             | `0`
| child stdin (write)    | `proc.stdin`  | -
| child stdout (read)    | `proc.stdout` | -
| child stdout (write)   | -             | `1`
| child stderr (read)    | `proc.stderr` | -
| child stderr (write)   | -             | `2`

![desired state](/assets/2017-02-17-pipes/finished.svg)

Let's start by closing some descriptors. Each end of a new pipe should only be referenced by one process. To remove references to a pipe end, we call `close`, like this:

```c
void call(char* argv[], struct subprocess * p) {
  int child_in[2]; int child_out[2]; int child_err[2];
  mk_pipe(child_in); mk_pipe(child_out); mk_pipe(child_err);
  pid_t pid = fork();
  if (pid == 0) {
    close(0); close(1); close(2);                                 // close parent pipes
    close(child_in[1]); close(child_out[0]); close(child_err[0]); // unused child pipe ends
    // ...
  } else {
    close(child_in[0]); close(child_out[1]); close(child_err[1]); // unused child pipe ends
    // ...
  }
}
```

After `close`ing appropriate ends in each process, we end up with:

| pipe end               | parent      | child
| ---------------------- | ----------- | ---------
| parent stdin (read)    | `0`         | -
| parent stdout (write)  | `1`         | -
| parent stderr (write)  | `2`         | -
| child stdin (read)     | -           | `stdin[0]`
| child stdin (write)    | `stdin[1]`  | -
| child stdout (read)    | `stdout[0]` | -
| child stdout (write)   | -           | `stdout[1]`
| child stderr (read)    | `stderr[0]` | -
| child stderr (write)   | -           | `stderr[1]`

![after closing](/assets/2017-02-17-pipes/closed.svg)

Much better. The remaining problems are that the child pipes are not referenced in the right way. The parent wants to access its pipe ends via the `proc` struct. To fix this, we copy the descriptors to that struct, and forget the tuple arrays.

![parent moved](/assets/2017-02-17-pipes/parent_moved.svg)

The child's side is trickier. The big problem is that the child's standard descriptors (0, 1, and 2) point to the _parent_ pipes, but we want them to point to the newly created _child_ pipes. In other words, we want to _move_ the reference from, say, `child_in[0]` to `0`.

In UNIX, we move a file descriptor by _duplicating_ it, then closing the old one. The system call is `dup2`:

```c
#include <unistd.h>
int dup2(int fildes, int fildes2);
```

After calling `dup2(fd1, fd2)`, the resource previously referenced by `fd1` is now also referenced by `fd2`. Here are the references after duplicating them:

![after dup2](/assets/2017-02-17-pipes/after_dup2.svg)

Finally, we close the old descriptors:

```c
void mv_fd(int fd1, int fd2) {
  dup2(fd1, fd2);
  close(fd1);
}
```

Let's call `mv_fd` to place the child's pipes in the standard locations:

```c
  // ...
  if (pid == 0) {
    close(0); close(1); close(2);                                 // close parent pipes
    close(child_in[1]); close(child_out[0]); close(child_err[0]); // unused child pipe ends
    mv_fd(child_in[0], 0); mv_fd(child_out[1], 1); mv_fd(child_err[1], 2); // copy new fds to standard locations
    // ...
  }
  // ...
}
```

![after move](/assets/2017-02-17-pipes/moved.svg)

Done! When we call `execve`, the page table for the child process will be replaced, so we can forget it. Here's the full code for `call`:

```c
// Start program at argv[0] with arguments argv.
// Set up new stdin, stdout and stderr.
// Puts references to new process and pipes into `p`.
void call(char* argv[], struct subprocess * p) {
  int child_in[2]; int child_out[2]; int child_err[2];
  pipe(child_in); pipe(child_out); pipe(child_err);
  pid_t pid = fork();
  if (pid == 0) {
    close(0); close(1); close(2);                                 // close parent pipes
    close(child_in[1]); close(child_out[0]); close(child_err[0]); // unused child pipe ends
    mv_fd(child_in[0], 0); mv_fd(child_out[1], 1); mv_fd(child_err[1], 2);
    char* envp[] = { NULL };
    execve(argv[0], argv, envp);
  } else {
    close(child_in[0]); close(child_out[1]); close(child_err[1]); // unused child pipe ends
    p->pid = pid;
    p->stdin = child_in[1];   // parent wants to write to subprocess child_in
    p->stdout = child_out[0]; // parent wants to read from subprocess child_out
    p->stderr = child_err[0]; // parent wants to read from subprocess child_err
  }
}
```

For simplicity, the code above does no error checking after system calls. You might want to use the following instead of the raw system calls:

```c
void close(int fd) {
  if (close(fd) == -1) { perror("Could not close pipe end" ); exit(1); }
}

void mk_pipe(int fds[2]) {
  if (pipe(fds) == -1) { perror("Could not create pipe"); exit(1); }
}

void mv_fd(int fd1, int fd2) {
  if (dup2(fd1,  fd2) == -1) { perror("Could not duplicate pipe end"); exit(1); }
  close(fd1);
}
```
