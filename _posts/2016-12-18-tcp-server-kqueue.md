---
title: How to write a TCP server with the `kqueue` API
tags:
  - c
  - programming
  - networking
  - tcp
  - kqueue
  - posix
  - system-calls
taggedAt: '2024-03-26'
---

I previously described [how a process can serve multiple TCP clients simultaneously using the `select` system call](/2016/12/16/tcp-server-select/), which blocks waiting for one of many possible events.

The `select` system call is inefficient. All this has to happen when we call `select`:

1. Process constructs a temporary `fdset` (possibly by copying another one with `FD_COPY`).
1. Process calls `select`.
1. Kernel copies the `fdset` from process memory to kernel memory.
1. Eventually, some events happen which unblock the `select`.
1. Kernel copies stuff from kernel memory to process memory, telling the process which file descriptors are ready.
1. Process iterates through all file descriptors, checking which ones are ready.

There are at least three copying steps, copying a 128 byte array, and there is at least one iteration step, iterating over 1024 bits.

There are two modern alternatives to `select` which provide a more efficient API: less copying and less iteration. On BSD such as macOS, there is `kqueue`. On Linux, there is `epoll`. Since I'm on macOS, we'll look at kqueue.

Kqueue stands for "kernel queue". The API gives processes a way to create event queues in kernel space, and subscribe to certain kinds of event. It's roughly a publish-subscribe system! The kernel acts as pub-sub server, the process acts as pub-sub client, the process connects to the server by creating a kqueue, the process subscribes to events by registering "filters" which can match events, and the kernel and processes can publish events to the queue.

We begin with the `kqueue()` syscall, which creates a new kernel queue and returns a file descriptor which references that queue. (Once again, "file descriptor" is a misnomer, and the descriptor just references this new kind of resource.)

There is only one other syscall: `kevent`. A call to `kevent` does two things: submit "changes", then wait for new events. "Changes" include registering new filters and publishing events. Here's the full API:

```c
#include <sys/types.h>
#include <sys/event.h>
#include <sys/time.h>
int kqueue(void);
int kevent(int kq,
           const struct kevent *changelist, int nchanges,  // any changes to register (can be NULL/0)
           struct kevent *eventlist, int nevents,          // kernel will put events here if not NULL/0
           const struct timespec *timeout);
```
