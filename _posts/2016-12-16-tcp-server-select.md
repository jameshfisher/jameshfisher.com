---
title: TCP server with the `select` syscall
---

Yesterday I described the minimal commands for a TCP server. But that server can only serve one client at a time! It does some work with one TCP connection, then closes it and deals with the next TCP connection, etc. This is not how most servers work; the clients expect to be able to talk to the server regardless of what other clients are around.

The reason the server can only handle one connection at a time is that the process blocks waiting for a single kind of event. If the process calls `accept`, the process blocks waiting for a new TCP connection, and nothing else will wake it up. If the process calls `recv(fd)`, the process blocks waiting for some bytes sent on that existing TCP connection, and nothing else will wake it up.

To solve this, the process needs to say, "OS, please put me to sleep and wake me up when something interesting happens". In our case, "something interesting" would be a new TCP connection or some bytes sent on any existing TCP connection.

The old-school UNIX way to say this is the `select` syscall. Roughly, we call `ready_fds = select(fds)`, which means "OS, please put me to sleep, and when something happens on a file descriptor in `fds`, wake me up and tell me which file descriptors are ready". Here, "ready" means "you can call a blocking syscall on it, but it won't block". If the file descriptor is linked to a TCP listening port, you can call `accept` on it, and it won't block. Thus, ""ready" for a TCP listening port means "there is a client waiting to open a TCP connection". If the file descriptor is linked to a TCP connection, you can call `recv` on it, and it won't block. Thus, "ready" for a TCP connection means "there are some bytes in the buffer waiting to be read".

After the `select` call, the process can decide which file descriptors to call `accept` or `recv` on. Because neither `accept` or `recv` will block, the server process can deal with clients in a timely way.

The `fds` argument is an `fd_set*`. An `fd_set` is an array of bits, each of which corresponds to a file descriptor. There are `FD_SETSIZE` bits, and on my machine, `FD_SETSIZE` is 1024. Thus, we are limited to 1024 file descriptors, which means ~1000 connected clients.

First wrinkle: the syscall doesn't return a new file descriptor set; it overwrites the one passed in. So we must track which file descriptors we have elsewhere, then copy them to an `fdset` before calling `select`, and after `select` returns, we must iterate over the same `fdset` to find out which file descriptors are "ready".

To work with `fdset`s, we use the functions `FD_ZERO` (the empty set), `FD_SET` (add to set), `FD_CLR` (remove from set), and `FD_ISSET` (test set membership). A convenience `FD_COPY` copies one set to another. (They're actually macros; we could see in future how they are implemented.)

Second wrinkle: you actually pass in three `fdset*` arguments, not one. The first is for "read" operations, the second for "write" operations, the third for "exceptional" conditions. Thus, `select(readfds, writefds, errorfds)` means "OS, please put me to sleep, and wake me up when a file descriptor in `readfds` is ready for reading, or when a file descriptor in `writefds` is ready for writing, or when a file descriptor in `errorfds` has some exceptional condition."

This is a mouthful, and it's not totally clear what it means. What is "ready for writing"? As always, it depends on the resource that the file descriptor is linked to. If it's a TCP connection, it means there is space in the TCP outbound buffer. If it's a a TCP listening socket, I don't know.

If we're not interested in some of these sets, e.g. we're not interested in write-readiness, we can pass `NULL` as the argument, and the process will not be notified of write-readiness.

The third wrinkle is that the process can pass another argument, a timeout. If nothing happens in that time, the call will unblock the process, telling it that nothing happened.
