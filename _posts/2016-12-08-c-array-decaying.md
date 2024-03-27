---
title: What is 'array decaying' in C?
tags:
  - c
  - programming
  - semantics
  - pointers
taggedAt: '2024-03-26'
summary: >-
  Arrays in C can "decay" to pointers, but are not inherently pointers. The size
  of an array is lost during decay.
---

It is sometimes said that arrays in C are basically pointers. This is not true. What is true is that a value of an array type can _decay_ to a value of a pointer type.

Take this:

```c
#include <stdio.h>

void takes_arr_pointer_1(int* arr) {
  printf("in takes_arr_pointer_1, sizeof(arr) = %d\n", sizeof(arr));
}

void takes_arr_pointer_2(int arr[]) {
  printf("in takes_arr_pointer_2, sizeof(arr) = %d\n", sizeof(arr));
}

int main() {
  int arr[100];
  printf("in main, sizeof(arr) = %d\n", sizeof(arr));
  takes_arr_pointer_1(arr);
  takes_arr_pointer_2(arr);
  return 0;
}
```

This prints:

```
% ./a.out
in main, sizeof(arr) = 400
in takes_arr_pointer_1, sizeof(arr) = 8
in takes_arr_pointer_2, sizeof(arr) = 8
```

In the context of `main`, the `arr` variable is an array of 100 `int`s. On my machine, `sizeof(int) = 4`, so `sizeof(arr) = 400`.

In the context of both other functions, the `arr` variable is a pointer to an `int`. Thus, `sizeof(arr)` is the size of a pointer, which on my machine is 8 bytes.

We were able to pass the `int arr[100]` to both functions, even though they accept pointers. The conversion of `arr` from an array type to a pointer type is known as _array decaying_, i.e. the array has "decayed" to a pointer.

The two parameter definitions `int* arr` and `int arr[]` are actually the same. Perhaps this is where the confusion comes from.
