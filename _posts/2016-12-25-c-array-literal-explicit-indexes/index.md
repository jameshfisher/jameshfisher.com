---
title: How to write an array literal in C (with explicit indexes)
tags:
  - c
  - programming
  - semantics
taggedAt: '2024-03-26'
summary: >-
  C array literals can use explicit indexes. The array length is determined by the largest explicit index.
---

How do you write a C array literal? The way I knew of was with curly braces:

```c
#include <stdio.h>
int main() {
  char* strs[] = { "foo", "bar", "baz" };

  for (size_t i = 0; i < sizeof(strs)/sizeof(strs[0]); i++)
    printf("strs[%zu] = %s\n", i, strs[i]);

  return 0;
}
```

```
% ./a.out
strs[0] = foo
strs[1] = bar
strs[2] = baz
```

This lists the array elements in order; i.e. at indexes 0, 1, then 2. But there is also a notation which uses explicit indexes. This program is the same:

```c
#include <stdio.h>
int main() {
  char* strs[] = {
    [0] = "foo",
    [1] = "bar",
    [2] = "baz"
  };

  for (size_t i = 0; i < sizeof(strs)/sizeof(strs[0]); i++)
    printf("strs[%zu] = %s\n", i, strs[i]);

  return 0;
}
```

But what happens when we use different indexes? All arrays must have indexes 0 to N with no gaps, since they are contiguous blocks of memory. So how does C choose the array length N? And what goes in the gaps? Let's try it:

```c
#include <stdio.h>
int main() {
  char* strs[] = {
    [2] = "foo",
    [7] = "bar",
    [9] = "baz"
  };

  for (size_t i = 0; i < sizeof(strs)/sizeof(strs[0]); i++)
    printf("strs[%zu] = %s\n", i, strs[i]);

  return 0;
}
```

This prints:

```
% ./a.out
strs[0] = (null)
strs[1] = (null)
strs[2] = foo
strs[3] = (null)
strs[4] = (null)
strs[5] = (null)
strs[6] = (null)
strs[7] = bar
strs[8] = (null)
strs[9] = baz
```

C chooses the largest explicit index as the last index, and fills omitted indexes with zero values.

(Actually, I don't know if the values are necessarily zeroes. They might be undefined.)
