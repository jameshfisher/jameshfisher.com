---
title: How do I do public-key signatures with `openssl`?
justification: I'm learning SSL/TLS by going through the commands of the `openssl` tool.
tags: []
summary: >-
  Using `openssl genrsa`, `openssl rsa`, `openssl rsautl -sign`, and `openssl rsautl -verify`.
---

Yesterday I described how to do public-key encryption with `openssl`, using the `genrsa`, `rsa`, and `rsautl` commands. Those same commands can also do signing and verification. Previously, we set up keys so that Bob could send a private message to Alice. To do this, Alice made a private key, and she sent the public key for it to Bob. With this same setup, Alice is using her public key as an unforgeable digital identity. This requires two things: that when people send messages to Alice, only Alice can receive them; and when Alice sends messages to people, they can see that the message is from Alice. Signing and verification deal with the latter story.

Alice now wants to send a public message to Bob. She runs:

```bash
openssl genrsa -out priv_key.pem 2048                   # Alice generates her private key
openssl rsa -pubout -in priv_key.pem -out pub_key.pem   # Alice derives the public key and sends it to Bob

echo "I, Alice, owe Bob £5" > cleartext                 # Alice generates an un-signed statement

# Alice signs the statement and sends `signed_cleartext` to Bob
openssl rsautl -sign -in cleartext -inkey priv_key.pem -out signed_cleartext
```

At Bob's end, he verifies the statement with:

```
$ openssl rsautl -verify -in signed_cleartext -inkey pub_key.pem -pubin
I, Alice, owe Bob £5
```

The tool verified the signature and printed the cleartext. If the verification fails, Bob gets a nasty error message:

```
$ openssl rsautl -verify -in signed_cleartext -inkey pub_key_2.pem -pubin
RSA operation error
51272:error:0407006A:rsa routines:RSA_padding_check_PKCS1_type_1:block type is not 01:/BuildRoot/Library/Caches/com.apple.xbs/Sources/OpenSSL098/OpenSSL098-64.30.2/src/crypto/rsa/rsa_pk1.c:102:
51272:error:04067072:rsa routines:RSA_EAY_PUBLIC_DECRYPT:padding check failed:/BuildRoot/Library/Caches/com.apple.xbs/Sources/OpenSSL098/OpenSSL098-64.30.2/src/crypto/rsa/rsa_eay.c:719:
```
