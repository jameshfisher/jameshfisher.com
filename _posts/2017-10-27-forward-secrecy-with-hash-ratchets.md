---
title: Forward secrecy with hash ratchets
tags:
  - programming
  - crypto
---

Alice wants to send messages to Bob.
These messages are sensitive, so Alice and Bob take precautions.
When they meet, they decide on a shared secret _S_ with which to encrypt the messages.
Each sent message is encrypted with the shared secret,
and each received message is decrypted with the shared secret.

Eve is interested in their conversation,
but hasn't been able to read anything,
because she doesn't have the shared secret.
However, Eve is able to intercept the encrypted messages,
and she has been storing them up, hoping to one day decrypt them.
Then one day, Eve gets lucky:
she discovers a vulnerability in Bob's phone,
and she manages to steal the shared secret!
With this, Eve can now decrypt the entire message history!

Is Alice and Bob's crypto-system "secure"?
A traditional perspective assumes Alice and Bob have secure machines,
and attackers only control the network.
In this traditional perspective,
the crypto-system described is secure,
and Eve's decryption of the message history
was only possible because of faulty machines.
But, in the real world,
Alice and Bob's machines do have bugs;
they do have vulnerabilities;
they do get stolen.
We should design crypto-systems
which minimize the damage that an attacker can do
with a compromised machine.

Specifically,
can we design the crypto-system so that,
even after Eve compromises Bob's phone,
she cannot decrypt her cache of the previous messages?
The answer is yes, and such a system is said to have "forward secrecy".

Consider an old plaintext message _M_,
which was encrypted with secret _S_
yielding ciphertext _C_.
To implement forward secrecy,
we must ensure that Bob's phone cannot recover _M_.
The first implication is that
Bob's phone must not store the plaintext messages.
Apps like WhatsApp claim to provide forward secrecy,
but they trivially fail at the first hurdle,
because the apps store a plaintext message log!

Let's assume, then, that
Bob's phone discards the message shortly after decryption.
The phone shows Bob the plaintext, then destroys the message.
Destroying _M_ is better, but not enough, because
Bob's phone still has the secret _S_,
which can be used to recover _M_ from Eve's stashed ciphertext _C_.
So Bob's phone must also destroy the secret _S_!

By destroying the secret _S_ after transmitting a message,
Alice and Bob have a system which provides forward secrecy.
The price they have paid is that they can now only send one message!
Their crypto-system wants to use the secret _S_ to encrypt the next message,
but it can't do so after destroying _S_.

To extend their conversation,
Alice and Bob need to agree on more secrets.
So they decide that, when they meet,
instead of agreeing on one shared secret _S_,
they will agree on a long series of shared secrets _S1_, _S2_, ..., _Sn_.
They will transfer the first message _M1_ with _S1_ to produce ciphertext _C1_.
They will then destroy _M1_ and _S1_,
so that Eve can never discover _M1_,
even if she compromises their machines.
For message _M2_, they will use _S2_, and so on,
sending up to _n_ messages before they need to meet again.

In effect, _S1_ through _Sn_ are a "one-time pad".
They are a big shared key, at least as large as the plaintext, only used once.
By destroying the pad as they use it,
Alice and Bob guarantee forward secrecy.
But the one-time pad has a couple of problems:
it's big, and it has finite length.

Both of these problems with the one-time pad can be fixed by
replacing randomness with _pseudo-randomness_.
Alice and Bob will use the shared secret _S_
as the seed to a pseudo-random number generator (PRNG),
from which they can derive the infinite stream of pseudo-random keys _S1_, _S2_, ..., etc.

A PRNG has _state_,
and a stepper function which yields a random number along with a new state.
There are many ways to implement this.
For example, the state could be the seed plus a counter,
and the stepper function could increment the counter,
and yield a random number by hashing the seed with the counter.
Would this system provide forward secrecy?
No!
This system never destroys the initial secret seed,
meaning the entire key stream is recoverable by Eve.
The previous states of the PRNG are recoverable by decrementing the counter.

For forward secrecy, we must ensure that, when stepping the PRNG,
the previous state becomes unrecoverable.
In other words, the stepper function must be a _one-way function_.
The most common one-way functions are _cryptographic hash functions_ like SHA256.
[This is how WhatsApp works!](https://www.whatsapp.com/security/WhatsApp-Security-Whitepaper.pdf)

> Each time a new Message Key is needed by a message sender,
> it is calculated as:
>
> 1. `Message Key = HMAC-SHA256(Chain Key, 0x01)`.
> 2. The Chain Key is then updated as `Chain Key = HMAC-SHA256(Chain Key, 0x02)`.
>
> This causes the Chain Key to “ratchet” forward,
> and also means that a stored Message Key can’t be used to
> derive current or past values of the Chain Key.

The WhatsApp whitepaper talks of "message keys" and "chain keys",
but the structure is exactly that of a pseudo-random number generator.
The "chain key" is the PRNG state.
The "message key" is the random number output, to be used as a one-time key.

HMAC is usually a way to sign data:
`signature = HMAC-SHA256(secret, plaintext)`.
In this terminology, the `Message Key` is the signature
resulting from signing the message `0x01` with the secret `Chain Key`.
But this is misleading.
WhatsApp is using the `HMAC-SHA256` function for a different purpose:
a hash function with two inputs.
I believe that instead of `HMAC-SHA256(Chain Key, 0x01)`
they could have used something like `SHA256(Chain Key + 0x01)`.
