---
title: What is ASN.1?
tags:
  - programming
  - openssl
summary: >-
  ASN.1 is a data format used to encode structured data like RSA
  private keys and certificate signing requests. Using `openssl
  asn1parse` to reveal its structure.
---

Crypto is full of obscure data formats.
`.pem` files, `.p8` files, `.p12` files, `.key` files, `.cert` files.
And lots of these are just wrappers for yet more formats.
One of these data formats is ASN.1, "Abstract Syntax Notation One".
ASN.1 is a bit like JSON, XML, or protocol buffers:
it can encode numbers, strings, sequences, sets and more.

For example,
if I generate an RSA private key with `openssl genrsa -out private_key.pem 512`,
the private key file is quite unreadable:

```
$
Generating RSA private key, 512 bit long modulus
.......................++++++++++++
.......................++++++++++++
e is 65537 (0x10001)
$ cat private_key.pem
-----BEGIN RSA PRIVATE KEY-----
MIIBOwIBAAJBAMPkSNKfzbL35Sq9F3Eqx25KvWbVTy7xgtxFYrP6JA4/92ZY5zJO
RB4sFmKMcD/53vx2AGJ4s14h2JDlwiJbzVsCAwEAAQJBAIDmElUl+kCthgpdarN4
psoYPBESg4wsNyOiNJShIGCO6BG2MLEYkd4KjZgToWwcV5pNJQmr+DbZrjsLOCsD
CYECIQDgwGC/cnKog0nOQrx8ast1iZ6B4tfQ+PjtNxMuDiE/SwIhAN8gskIQTM8F
sEai7XWOSmLCq20r30a6D/rscToF3hAxAiEAzbjJ1fOYaA7ke9wyU2AdpBS39gQB
r9J1aAzFjZ55aEkCIDqSprjY9pDR+XhRhOx7MePDHqVGAxLZ/R/tubt1ltnBAiBB
yxWk7T+RcKdYkyybGxP2CRFWHu47R0RX6fq0xywWSg==
-----END RSA PRIVATE KEY-----
```

But there is structure here.
A `.pem` file can contain many blocks,
and this file contains one `RSA PRIVATE KEY` block.
Each block has some bytes of data as the body,
which are encoded in base64.
This masks the real structure of the body,
which is a sequence of nine integers
encoded in the ASN.1 format.
We can reveal this structure with `openssl asn1parse`:

```
$ openssl asn1parse -i -in private_key.pem
    0:d=0  hl=4 l= 315 cons: SEQUENCE
    4:d=1  hl=2 l=   1 prim:  INTEGER           :00
    7:d=1  hl=2 l=  65 prim:  INTEGER           :C3E448D29FCDB2F7E52ABD17712AC76E4ABD66D54F2EF182DC4562B3FA240E3FF76658E7324E441E2C16628C703FF9DEFC76006278B35E21D890E5C2225BCD5B
   74:d=1  hl=2 l=   3 prim:  INTEGER           :010001
   79:d=1  hl=2 l=  65 prim:  INTEGER           :80E6125525FA40AD860A5D6AB378A6CA183C1112838C2C3723A23494A120608EE811B630B11891DE0A8D9813A16C1C579A4D2509ABF836D9AE3B0B382B030981
  146:d=1  hl=2 l=  33 prim:  INTEGER           :E0C060BF7272A88349CE42BC7C6ACB75899E81E2D7D0F8F8ED37132E0E213F4B
  181:d=1  hl=2 l=  33 prim:  INTEGER           :DF20B242104CCF05B046A2ED758E4A62C2AB6D2BDF46BA0FFAEC713A05DE1031
  216:d=1  hl=2 l=  33 prim:  INTEGER           :CDB8C9D5F398680EE47BDC3253601DA414B7F60401AFD275680CC58D9E796849
  251:d=1  hl=2 l=  32 prim:  INTEGER           :3A92A6B8D8F690D1F9785184EC7B31E3C31EA5460312D9FD1FEDB9BB7596D9C1
  285:d=1  hl=2 l=  32 prim:  INTEGER           :41CB15A4ED3F9170A758932C9B1B13F60911561EEE3B474457E9FAB4C72C164A
```

