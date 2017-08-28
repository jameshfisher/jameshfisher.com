---
title: "How can I write a file with `mmap` in C?"
---

Here's an example of writing to a file using `mmap`.

```c
#include <unistd.h>
#include <fcntl.h>
#include <sys/mman.h>
#include <string.h>

int main(void) {
  int fd = open("test_file", O_RDWR | O_CREAT, (mode_t)0600);
  const char *text = "hello";
  size_t textsize = strlen(text) + 1;
  lseek(fd, textsize-1, SEEK_SET);
  write(fd, "", 1);
  char *map = mmap(0, textsize, PROT_READ | PROT_WRITE, MAP_SHARED, fd, 0);
  memcpy(map, text, strlen(text));
  msync(map, textsize, MS_SYNC);
  munmap(map, textsize);
  close(fd);
  return 0;
}
```
