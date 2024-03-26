---
title: How do I encrypt text with `openssl`?
justification: >-
  I said I'd learn SSL/TLS. I'm first working through the various `openssl`
  subcommands.
tags:
  - openssl
  - tls
  - cryptography
  - security
  - encryption
  - cli
  - c
taggedAt: '2024-03-26'
---

The `openssl` CLI tool is a bag of random tricks. One of them is the `enc` command. Here's an example of encrypting and decrypting some text:

```bash
$ echo 'super secret message' > plain.txt
$ openssl enc -k secretpassword123 -aes256 -base64 -e -in plain.txt -out cipher.txt
$ cat cipher.txt
U2FsdGVkX1+vXUvo9fOehyq11uH+za8COV/+UScl2w6JPiFoVm3pte639CMDBMTB
$ openssl enc -k secretpassword123 -aes256 -base64 -d -in cipher.txt -out plain_again.txt
$ cat plain_again.txt
super secret message
```

Here,

* `-k secretpassword123` sets the password for encryption and decryption
* `-aes256` selects the cipher type, of which there are many
* `-base64` sets encryption to base64-encode the result, and decryption to base64-decode the input
* `-e` tells `openssl` to encrypt the `-in` file; `-d` tells it to decrypt the `-in` file
