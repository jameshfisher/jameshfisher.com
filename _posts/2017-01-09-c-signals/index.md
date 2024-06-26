---
title: What are 'signals' in C?
tags:
  - c
  - programming
taggedAt: '2024-03-26'
summary: >-
  Signals in C are software interrupts that allow programs to respond to events.
  The `signal.h` header provides functions to register signal handlers and send
  signals.
---

We've all seen "signals" like `SIGTERM`,  `SIGSEGV` (memory issues!). But what is a signal? Let's explore the basics from a C perspective.

The Signals API is in `<signal.h>`. Example usage:

```c
#include <signal.h>
#include <stdio.h>

void catch(int signo) {
  printf("Received signal %d\n", signo);
}

int main(void) {
  if (signal(SIGINT, catch) == SIG_ERR) {
    printf("Error setting signal handler\n");
  }
  printf("Raising signal %d\n", SIGINT);
  raise(SIGINT);
  printf("Exiting normally\n");
  return 0;
}
```

This prints

```c
Raising signal 2
Received signal 2
Exiting normally
```

Important functions in `<signal.h>` are `signal` and `raise`:

```c
#include <signal.h>
typedef void (*sig_t) (int);
sig_t signal(int sig, sig_t func);  // allows for a signal to be caught, to be ignored, or to generate an interrupt
int raise(int sig);  // sends the signal sig to the current thread
```

Above, we raised the signal "artificially" with `raise`. We can also raise `SIGINT` ("interrupt signal") with `Ctrl-C` when running the program. Consider:

```c
#include <signal.h>
#include <stdio.h>
void catch(int signo) {
  printf("Received signal %d\n", signo);
}
int main(void) {
  signal(SIGINT, catch);
  for (;;) {
    getchar();
  }
  return 0;
}
```

```
% ./a.out
^CReceived signal 2
^CReceived signal 2
^CReceived signal 2
...
```
