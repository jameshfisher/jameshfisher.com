---
title: Hashing a string with the Web Cryptography API
tags:
  - programming
  - crypto
  - javascript
summary: >-
  The Web Cryptography API provides low-level crypto primitives in JavaScript,
  including hashing strings using SHA-256.
---

The [Web Cryptography API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
provides crypto primitives for hashing, generating keys, encrypting, signing, and so on.
The API is a bit weird, though,
and there aren't many nice examples on the web.
Here are some examples.

The oddly named object `crypto.subtle` provides many functions.
For example, it provides the `crypto.subtle.digest` function,
which lets us apply a named hash function to an `ArrayBuffer`,
yielding another `ArrayBuffer`.
The following function takes a string and returns its SHA-256 hash.
Or more strictly speaking, it returns
the hexadecimal encoding of
the SHA-256 hash of
the UTF-8 encoding of
that string.

```js
async function sha256(str) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder("utf-8").encode(str));
  return Array.prototype.map.call(new Uint8Array(buf), x=>(('00'+x.toString(16)).slice(-2))).join('');
}
```

<div>
  <input id="plaintext" value="hello"/>
  <code id="sha256"></code>
</div>

<script>
      async function sha256(str) {
        const buf = await crypto.subtle.digest("SHA-256", new TextEncoder("utf-8").encode(str));
        return Array.prototype.map.call(new Uint8Array(buf), x=>(('00'+x.toString(16)).slice(-2))).join('');
      }
      const plaintextEl = document.getElementById("plaintext");
      const sha256El = document.getElementById("sha256");
      async function update(ev) {
        const s = await sha256(plaintextEl.value);
        sha256El.innerText = s;
      };
      plaintextEl.oninput = update;
      update()
</script>

Notice that `crypto.subtle.digest` returns a `Promise` of the digest.
All the `crypto.subtle` functions are asynchronous like this.

Notice that it's `crypto.subtle.digest("SHA-256", x)`,
and not `crypto.subtle.sha256(x)`.
The specific digest algorithm is passed in as a string.
This pattern is followed in all the other functions,
e.g. instead of generating an ECDH key with `crypto.subtle.generateKeyECDH({namedCurve: "P-256"}, ...)`,
we call `crypto.subtle.generateKey({name:"ECDH", namedCurve: "P-256"}, ...)`.
There is a matrix of which operations are supported by which crypto algorithms:

| Algorithm name                  | Supported operations
|---------------------------------|---
| `RSA-{PSS,PKCS1-v1_5}`, `ECDSA` | `sign/verify`, `generateKey`, `{im,ex}portKey`
| `ECDH`                          | `generateKey`, `derive{Key,Bits}`, `{im,ex}portKey`
| `RSA-OAEP`, `AES-{CTR,CBC,GCM}` | `{en,de}crypt`, `generateKey`, `{im,ex}portKey`, `[un]wrapKey`
| `AES-KW`                        | `generateKey`, `{im,ex}portKey`, `[un]wrapKey`
| `HMAC`                          | `sign/verify`, `generateKey`, `{im,ex}portKey`
| `SHA-{1,256,384,512}`           | `digest`
| `HKDF`, `PBKDF2`                | `derive{Key,Bits}`, `importKey`

This stringly-typed API is crying out for some type-safe wrappers!