This integer sequence structure is
[an RSA private key in PKCS#1 format as described by RFC 3447](https://tools.ietf.org/html/rfc3447#appendix-A.1.2):

```asn1
RSAPrivateKey ::= SEQUENCE {
    version           Version,
    modulus           INTEGER,  -- n
    publicExponent    INTEGER,  -- e
    privateExponent   INTEGER,  -- d
    prime1            INTEGER,  -- p
    prime2            INTEGER,  -- q
    exponent1         INTEGER,  -- d mod (p-1)
    exponent2         INTEGER,  -- d mod (q-1)
    coefficient       INTEGER,  -- (inverse of q) mod p
    otherPrimeInfos   OtherPrimeInfos OPTIONAL
}
```

The above is an "ASN.1 modules",
a text file which describes a set of ASN.1 values.
This is much like protocol buffer schema, XML schema, or JSON schema.

Lots of SSL files are PEM blocks containing a body encoded in ASN.1.
As another example, Certificate Signing Requests, `.csr` files,
look like this:

```
$ openssl asn1parse -i -in cert_request.csr
    0:d=0  hl=4 l= 392 cons: SEQUENCE
    4:d=1  hl=4 l= 306 cons:  SEQUENCE
    8:d=2  hl=2 l=   1 prim:   INTEGER           :00
   11:d=2  hl=3 l= 173 cons:   SEQUENCE
   14:d=3  hl=2 l=  11 cons:    SET
   16:d=4  hl=2 l=   9 cons:     SEQUENCE
   18:d=5  hl=2 l=   3 prim:      OBJECT            :countryName
   23:d=5  hl=2 l=   2 prim:      PRINTABLESTRING   :GB
   27:d=3  hl=2 l=  15 cons:    SET
   29:d=4  hl=2 l=  13 cons:     SEQUENCE
   31:d=5  hl=2 l=   3 prim:      OBJECT            :stateOrProvinceName
   36:d=5  hl=2 l=   6 prim:      UTF8STRING        :London
   44:d=3  hl=2 l=  15 cons:    SET
   46:d=4  hl=2 l=  13 cons:     SEQUENCE
   48:d=5  hl=2 l=   3 prim:      OBJECT            :localityName
   53:d=5  hl=2 l=   6 prim:      UTF8STRING        :London
   61:d=3  hl=2 l=  29 cons:    SET
   63:d=4  hl=2 l=  27 cons:     SEQUENCE
   65:d=5  hl=2 l=   3 prim:      OBJECT            :organizationName
   70:d=5  hl=2 l=  20 prim:      UTF8STRING        :Jameshfisher Limited
   92:d=3  hl=2 l=  24 cons:    SET
   94:d=4  hl=2 l=  22 cons:     SEQUENCE
   96:d=5  hl=2 l=   3 prim:      OBJECT            :organizationalUnitName
  101:d=5  hl=2 l=  15 prim:      UTF8STRING        :Human Resources
  118:d=3  hl=2 l=  28 cons:    SET
  120:d=4  hl=2 l=  26 cons:     SEQUENCE
  122:d=5  hl=2 l=   3 prim:      OBJECT            :commonName
  127:d=5  hl=2 l=  19 prim:      UTF8STRING        :hr.jameshfisher.com
  148:d=3  hl=2 l=  37 cons:    SET
  150:d=4  hl=2 l=  35 cons:     SEQUENCE
  152:d=5  hl=2 l=   9 prim:      OBJECT            :emailAddress
  163:d=5  hl=2 l=  22 prim:      IA5STRING         :jameshfisher@gmail.com
  187:d=2  hl=2 l=  92 cons:   SEQUENCE
  189:d=3  hl=2 l=  13 cons:    SEQUENCE
  191:d=4  hl=2 l=   9 prim:     OBJECT            :rsaEncryption
  202:d=4  hl=2 l=   0 prim:     NULL
  204:d=3  hl=2 l=  75 prim:    BIT STRING
  281:d=2  hl=2 l=  31 cons:   cont [ 0 ]
  283:d=3  hl=2 l=  29 cons:    SEQUENCE
  285:d=4  hl=2 l=   9 prim:     OBJECT            :challengePassword
  296:d=4  hl=2 l=  16 cons:     SET
  298:d=5  hl=2 l=  14 prim:      UTF8STRING        :securepassword
  314:d=1  hl=2 l=  13 cons:  SEQUENCE
  316:d=2  hl=2 l=   9 prim:   OBJECT            :sha256WithRSAEncryption
  327:d=2  hl=2 l=   0 prim:   NULL
  329:d=1  hl=2 l=  65 prim:  BIT STRING
```
