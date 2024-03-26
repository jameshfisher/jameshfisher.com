---
title: What do array subscripts mean in C?
tags:
  - c
  - programming
taggedAt: '2024-03-26'
---

C array subscripts can be understood via pointer arithmetic.

```c
#include <stdio.h>
int main(void) {
  int vals[10];
  printf("%d\n", vals[3]);
  return 0;
}
```

What does `vals[3]` mean here? It means "take the pointer `vals`, shift it up to the fourth element in the array, and dereference that pointer". We can write this out as `*(vals + 3)`.

This is in fact the definition of the array subscript operator in C: `a[b]` means `*(a+b)`.

[The Standard](http://www.open-std.org/jtc1/sc22/wg14/www/docs/n1256.pdf) says

> For addition, either both operands shall have arithmetic type, or one operand shall be a
> pointer to an object type and the other shall have integer type. (Incrementing is
> equivalent to adding 1.)

Above, we are in the latter case: "one operand shall be a pointer to an object type and the other shall have integer type". `vals` has type `int*`, and `3` has integer type.

> When an expression that has integer type is added to or subtracted from a pointer, the
> result has the type of the pointer operand.

So the expression `vals+3` has type `int*`.

> the result points to an element offset from the original element such that the difference of the subscripts of the resulting and original array elements equals the integer expression.

That is, if we consider that `vals` actually points to some `arr[n]`, then `vals+3` points to `arr[n+3]`.

Note that this definition is commutative: `3+vals` also points to `arr[n+3]`.

This has the funny consequence that `a[b]` is actually the same as `b[a]`!
