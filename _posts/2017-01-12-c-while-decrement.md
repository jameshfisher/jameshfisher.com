---
title: Doing something `n` times in C with `while` and decrement
tags:
  - c
  - programming
taggedAt: '2024-03-26'
---

Here's the standard way to `do_something()` `n` times in C:

```c
for (int i = 0; i < n; i++) {
  do_something();
}
```

But if you don't use `n` after the loop, and you don't use `i` in the loop body, this is a simpler way:

```c

while (n--) {
  do_something();
}
```

Full example:

```c
#include <stdio.h>
int main(void) {
  int n = 3;
  while (n--) {
    printf("hey\n");
  }
  return 0;
}
```

which prints:

```
% ./a.out
hey
hey
hey
```
