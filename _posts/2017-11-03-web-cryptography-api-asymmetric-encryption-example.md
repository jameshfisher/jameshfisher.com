---
title: "Asymmetric encryption with the Web Cryptography API"
---

The Web Cryptography API lets us generate RSA and EC keypairs,
but these keys don't support encryption/decryption!
The only algorithms supporting encryption and decryption
are symmetric (and the obscure-sounding `RSA-OAEP`).
Instead of directly providing asymmetric encryption/decryption,
the Web Cryptography API provides the `deriveKey` method,
which lets two communicators derive a shared symmetric secret.
This post shows how to derive a shared AES key
given two ECDH keys.
This code should log `true`,
asserting that Alice's derived AES key
is the same as Bob's derived AES key:

```js
const aliceKeyPair = await genKeyPair();
const bobKeyPair   = await genKeyPair();
const aliceSecret  = await deriveKey(aliceKeyPair.privateKey, bobKeyPair.publicKey  );
const bobSecret    = await deriveKey(  bobKeyPair.privateKey, aliceKeyPair.publicKey);
console.log((await exportKey(aliceSecret)).k === (await exportKey(bobSecret)).k);
```

Here's the accompanying code which calls the `crypto.subtle` API:

```js
function genKeyPair() {
  return crypto.subtle.generateKey({name:"ECDH", namedCurve: "P-256"}, true, ["deriveKey"]);
}
function deriveKey(privKey, pubKey) {
  return crypto.subtle.deriveKey(
    {"name": "ECDH", "public": pubKey},
    privKey,
    {name:"AES-CTR", length: 256},
    true,
    ["encrypt", "decrypt"]
  );
}
async function exportKey(k) {
  return JSON.stringify(await crypto.subtle.exportKey("jwk", k));
}
```

After Alice and Bob have derived their shared symmetric secret,
they can use this to communicate using normal symmetric crypto.

<script>
  function genKeyPair() {
    return crypto.subtle.generateKey({name:"ECDH", namedCurve: "P-256"}, true, ["deriveKey"]);
  }
  function deriveKey(privKey, pubKey) {
    return crypto.subtle.deriveKey(
      {"name": "ECDH", "public": pubKey},
      privKey,
      {name:"AES-CTR", length: 256},
      true,
      ["encrypt", "decrypt"]
    );
  }
  async function exportKey(k) {
    return JSON.stringify(await crypto.subtle.exportKey("jwk", k));
  }
  (async function() {
    const aliceKeyPair = await genKeyPair();
    const bobKeyPair   = await genKeyPair();
    const aliceSecret  = await deriveKey(aliceKeyPair.privateKey, bobKeyPair.publicKey  );
    const bobSecret    = await deriveKey(  bobKeyPair.privateKey, aliceKeyPair.publicKey);
    console.log((await exportKey(aliceSecret)).k === (await exportKey(bobSecret)).k);
  })();
</script>
