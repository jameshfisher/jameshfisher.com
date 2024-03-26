---
title: 'What is a "file descriptor", really?'
tags:
  - c
  - posix
  - programming
taggedAt: '2024-03-26'
---

People say "in UNIX, everything is a file". And that we interact with the operating system through "file descriptors".

I don't find this very enlightening. All it means is that the word "file" is overloaded to mean "some sort of resource". Here are things that a file descriptor can represent:

* A handle to an honest-to-goodness file
* One end of a TCP connection
* A listening TCP port
* A listening UDP port
* A reference to a kernel event queue
* ...

Depending on how you got your "file descriptor", the operations you can do on it are different. There is no universal API for interacting with a "file descriptor". For example, if you call `kqueue()` to get a new kernel queue, you should not perform a `write` operation on it. Just because it's a "file descriptor", it doesn't mean you can write to it like that. It's a kernel queue, which is completely different from a file.

"File descriptor" should be renamed "resource descriptor".
