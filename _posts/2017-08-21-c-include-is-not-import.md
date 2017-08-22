---
title: "C `include` is not an import"
---

Take this C program:

```c
#include <stdio.h>
int main() {
  fprintf(stdout, "Blimey! Error: %d\n", 42);
  return 0;
}
```

It's tempting to see `#include` as importing some functionality to use in your program -
in this case, `#include <stdio.h>` as importing `fprintf` and `stdout`.
But this is not what `#include` does here.
Instead, `#include <stdio.h>` just pulls in some text which declares the existence of `fprintf`.
You can run `clang -E` to run the C preprocessor on this file and spit out the included text.
Stripping out the unused included text, we get the following program,
which will compile and behave the same:

```c
typedef long long __int64_t;
typedef __int64_t __darwin_off_t;
struct __sFILEX;
struct __sbuf {
 unsigned char *_base;
 int _size;
};
typedef __darwin_off_t fpos_t;
typedef struct __sFILE {
 unsigned char *_p;
 int _r;
 int _w;
 short _flags;
 short _file;
 struct __sbuf _bf;
 int _lbfsize;
 void *_cookie;
 int (* _Nullable _close)(void *);
 int (* _Nullable _read) (void *, char *, int);
 fpos_t (* _Nullable _seek) (void *, fpos_t, int);
 int (* _Nullable _write)(void *, const char *, int);
 struct __sbuf _ub;
 struct __sFILEX *_extra;
 int _ur;
 unsigned char _ubuf[3];
 unsigned char _nbuf[1];
 struct __sbuf _lb;
 int _blksize;
 fpos_t _offset;
} FILE;
extern FILE *__stdoutp;
int fprintf(FILE * restrict, const char * restrict, ...) __attribute__((__format__ (__printf__, 2, 3)));
int main() {
  fprintf(__stdoutp, "Blimey! Error: %d\n", 42);
  return 0;
}
```

This is a key difference between `#include` and any `import` features in other languages.
In Go, for example, you cannot inline `fmt` instead of doing `import "fmt"`.

How, then, does an implementation of `fprintf` get into your compiled program?
Via _linking_.
More on that later.
