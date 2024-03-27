---
title: What is symmetric cryptography?
tags:
  - cryptography
taggedAt: "2024-03-26"
summary: >-
  Symmetric cryptography uses a shared secret key for both encryption and
  authentication, providing confidentiality and integrity. We look at
  the API, HMAC, and Authenticated Encryption.
---

My understanding of cryptography is very superficial. Here are some notes.

Traditional communication is easy: go into a meeting room and speak to each other. But in the modern world, we don't always have this luxury; instead we have to talk over large distances, via wires and other people, with many people listening. Unfortunately some of these people are "adversarial" and can now do bad things:

- They can read what you say.
- They can change what you say.
- They can pretend to be you.

Crypto is all about recovering some of the guarantees of the meeting room, while in the presence of such adversaries. Two important guarantees are that:

- Adversaries can't read your messages. ("Encryption".)
- The recipient can verify that your messages are really from you. ("Authentication", "verification", or "signing".)

There are two main forms:

- Private/secret/symmetric key. This is the old-school crypto which requires you to share a secret with the recipient. The hardships with it include initial key exchange, and that anyone who can decrypt your messages can also impersonate you.
- Public/asymmetric key. This is the amazing post-1970 crypto which "fixes" some of those hardships.

I'd like to know more about symmetric key crypto. You can do both things with it:

- Encryption: Send a message to someone else with the secret, such that adversaries can't read it.
- Authentication (signing): Send a message to someone else with the secret, such that they can verify it's from you.

The basic API is:

```
ciphertext = encrypt(secret, plaintext)
plaintext = decrypt(secret, ciphertext)

signedtext = sign(secret, plaintext)
ok = verify(secret, signedtext)
```

There are obvious relationships between these. Decryption with the same secret is of course the inverse of encryption:

```
forall secret, plaintext: decrypt(secret, encrypt(secret, plaintext)) == plaintext
```

And signed text should verify if checked with the same secret:

```
forall secret, plaintext: verify(secret, sign(secret, plaintext))
```

Those are the mainline cases with no adversaries. There are also the important properties where the secrets differ:

```
forall secret1, secret2, plaintext: (decrypt(secret2, encrypt(secret1, plaintext)) == plaintext) == (secret1 == secret2)
forall secret1, secret2, plaintext: verify(secret2, sign(secret1, plaintext)) == (secret1 == secret2)
```

See what this means in the case of an adversary trying to read my messages:

```
decrypt(fake_secret, encrypt(secret, plaintext)) != plaintext  // can't read my messages
verify(fake_secret, sign(secret, plaintext)) == false  // can't see that it's from me
```

See what this means in the case of an adversary trying to pretend to be me:

```
decrypt(secret, encrypt(fake_secret, plaintext)) != plaintext  // can't pretend to be me
verify(secret, sign(fake_secret, plaintext)) == false  // can't pretend to be me
```

Actually, the `sign/verify` API is usually a bit different: instead of giving you a full "signed text", it just gives you a _signature_. In crypto terminology, this is called a "Message Authentication Code", or MAC. That is:

```
sig = gen_mac(secret, plaintext)
ok = verify_sig(secret, sig, plaintext)
```

Then, instead of sending a signed text, one sends the plaintext and the signature. The important property is then:

```
verify_sig(secret2, sign(secret1, plaintext1), plaintext2) == (secret1 == secret2 && plaintext1 == plaintext2)
```

Actually, the `verify_sig` function often doesn't exist, because it is trivially implemented:

```
verify_sig(secret, sig, plaintext) = (sig == gen_mac(secret, plaintext))
```

However, the `==` function here can be vulnerable to a timing attack if implemented in the normal way, so the `verify_sig` function (can/should exist in order to protect against this common error.)

The above says that, to verify the signature, we re-generate the signature and check that it is the same as the one sent. Then the important property is:

```
(gen_mac(secret1, plaintext1) == gen_mac(secret2, plaintext2)) == (secret1 == secret2 && plaintext1 == plaintext2)
```

Notice that this process verifies _two_ properties:

- The received message is from someone with the shared secret. ("Authentication".)
- The received message is exactly what that person wrote. ("Data integrity".)

If `verify_sig` fails, there are a few possible causes:

- The message is not from someone with the shared secret.
- An adversary tampered with the message in transit.
- The message was corrupted in transit.

This MAC process has some similarity with a different concept, a message digest (aka checksum):

```
digest = gen_digest(plaintext)
ok = verify_digest(digest, plaintext)
```

