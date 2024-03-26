---
title: What does the C `signal` function return?
tags:
  - c
  - programming
taggedAt: '2024-03-26'
---

Look at the `signal` signature: `sig_t signal(int sig, sig_t func)`. What is that return value?

Let's remind ourselves what `signal` actually does. `signal` takes two arguments, e.g. `signal(i, h)`. The first argument is a signal number: an `int`, e.g. `SIGINT` which is `2` and means "interrupt program". The second argument is a _signal handler_, which is a pointer to a function which takes a signal number as argument. `signal(i, h)` requests that the handler `h` be called when the process receives the interrupt `i`.

But `signal` also has a return value. In `h1 = signal(i, h2)`, h1 is the "previous action" for interrupt `i`, i.e. the previously registered action. If there was no action previously registered, `signal` returns `NULL`.

An example showing how the return value depends on the previous registrations for the signal number:

```c
#include <signal.h>
#include <assert.h>
#include <stdio.h>

void catch1(int signo) {
  printf("catch1 received signal %d\n", signo);
}

void catch2(int signo) {
  printf("catch2 received signal %d\n", signo);
}

int main(void) {
  sig_t prev_sigint_handler1 = signal(SIGINT, catch1);
  assert(prev_sigint_handler1 == NULL);

  sig_t prev_sighup_handler1 = signal(SIGHUP, catch2);
  assert(prev_sighup_handler1 == NULL);

  raise(SIGINT);  // calls catch1
  raise(SIGHUP);  // calls catch2

  // Now let's swap the handlers

  sig_t prev_sigint_handler2 = signal(SIGINT, catch2);
  assert(prev_sigint_handler2 == catch1);

  sig_t prev_sighup_handler2 = signal(SIGHUP, catch1);
  assert(prev_sighup_handler2 == catch2);

  raise(SIGINT);  // calls catch2
  raise(SIGHUP);  // calls catch1

  return 0;
}
```

```
% ./a.out
catch1 received signal 2
catch2 received signal 1
catch2 received signal 2
catch1 received signal 1
```
