---
title: How do I set a socket to be non-blocking?
justification: I'm learning networking by understanding pieces of Redis.
tags: []
---

The traditional UNIX system calls are _blocking_. For example:

> `accept()` blocks the caller until a connection is present.
>
> If no messages space is available at the socket to hold the message to be transmitted, then `send()` normally blocks.
>
> If no messages are available at the socket, the `recv` call waits for a message to arrive.

When writing a server, we need to be ready to react to many kinds of event which could happen next: a new connection is made, or a client sends us a request, or a client drops its connection. If we make a call to, say, `accept`, and the call blocks, then we lose our ability to respond to other events.

The traditional answer to this problem is the `select` system call. We call `select` indicating various blocking calls we're interested in. `select` then blocks until one or more of those blocking calls is _ready_, meaning that calling it will not block.

If our server only makes calls which `select` has indicated will not block, will everything be OK? No! These two operations - `select` followed by the hopefully non-blocking call - are non-atomic. By the time the server makes the call, the situation may have changed! A pending connection may disappear before we try to `accept` it. A client attempting to send data may disappear before we try to `read` its data. Data may be read from a socket by a different process before we get to it.

The answer to this is **non-blocking I/O.** We set a flag on a socket which marks that socket as non-blocking. This means that, when performing calls on that socket (such as `read` and `write`), if the call cannot complete, then instead it will fail with an error like `EWOULDBLOCK` or `EAGAIN`.

To mark a socket as non-blocking, we use the `fcntl` system call. Here's an example:

```c
int flags = guard(fcntl(socket_fd, F_GETFL), "could not get file flags");
guard(fcntl(socket_fd, F_SETFL, flags | O_NONBLOCK), "could not set file flags");
```

Here's a complete example. This server opens TCP port 8080, and marks the listening socket as non-blocking. The server then loops, repeatedly asking for a new connection. If the server gets a connection, the server writes something to the connection then closes it. If the server does not get a connection (because no connections were made to the server, and the socket was marked non-blocking), then the server sleeps for a second before trying again.

```c
#include <stdlib.h>
#include <unistd.h>
#include <sys/socket.h>
#include <stdio.h>
#include <fcntl.h>
#include <netinet/in.h>
#include <errno.h>

int guard(int n, char * err) { if (n == -1) { perror(err); exit(1); } return n; }

int main() {
  int listen_socket_fd = guard(socket(AF_INET, SOCK_STREAM, 0), "could not create TCP listening socket");
  int flags = guard(fcntl(listen_socket_fd, F_GETFL), "could not get flags on TCP listening socket");
  guard(fcntl(listen_socket_fd, F_SETFL, flags | O_NONBLOCK), "could not set TCP listening socket to be non-blocking");
  struct sockaddr_in addr;
  addr.sin_family = AF_INET;
  addr.sin_port = htons(8080);
  addr.sin_addr.s_addr = htonl(INADDR_ANY);
  guard(bind(listen_socket_fd, (struct sockaddr *) &addr, sizeof(addr)), "could not bind");
  guard(listen(listen_socket_fd, 100), "could not listen");
  for (;;) {
    int client_socket_fd = accept(listen_socket_fd, NULL, NULL);
    if (client_socket_fd == -1) {
      if (errno == EWOULDBLOCK) {
        printf("No pending connections; sleeping for one second.\n");
        sleep(1);
      } else {
        perror("error when accepting connection");
        exit(1);
      }
    } else {
      char msg[] = "hello\n";
      printf("Got a connection; writing 'hello' then closing.\n");
      send(client_socket_fd, msg, sizeof(msg), 0);
      close(client_socket_fd);
    }
  }
  return EXIT_SUCCESS;
}
```

Notice the calls to `fcntl` and the check for `EWOULDBLOCK` when calling `accept`. When running this and making connections, we see:

```
$ ./a.out
No pending connections; sleeping for one second.
No pending connections; sleeping for one second.
No pending connections; sleeping for one second.
Got a connection; writing 'hello' then closing.
No pending connections; sleeping for one second.
Got a connection; writing 'hello' then closing.
Got a connection; writing 'hello' then closing.
No pending connections; sleeping for one second.
No pending connections; sleeping for one second.
^C
```

I'm making repeated TCP connections with:

```
$ nc localhost 8080
hello
$ nc localhost 8080
hello
$ nc localhost 8080
hello
```
