---
title: >-
  How do I measure program execution time in C? How do I use the `times`
  function?
tags:
  - c
  - programming
  - performance
  - system-calls
taggedAt: '2024-03-26'
summary: >-
  Use the `times()` system call in C to measure the CPU time used by a process,
  distinguishing between time charged to the process itself and time charged to
  the kernel on its behalf.
---

How do you measure the time taken by a program, or a program fragment? The general approach is simple (pseudocode):

```c
time time_thing(f) {
  time t1 = now();
  do_thing();
  time t2 = now();
  return t2-t1;
}
```

The subtlety is in the semantics of your `now` function. As it turns out, C has many functions available to get the "current time". The obvious one is `gettimeofday`:

```c
#include <sys/time.h>
int gettimeofday(struct timeval *restrict tp, void *restrict tzp);  // The system's notion of the current Greenwich time and the current time zone
```

But `gettimeofday` is inappropriate for measuring the running time of your process. `gettimeofday` measures "wall-clock time", which means you get a lot of noise due to other system activity, such as other processes and the kernel.

There is another function called `times`, which has another notion of "current time": the amount of time "charged" to the current process since it began. The kernel "charges" processes by keeping a counter of how much CPU time they have used.

```c
#include <sys/times.h>
struct tms {
  clock_t tms_utime;  // amount of CPU time charged to current process
  clock_t tms_stime;  // amount of CPU time charged to kernel on behalf of current process
  // ...
};
void times(struct tms * buf);  // Fill buf with current process charge
```

Notice the counters distinguish between time charged to the process, and time charged to the kernel on behalf of that process. The latter might include things like: setting up connections, setting up kernel queues.
