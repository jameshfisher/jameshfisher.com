---
title: "concurrent fwrites are not atomic"
---

Take the following C program, in which two threads concurrently use `fwrite` to the same file. Each thread loops, writing a line over and over. What do you expect the output file to look like?

```c
#include <stdlib.h>
#include <stdio.h>
#include <string.h>
#include <unistd.h>

int main() {
  FILE* h = fopen("file.txt", "a");
  if (h == NULL) { perror("Could not open file for appending"); exit(1); }
  if (fork() == 0) {
    char* line = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\n";
    for (int i = 0; i < 10000; i++) {
      if (fwrite(line, strlen(line), 1, h) != 1) { perror("Could not append line to file"); exit(1); }
    }
    if (fclose(h) != 0) { perror("Could not close file"); exit(1); }
  } else {
    char* line = "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb\n";
    for (int i = 0; i < 10000; i++) {
      if (fwrite(line, strlen(line), 1, h) != 1) { perror("Could not append line to file"); exit(1); }
    }
    if (fclose(h) != 0) { perror("Could not close file"); exit(1); }
  }
  return 0;
}
```

Looking at the output file, we find bits like this:

```
...
bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
bbbbbbbbbbbbbbbbbbaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
...
aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
aaaaaaaabbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
...
```

If `fwrite` were atomic, we would see random interleavings of lines, but here we see random interleavings of _characters_.

Actually, it's worse than being non-atomic - we have invoked undefined behavior! POSIX says:

> This volume of POSIX.1-2008 does not specify behavior of concurrent writes to a file from multiple processes. Applications should use some form of concurrency control.
