---
title: "Making a stream cipher"
tags: ["programming", "go", "crypto"]
---

Symmetric cryptography lets Alice talk privately to Bob,
as long as they have a shared secret.
A "stream cipher" is one way to do symmetric crypto.
It's surprisingly easy to make a (probably bad) stream cipher.
Here's one implementation in Go:

```go
package main

import "os"
import "bufio"
import "crypto/sha256"

func main() {
	keystream := make(chan byte)
	key := []byte(os.Args[1])
	state := sha256.Sum256(key)
	go func() {
		for {
			state := sha256.Sum256(state[:])
			for i := 0; i < 4; i++ {
				keystream <- state[i]
			}
		}
	}()
	stdin := bufio.NewReader(os.Stdin)
	for {
		b, err := stdin.ReadByte()
		if err != nil {
			break
		}
		os.Stdout.Write([]byte{b ^ <-keystream})
	}
}
```

And here's the system in action,
sending a message over TCP:

```
$ nc -l 15000 | go run cipher.go secretpass  # Bob awaits Alice's message
I love you Bob
```

```bash
# Alice runs this
echo 'I love you Bob' | go run cipher.go secretpass | nc bob.com 15000
```

A stream cipher is a bit like the "one-time pad" system.
In the one-time pad system, Alice and Bob share a pad filled with random bytes.
To encrypt the plaintext, Alice XORs it with some bytes from the pad.
To decrypt the ciphertext, Bob XORs it with the same bytes from the pad.
Notice that the encryption and decryption algorithms are identical,
or "symmetric".

Sharing this pad is impractical for a couple of reasons.
The pad is big, making it impractical to carry.
But the pad is finite, meaning you can run out of key material.
Stream ciphers fix this by _generating_ an infinite pad, called a "keystream",
from a finite starting key.
In the example above, Alice and Bob agreed on the key `secretpass`.
Notice again that encryption and decryption are symmetric,
using the same file `cipher.go`.

My stream cipher generates the keystream
by repeatedly applying SHA-256 to the initial key.
After each application of SHA-256,
it takes some bytes from the state as keystream bytes.
There are many other ways you could generate the keystream.

This stream cipher suffers from some of the weaknesses of the one-time pad.
The keystream must not be reused!
If Alice and Bob were to exchange another message using the same key,
Eve could XOR the two ciphertexts together
to get the XOR of the two plaintexts.

Another weakness:
while the stream cipher provides privacy,
it does not provide integrity!
An man-in-the-middle could muddle with the ciphertext,
and Bob would have no way to know.

And there are probably other flaws I haven't foreseen.
IANAC (I am not a cryptographer).
