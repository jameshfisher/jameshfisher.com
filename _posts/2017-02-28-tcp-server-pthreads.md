---
title: "How to write a TCP server with the `pthread` API"
---

I've described several ways to write a TCP server:

* using the `socket` system calls, serving one client at a time
* using `fork` system call to serve multiple clients (one client per process)
* using `select` system call to serve multiple clients
* using `kqueue` system calls to serve multiple clients

Today I'll describe another: using the `pthread` library to serve multiple clients. The pthread functions are not system calls, but they are part of the standard POSIX API. (In future, I'll describe how pthreads are implemented on top of system calls.)

The library in `pthread.h` includes many functions, but today we'll just use the most fundamental one:

```c
#include <pthread.h>
int pthread_create(pthread_t *thread, const pthread_attr_t *attr, void *(*start_routine)(void *), void *arg);
```

The `pthread_create` function is somewhat like the `fork` system call: it creates two threads of control where previously there was one. The important differences today are:

* The `fork` system call starts the new process at the same program counter as the old process. But the `pthread_create` function takes a function pointer, and starts the new thread at that position.
* The `fork` system call clones the file descriptor table for the new process. The `pthread_create` function does not; instead, the thread shares the same file descriptor table.

Here's the program, which runs an "echo" server for every TCP client, using `pthread_create` for each new TCP connection:

```c
#include <stdlib.h>
#include <stdio.h>
#include <unistd.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <pthread.h>

int guard(int r, char * err) {if (r == -1) { perror(err); exit(1); } return r; }

void * thread_func(void * arg) {
  intptr_t conn_fd = (int) arg;
  printf("thread: serving fd %ld\n", conn_fd);
  char buf[1024];
  for (;;) {
    int bytes_received = guard(recv(conn_fd, buf, sizeof(buf), 0), "Could not recv");
    if (bytes_received == 0) { goto stop_serving; }
    int bytes_sent = 0;
    while (bytes_sent < bytes_received) {
      ssize_t bytes_sent_this_call = send(conn_fd, buf+bytes_sent, bytes_received-bytes_sent, 0);
      if (bytes_sent_this_call == -1) { goto stop_serving; }
      bytes_sent += bytes_sent_this_call;
    }
  }
  stop_serving:
  guard(close(conn_fd), "Could not close socket");
  printf("thread: finished serving %ld\n", conn_fd);
  return NULL;
}

int main(void) {
  int listen_fd = guard(socket(AF_INET, SOCK_STREAM, 0), "Could not create TCP listening socket");
  guard(listen(listen_fd, 100), "Could not listen");
  struct sockaddr_in addr;
  socklen_t addr_bytes = sizeof(addr);
  guard(getsockname(listen_fd, (struct sockaddr *) &addr, &addr_bytes), "Could not get sock name");
  printf("Listening on port %d\n", ntohs(addr.sin_port));
  for (;;) {
    intptr_t conn_fd = guard(accept(listen_fd, NULL, NULL), "Could not accept");
    pthread_t thread_id;
    int ret = pthread_create(&thread_id, NULL, thread_func, (void*) conn_fd);
    if (ret != 0) { printf("Error from pthread: %d\n", ret); exit(1); }
    printf("main: created thread to handle connection %ld\n", conn_fd);
  }
  return 0;
}
```
