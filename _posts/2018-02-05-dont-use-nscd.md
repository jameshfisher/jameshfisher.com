---
title: Don't use `nscd`
tags:
  - programming
  - posix
  - c
hnUrl: 'https://news.ycombinator.com/item?id=32950968'
hnUpvotes: 2
summary: >-
  `nscd`, a local DNS resolver within `glibc`, is non-standard. Instead, use a local DNS server like `named` or `dnscache`.
---

You find that DNS queries take a long time from your machine,
and you decide to fix this by installing a local DNS resolver.
You ask the internet, which says:

> You could use `bind9`, `nscd`, or `djbdns`.

There's an odd one out in this list.
One of them is not a DNS server at all!

An ordinary DNS server listens on UDP port 53.
When running a local caching DNS resolver,
local processes will contact `localhost:53` for any DNS lookups.

But, unlike the other caching DNS resolvers,
`nscd` does not listen on any ports!
Instead, `nscd` listens on a socket, `/var/run/nscd/socket`.
How, though, do local processes know to connect to `/var/run/nscd/socket`?

The answer is that local processes _don't_ know to connect to `/var/run/nscd/socket`.
Or rather, some do, and some don't.
The processes that do know about `/var/run/nscd/socket`
are those linked against `glibc` and using `getaddrinfo` from that library.

Only GNU's implementation of the C standard library
has the knowledge of `/var/run/nscd/socket`.
If your process is linked against a different libc (e.g. `musl`),
or if your process uses a different runtime (e.g. the Go runtime),
it knows nothing of `/var/run/nscd/socket`.
This is your first reason for not using `nscd`.

Other systems have not implemented support for `/var/run/nscd/socket`
because there is no specification, or even informal documentation, for `nscd`.
Why?
Because `nscd` is entirely internal to glibc.
[The source code for the daemon is part of glibc](https://github.com/bminor/glibc/blob/09533208febe923479261a27b7691abef297d604/nscd/nscd.c#L138),
even though the daemon is not part of the libc library.

If you try installing `nscd` anyway,
you'll find the second reason for not using `nscd`:
it's horribly unstable.
I can't keep it running for more than a few seconds
before I get log lines like this in the system log:

```
Feb  3 19:36:17 vagrant-ubuntu-trusty-64 kernel: [11799.496494] nscd[3677]: segfault at 43c000010 ip 00007fba29180753 sp 00007fba1e4741f0 error 4 in nscd[7fba2916c000+25000]
Feb  3 19:39:46 vagrant-ubuntu-trusty-64 kernel: [12008.644917] nscd[3758]: segfault at 0 ip 00007ff37679cdfa sp 00007ff36ce901e8 error 4 in libc-2.19.so[7ff376714000+1be000]
Feb  3 19:51:09 vagrant-ubuntu-trusty-64 kernel: [12691.893221] nscd[3856]: segfault at 0 ip 00007f82d31aadfa sp 00007f82c989e1e8 error 4 in libc-2.19.so[7f82d3122000+1be000]
```

This is not just my experience.
[Denys Vlasenko](https://github.com/keymon/unscd/blob/master/nscd-0.47.c) explains:

> nscd problems are not exactly unheard of. Over the years, there were
> quite a bit of bugs in it. This leads people to invent babysitters
> which restart crashed/hung nscd. This is ugly.
>
> After looking at nscd source in glibc I arrived to the conclusion
> that its design is contributing to this significantly. Even if nscd's
> code is 100.00% perfect and bug-free, it can still suffer from bugs
> in libraries it calls.
>
> As designed, it's a multithreaded program which calls NSS libraries.
> These libraries are not part of libc, they may be provided
> by third-party projects (samba, ldap, you name it).
>
> Thus nscd cannot be sure that libraries it calls do not have memory
> or file descriptor leaks and other bugs.
>
> Since nscd is multithreaded program with single shared cache,
> any resource leak in any NSS library has cumulative effect.
> Even if a NSS library leaks a file descriptor 0.01% of the time,
> this will make nscd crash or hang after some time.

Vlasenko writes this in the context of his single-threaded `nscd` replacement for BusyBox.
But he notes "as of 2008-08 it is not in wide use".
But it won't be in widespread use, ever,
and there won't be any other stable replacements for `nscd`, either,
because the `nscd` protocol is internal to glibc,
with no stability guarantees.

Instead of `nscd`, use a local DNS server registered in `/etc/resolv.conf`.
The protocol is specified and stable, all processes respect `resolv.conf`, and there are many implementations.
Try out `named` from `bind9`, or `dnscache` from `djbdns`.
