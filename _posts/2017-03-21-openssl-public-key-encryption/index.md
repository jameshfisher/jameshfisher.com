---
title: How do I do public-key encryption with `openssl`?
justification: I'm learning about SSL/TLS by going through the `openssl` commands.
tags: []
summary: >-
  Generating RSA keys, extracting the public key, encrypting with the public key, and
  decrypting with the private key.
---

OpenSSL is a public-key crypto library (plus some other random stuff). Here's how to do the basics: key generation, encryption and decryption. We'll use RSA keys, which means the relevant `openssl` commands are `genrsa`, `rsa`, and `rsautl`.

```bash
# Alice generates her private key `priv_key.pem`
openssl genrsa -out priv_key.pem 2048

# Alice extracts the public key `pub_key.pem` and sends it to Bob
openssl rsa -pubout -in priv_key.pem -out pub_key.pem

# Bob encrypts a message and sends `encrypted_with_pub_key` to Alice
openssl rsautl -encrypt -in cleartext -out encrypted_with_pub_key -inkey pub_key.pem -pubin

# Alice decrypts Bob's message
openssl rsautl -decrypt -in encrypted_with_pub_key -inkey priv_key.pem
```
