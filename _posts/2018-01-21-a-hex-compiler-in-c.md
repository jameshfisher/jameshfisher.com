---
title: "A hex compiler in C"
---

Here is a sample of a programming language I call "Hex":

```
# hello_world.hex
# compiles to "hello_world.txt"

48 65 6c 6c 6f  # "Hello"
20              # space
77 6f 72 6c 64  # "world"
0a              # newline
```

In Hex, you can write not just programs, but videos, images, text files, anything.
You write programs in Hex by writing the hexadecimal codes for each byte of,
say, an ELF binary for Linux on Intel x86.
These programs are completely readable, because you can also write comments.

To run a Hex program, you first pass it to the `hex` compiler:

```
$ hex < hello_world.hex > hello_world.txt
$ cat hello_world.txt
Hello world
```

Here is a compiler for Hex, written in C:

```c
#include <stdio.h>
int to_hex(char c) {
  if      ('0' <= c && c <= '9') { return      c-'0'; }
  else if ('a' <= c && c <= 'f') { return 10 + c-'a'; }
  return -1;
}
int main(void) {
  for (;;) {
    int c = getchar();
    if (to_hex(c) != -1) {
      int c2 = getchar();
      if (to_hex(c2) != -1) { putchar(0x10*to_hex(c) + to_hex(c2)); }
      else { return 1; }
    }
    else if (c == EOF) { break; }
    else if (c == '#') { while (getchar() != '\n'); }
    else if (c == ' ' || c == '\n') { continue; }
    else { return 1; }
  }
  return 0;
}
```
