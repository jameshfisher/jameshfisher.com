---
title: "What is a random oracle?"
---

Here's one way to implement a hash function (in Go):

```go
package main
import (
  "fmt"
  "net/http"
  "math/rand"
)
type Oracle struct {
  answers map[string][]byte
}
func (oracle *Oracle) ServeHTTP(w http.ResponseWriter, r *http.Request) {
  hash, ok := oracle.answers[r.URL.Path]
  if !ok {
    hash = make([]byte, 32)
    rand.Read(hash)
    oracle.answers[r.URL.Path] = hash
  }
  fmt.Fprintf(w, "%x\n", hash)
}
func main() {
  var oracle Oracle
  oracle.answers = map[string][]byte{}
  http.ListenAndServe(":3000", &oracle)
}
```

We query the hash function like so:

```
$ curl localhost:3000/bar
52fdfc072182654f163f5f0f9a621d729566c74d10037c4d7bbb0407d1e2c649
$ curl localhost:3000/bar
52fdfc072182654f163f5f0f9a621d729566c74d10037c4d7bbb0407d1e2c649
$ curl localhost:3000/baz
81855ad8681d0d86d1e91e00167939cb6694d2c422acd208a0072939487f6999
```

You're probably thinking,
"this doesn't look like any hash function I've seen before."
But look at its output:
`bar` always hashes to the same value,
`bar` and `baz` have completely different hashes despite their similarity,
and it's infeasible given `81855ad...87f6999` to find a corresponding input like `baz`.
This hash function is quite different from SHA-256, MD5, or Blowfish,
but it has many of the same properties!

The above "hash function" is a _random oracle_.
A random oracle is a model of an ideal hash function.
When you're using a hash function like SHA-256,
you can imagine that each call to the algorithm
will make a query to this global HTTP server.

When we say a hash function is bad,
we often mean that the hash function doesn't behave like a random oracle.
For example, a random oracle is resistant to collision attacks.
This means that
there is no way to find two values for which
the random oracle will return the same hash,
except by repeatedly querying the oracle with new values.
Other properties we expect from real-world hash functions,
like preimage resistance and second-preimage resistance,
are properties we expect from a random oracle model.
