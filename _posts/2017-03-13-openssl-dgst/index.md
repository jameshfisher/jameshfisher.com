---
title: How do I create a message digest using `openssl`?
justification: 'I''m learning SSL, starting by going through the CLI tool commands'
tags:
  - hmac
  - hashing
  - openssl
  - cryptography
  - programming
  - cli
taggedAt: '2024-03-26'
summary: >-
  Create message digests using the `openssl dgst` command, specifying the hash
  algorithm (e.g. `-sha512`) and optionally signing with a shared password using
  `-hmac`.
---

The `openssl` tool has a `dgst` command which creates message digests. Here's an example:

```
$ echo 'hello world' | openssl dgst -sha512 -hex
db3974a97f2407b7cae1ae637c0030687a11913274d578492558e39c16c017de84eacdc8c62fe34ee4e12b4b1428817f09b6a2760c3f8a664ceae94d2434a593
```

Various flags change the hash algorithm, e.g. `-sha1`.

A useful flag is `-hmac`, which lets you sign the content with a shared password:

```
$ echo 'hello world' | openssl dgst -sha1 -hex -hmac secret_password_1
61c587ccf0d9feebbe95fa866f003a1ae7651f8f
```
