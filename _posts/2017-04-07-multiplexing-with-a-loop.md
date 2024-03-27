---
title: Multiplexing by looping over nonblocking sockets
justification: I'm learning networking. Currently concentrating on TCP.
tags: []
---

To multiplex multiple clients in a server process, we traditionally use two tools: `select` (or similar) to discover which clients can be processed, and non-blocking sockets to ensure that we don't block when processing those clients.

It turns out that non-blocking sockets are sufficient to multiplex several clients, and `select` (or similar) are optimizations. To multiplex with only non-blocking sockets, we loop over each socket, repeatedly attempting to process them.

The following server keeps a total of the number of bytes received by all clients. Thus the server is a shared counter.

```
#include <sys/socket.h>
#include <fcntl.h>
#include <netinet/in.h>
#include <errno.h>
#include <stdio.h>
#include <stdbool.h>
#include <unistd.h>
#include "./deps/vec/vec.c"
int guard(int n, char* err) { if (n == -1) { perror(err); exit(1); } return n; }
struct client { int fd; bool deleted; };
typedef vec_t(struct client) vec_client_t;
int tcp_listen_fd;
vec_client_t clients;
char buf[1024];
int total = 0;
void set_nonblocking(int fd) {
  int flags = guard(fcntl(tcp_listen_fd, F_GETFL), "could not get flags");
  guard(fcntl(tcp_listen_fd, F_SETFL, flags | O_NONBLOCK), "could not set flags");
}
int main() {
  vec_init(&clients);
  tcp_listen_fd = guard(socket(AF_INET, SOCK_STREAM, 0), "could not create TCP listening socket");
  set_nonblocking(tcp_listen_fd);
  struct sockaddr_in addr;
  addr.sin_family = AF_INET;
  addr.sin_port = htons(6379);
  addr.sin_addr.s_addr = htonl(INADDR_ANY);
  guard(bind(tcp_listen_fd, (struct sockaddr *) &addr, sizeof(addr)), "could not bind");
  guard(listen(tcp_listen_fd, 100), "could not listen");
  for(;;) {
    printf("Accepting new connections.\n");
    int new_client_fd = accept(tcp_listen_fd, NULL, NULL);
    if (new_client_fd == -1 && errno == EWOULDBLOCK) {
      printf("No new client connections.\n");
    } else {
      printf("New client connection %d!\n", new_client_fd);
      set_nonblocking(new_client_fd);
      struct client new_client;
      new_client.fd = new_client_fd;
      new_client.deleted = false;
      vec_push(&clients, new_client);
    }
    printf("Accepting increments.\n");
    struct client * client; size_t i;
    vec_foreach_ptr(&clients, client, i) {
      printf("Attempting to read an increment from client %d.\n", client->fd);
      int num_bytes_read = read(client->fd, buf, sizeof(buf));
      if (num_bytes_read == -1) {
        printf("The client hasn't sent anything.\n");
      } else if (num_bytes_read == 0) {
        printf("The client disappeared. We'll delete it soon.\n");
        client->deleted = true;
      } else {
        printf("An increment by %d.\n", num_bytes_read);
        total += num_bytes_read;
        printf("New total: %d.\n", total);
      }
    }
    printf("Deleting dead clients.\n");
    vec_foreach_ptr(&clients, client, i) {
      if (client->deleted) {
        printf("Deleting client %d.\n", client->fd);
        vec_swapsplice(&clients, i, 1);
      }
    }
    printf("Sleeping for one second.\n");
    sleep(1);
  }
  vec_deinit(&clients);
  return 0;
}
```

Because the process repeatedly loops, its output is quite verbose, usually reporting that nothing happened:

