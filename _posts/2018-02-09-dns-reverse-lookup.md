---
title: How does reverse DNS lookup work?
tags:
  - reverse-dns
  - dns
  - networking
  - posix
  - programming
taggedAt: '2024-03-26'
---

You have an IP address like `8.8.4.4`,
and you want to know which domains point to it.
I always used to Google "reverse IP",
then use [a web service like this one](https://mxtoolbox.com/ReverseLookup.aspx).
I assumed these services must have some giant database of all public DNS records
in order to invert the query.

That's not how it works!
You can do the same "reverse IP" query yourself
using a tool like `dig`:

```console
$ dig +short PTR 4.4.8.8.in-addr.arpa
google-public-dns-b.google.com.
```

And sure enough,
if we ask for the IP for `google-public-dns-b.google.com`,
we get `8.8.4.4`:

```console
$ dig +short A google-public-dns-b.google.com
8.8.4.4
```

This works because DNS has a `PTR` record type,
which is like the inverse of the `A` record type.
Where there is a record `google-public-dns-b.google.com. IN A 8.8.4.4`,
there is an equivalent inverse record `4.4.8.8.in-addr.arpa. IN PTR google-public-dns-b.google.com.`.

Notice the weird notation `4.4.8.8.in-addr.arpa`.
All IP addresses `A.B.C.D` are assigned a "domain" `D.C.B.A.in-addr.arpa`.
This hack seems to be necessary because
the "left-hand side" of DNS record types are supposed to be domains,
not IP addresses.

Because this `PTR` query is on a separate set of `PTR` records,
and not on the canonical set of `A` records,
there is no guarantee that it will give you an inverse.
The `PTR` records can be inconsistent with the `A` records.

How does `dig` look up the "domain" `4.4.8.8.in-addr.arpa`?
The same as for any other domain name!
Traverse the domain name from the root,
beginning by asking the root nameservers.
We get results like these:

```
arpa.			          IN	NS	a.root-servers.net.
in-addr.arpa.		    IN	NS	a.in-addr-servers.arpa.
8.in-addr.arpa.		  IN	NS	ns1.Level3.net.
8.8.in-addr.arpa.	  IN	NS	ns1.Level3.net.
4.8.8.in-addr.arpa.	IN	NS	ns1.google.com.
```

The IP address space is hierarchical,
just like the domain name space.
But the most-significant digit is on the left of the IP address,
unlike the most-significant part of the domain name,
which is on the right.
This is the reason that the IP address `A.B.C.D`
is reversed when placed into its "domain" `D.C.B.A.in-addr-arpa`.

The owner of the IP address space `8.8.*.*`,
i.e. `8.8.0.0/16`,
is in control of the domain `8.8.in-addr-arpa`.
Apparently Google is the owner of `8.8.4.*`, i.e. `8.8.4.0/24`.
We can explore these ownerships with other tools,
but that's another blog post.
