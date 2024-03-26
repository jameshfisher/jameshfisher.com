---
title: How do I close a file descriptor in C?
tags:
  - c
  - posix
  - file-descriptors
  - system-calls
taggedAt: '2024-03-26'
---

To close a file descriptor, we use the `close` system call. Here's an example:

```c
#include <unistd.h>
#include <assert.h>
#include <stdio.h>

#define WRITE(F, S) write((F), (S), sizeof(S))

int main(void) {
  // Do some normal writing.
  assert(0 < WRITE(1, "This is written to stdout via descriptor 1\n"));

  // Get another reference to the same stdout pipe.
  int new_stdout = dup(1);

  // Writing to the new reference also works.
  assert(0 < WRITE(new_stdout, "This is written to stdout via new descriptor\n"));

  // Close our original file descriptor to stdout!
  close(1);

  // Writing to our new reference still works.
  // The pipe is only closed when all references to it are closed.
  assert(0 < WRITE(new_stdout, "This is also written to stdout via new descriptor\n"));

  // Close our final reference to the stdout pipe.
  // This closes the write end of the pipe.
  close(new_stdout);

  // Now we can't write to the pipe, because the write end of the pipe has been closed.
  assert(-1 == WRITE(new_stdout, "This should break\n"));
  perror("Could not write to new_stdout");

  return 0;
}
```
