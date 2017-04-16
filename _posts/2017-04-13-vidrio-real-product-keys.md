---
title: "Vidrio gets real product keys"
justification: "I'm monetizing Vidrio with product keys."
---

What does a product key consist of? Somehow, the application should be convinced that _the developer has given my current user the permission to run me on this computer_.

Unfortunately, identifying "this computer" is tricky. The computer may not have an obvious ID. The user may want to transfer their license to another computer. There are ways to tackle this problem, but instead most developers have fallen back to this weaker claim in their product keys: _the developer has given user X permission to run the application on his computers_. Thus the product key just contains a user ID. This allows a product key to be copied to any number of computers, and that problem should be dealt with in some other way.

Verification and unforgeability can be satisfied with an asymmetric signature. I want a well-known format for such product keys which is supported by my server (in Go) and my client (in Swift). I can't find an candidate which fits all three requirements. I'm choosing JWT using RSA. There doesn't seem to be an obvious library in Swift for RSA verification. I'll sort that out later.

[jwt-go seems to be the de facto Go JWT library](https://github.com/dgrijalva/jwt-go). For crypto, it's using [the crypto/rsa library](https://godoc.org/crypto/rsa).

Here's an example of generating a JWT in Go:

```go
package main
import (
  "github.com/dgrijalva/jwt-go"
  "io/ioutil"
  "fmt"
  "time"
)
func main() {
  pemBytes, err := ioutil.ReadFile("priv_key.pem")
  if err != nil { panic(err) }
  privKey, err := jwt.ParseRSAPrivateKeyFromPEM(pemBytes)
  if err != nil { panic(err) }
  token := jwt.NewWithClaims(jwt.SigningMethodRS256, jwt.MapClaims{
    "iss": "vidr.io",
    "sub": "jameshfisher@gmail.com",
    "iat": time.Now().Unix(),
  })
  tokenStr, err := token.SignedString(privKey)
  if err != nil { panic(err) }
  fmt.Printf("Token: %s\n", tokenStr)
}
```

I generated the RSA key with

```bash
openssl genrsa -out priv_key.pem 4096
```

This is now integrated into the product key server, which will give you wonderfully long keys like this:

```
Your product key is: eyJhbGciOiJcCI6IkpXVCJ9.eyJpYXQiOjE0OTIzNjY3MjMsImlzcyI6InZpZHIuaW8iLCJzdWIiOiJqaW1teUBqYW1iby5jb20ifQ.DMOeZTv-BqFOTSH-ibuG7cZr_elEn0i7a4n3YzG4wot0aAhnytd8im4zQGgpwVn-TPPA8s2tkUfUMp0as5S9vwlf_pSsptDNf7hHOj6aurVG5D30v27u8Hvo6B3f70027shqTfx8dhG6uvviZnX8LISaIbwr7AfWcJEYB7MjOGIgkl4x3F5-_UyxUv8aWKpWIyA51ezKwnpFF1k5FnPHavpAWl5V0bppaUpm1ygsH8wGDqbqGheIEEPVtcWiCoHH-18JCGSKKd5mQBSMWQI0mwC84PpVFmBofeY2GLSzTvNo1VwFlPht1MGumLpM78aeuEtF04P7rIzbmSZXzQAWPzQAnj6t3xhJu8sTJZe94ltSu_ds8Xe1PXPm_7frJz58W0ubK82_O_a6uVclYy_28XfMtsQtHoyNrC7VN9YSU-XZlsgdA42xzJVWSUzI1NiIsInR5XUvTCaD4v7oxAwcCEibskJ6MdhbpU1qANNSfjTy6w_1d3NMFVe9gjk2M-LQIRzUbjGciA8kA03mw_EKp0XlQ3ErOEIgLyaO8045PUhTjjPAobSY4tIK8VVltWwN2SLRixrqC98wfZ8x_gOM1w66_qi9_J378NvNYJCPKxM1i6DuCMeKHaUoHPIHf9JK5WWVBpsb7RNmp6ett52MxTl3KBHhhHbBQJ2VMN5V9xN9Xp7z7QhEBPfQ
```
