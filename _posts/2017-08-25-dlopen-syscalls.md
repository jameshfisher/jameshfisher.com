---
title: "What system calls does `dlopen` use?"
---

When using the `dlopen` API - `dlopen`, `dlsym`, `dlclose` - what syscalls does it use?
I wrote two programs to compare:
one which loads a function from a shared object,
and one which embeds the function in the main binary.
Using `dtruss` to log system calls, the dynamic-loading version does something like this:

```c
void* start = 0x10EA52000;
size_t pagesize = getpagesize();
struct stat64 stat;
stat64("plugin.so", &stat);
int fd = open("plugin.so", 0, 0);
mmap(start+(0*pagesize), 6*pagesize,               PROT_READ|PROT_EXEC,  MAP_FIXED|MAP_PRIVATE, fd, 0*pagesize);
mmap(start+(6*pagesize), 1*pagesize,               PROT_READ|PROT_WRITE, MAP_FIXED|MAP_PRIVATE, fd, 1*pagesize);
mmap(start+(7*pagesize), stat.off_t - 7*pagesize,  PROT_READ,            MAP_FIXED|MAP_PRIVATE, fd, 2*pagesize);
close(fd);
munmap(start+(0*pagesize), 4096);
munmap(start+(6*pagesize), 4096);
munmap(start+(7*pagesize), 4096);
```

It's notable that this does not use any special syscalls.
Instead, the program uses standard UNIX syscalls to put the file in memory.

The program knows the offsets of three sections of the file:
one executable (containing functions),
one read/writable (containing global variables),
and one readable (the Mach-O headers, at the end of the file?).
The program maps these into memory at fixed locations.