A message digest verifies data integrity, i.e. that no accidental corruption occurred, but does _not_ verify that it has not been deliberately tampered with! An adversary can easily modify the plaintext in transit, create a new digest for it, and substitute that for the old one.

Thus a MAC does strictly more than a message digest: as well as verifying that no accidental corruption has occurred, it also verifies that no deliberate corruption has occurred.

There are a few kinds of MAC. A popular kind is HMAC (Hash-based MAC), which relies on a cryptographic hash function. Conceptually, HMAC is implemented as:

```
hmac(secret, plaintext) = hash(secret ++ plaintext)
```

It is not quite implemented this way, because some underlying hash functions are vulnerable to a "length-extension attack". This means an attacker can easily extend the plaintext without modifying the MAC. Because of this technical problem with some hash functions, HMAC instead applies the `hash(secret ++ ...)` function _twice_, to get:

```
hmac(secret, plaintext) = hash(secret ++ hash(secret ++ plaintext))
```

There are other ways of generating a MAC, but HMAC is by far the most popular.

Commonly, we'll want to combine the two properties offered by secret-key crypto: encryption _and_ authentication. How do we combine them? There are at least three techniques. Together, they're called "Authenticated Encryption" (authenc).

First, Encrypt-then-MAC ("EtM"). EtM works by:

```
string encrypt_then_mac(secret, plaintext) {
  let ciphertext = encrypt(secret, plaintext);
  let mac = gen_mac(secret, ciphertext);
  return ciphertext ++ mac;
}

string verify_then_decrypt(secret, ciphertext_and_mac) {
  let ciphertext, mac = split(ciphertext_and_mac);
  assert(gen_mac(secret, ciphertext) == mac);
  return decrypt(secret, ciphertext);
}
```

Notice that in terms of API, this is basically the same as the `encrypt` and `decrypt` functions, but `decrypt` will only return plaintext if authentication succeeds.

The next is Encrypt-and-MAC (E&M):

```
string encrypt_and_mac(secret, plaintext) {
  let ciphertext = encrypt(secret, plaintext);
  let mac = gen_mac(secret, plaintext);  // uses plaintext instead of ciphertext
  return ciphertext ++ mac;
}

string verify_and_decrypt(secret, ciphertext_and_mac) {
  let ciphertext, mac = split(ciphertext_and_mac);
  let plaintext = decrypt(secret, ciphertext);
  assert(gen_mac(secret, plaintext) == mac);
  return plaintext;
}
```

Finally, there is MAC-then-Encrypt (MtE):

```
string mac_then_encrypt(secret, plaintext) {
  let mac = gen_mac(secret, plaintext);
  return encrypt(secret, plaintext ++ mac);
}

string decrypt_then_verify(secret, ciphertext) {
  let plaintext, mac = split(decrypt(secret, ciphertext));
  assert gen_mac(secret, plaintext) == mac;
  return plaintext;
}
```

