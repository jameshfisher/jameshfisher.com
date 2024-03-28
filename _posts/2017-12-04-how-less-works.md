---
title: 'How less works: the terminal''s alternative buffer'
tags:
  - c
  - unix
  - programming
summary: >-
  `less` uses the terminal's "alternate screen" feature to clear the screen and
  display the contents of a file, and then restores the previous screen when
  exiting.
---

Run `less foo.txt`.
Your terminal clears,
replaced with the contents of `foo.txt`.
When you hit `q`,
your previous shell history redisplays!
How does `less` achieve this?

`less` is not just printing the file contents to stdout.
That's what `cat foo.txt` would do.
Rather, `less` treats its stdout as a _terminal_.
A terminal has extra features,
such as restoring the previous display state.
Let's see how `less` achieves this.

The standard library for interacting with terminals is `ncurses.h`.
The following C program is a crappy `less` reimplementation using ncurses:

```c
#include <ncurses.h>
#include <stdio.h>
int main(int argc, char** argv) {
  initscr();
  FILE* f = fopen(argv[1], "r");
  int c;
  while ((c = getc(f)) != EOF) printw("%c", c);
  fclose(f);
  refresh();
  getc(stdin);
  endwin();
  return 0;
}
```

To discover the magic behind `ncurses.h`,
we can run our program and pipe its output to another file:

```
$ clang -lcurses less.c
$ echo 'Hello, world!' > to_display.txt
$ ./a.out to_display.txt > output.txt
$ hexdump -C output.txt
00000000  1b 5b 3f 31 30 34 39 68  1b 5b 31 3b 33 38 72 1b  |.[?1049h.[1;38r.|
00000010  28 42 1b 5b 6d 1b 5b 34  6c 1b 5b 3f 37 68 1b 5b  |(B.[m.[4l.[?7h.[|
00000020  48 1b 5b 32 4a 48 65 6c  6c 6f 2c 20 77 6f 72 6c  |H.[2JHello, worl|
00000030  64 21 0d 0a 1b 5b 33 38  3b 31 48 1b 5b 3f 31 30  |d!...[38;1H.[?10|
00000040  34 39 6c 0d 1b 5b 3f 31  6c 1b 3e                 |49l..[?1l.>|
0000004b
```

Curses achieves its magic via inline "escape sequences".
Two important escape sequences in here are `\e[?1049h` and `\e[?1049l`.
These are escape sequences for switching to and from the "alternate screen".
This alternate screen is a feature supported by most terminals, including `xterm`.

We can therefore make a simpler crappy `less` reimplementation without using ncurses:

```c
#include <stdio.h>
int main(int argc, char** argv) {
  puts("\e[?1049h");
  FILE* f = fopen(argv[1], "r");
  int c;
  while ((c = getc(f)) != EOF) putc(c, stdout);
  fclose(f);
  getc(stdin);
  puts("\e[?1049l");
  return 0;
}
```

Actually, the escape sequences `\e[?1049h` and `\e[?1049l` are specific to XTerm.
Other terminals might use different escape sequences for the same feature.
Ncurses knows about many terminal types,
and used XTerm escape sequences because
my iTerm is set to report its terminal type as `xterm-256color`.
Ncurses achieves this by using the standard `terminfo.h` database,
which wraps many different terminal types, giving standard names to escape sequences.
Terminfo calls these sequences `smcup` and `rmcup`.
We can access the terminfo database with the command `tput`,
giving us another crappy `less` reimplementation in shell:

```bash
#!/bin/bash
tput smcup
cat "${1}"
read
tput rmcup
```
