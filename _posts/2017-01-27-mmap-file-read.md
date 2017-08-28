---
title: "How can I read a file with `mmap` in C?"
---

Yesterday I introduced `mmap` as a way to map physical memory into the address space. But `mmap` is more well-known for its ability to map _files_ into the address space.

Here's an example of reading the system dictionary file by memory-mapping it.

```c
#include <stdio.h>
#include <sys/mman.h>
#include <unistd.h>
#include <fcntl.h>

int main(void) {
  int fd = open("/usr/share/dict/words", O_RDONLY);
  size_t pagesize = getpagesize();
  char * region = mmap(
    (void*) (pagesize * (1 << 20)), pagesize,
    PROT_READ, MAP_FILE|MAP_PRIVATE,
    fd, 0
  );
  fwrite(region, 1, pagesize, stdout);
  int unmap_result = munmap(region, pagesize);
  close(fd);
  return 0;
}
```
