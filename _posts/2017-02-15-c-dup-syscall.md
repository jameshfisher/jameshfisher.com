---
title: "How do I duplicate a file descriptor in C?"
---

Answer: the `dup` system call. Here's an example of duplicating the descriptor `1`, which refers to the standard out pipe.

```c
#include <unistd.h>

#define WRITE(F, S) write((F), (S), sizeof(S))

int main(void) {
  WRITE(1, "This is written to stdout via descriptor 1\n");
  int new_stdout = dup(1);
  WRITE(new_stdout, "This is written to stdout via new descriptor\n");
  return 0;
}
```

By duplicating the file descriptor, we get two references to the same underlying pipe.
