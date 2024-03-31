---
title: How can I do elliptic curve crypto with OpenSSL?
justification: I'm beginning learning SSL/TLS by going through the CLI commands
tags: []
summary: >-
  Generate ECC private key with `openssl ecparam`, extract public key from it using `openssl ec`, derive shared secret using `openssl pkeyutl`.
---

I've previously looked at doing asymmetric crypto with `openssl` using the `genrsa`, `rsa`, and `rsautl` commands. This uses RSA, which is one way to do asymmetric crypto. An alternative way is elliptic-curve crypto (ECC), and `openssl` has commands for ECC too.

Here's how Alice and Bob generate their private keys and extract public keys from them:

```bash
# Alice generates her private key
openssl ecparam -name secp256k1 -genkey -noout -out alice_priv_key.pem

# Alice extracts her public key from her private key
openssl ec -in alice_priv_key.pem -pubout -out alice_pub_key.pem
```

(Here, we choose the curve `secp256k1`. There are many to choose from.)

However, there are no tools for encrypting and decrypting! ECC doesn't define these directly. Instead, ECC users use _Diffie-Hellman (DH) key exchange_ to compute a shared secret, then communicate using that shared secret. This combination of ECC and DH is called ECDH.

See Alice and Bob derive their shared secret:

```bash
$ openssl pkeyutl -derive -inkey alice_priv_key.pem -peerkey bob_pub_key.pem -out alice_shared_secret.bin
$ openssl pkeyutl -derive -inkey bob_priv_key.pem -peerkey alice_pub_key.pem -out bob_shared_secret.bin
$ base64 alice_shared_secret.bin
BvqYFmmnn7s9M8bOrO0YDmBHs1sBIAtz5/0mmCQY5/8=
$ base64 bob_shared_secret.bin
BvqYFmmnn7s9M8bOrO0YDmBHs1sBIAtz5/0mmCQY5/8=
```

Notice Alice's shared secret file is the same as Bob's. They can now use this shared secret to communicate using any symmetric crypto. For example:

```bash
$ echo 'I love you Bob' > plain.txt
$ openssl enc -aes256 -base64 -k $(base64 alice_shared_secret.bin) -e -in plain.txt -out cipher.txt
$ openssl enc -aes256 -base64 -k $(base64 bob_shared_secret.bin) -d -in cipher.txt -out plain_again.txt
$ cat plain_again.txt
I love you Bob
```
