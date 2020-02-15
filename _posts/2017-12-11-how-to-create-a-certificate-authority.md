---
title: "How to create a certificate authority"
draft: true
---

Generate your root key:

```
$ openssl genpkey -out ca.key.pem -algorithm RSA
...............................+++
..................................................................................................................+++
```

Generate your self-signed root certificate.
Confusingly, this is done with `openssl req`,
which is ordinarily used to create CSRs.

```

```


Your client then generates their private key:

```
$ openssl genpkey -out private_key.pem -algorithm RSA
........................................+++
.................................................................+++
```

Client generates their public key:

```
$ openssl pkey -in private_key.pem -out public_key.pem -pubout
```

Client generates CSR for public key:

```
$ openssl req -new -out CSR.csr -key private_key.pem
You are about to be asked to enter information that will be incorporated
into your certificate request.
What you are about to enter is what is called a Distinguished Name or a DN.
There are quite a few fields but you can leave some blank
For some fields there will be a default value,
If you enter '.', the field will be left blank.
-----
Country Name (2 letter code) []:GB
State or Province Name (full name) []:London
Locality Name (eg, city) []:London
Organization Name (eg, company) []:Acme Donuts Ltd.
Organizational Unit Name (eg, section) []:IT
Common Name (eg, fully qualified host name) []:donuts.co.uk
Email Address []:dan@donuts.co.uk

Please enter the following 'extra' attributes
to be sent with your certificate request
A challenge password []:
```

Client sends you this public key.
