---
title: How does a stream cipher work?
tags:
  - stream-cipher
  - one-time-pad
  - cryptography
  - security
taggedAt: '2024-03-26'
summary: >-
  A stream cipher works like a one-time pad, but uses a pseudorandom "keystream"
  from a PRNG seeded by a secret key and nonce, preventing attacks based on pad
  disclosure or reuse.
---

* A stream cipher works roughly like a one-time pad.

* Just as in one-time pad, it can be broken if (A) you have insight into what the pad looks like, or if (B) the pad is used multiple times.

* The difference is that the "pad" in a stream cipher is not random, but pseudorandom - called a “keystream”.

* The pad/keystream essentially comes from a PRNG, which is seeded by (secret key + nonce).

* So the PRNG seed has a constant secret half (the secret key), and a changing public half (the nonce).

* The constant secret half (the key) prevents the first kind of breakage (A: attacker having insight into the pad).

* The changing public half (the nonce) prevents the second kind of breakage (B: the pad being used multiple times).
