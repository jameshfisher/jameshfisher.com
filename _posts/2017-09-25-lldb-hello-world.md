---
title: '`lldb` hello world'
tags: []
---

Create the following C program, `main.c`. We'll use `lldb` to step through it.

```c
#include <stdio.h>
int main() {
  printf("Hello 1\n");
  printf("Hello 2\n");
  return 0;
}
```

First, compile this with debugging in mind.
The first required flag is `-g`, "Generate debug information."
You should also disable optimizations with `-O0`;
this produces a program with a more obvious mapping to the source.

```
$ clang -g -O0 main.c
```

You now have an `a.out` which we can pass to `lldb`:

```
$ lldb -f a.out
(lldb) target create "a.out"
Current executable set to 'a.out' (x86_64).
(lldb)
```

You are now dropped into an `lldb` REPL.
You can issue commands to manipulate this session.
Your `a.out` program has not yet started; we'll tell `lldb` to start it in a minute.
First, set a breakpoint at the beginning of `main` using the `b` command:

```
(lldb) b main
Breakpoint 1: where = a.out`main + 22 at main.c:3, address = 0x0000000100000f56
(lldb)
```

Next, use the `r` command to run your `a.out`.
The process will launch, but will stop at the breakpoint:

```
(lldb) r
Process 93581 launched: '/Users/jim/dev/tmp/lldb-hw/a.out' (x86_64)
Process 93581 stopped
* thread #1, queue = 'com.apple.main-thread', stop reason = breakpoint 1.1
    frame #0: 0x0000000100000f56 a.out`main at main.c:3
   1   	#include <stdio.h>
   2   	int main() {
-> 3   	  printf("Hello 1\n");
   4   	  printf("Hello 2\n");
   5   	  return 0;
   6   	}
(lldb)
```

You can also set breakpoints using source line numbers.
This is only available when the program has debug information
(which you told `clang` to embed using `-g`).

```
(lldb) b 4
Breakpoint 2: where = a.out`main + 36 at main.c:4, address = 0x0000000100000f64
(lldb)
```

Now use `continue` to move from our current breakpoint (`main`) to our new breakpoint (line 4).
The process then executes line 3, `printf("Hello 1\n")`,
and this output to stdout is shown by `lldb`:

```
(lldb) continue
Process 93581 resuming
Hello 1
Process 93581 stopped
* thread #1, queue = 'com.apple.main-thread', stop reason = breakpoint 2.1
    frame #0: 0x0000000100000f64 a.out`main at main.c:4
   1   	#include <stdio.h>
   2   	int main() {
   3   	  printf("Hello 1\n");
-> 4   	  printf("Hello 2\n");
   5   	  return 0;
   6   	}
(lldb)
```

If you continue again, the process will hit no further breakpoints.
The process instead runs to completion and exits:

```
(lldb) continue
Process 93581 resuming
Hello 2
Process 93581 exited with status = 0 (0x00000000)
(lldb)
```

There are many more `lldb` commands but these are the essentials.
Exit the session:

```
(lldb) ^D
```
