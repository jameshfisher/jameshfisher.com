---
title: What is a TTY?
tags: []
summary: >-
  Terminals in Unix are files in the filesystem, identified by names like
  `/dev/ttys008`. Processes have standard input, output, and error streams that
  can be connected to terminals. The terminal a process is attached to can be
  inspected and manipulated.
---

Open a terminal and run `tty`.
It will give you the unique ID of your terminal:

```
$ tty
/dev/ttys008
```

UNIX has this saying, "everything is a file".
Your terminal is just another file in the filesystem!
What is its file path?
<span class="answer">`/dev/ttys008`, the output of `tty`.</span>

Your terminal acts quite like a normal file.
You can read from it and write to it:

```
$ echo "Hello, TTY" > /dev/ttys008
Hello, TTY
```

```
$ cat /dev/ttys008 > output.txt
Hello, file
~/dev/tmp/tty
$ cat output.txt
Hello, file
```

Because terminals are in the global filesystem,
they can interact with each other.
Now open a second terminal,
and run `echo "Hello, TTY" > /dev/ttys008` again.
What happens?
<span class="answer">The text `Hello, TTY` appears in the original terminal!</span>
You can now chat to other people using the system.
This is how programs like `wall` work.

A process gets three standard streams: stdin, stdout, and stderr.
The process can inspect these streams to see which TTY it's attached to,
like this:

```c
#include <unistd.h>
#include <stdio.h>
void print_tty(char* name, FILE * f) {
  printf("%s (fileno %d): ", name, fileno(f));
  if (isatty(fileno(f))) printf("TTY %s\n", ttyname(fileno(f)));
  else                   printf("not a TTY\n");
}
int main(void) {
  print_tty("stdin ", stdin);
  print_tty("stdout", stdout);
  print_tty("stderr", stderr);
}
```

When you start this process from your shell,
all three streams are attached to your current TTY:

```
$ clang whatismytty.c
$ ./a.out
stdin  (fileno 0): TTY /dev/ttys008
stdout (fileno 1): TTY /dev/ttys008
stderr (fileno 2): TTY /dev/ttys008
```

We can use shell piping/redirection commands
to change which TTYs the streams are attached to.

```
$ ./a.out | cat
stdin  (fileno 0): TTY /dev/ttys008
stdout (fileno 1): not a TTY
stderr (fileno 2): TTY /dev/ttys008
$ echo | ./a.out
stdin  (fileno 0): not a TTY
stdout (fileno 1): TTY /dev/ttys008
stderr (fileno 2): TTY /dev/ttys008
$ ./a.out < /dev/ttys003
stdin  (fileno 0): TTY /dev/ttys003
stdout (fileno 1): TTY /dev/ttys008
stderr (fileno 2): TTY /dev/ttys008
$ ./a.out < /dev/ttys003 2> /dev/ttys004
stdin  (fileno 0): TTY /dev/ttys003
stdout (fileno 1): TTY /dev/ttys008
stderr (fileno 2): TTY /dev/ttys004
```

Each process can also have a "controlling terminal".
A process's controlling terminal is not necessarily the same as
the terminals its streams are attached to.
You can see these with the `ps` command:

```
$ sudo ps -ax -o pid,tty
  PID TTY
    1 ??
   50 ??
   51 ??
...
...
84721 ttys007
84722 ttys007
71296 ttys008
71297 ttys008
71305 ttys008
```

Also, notice that some processes have `??` as their TTY.
Most of these processes are "daemons", UNIX background processes.
