---
title: "How do I put an array in a struct in C?"
---

Redis uses a string encoding which it calls "Simple Dynamic Strings". Simplified, it looks like:

```c
struct sds {
  size_t len;
  char buf[];
};
```

The interesting thing here is the `buf` field: it has no defined length. Surely, then, this is a "decayed array", i.e. a pointer to an array of `char`s? But no!:

```c
#include <stdio.h>

struct sds {
  size_t len;
  char buf[];
};

int main() {
  struct sds str;

  printf("sizeof(str) = %zu\n", sizeof(str));

  printf("sizeof(str.len) = %zu\n", sizeof(str.len));

  // printf("sizeof(str.buf) = %zu\n", sizeof(str.buf));
  // "invalid application of 'sizeof' to an incomplete type 'char []'"

  return 0;
}
```

```
% ./a.out
sizeof(str) = 8
sizeof(str.len) = 8
```

The `buf` field has the _incomplete type_ `char []`, and yet `struct sds` is a complete type with size 8 bytes.

It seems C allows a single such array type at the end of the struct definition. It is invalid to have two such arrays:

```c
struct sds {
  size_t len;
  char buf[];
  char buf2[];  // error: field has incomplete type 'char []'
};
```

This makes sense, because C must be able to determine the offset of every field, but the unknown length of `buf` makes it impossible to determine the offset of `buf2`. For the same reason, it is invalid to put the incomplete type in the middle of the list:

```c
struct sds {
  char buf[];  // error: field has incomplete type 'char []'
  size_t len;
};
```

The size of the `buf` field is 0 bytes, and you become responsible for maintaining the size of the allocation. So to create such an allocation, we do:

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

struct sds {
  size_t len;
  char buf[];
};

int main() {
  struct sds * str = malloc(sizeof(struct sds) + sizeof("foo"));
  str->len = sizeof("foo");
  strcpy(str->buf, "foo");
  return 0;
}
```
