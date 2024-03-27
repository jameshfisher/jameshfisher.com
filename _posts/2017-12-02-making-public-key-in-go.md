---
title: Making a public key file in Go
draft: true
tags: []
---

[I saw yesterday](/2017/11/30/asn1/) that the kinds of file that OpenSSL uses -
private and public keys, certificates, and so on -
are not as opaque as they might look.
Two important formats used are PEM and ASN.1.
ASN.1 is a bit like protobuf, with a binary encoding called DER.
PEM "wraps" this binary encoding to produce an ASCII file.

These two formats are available in the Go standard library as `encoding/pem` and `encoding/asn1`.
With these, we can make files interoperable with OpenSSL.
For example, let's make a public key file:

```go
package main
import "os"
import "encoding/pem"
import "encoding/asn1"
import "math/big"
func main() {
  var publicKey struct { Modulus *big.Int; Exponent int; }
  publicKey.Modulus = big.NewInt(0)
  publicKey.Modulus.SetString("C3E448D29FCDB2F7E52ABD17712AC76E4ABD66D54F2EF182DC4562B3FA240E3FF76658E7324E441E2C16628C703FF9DEFC76006278B35E21D890E5C2225BCD5B", 16)
  publicKey.Exponent = 0x010001
  asn1Bytes, _ := asn1.Marshal(publicKey)
  file, _ := os.Create("public_key.pem")
  pem.Encode(file, &pem.Block{ Type: "RSA PUBLIC KEY", Bytes: asn1Bytes })
  file.Close()
}
```

The above makes a `public_key.pem`
which follows [the PKCS#1 format for public keys](https://tools.ietf.org/html/rfc3447#appendix-A),
defined as:

```
RSAPublicKey ::= SEQUENCE {
    modulus           INTEGER,  -- n
    publicExponent    INTEGER   -- e
}
```

We can use this
