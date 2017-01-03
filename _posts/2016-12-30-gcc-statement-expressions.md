---
title: GCC statement expressions
---

Lots of "modern" languages, like Rust, have converted statement syntax-forms into expressions. For example, `if`/`else`, which in C is a statement form, is in Rust a ternary expression. For another example, a series of expressions separated by semicolons becomes another expression, where in C this would be a compound statement.

GCC has a non-standard extension, [statement exprs](https://gcc.gnu.org/onlinedocs/gcc/Statement-Exprs.html), which provides something similar: the ability to put a compound statement in an expression position. Example:

```c
#include <stdio.h>
int main() {
  int x = ({ printf("lhs\n"); int y = 2; y*y; }) + ({ printf("rhs\n"); 5; });
  printf("x = %d\n", x);
  return 0;
}
```

which prints:

```
% ./a.out
lhs
rhs
x = 9
```

Notice that this printed `lhs` before `rhs`, so the left-hand operand of `+` was evaluated before the right-hand operand. You must not rely on this behavior! The evaluation order of two operands is unspecified in C. We could just as easily have received the print statements in the opposite order.