All three approaches are used in different major systems: EtM in IPsec, E&M in SSH, and MtE in SSL/TLS. There seems to be no consensus on which is better. There are also "signcryption" algorithms which do encryption and signing at the same time, instead of mashing the two together. Signcryption does not seem to be commonly used. [This guy](https://blog.cryptographyengineering.com/2012/05/19/how-to-choose-authenticated-encryption/) suggests that we should

1. "Always compute the MACs on the ciphertext, never on the plaintext", i.e. `encrypt_then_mac`.
2. "Use two different keys, one for encryption and one for the MAC."

Within symmetric-key crypto, there are two forms of cipher:

- Block ciphers. A block cipher encrypts fixed-length plaintexts. For example, the Blowfish algorithm works on 64-bit blocks (8 bytes).
- Stream ciphers. A stream cipher encrypts variable-length plaintexts. It works "online", i.e. can emit the cipher text as it consumes the plaintext.

To understand either, a good place to start seems to be the XOR function (denoted ⊕ in crypto-land). It's one of the classic binary functions we were taught in school:

```
A  B  A⊕B
=  =  ===
0  0   0
0  1   1
1  0   1
1  1   0
```

XOR is used EVERYWHERE. It's the heart of the most fundamental symmetric-key algorithm, the ONE-TIME PAD. This works by having a shared secret (the "pad") which is the same length as the plaintext, and computing the ciphertext quite simply as `plaintext ⊕ pad`.

Why does the one-time pad work? Consider the case where the ciphertext is a single bit, 0 or 1. Clearly, the plaintext is either 0 or 1 - the only plaintexts of the same length. Which was it? The answer depends on the pad (0 or 1), which we do not know, and which are both equally likely. Since both pads are equally likely, both plaintexts are equally likely. Now consider a ciphertext of length N bits - the same argument applies. Literally _any_ plaintext of length N could have generated it. The same argument applies because all the bits are encrypted in an unrelated fashion - in a sense, we are seeing N 1-bit ciphertexts, generated from N 1-bit plaintexts, each with its own 1-bit pad.

The same arguments do not apply to other encryption algorithms, because the bits of the ciphertext are not independent in the same way. Typically, the bit at `ciphertext[n]` is not just affected by `plaintext[n]` and `secret[n]`; it is affected by `plaintext[0..n]` and the entire secret.

Another way to see why other algorithms are not as secure as the one-time pad is that, for a given ciphertext, the set of possible plaintexts is much smaller.

The big problem with the one-time pad is the onerous requirement to share a secret the same length as the message, and to never re-use it.

Block ciphers and stream ciphers attempt to do secure encryption of arbitrary-length messages with a small fixed-size secret. For example, a stream cipher might let you securely send a live video broadcast (of size unknown until completion), but with a secret of just 128 bits.

The fixed small key size explains why, for a given ciphertext, there is a much smaller set of possible plaintexts (compared to the one-time pad). If you receive a ciphertext, and you know that the key size was 8 bits, you can try all possible 2^8=256 keys to find all possible plaintexts. One of these will be the true plaintext.

Block/stream ciphers do not work on the one-time-pad principle that "all possible plaintexts of this size are equally likely". Instead, they work on the principle that "you can't try all the keys, because there are too many". So keys are set to, say, 512 bits, because 2^512 is just too many to practically try.

The one-time pad is secure against any adversary, regardless of computational power. Modern crypto is only secure based on assumptions about adversaries' computational power.

Block/stream ciphers are broken to the extent that attackers do not have to try all the possible keys.

Let's look at block ciphers. A given block cipher has the API:

```
block = encrypt(secret, block)
block = decrypt(secret, block)
```

This looks just like our `encrypt` and `decrypt` functions above. The difference is that, for a given block cipher, the `block` type has a fixed length and the `secret` type has a fixed length. For example:

```
block64 = blowfish_encrypt(secret, block64)
block64 = blowfish_decrypt(secret, block64)
```

An example in Python:

```
>>> import blowfish
>>> cipher = blowfish.Cipher(b"this is my secret key")
>>> cipher.encrypt_block(b"12345678")
b'\x10N\xb1\x0c]\x98\xd7\xb3'
>>> cipher.encrypt_block(b"h5ageragreshs54ht")
>>> cipher.decrypt_block(cipher.encrypt_block(b"htrsh34s"))
b'htrsh34s'
```

The obvious problem with block ciphers is that real-world messages are rarely exactly 64 bits long. How can we encrypt longer strings? The obvious approach is to split the plaintext into block-sized pieces, and apply the block cipher to each of these. That way, we get:

```
ciphertext_blocks[0] = encrypt(secret, plaintext_blocks[0])
ciphertext_blocks[1] = encrypt(secret, plaintext_blocks[1])
...
ciphertext_blocks[n] = encrypt(secret, plaintext_blocks[n])
```

The decryption is then obvious:

```
plaintext_blocks[n] = decrypt(secret, ciphertext_blocks[n])
```

This scheme is known as "Electronic Codebook" (ECB). A key problem with ECB is that identical blocks of plaintext will encrypt to the same blocks of ciphertext. This reveals some structure of the plaintext. This flaw makes ECB insecure and rarely used.

There are various approaches which work around this problem. The classic is "Cipher Block Chaining":

```
ciphertext_blocks[0] = encrypt(secret, xor(plaintext_blocks[0], initialization_vector))
ciphertext_blocks[1] = encrypt(secret, xor(plaintext_blocks[1], ciphertext_blocks[0]))
ciphertext_blocks[2] = encrypt(secret, xor(plaintext_blocks[1], ciphertext_blocks[1]))
...
ciphertext_blocks[n] = encrypt(secret, xor(plaintext_blocks[n], ciphertext_blocks[n-1]))
```

What is this `initialization_vector`? It's another block (it should be called _initialization block_) filled with random bits.

The general approach is to thread some _state_ between each encryption.
there exist many "modes of operation" which allow

Let's look at stream ciphers. They have the API:

```
ciphertext_byte, new_state = encrypt_byte(secret, plaintext_byte, prev_state)
plaintext_byte, new_state = decrypt_byte(secret, ciphertext_byte, prev_state)
```
