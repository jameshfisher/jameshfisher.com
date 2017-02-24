---
title: "What are the `domain` and `type` arguments to the `socket` system call?"
---

Here's the `socket` system call:

```c
#include <sys/socket.h>
int socket(int domain, int type, int protocol);
```

Those three arguments determine the protocol we want to use. Actually, the last argument alone - `protocol` - seems to fully determine the protocol. For example, `6` is the protocol number for TCP. The `domain` and `type` describe this protocol, and usually the combination of `domain` and `type` also fully determines the protocol, but not always.

It seems to be traditional to pass in the `domain` and `type`, and set `protocol` to `0`, meaning the default protocol for the `domain`/`type` pair will be selected. (The `man` pages don't actually describe this behavior, but various network guides do.) For example, this call creates a TCP socket:

```c
int fd = socket(PF_INET, SOCK_STREAM, 0);
```

The domain `PF_INET` says "TCP operates in the internet protocol family". `PF` means "protocol family", and `INET` means "internet". As far as I can tell, "protocol family" and The type `SOCK_STREAM` says "TCP provides an ordered, reliable, bidirectional byte stream".

Most code actually uses `AF_` rather than `PF_`, e.g. `AF_INET`. `AF` means "address family", and the idea was that each "address family" could support several "protocol families". This didn't happen; e.g., IPv4 addresses only work in the internet protocol family. Guides say to just use the `AF_` constants; the `PF_` constants are aliased to the `AF_` ones in all implementations.

Here are some more examples:

```c
socket(AF_INET,      SOCK_STREAM,     0);               // Selects TCP
socket(AF_INET,      SOCK_STREAM,     6);               // Also selects TCP
socket(AF_INET,      SOCK_STREAM,     IPPROTO_TCP);     // Same as above; selects TCP
socket(AF_INET,      SOCK_DGRAM,      0);               // Selects UDP
socket(AF_INET,      SOCK_SEQPACKET,  0);               // Selects SCTP (not implemented on macOS)
socket(AF_BLUETOOTH, SOCK_STREAM,     BTPROTO_RFCOMM);  // Selects the Bluetooth RFCOMM protocol
```
