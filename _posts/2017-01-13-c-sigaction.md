---
title: What is `sigaction` in C?
tags:
  - c
  - programming
taggedAt: '2024-03-26'
---

The "`signal` facility is a simplified interface to the more general `sigaction` facility." Indeed, when we trace a C program with `signal` calls, we only see calls to `sigaction` system calls. We're also told that "`signal` is less portable than `sigaction` when establishing a signal handler".

Let's look into `sigaction`. It's a system call. It has a more complicated interface than `signal`:

```c
#include <signal.h>
int sigaction(int sig, const struct sigaction *restrict act, struct sigaction *restrict oact);
```

`sigaction(sig, act, oact)` means "set the disposition for `sig` to `act`, and store the old disposition in `oact`". Its return value is 0 or -1, indicating whether the system call errored.

Those `struct sigaction`s are "dispositions", meaning they express what to do when the given signal is received. The disposition consists of a handler, a mask, and some flags:

```c
struct sigaction {
 union __sigaction_u __sigaction_u;  /* signal handler */
 sigset_t sa_mask;               /* signal mask to apply */
 int     sa_flags;               /* see signal options below */
};
```

The "mask" is a `sigset_t`, which is a set of signal numbers. The mask for signal `sig` expresses which signals the process can receive while it is handling signal number `sig`.

Let's look at how `signal` is implemented:

```c
// allows for a signal to be caught, to be ignored, or to generate an interrupt
sig_t signal(int sig, sig_t handler) {

    // Construct the new disposition
    struct sigaction newDisp;
    newDisp.sa_handler = handler;
    sigemptyset(&newDisp.sa_mask);
    newDisp.sa_flags = SA_RESTART;

    // We'll put the old disposition here
    struct sigaction prevDisp;

    if (sigaction(sig, &newDisp, &prevDisp) == -1) {
      return SIG_ERR;
    } else {
      // User of signal doesn't care about the whole disposition; just the handler
      return prevDisp.sa_handler;
    }
}
```
