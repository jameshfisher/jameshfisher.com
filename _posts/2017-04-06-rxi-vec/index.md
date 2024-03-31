---
title: rxi/vec - a simple C vector library
tags: []
summary: >-
  rxi/vec provides dynamic arrays in C, including push, pop, and iteration, without the need to manage array resizing and length.
---

C provides arrays, but these do less than most other languages' array structures. For instance, if you want to push a new element onto the end of your array, you must go through the work of resizing it with `realloc` to make room for the new element. For this, you need to keep track of the array length separately. Then to avoid constant reallocation you keep a separate length and capacity. Soon you've written a vector library.

Instead, you can use someone else's vector library. I like [rxi/vec](https://github.com/rxi/vec). Here's an example of using it. Installation:

```sh
$ brew install clib
$ clib install rxi/vec
$ find .
.
./deps
./deps/vec
./deps/vec/package.json
./deps/vec/vec.c
./deps/vec/vec.h
```

Example program:

```c
#include <stdio.h>
#include "./deps/vec/vec.h"
typedef vec_t(char*) vec_string_t;
void print_vec(vec_string_t * strings) {
  size_t i; char * string;
  vec_foreach(strings, string, i) {
    printf("strings[%zu] = \"%s\"\n", i, string);
  }
}
int main() {
  vec_string_t strings;
  vec_init(&strings);  // memset(&strings, 0, sizeof(strings));
  vec_push(&strings, "hello");
  vec_push(&strings, "world");
  print_vec(&strings);
  char* world = vec_pop(&strings);
  printf("popped %s\n", world);
  print_vec(&strings);
  vec_deinit(&strings);
  return 0;
}
```

Running it gives:

```
$ clang main.c deps/vec/vec.c
$ ./a.out
strings[0] = "hello"
strings[1] = "world"
popped world
strings[0] = "hello"
```

In a future post, I'll show how rxi/vec is implemented.
