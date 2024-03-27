---
title: Your password is the private key. So what is the public key?
tags: []
---

There are two branches of crypto: symmetric and asymmetric. Symmetric crypto is simpler to understand: two participants share a secret string, such as "ImmediateWomanBroadcastCross4". This secret is commonly known as a password. They can then communicate in private by encrypting an decrypting using the secret.

Asymmetric is a bit more complex: here, secrets are not shared; instead, each participant has their own private secret. To communicate securely, a _public key_ is generated from each secret, and the public key is shared. The participants then communicate in private by encrypting with the public key, then decrypting with the corresponding private key.

A disadvantage of asymmetric cryptosystems is how intimidating the keys are. Whereas a decent symmetric secret is "ImmediateWomanBroadcastCross4", a decent asymmetric secret might look like this:

```
-----BEGIN RSA PRIVATE KEY-----
MIIEpQIBAAKCAQEA4iMOB4Q9SQjIlVciAIOhb3fXzLpKS+NgSrJFGO+fpfqkij6Q
L9+02fqTL24CCDbJ1rm2Vm2h6RRNCCR64o3USNYZF8oWW3q53lGaugoP1HXNt6WN
rV8xMpfvv6fKrIsKsQJGKvDAZuFnZEMvZ6tpeomiEXiUEtsAefi8ab88FHg0oaqW
QN0tLrdrm7w9DpRq2aSmwHRL4GgTonUnN7nC/fR7MefvD2+AAQEZKhQbp3RMooIu
z5+fDFpKpds2GPxaorF39e990EgI1mxd26dN/xiyfG3VmIrRyLirzbAs1B1RvWDQ
KTZw2O3uyNb3KgSJ7BSxEBq64BYTY/Sgw/16SQIDAQABAoIBAQDEirMm1UhusbOk
GJb023Lz7rUgusjYLEcEpOxpP9sB51Ya0UWAVm5ZBe/myTX67aN/fOl9NMwESCCr
cwla3uoiY/JrOrkzyPbCwyo3h4c6oSiq9Liudo3L60H00WDVlgM01UUnDRgsUrwJ
6FrLP6/tULILfUE1IiLH3+fiANO29SB9XRoWLfMWwKQovU8fE5OJG4+6jfx+kR0o
k7vGRCe8clZFhnoRDzICQ7jppNcLgjhGLLdvE+gxzmUbEL5Ae/o45EK8R0GAwJE4
fgMAoRacgjU2dw1FZy2qXzbUgXXazEowvreesVYVceRZBW6UAxYtPUsELX6cRR48
ojnQewABAoGBAPSaHXrxNhwzcY4lGrOhW5gkOdCl4Niv96Er4lVjrUyfsx1rlLA+
wMY/+jvtDLG1Yoi4NWbGUMO5Fny/fr9JdrIDDK5SmHv+pqSB+tHTX/lIL5UTk1K9
WYHzLiYGcEZtGPEZI7UJhur49U63WFfqu9HbDnrN8ZaXYbEFOerNmk9JAoGBAOys
qup4LH1mnjGOWtBYpL+YcQ2E3pB43Qz0Vx1cY/xn6v1zpKZCi+hF9n2JsftGPAgM
XOZmvX5kRycrcMXVlqc8RU+IQbtPm47ujOSht2f/SNHLBxQhbcZDXKN14cuGXDqv
tEuaUvQCvWY0HICkmRGX1xLfPv1ona9zJlTMutMBAoGBAMInIodXt4+i9dvSb+Nt
jPqypoGLaXIWGwT/hGQq/n/3s4ECx78t0G6Mkd/HRXA5fcDwFtNBTxJMdCEJD15e
vayG5yXnwcmKVFP4KFMs6N1CAyLdqu7eBZI0qMjeC3ibWFTnk4Q7z6/rdSvKNIF0
fSkSK+gmWEEkYBLXByXtlTKhAoGBAN5icEbYnJVIMyTFajeS01rkVnYpfyepKave
e2yvP5QP4RI981v185hRBQd4trAwkn/Nfg1QRIXam7EGdHSv+Vsymr3cfkcOylBH
fkPmYHtruHTInOIhdxBwgz9kqMGgglDygCr52zBE0sqR9KY8A0gwsHqfIoTiJCiT
vlS3+mQBAoGAaZEXlB8is38OKISXm4atYElKL0Bctv3h6RDdWHIEEmwJJWYMGq5t
joU8tDbIGNwIgFY3m3RCNXCk8oJK9SYwY8rG4JIl+yrPwSgDPZQeYBHXGLd7W+01
mJ/iCMWKcj93jRaTlvaVpLDPkv59DCOoThv2G/u3ftXPMd+OidCwIZM=
-----END RSA PRIVATE KEY-----
```

Humans have some trouble remembering "ImmediateWomanBroadcastCross4". By comparison, the asymmetric secret is far too large for most humans to practically remember.

The traditional solution to this is to save the asymmetric secret somewhere _secret_, and maybe encrypt too (with an easier-to-remember symmetric key).

There's another solution! Usually, an asymmetric secret is generated from an entropy source (for example, `openssl genrsa` uses system entropy sources to find two primes). Instead, we can replace this entropy source with a pseudorandom source derived from a password (such as "ImmediateWomanBroadcastCross4"). So from any human-rememberable password, we can derive a private key, and from that, derive the public key. Then the user does not have to store a private key anywhere.

This seems to be hard with the `openssl` CLI tool; I can't find any way to replace its entropy sources. [This tool called `enchive`](https://github.com/skeeto/enchive) uses this scheme, with ECC crypto. [The concept of "brainwallets"](https://en.bitcoin.it/wiki/Brainwallet) in Bitcoin also use this scheme.

Whether this approach is a "good idea" is another question. Obviously, you want a good password. And to avoid brute-forcing, it should be expensive to check any given password guess. Your PRNG should be using an expensive "password algorithm", such as Scrypt.
