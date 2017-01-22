---
title: "What syscalls does a UDP server need?"
---

I previously described the syscalls needed for a multi-client TCP server. There are at least eight: `socket`, `bind`, `listen`, `select`, `accept`, `recv`, `send`, and `close`. This could be used to make an echo server: clients can open a TCP connection, and whatever bytes they send get echoed back.

Now let's look at the simplest UDP server, and again make an echo server: clients can send a UDP datagram, and whatever they send gets echoed back.

1. `udp_fd = socket(UDP)`: "OS, please create a UDP socket, and give me a file descriptor referencing it".
1. `bind(udp_fd, 9999)`: "OS, please point UDP port 9999 to the new UDP socket".
1. `msg, from = recvfrom(udp_fd)`: "OS, please put me to sleep until a UDP datagram is received, then give it to me".
1. `sendto(udp_fd, msg, from)`: "OS, please send this UDP datagram from my port to this remote address and port".
1. `close(udp_fd)`: "OS, I'm done listening for new datagrams. Stop listening on that port, and remove this file descriptor".

Compared to the TCP server, we of course don't get the features of TCP: messages are unreliable, unordered, and nothing monitors network congestion.

But a benefit is simplicity: we have no `listen`, `select`, or `accept`. We do not have to manage multiple connections, deal with splitting byte streams into individual messages, or work with `select/kqueue/epoll`.

The other benefit is flexibility: our communication may not fit into the TCP model very well.
