---
title: "Symmetric encryption with the Web Cryptography API"
tags: ["programming", "crypto", "javascript"]
---

Here's an example of symmetric encryption using the Web Cryptography API.
Below you see three textareas: plaintext, ciphertext and private key.
This page generates a new symmetric key.
You can see this key in JSON Web Key format, on the right-hand side.
The plaintext on the left is encrypted with this key;
the resulting ciphertext is in the middle.

<div>
  <style>
    textarea {
      height: 250px;
      font-family: monospace;
    }
  </style>
  <div style="display: flex;">
    <textarea style="flex: 1;" id="plaintext">I, Jim, owe Bob $5</textarea>
    <textarea style="flex: 1;" id="ciphertext"></textarea>
    <textarea style="flex: 2;" id="privKey"></textarea>
  </div>
</div>
<script>
  function buf2hex(buf) {
    return Array.prototype.map.call(new Uint8Array(buf), x=>(('00'+x.toString(16)).slice(-2))).join('');
  }
  function hex2buf(hex) {
    const bytes = [];
    for (let i = 0; i < hex.length; i+=2) {
      bytes.push(Number.parseInt(hex.slice(i,i+2), 16));
    }
    return new Uint8Array(bytes);
  }
  (async()=>{
    const privKeyEl = document.getElementById("privKey");
    const plaintextEl = document.getElementById("plaintext");
    const ciphertextEl = document.getElementById("ciphertext");
    privKeyEl.value = JSON.stringify(await crypto.subtle.exportKey("jwk", await crypto.subtle.generateKey({name:"AES-CTR", length: 256}, true, ["encrypt", "decrypt"])));
    function importKey() {
      return crypto.subtle.importKey(
        "jwk",
        JSON.parse(privKeyEl.value),
        {name:"AES-CTR", length: 256},
        true,
        ["encrypt", "decrypt"]
      );
    }
    async function encrypt() {
      const privKey = await importKey();
      ciphertextEl.value = buf2hex(await crypto.subtle.encrypt(
        {name: "AES-CTR", counter: new Uint8Array(16), length: 16*8},
        privKey,
        new TextEncoder("utf-8").encode(plaintextEl.value)
      ));
    }
    async function decrypt() {
      const privKey = await importKey();
      plaintextEl.value = new TextDecoder("utf-8").decode(
        await crypto.subtle.decrypt(
          {name: "AES-CTR", counter: new Uint8Array(16), length: 16*8},
          privKey,
          hex2buf(ciphertextEl.value)
          ));
    };
    plaintextEl.oninput = encrypt;
    privKeyEl.oninput = encrypt;
    ciphertextEl.oninput = decrypt;
    encrypt();
  })();
</script>

You can edit all three textareas.
Editing the plaintext updates the ciphertext.
Editing the private key also updates the ciphertext.
Editing the ciphertext updates the plaintext using the private key.

The `crypto.subtle` methods used are
`generateKey`, `exportKey`, `importKey`, `encrypt` and `decrypt`.
I first generate the private key like this:

```js
privKeyEl.value = JSON.stringify(
  await crypto.subtle.exportKey(
    "jwk",                              // JSON Web Key format
    await crypto.subtle.generateKey(
      {name:"AES-CTR", length: 256},    // AES in "counter" mode
      true,                             // Allow exporting the key
      ["encrypt", "decrypt"])));        // We'll use the key for encryption and decryption
```

I import the key again with the reverse process:

```js
function importKey() {
  return crypto.subtle.importKey(
    "jwk",
    JSON.parse(privKeyEl.value),
    {name:"AES-CTR", length: 256},
    true,
    ["encrypt", "decrypt"]
  );
}
```

To encrypt the plaintext:

```js
function buf2hex(buf) {
  return Array.prototype.map.call(new Uint8Array(buf), x=>(('00'+x.toString(16)).slice(-2))).join('');
}
async function encrypt() {
  const privKey = await importKey();
  ciphertextEl.value = buf2hex(
    await crypto.subtle.encrypt(
      {name: "AES-CTR", counter: new Uint8Array(16), length: 16*8},
      privKey,
      new TextEncoder("utf-8").encode(plaintextEl.value)));
}
```

To decrypt the ciphertext:

```js
function hex2buf(hex) {
  const bytes = [];
  for (let i = 0; i < hex.length; i+=2) {
    bytes.push(Number.parseInt(hex.slice(i,i+2), 16));
  }
  return new Uint8Array(bytes);
}
async function decrypt() {
  const privKey = await importKey();
  plaintextEl.value = new TextDecoder("utf-8").decode(
    await crypto.subtle.decrypt(
      {name: "AES-CTR", counter: new Uint8Array(16), length: 16*8},
      privKey,
      hex2buf(ciphertextEl.value)));
};
```

Notice that, for each plaintext character, you get two hex characters.
The plaintext and ciphertext are the same size in bytes.
The characters are encoded byte-by-byte.
By editing pieces of the ciphertext,
the corresponding plaintext character changes.
If you edit the private key, the ciphertext completely changes.

The encryption is AES in "counter" mode,
counting up from 0 for each encryption block.
This is perhaps not the "recommended" mode of operation.
I'll do a future post about modes of operation in block ciphers.
