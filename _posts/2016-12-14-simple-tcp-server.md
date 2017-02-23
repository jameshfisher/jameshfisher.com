---
title: "What syscalls does a TCP server need?"
---

The minimal useful TCP server must at least use the commands `socket/bind/listen/accept/recv/send/close`:

1. `tcp_listen_fd = socket(TCP)`: "OS, please create a TCP socket, and give me a file descriptor referencing it".
1. `bind(tcp_listen_fd, 9999)`: "OS, please point TCP port 9999 to the new TCP socket".
1. `listen(tcp_listen_fd)`: "OS, please start listening on the TCP port (9999)".
1. `tcp_conn_fd = accept(tcp_listen_fd)`: "OS, please put me to sleep until there's a connection to the TCP port, then give me a file descriptor referencing the new TCP connection".
1. `bytes = recv(tcp_conn_fd)`: "OS, please put me to sleep until there are some bytes sent by the other end of the TCP connection, then give me some of those bytes".
1. `send(tcp_conn_fd, bytes)`: "OS, please send these bytes to the other end of the TCP connection".
1. `close(tcp_conn_fd)`: "OS, I'm done with this TCP connection. Close it and remove this file descriptor".
1. `close(tcp_listen_fd)`: "OS, I'm done listening for new TCP connections. Stop listening on the TCP port, and remove this file descriptor".
