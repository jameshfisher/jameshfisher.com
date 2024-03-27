---
title: How to create a public-key infrastructure
justification: >-
  I'm learning SSL/TLS. x509 is a big part of this, but the tools obscure the
  problems it solves, and the cryptographic operations involved. To understand
  it, I'm building it myself.
tags: []
summary: >-
  I demonstrate creating a public-private key pair, distributing the public key,
  and using a trusted third party (CA) to vouch for the public key.
---

Say Alice generates her private key, and extracts her public key:

```bash
openssl genrsa -out alice_priv_key.pem 2048
openssl rsa -pubout -in alice_priv_key.pem -out alice_pub_key.pem
```

Alice then distributes her public key, saying:

> To: Bob <bob@nice.com>
> From: Alice <alice@great.com>
>
> Hello everyone,
>
> Here's my public key! Please use it to send me messages and to verify that future messages are from me.
>
> ```
> -----BEGIN PUBLIC KEY-----
> MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBALdRf5ibmHxq8ggNQ3a+N3v1TjFxAcsO
> bD9d6x5Klyo5vfKQ9/HjVwyVgJS8lt7vdHd3NAqU0jID8wCs+htkFl8CAwEAAQ==
> -----END PUBLIC KEY-----
> ```
>
> Alice

If Bob receives this message in his email inbox, can he trust it? No! It could be from anyone! Nothing in the message demonstrates that this email is _really_ from the person that Bob knows as Alice.

One way for Alice to convince Bob that this is her public key is to deliver the key in person. Alice can visit Bob's house and hand him the public key on paper.

This method is inconvenient, because Bob lives in London and Alice in Moscow. But Alice knows that Bob trusts her friend Pyotr, and that Bob has Pyotr's public key. So Alice asks Pyotr to _sign_ her public key. So Pyotr does this:

```bash
cat <(echo 'This public key is Alice <alice@great.com>:') alice_pub_key.pem > statement_by_pyotr
$ openssl rsautl -sign -in statement_by_pyotr -inkey pyotr_priv_key.pem -out certificate
```

Pyotr calls this signed public key a "certificate". Alice can now embed this certificate in her email to Bob instead:

> To: Bob <bob@nice.com>
> From: Alice <alice@great.com>
>
> Hello everyone,
>
> Here's my public key! Please use it to send me messages and to verify that future messages are from me. I've attached my key in the file `certificate`, which is signed by Pyotr.
>
> Alice

Now when Bob receives this email, he can verify the attached `certificate` file to get Alice's public key:

```
$ openssl rsautl -verify -in certificate -inkey pyotr_pub_key.pem -pubin
This public key is Alice <alice@great.com>:
-----BEGIN PUBLIC KEY-----
MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBALdRf5ibmHxq8ggNQ3a+N3v1TjFxAcsO
bD9d6x5Klyo5vfKQ9/HjVwyVgJS8lt7vdHd3NAqU0jID8wCs+htkFl8CAwEAAQ==
-----END PUBLIC KEY-----
```

In this scheme, Pyotr is acting as a certificate authority (CA). Because Pyotr is trusted by Bob, Pyotr can perform a valuable service for Alice: vouching for Alice's public key.

In the real world, the certificate authorities are Comodo, Symantec, GoDaddy, and others. Comodo has gotten its public key onto many people's machines, in the form of "root certificates". Comodo can therefore perform a valuable service to websites: vouching for that website's public key, so that other people can communicate with that website. Instead of visiting someone's house to tie the public key to a real person, Comodo will tie the public key to a domain by verifying ownership of the domain (e.g. with a DNS challenge). Instead of ad hoc signed strings, Comodo and others use X.509, which has proper formats for certificates (amongst other features).

In future posts I'll look at the `req`, `x509` and `ca` commands, which are the "proper" way to do PKI.
