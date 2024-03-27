---
title: DNS resolution procedure
tags:
  - programming
  - networking
---

DNS is mainly a way to look up the IP address for a domain.
You send a domain to a nameserver, and the nameserver sends back a response.
Unfortunately the response is not necessarily an IP!
The nameserver can respond with answers
which expect the DNS client to make further DNS requests to find the IP address.
DNS resolution is therefore a _recursive_ procedure
with at least two recursive cases,
and this recursion can be confusing.

Let's say we ask the nameserver `8.8.8.8` for the IP address for the domain `www.example.com.`.
In DNS terminology, we ask the nameserver for an `A` record relating to this domain.
The nameserver might respond with an `A` record like `www.example.com. 3600 IN A 1.2.3.4`.
If so, we know the IP address is `1.2.3.4`, so we're done.

But even though we asked for an `A` record,
if the nameserver doesn't know any `A` records for `www.example.com.`,
the nameserver may instead respond with other kinds of record.
Two important kinds of record are `CNAME` and `NS`.
We can model this (in pseudo-Haskell) as

```haskell
data Answer = A IpAddr | CNAME Domain | NS Domain

-- ask nameserver `ns` for an A record for domain `d`.
-- It might give us an answer.
query :: Domain -> IpAddr -> Maybe Answer
```

Instead of an `A` record,
the nameserver might respond with `www.example.com. 3600 IN CNAME example-com.netlify.com.`.
In English, this means "To find `www.example.com.`, instead find `example-com.netlify.com.`"
This is a recursive case in our DNS resolution procedure:

```haskell
resolve :: Domain -> IpAddr -> Maybe IpAddr
resolve domain nsIp = do
  ans <- query domain nsIp
  case query domain nsIp of
    A ip -> Just ip
    CNAME domain' -> resolve domain' nsIp
```

Another recursive case is given by the `NS` record type.
The nameserver could respond with `www.example.com. 3600 IN NS ns1.foo-registrar.com.`,
which in English means "To find `www.example.com.`, ask the nameserver `ns1.foo-registrar.com.`"
But wait:
before we even ask `ns1.foo-registrar.com.` anything,
we first need to find its IP, and this is another DNS resolution!
Let's say we eventually resolve `ns1.foo-registrar.com.` to the IP `7.7.7.7`.
Then we can continue by asking `7.7.7.7` for an `A` record for `www.example.com.`:

```haskell
resolve :: Domain -> IpAddr -> Maybe IpAddr
resolve domain nsIp = do
  ans <- query domain nsIp
  case query domain nsIp of
    A ip -> Just ip
    CNAME domain' -> resolve domain' nsIp                           -- recursive call
    NS otherNsDomain -> do
                          otherNsIp <- resolve otherNsDomain nsIp   -- recursive call
                          resolve domain otherNsIp                  -- recursive call
```

This already contains many simplifications,
and I'm not sure it's even correct.
By continuing the resolution as `resolve domain otherNsIp`,
we forget our original nameserver, `8.8.8.8`.
It may be that `7.7.7.7` only knows that `www.example.com. 3600 IN CNAME example-com.netlify.com.`.
To resolve `example-com.netlify.com`, which nameserver should we ask -
`7.7.7.7` or `8.8.8.8`?
Instead, we probably want to build up a _list_ of nameservers we can ask,
so we can try each of them in order.

Nameservers can also respond with _multiple_ records.
These records can have different priorities.
They can respond with other records like `ANAME`, `ALIAS` or `SRV`,
with other resolution semantics.
DNS resolution is complicated!
