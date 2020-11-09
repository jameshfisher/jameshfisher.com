---
title: "Signing a string with HMAC using the Web Crypto API"
tags: ["programming", "crypto", "javascript"]
---

Below, you can type a plaintext string, and enter a secret key.
It will print the signature resulting from signing the plaintext with your secret key.

<div>
  <p>String to sign:</p>
  <textarea id="stringToSign" rows="2" cols="50">string to sign</textarea>
  <p>Shared secret key:</p>
  <textarea id="key" rows="4" cols="50"></textarea>
  <p>Signature:</p>
  <code id="sig"></code>
</div>
<script>
    (async function(){
      function buf2hex(buf) {
        return Array.prototype.map.call(new Uint8Array(buf), x=>(('00'+x.toString(16)).slice(-2))).join('');
      }
      async function hmacSha256(key, str) {
        const buf = new TextEncoder("utf-8").encode(str);
        const sig = await window.crypto.subtle.sign("HMAC", key, buf);
        return buf2hex(sig);
      }
      const secretKeyEl = document.getElementById("key");
      const stringEl = document.getElementById("stringToSign");
      const sigEl = document.getElementById("sig");
      const key = await window.crypto.subtle.generateKey(
        {name:"HMAC","hash":"SHA-256"},
        true,
        ["sign", "verify"]);
      secretKeyEl.value = JSON.stringify(
        await window.crypto.subtle.exportKey("jwk", key));
      async function update() {
        console.log("update");
        const jwk = JSON.parse(secretKeyEl.value);
        const key = await window.crypto.subtle.importKey(
          "jwk",
          jwk,
          {name:"HMAC","hash":"SHA-256"},
          true,
          ["sign", "verify"]);
        sigEl.innerText = await hmacSha256(key, stringEl.value);
      }
      secretKeyEl.oninput = update;
      stringEl.oninput = update;
      update();
    })();
</script>

This is implemented with the Web Cryptography API.
Specifically, it uses `window.crypto.subtle.sign("HMAC", CryptoKey, ArrayBuffer)`:

```js
function buf2hex(buf) {
  return Array.prototype.map.call(new Uint8Array(buf), x=>(('00'+x.toString(16)).slice(-2))).join('');
}
async function hmacSha256(key, str) {
  const buf = new TextEncoder("utf-8").encode(str);
  const sig = await window.crypto.subtle.sign("HMAC", key, buf);
  return buf2hex(sig);
}
```

Your secret key is generated when this page loads.
The key is in "JSON Web Key" format.
It was generated with `window.crypto.subtle.generateKey`
and exported with `window.crypto.subtle.exportKey`,
like so:

```js
const key = await window.crypto.subtle.generateKey(
  {name:"HMAC","hash":"SHA-256"},
  true,
  ["sign", "verify"]);
secretKeyEl.value = JSON.stringify(
  await window.crypto.subtle.exportKey("jwk", key));
```

You can edit your key in the textarea, or copy-paste a new one.
The key is imported from the textarea with `window.crypto.subtle.importKey`:

```js
const jwk = JSON.parse(secretKeyEl.value);
const key = await window.crypto.subtle.importKey(
  "jwk",
  jwk,
  {name:"HMAC","hash":"SHA-256"},
  true,
  ["sign", "verify"]);
```
