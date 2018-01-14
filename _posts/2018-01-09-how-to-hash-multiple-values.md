---
title: "How to hash multiple values"
tags: ["programming", "crypto"]
---

To hash a string like `"hello"`,
you choose a specific hash function like SHA-256,
then pass the string to it,
getting a hash like `2cf24db...38b9824`.
Like this (in Go):

```go
func hash1(v []byte) []byte {
  h := sha256.Sum256(v)
  return h[:]
}
```

But if you have two strings like `"Jim"` and `"Fisher"`,
how do you hash these two values together?
And if you have an array of strings,
how do you produce a hash of the entire array?
We want a "composite" hash function.
There are multiple ways to make a composite hash function,
but it's not obvious which way you should choose,
and it's usually left up to you to implement it!

I recently stumbled over composite hash function implementation
which I'll call hash-then-XOR.
It looked like this:

```go
func hash2_hash_then_xor(v1, v2 []byte) []byte {
  return xor(hash1(v1), hash1(v2))
}

func xor(v1, v2 []byte) []byte {
  r := make([]byte, len(v1))
  for i := 0; i < len(v1); i++ {
    r[i] = v1[i] ^ v2[i]
  }
  return r
}
```

Hash-then-XOR first hashes each input value,
then combines all the hashes with XOR.
Hash-then-XOR seems plausible,
but is it a good hash function?
Think about it for a moment.

No, hash-then-XOR is not a good hash function!
A good hash function makes it hard to find _collisions_,
distinct inputs which produce the same hash.
Let me tell you that `hash2_hash_then_xor("Jim", "Fisher")`
produces the hash `7cf467d...a7417a0`.
Can you find another distinct input which produces the hash `7cf467d...a7417a0`?
<span class="answer">You don't need to brute-force it!
You only need to swap the arguments: `hash2_hash_then_xor("Fisher", "Jim")`.</span>

Given an input to hash-then-XOR,
it's easy to find another input with the same hash.
This is known as a "second-preimage attack",
and it's bad news for a hash function!
Hash-then-XOR is not collision-resistant because
XOR is _commutative_: `forall a b, xor(a,b) == xor(b,a)`.
Hash-then-XOR may be ideal if you wish to hash a _set_ of values
in which the order does not matter,
but this is not a typical requirement.

To hash an ordered pair of values,
we want a non-commutative combining function.
One non-commutative function is _concatenation_,
which is used in perhaps the most common composite hash function,
which I'll call concat-then-hash:

```go
func hash2_concat_then_hash(v1, v2 []byte) []byte {
  return hash1(append(v1, v2...))
}
```

In concat-then-hash,
the hash of `"Jim"` and `"Fisher"`
is the hash of `"JimFisher"`.
Reversing the inputs produces the hash of `"FisherJim"`,
a distinct string,
so this is not vulnerable to an attack by reordering inputs.
Is concat-then-hash then invulnerable to a second-preimage attack?
Can you find an example of another input which collides with
`hash2_concat_then_hash("Jim", "Fisher")`?
<span class="answer">
Again, you don't need to brute-force it!
One example is `hash2_concat_then_hash("Ji", "mFisher")`,
because `"Ji"` and `"mFisher"` also concatenate to `"JimFisher"`.
</span>

Concat-then-hash is also vulnerable to second-preimage attacks!
Intuitively, concatenation throws away the dividing line between the two values,
so we can find collisions at all the other dividing lines.
You might be thinking of preserving this dividing line with a separator character,
like this:

```go
func hash2_concat_sep_then_hash(v1, v2 []byte) []byte {
  return hash1(append(append(v1, ','), v2...))
}
```

Here, we instead hash the string `"Jim,Fisher"`,
which claims to preserve the dividing line with a comma.
Can you find an example of another input which collides with
`hash2_concat_sep_then_hash("Jim", "Fisher")`?
Are we finally collision-resistant?
<span class="answer">
No, we're not collision-resistant!
I can't find a second preimage,
because no other pairs of strings concatenate to `"Jim,Fisher"`.
But you can still find collisions,
because the input strings can embed the separator.
For example, `("a,b", "c")` collides with `("a", "b,c")`.
</span>

The underlying problem is that concatenation is not _injective_,
and this is not fixed by adding a separator.
At [Pusher](https://pusher.com),
the company I work for,
[we were once hit by a security issue due to the non-injectivity of concatenation](https://sakurity.com/blog/2015/05/08/pusher.html),
even with a separator.
You should take this seriously!

To guarantee injectivity,
instead of concatenation,
we can use a _serialization_ function.
An example is JSON serialization,
so the hash of `"Jim"` and `"Fisher"`
would be the hash of `["Jim","Fisher"]`.
We can implement serialize-then-hash in Go like this:

```go
func hash2_serialize_then_hash(v1, v2 []byte) []byte {
  bs, _ := json.Marshal([]string{string(v1), string(v2)})
  return hash1(bs)
}
```

No other two strings under serialization produce `["Jim","Fisher"]`.
We know a serialization function is injective because
it comes with a corresponding parsing function.
To my knowledge, serialize-then-hash is a collision-resistant composite hash function,
assuming that the underlying hash function (such as SHA-256) is collision-resistant,
and your underlying serialization function (such as JSON) is in fact injective.

There are other valid composite hash functions,
such as [HMAC](https://en.wikipedia.org/wiki/Hash-based_message_authentication_code).
But HMAC distinguishes between a "key" and "message",
and is not defined over variable-length arrays of strings.
In my opinion,
there should be a standard construction
which hashes an array of values.
To my knowledge, no such standard exists.
