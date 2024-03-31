---
title: What is `perror` in C?
tags:
  - c
  - system-calls
  - programming
taggedAt: '2024-03-26'
summary: >-
  `perror` in C prints a human-readable description of the last error that
  occurred, as stored in the global `errno` variable.
---

You may see calls to `perror` in C code. What is it?

```c
#include <stdio.h>
void perror(char const * s);
```

A call to `perror("foo")` will print `"foo: "` to stderr, then will print a human-readable description of the err in `errno` (the global error number written to by syscalls and library functions). For example:

```c
#include <stdio.h>
int main() {
  FILE* fp = fopen("nonexistent", "r");
  if (fp == NULL) {
    perror("Could not open file");
    return 1;
  }
  // ...
  return 0;
}
```

This prints:

```
% ./a.out
Could not open file: No such file or directory
```

The `perror` function gets the string `"No such file or directory"` from a global error table:

```c
#include <errno.h>
const char * const sys_errlist[];
int sys_nerr;
```

We can print these out:

```c
#include <stdio.h>
int main() {
  for (size_t i = 0; i < sys_nerr; i++) {
    printf("%*zu = %s\n", 3, i, sys_errlist[i]);
  }
}
```

We get all the errors!:

```
% ./a.out
  0 = Undefined error: 0
  1 = Operation not permitted
  2 = No such file or directory
  3 = No such process
  4 = Interrupted system call
  5 = Input/output error
  6 = Device not configured
  7 = Argument list too long
  8 = Exec format error
  9 = Bad file descriptor
 10 = No child processes
 11 = Resource deadlock avoided
 12 = Cannot allocate memory
 13 = Permission denied
 14 = Bad address
 15 = Block device required
 16 = Resource busy
 17 = File exists
 18 = Cross-device link
 19 = Operation not supported by device
 20 = Not a directory
 21 = Is a directory
 22 = Invalid argument
 23 = Too many open files in system
 24 = Too many open files
 25 = Inappropriate ioctl for device
 26 = Text file busy
 27 = File too large
 28 = No space left on device
 29 = Illegal seek
 30 = Read-only file system
 31 = Too many links
 32 = Broken pipe
 33 = Numerical argument out of domain
 34 = Result too large
 35 = Resource temporarily unavailable
 36 = Operation now in progress
 37 = Operation already in progress
 38 = Socket operation on non-socket
 39 = Destination address required
 40 = Message too long
 41 = Protocol wrong type for socket
 42 = Protocol not available
 43 = Protocol not supported
 44 = Socket type not supported
 45 = Operation not supported
 46 = Protocol family not supported
 47 = Address family not supported by protocol family
 48 = Address already in use
 49 = Can't assign requested address
 50 = Network is down
 51 = Network is unreachable
 52 = Network dropped connection on reset
 53 = Software caused connection abort
 54 = Connection reset by peer
 55 = No buffer space available
 56 = Socket is already connected
 57 = Socket is not connected
 58 = Can't send after socket shutdown
 59 = Too many references: can't splice
 60 = Operation timed out
 61 = Connection refused
 62 = Too many levels of symbolic links
 63 = File name too long
 64 = Host is down
 65 = No route to host
 66 = Directory not empty
 67 = Too many processes
 68 = Too many users
 69 = Disc quota exceeded
 70 = Stale NFS file handle
 71 = Too many levels of remote in path
 72 = RPC struct is bad
 73 = RPC version wrong
 74 = RPC prog. not avail
 75 = Program version wrong
 76 = Bad procedure for program
 77 = No locks available
 78 = Function not implemented
 79 = Inappropriate file type or format
 80 = Authentication error
 81 = Need authenticator
 82 = Device power is off
 83 = Device error
 84 = Value too large to be stored in data type
 85 = Bad executable (or shared library)
 86 = Bad CPU type in executable
 87 = Shared library version mismatch
 88 = Malformed Mach-o file
 89 = Operation canceled
 90 = Identifier removed
 91 = No message of desired type
 92 = Illegal byte sequence
 93 = Attribute not found
 94 = Bad message
 95 = EMULTIHOP (Reserved)
 96 = No message available on STREAM
 97 = ENOLINK (Reserved)
 98 = No STREAM resources
 99 = Not a STREAM
100 = Protocol error
101 = STREAM ioctl timeout
102 = Operation not supported on socket
103 = Policy not found
104 = State not recoverable
105 = Previous owner died
106 = Interface output queue is full
```

However, don't use this array; it's deprecated. You should instead use the `strerror` function:

```c
#include <string.h>
char *strerror(int errnum);
```

So the modern way to print all errors is:

```c
#include <stdio.h>
#include <string.h>
int main() {
  for (size_t i = 0; i < sys_nerr; i++) {
    printf("%*zu = %s\n", 3, i, strerror(i));
  }
}
```
