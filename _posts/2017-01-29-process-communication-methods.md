---
title: In what ways can processes communicate?
tags:
  - posix
  - ipc
  - c
  - programming
taggedAt: '2024-03-26'
---

UNIX processes on their own are boring; they are interesting when they communicate. There are many methods of "Inter-process communication", or IPC. What are all these methods? There are many!:

* **Files**: `open`, `close`, `read`, `write`. The sender writes to a file; the receiver reads from it. USP: durability.
* **Pipes**: `pipe`, `close`, `read`, `write`. A pipe, created with `pipe`, is a byte queue. `pipe` returns file descriptors for both ends. Closing both ends destroys the pipe.
* **Signals**: `sigaction`, `kill`. The sender can send a signal to the receiver. A signal does not have associated data.
* **Socket**: `socket`, `bind`-`listen`-`accept`/`connect`, `close`, `read`, `write`. Sockets link processes over network interfaces. USP: connecting remote processes (not just local ones).
* **Message queues**: `mq_open`, `mq_timedreceive`, `mq_timedsend`. A message queue is a bit like a pipe, but with a proper concept of messages (a message is a byte array).
* **Semaphores**: `semget`, `semop`. Used to protect common resources used by processes.
* **Shared memory**: `shmget` and friends. A single memory location can be read/written by multiple processes. USP: communication via memory, not system calls.
