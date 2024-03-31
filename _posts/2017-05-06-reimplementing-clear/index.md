---
title: What is the `clear` program?
tags: []
summary: >-
  The `clear` program clears the terminal screen using the escape sequence
  `\033c`, where `\033` is the ASCII code for "escape" and `'c'` is the command
  to clear the screen.
---

Typing `clear` at the terminal clears your screen. How does this program work? The implementation is tiny:

```c
#include <stdio.h>
int main() {
  printf("\033c");
  return 0;
}
```

This magic string is composed of two bytes: 27, then `'c'`. Byte 27 is `ESC` in the ACSII table, and it's understood by the terminal as an escape sequence. It then expects further characters to specify the command; we give it `'c'` which clears the screen.
