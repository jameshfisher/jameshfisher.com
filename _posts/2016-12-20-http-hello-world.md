---
title: "How to write a 'hello world' HTTP server in C"
---

Writing a "hello world" HTTP server is surprisingly simple. This responds to every request with a "hello world" page:

```c
#include <stdlib.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <unistd.h>

int main() {
  int server_fd = socket(AF_INET, SOCK_STREAM, 0);
  struct sockaddr_in server;
  server.sin_family = AF_INET;
  server.sin_port = htons(8080);
  server.sin_addr.s_addr = htonl(INADDR_ANY);
  bind(server_fd, (struct sockaddr*) &server, sizeof(server));
  listen(server_fd, 128);
  for (;;) {
    int client_fd = accept(server_fd, NULL, NULL);
    char response[] = "HTTP/1.1 200 OK\r\nContent-Length: 13\r\nConnection: close\r\n\r\nHello, world!";
    for (int sent = 0; sent < sizeof(response); sent += send(client_fd, response+sent, sizeof(response)-sent, 0));
    close(client_fd);
  }
  return 0;
}
```

Of course, this cuts corners:

* It doesn't bother examining the request!
* It doesn't do any error handling for `socket`, `bind`, `listen`, `accept`, `send`, `close`
* It closes the connection every time even though it claims to be HTTP/1.1
