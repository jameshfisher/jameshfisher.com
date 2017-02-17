---
title: "macOS assembly hello world"
---

I started with [this gist](https://gist.github.com/FiloSottile/7125822), creating this file:

```asm
global start
section .text
start:
  mov rax, 0x2000004 ; write
  mov rdi, 1 ; stdout
  mov rsi, msg
  mov rdx, msg.len
  syscall
  mov rax, 0x2000001 ; exit
  mov rdi, 0
  syscall
section .data
msg:    db      "Hello, world!", 10
.len:   equ     $ - msg
```

This is "assembly", but this term is vague. Getting specific, this file:

* is written in "Intel" assembly syntax (not the AT&T syntax)
* is written for an Intel x86-64 machine (it uses x86-64 instructions)
* is written for macOS (it uses macOS system calls)
* is intended to generate a "Mach-O 64" object file, the format used by macOS on 64-bit machines

To compile it, we need tools which understand all of these. One of these is `nasm`, the "Netwide Assembler". It seems to be the most popular assembler. I ran the program with:

```
$ brew install nasm
$ nasm -version
NASM version 2.12.02 compiled on Sep 14 2016
$ nasm -f macho64 hello.s
$ ld -macosx_version_min 10.7.0 -lSystem -o hello hello.o
$ ./hello
Hello, world!
```

There are lots of unknown bits in here. I'll cover them in future posts ...
