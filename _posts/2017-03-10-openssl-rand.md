---
title: How do I generate random bytes with `openssl`?
justification: I said I'd learn OpenSSL; `rand` is another tool in the toolbox
tags:
  - openssl
  - tls
  - cryptography
  - security
  - programming
  - random-numbers
  - cli
taggedAt: '2024-03-26'
---

Another command in `openssl` is `rand`. We invoke it like this:

```bash
$ openssl rand -hex 10
aa27660aa7e186902981
```

Here, `10` indicates the number of random bytes to print to standard out. `-hex` prints those bytes in hex format - 2 characters per byte, so 20 characters.

The output comes from a PRNG. The PRNG is seeded with, amongst other randomness sources, a file at `~/.rnd`. This file contains random bytes:

```
$ cat ~/.rnd
33k�ɱ��%�*��#Yn�� ]w$Lkn���M|cW@9%V
...
```

OpenSSL apparently uses this location to store previously-gathered entropy. You can delete it at any time without any ill effects.
