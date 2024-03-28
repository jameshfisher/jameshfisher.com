---
title: What are `setjmp` and `longjmp` in C?
tags:
  - setjmp
  - longjmp
  - c
  - programming
taggedAt: '2024-03-26'
summary: >-
  `setjmp` and `longjmp` in C bypass normal function call and
  return flow, allowing a function to return to a previously saved state.
  `setjmp` saves the current execution context, and `longjmp` restores it.
---

Normal program flow in C follows function calls and branching constructs (`if`, `while` etc). The functions `setjmp` and `longjmp` introduce another kind of program flow.

```c
#include <setjmp.h>
int setjmp(jmp_buf env);
void longjmp(jmp_buf env, int val);
```

In its simplest use, the process calls `setjmp` somewhere, then at some time later calls `longjmp`. Roughly, the call to `longjmp` restores the process in the state that it existed when it called `setjmp`. Thus, this program is an infinite loop:

```c
#include <setjmp.h>
#include <stdio.h>

jmp_buf buf;

int main(void) {
  int r = setjmp(buf);
  printf("r = %d\n", r);
  longjmp(buf, 42);
  return 0;
}
```

... which prints:

```
% ./a.out
r = 0
r = 42
r = 42
r = 42
r = 42
r = 42
r = 42
...
```

This loops forever, since the process state at `setjmp` led to the call to `longjmp`. Thus, the process makes the calls `setjmp`, `longjmp`, `longjmp`, `longjmp`, _ad infinitum_. (Actually, I think this pattern causes undefined behavior. The `setjmp` and `longjmp` calls are supposed to come in pairs.)

The program needs a way, immediately after the `setjmp` call, to determine whether it just set the jump or it had its state restored. The return value of `setjmp` provides this. After a normal call to `setjmp`, it returns `0`. When the state is restored after a `longjmp`, the return value is provided by the `longjmp` call; this is what the second argument to `longjmp` provides. So this program does not infinite loop:

```c
#include <setjmp.h>
#include <stdio.h>

jmp_buf buf;

int main(void) {
  switch (setjmp(buf)) {
    case 0:
      printf("I just set jump\n");
      longjmp(buf, 42);
      break;
    case 42:
      printf("Returned from longjmp\n");
      break;
    default:
      fprintf(stderr, "We shouldn't get here!\n");
  }

  return 0;
}
```

This prints:

```
% ./a.out
I just set jump
Returned from longjmp
```

The `man` page says that `setjmp` "saves its calling environment" in `buf`, and `longjmp` "restores the environment". It's a bit vague on what that "environment" is, though. Let's find out in a future post.
