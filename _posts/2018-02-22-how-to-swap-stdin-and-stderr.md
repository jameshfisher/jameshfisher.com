---
title: "How does swapping stdin and stderr work?"
tags: ["programming", "unix", "c"]
---

Sometimes I want to call something in bash,
but work with its stderr stream instead of its stdout.
The advice on the web is to swap its stderr and stdout
using the magic string `3>&2 2>&1 1>&3-`.
Here's an example of such a program:

```console
$ ./test
This goes to stdout
This goes to stderr
$ ./test | tr '[a-z]' '[A-Z]'
This goes to stderr
THIS GOES TO STDOUT
$ (./test 3>&2 2>&1 1>&3-) | tr '[a-z]' '[A-Z]'
This goes to stdout
THIS GOES TO STDERR
```

Here I'm using `tr '[a-z]' '[A-Z]'` to distinguish stdout from stderr.
The text in uppercase is that which is passed through the pipe;
the text in lowercase is printed directly to the terminal as stderr.
Notice in the third command,
the magic string `3>&2 2>&1 1>&3-`
causes the normally-stdout text from `./test` to be printed as error text,
and causes the normally-stderr text from `./test` to be passed through the pipe.
That is, `3>&2 2>&1 1>&3-` swapped stdout and stderr.

But how did it do that?
The instruction `3>&2` is shell-speak for
"copy file descriptor 2 to file descriptor 3".
(The syntax here is particularly unintuitive.
I would have expected `3>&2` to mean "copy file descriptor 3 to file descriptor 2".)
The shell achieves this copying with the system call `dup2`,
described as:

> ```
> #include <unistd.h>
> int dup2(int oldfd, int newfd);
> ```
>
> `dup2()` makes `newfd` be the copy of `oldfd`, closing `newfd` first if necessary ...
> After a successful return from one of these system calls,
> the old and new file descriptors may be used interchangeably.
> They refer to the same open file description (see open(2)) and thus share file offset and file status flags.

Thus, `3>&2` corresponds to a call to `dup2(2,3)`,
`2>&1` corresponds to `dup2(1,2)`,
and `1>&3` corresponds to `dup2(3,1)`.

Actually, the magic string uses the slightly different command `1>&3-`.
Notice the hyphen `-` on the end.
This hyphen corresponds to the system call `close(3)`,
closing file descriptor 3.
Bash evaluates these from left to right,
so the magic string `3>&2 2>&1 1>&3-`
corresponds to the system calls:
`dup2(2,3); dup2(1,2); dup2(3,1); close(3)`.

We can do this ourselves in C.
Here's the source of the `./test` program:

```c
#include <stdio.h>
int main(void) {
  fprintf(stdout, "This goes to stdout\n");
  fprintf(stderr, "This goes to stderr\n");
}
```

By putting those system calls at the start of our program,
we can swap the destinations of those `fprintf` calls:

```c
#include <stdio.h>
#include <unistd.h>
int main(void) {
  dup2(2, 3);
  dup2(1, 2);
  dup2(3, 1);
  close(3);
  fprintf(stdout, "This goes to stdout\n");
  fprintf(stderr, "This goes to stderr\n");
}
```

```console
$ ./test_swapped | tr '[a-z]' '[A-Z]'
This goes to stdout
THIS GOES TO STDERR
```

But why do those calls to `dup2` and `close` swap stdin and stdout?
The three calls to `dup2` are the standard "swap" algorithm,
using file descriptor 3 as "swap space".
Finally the `close` call removes the swap space.
Here I've annotated the calls to show the state of the file descriptors:

```c
// { 0 -> stdin, 1 -> stdout, 2 -> stderr }
dup2(2, 3); // tmp := stderr
// { 0 -> stdin, 1 -> stdout, 2 -> stderr, 3 -> stderr }
dup2(1, 2); // stdout := stderr
// { 0 -> stdin, 1 -> stdout, 2 -> stdout, 3 -> stderr }
dup2(3, 1); // stdout := tmp
// { 0 -> stdin, 1 -> stderr, 2 -> stdout, 3 -> stderr }
close(3);
// { 0 -> stdin, 1 -> stderr, 2 -> stdout }
```