```
$ ./a.out
Accepting new connections.
No new client connections.
Accepting increments.
Deleting dead clients.
Sleeping for one second.
Accepting new connections.
No new client connections.
Accepting increments.
Deleting dead clients.
Sleeping for one second.
Accepting new connections.
No new client connections.
Accepting increments.
Deleting dead clients.
Sleeping for one second.
Accepting new connections.
No new client connections.
Accepting increments.
Deleting dead clients.
Sleeping for one second.
Accepting new connections.
New client connection 4!
Accepting increments.
Attempting to read an increment from client 4.
The client hasn't sent anything.
Deleting dead clients.
Sleeping for one second.
Accepting new connections.
No new client connections.
Accepting increments.
Attempting to read an increment from client 4.
The client hasn't sent anything.
Deleting dead clients.
Sleeping for one second.
Accepting new connections.
No new client connections.
Accepting increments.
Attempting to read an increment from client 4.
An increment by 6.
New total: 6.
Deleting dead clients.
Sleeping for one second.
Accepting new connections.
No new client connections.
Accepting increments.
Attempting to read an increment from client 4.
An increment by 6.
New total: 12.
Deleting dead clients.
Sleeping for one second.
Accepting new connections.
No new client connections.
Accepting increments.
Attempting to read an increment from client 4.
The client hasn't sent anything.
Deleting dead clients.
Sleeping for one second.
Accepting new connections.
No new client connections.
Accepting increments.
Attempting to read an increment from client 4.
The client hasn't sent anything.
Deleting dead clients.
Sleeping for one second.
Accepting new connections.
No new client connections.
Accepting increments.
Attempting to read an increment from client 4.
The client hasn't sent anything.
Deleting dead clients.
Sleeping for one second.
Accepting new connections.
New client connection 5!
Accepting increments.
Attempting to read an increment from client 4.
The client hasn't sent anything.
Attempting to read an increment from client 5.
The client hasn't sent anything.
Deleting dead clients.
Sleeping for one second.
Accepting new connections.
No new client connections.
Accepting increments.
Attempting to read an increment from client 4.
The client hasn't sent anything.
Attempting to read an increment from client 5.
An increment by 6.
New total: 18.
Deleting dead clients.
Sleeping for one second.
Accepting new connections.
No new client connections.
Accepting increments.
Attempting to read an increment from client 4.
The client hasn't sent anything.
Attempting to read an increment from client 5.
The client hasn't sent anything.
Deleting dead clients.
Sleeping for one second.
Accepting new connections.
No new client connections.
Accepting increments.
Attempting to read an increment from client 4.
The client hasn't sent anything.
Attempting to read an increment from client 5.
An increment by 4.
New total: 22.
Deleting dead clients.
Sleeping for one second.
Accepting new connections.
No new client connections.
Accepting increments.
Attempting to read an increment from client 4.
The client hasn't sent anything.
Attempting to read an increment from client 5.
The client disappeared. We'll delete it soon.
Deleting dead clients.
Deleting client 5.
Sleeping for one second.
Accepting new connections.
No new client connections.
Accepting increments.
Attempting to read an increment from client 4.
The client hasn't sent anything.
Deleting dead clients.
Sleeping for one second.
Accepting new connections.
No new client connections.
Accepting increments.
Attempting to read an increment from client 4.
The client hasn't sent anything.
Deleting dead clients.
Sleeping for one second.
Accepting new connections.
No new client connections.
Accepting increments.
Attempting to read an increment from client 4.
The client hasn't sent anything.
Deleting dead clients.
Sleeping for one second.
Accepting new connections.
No new client connections.
Accepting increments.
Attempting to read an increment from client 4.
An increment by 6.
New total: 28.
Deleting dead clients.
Sleeping for one second.
Accepting new connections.
No new client connections.
Accepting increments.
Attempting to read an increment from client 4.
The client disappeared. We'll delete it soon.
Deleting dead clients.
Deleting client 4.
Sleeping for one second.
Accepting new connections.
No new client connections.
Accepting increments.
Deleting dead clients.
Sleeping for one second.
Accepting new connections.
No new client connections.
Accepting increments.
Deleting dead clients.
Sleeping for one second.
^C
```
