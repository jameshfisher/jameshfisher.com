---
title: How do I unregister a `signal` handler in C?
tags:
  - c
  - programming
taggedAt: '2024-03-26'
summary: >-
  To unregister a `signal` handler in C, use `signal(signum, SIG_DFL)` to reset
  the disposition to the default, or `signal(signum, SIG_IGN)` to set the
  disposition to ignore the signal.
---

There are two possible ways to unregister a signal handler, and both re-use the same `signal` function:

```c
signal(SIGINT, SIG_DFL);  // reset the disposition for SIGINT to the default
signal(SIGINT, SIG_IGN);  // set the disposition for SIGINT to ignore the signal
```

[The manual for `signal`](http://man.he.net/?topic=signal&section=2) explains the three possible values for a signal handler:

> `signal(signum, handler)` sets the disposition of the signal `signum` to `handler`, which is either `SIG_IGN`, `SIG_DFL`, or the address of a  programmer-defined  function (a "signal handler").

Example of unregistering handlers:

```c
#include <signal.h>
#include <assert.h>
#include <stdio.h>

void catch(int signo) {
  printf("catch received signal %d\n", signo);
}

int main(void) {
  // "Default" and "ignore" actions are encoded as pointers 0 and 1
  assert(SIG_DFL == (sig_t) 0);
  assert(SIG_IGN == (sig_t) 1);

  // disposition for all handlers is initially 0, i.e. SIG_DFL
  assert(signal(SIGINT, catch) == SIG_DFL);

  raise(SIGINT);  // calls catch

  assert(signal(SIGINT, SIG_IGN) == catch);

  raise(SIGINT);  // does nothing because disposition(SIGINT) == SIG_IGN

  assert(signal(SIGINT, SIG_DFL) == SIG_IGN);

  raise(SIGINT);
  // Terminates process! Because disposition(SIGINT) == SIG_DFL, and the default
  // action for SIGINT is to terminate the process

  // So we never get to here
  return 0;
}
```
