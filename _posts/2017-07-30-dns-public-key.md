---
title: How to cut out the CA middleman
tags: []
---

SSL certificates work on trust: end users trust their browsers, and browsers trust "certificate authorities" (CAs) like Gandi. But the chain goes one step further: the CA trusts DNS. When you buy an SSL certificate for `foo.com` from a CA like Gandi, Gandi verifies that you `foo.com` by challenging you to modify the DNS for that domain. The ultimate trusted authority is not the CA; it is the Domain Name System.

There is therefore a much simpler alternative to SSL certificates, which cuts out the CA middleman: have the browser consult DNS directly. The browser already consults DNS for the server's IP; we would additionally have the browser ask DNS for a public key for that domain. It would run like this:

1. Company buys `foo.com` from the `.com` registrar.
1. Company generates keypair.
1. Company puts public key in `foo.com` DNS under a `TXT` record (or some new `PUBKEY` record).
1. Company puts private key on server.
1. Company points `foo.com`'s `A` record to the server's IP.
1. User visits `foo.com` in browser.
1. Browser asks DNS for the `A` record and `PUBKEY` record for `foo.com`.
1. Browser opens connection to the server, using server's public key to establish shared secret.
1. Browser and server communicate in a session.

Here, no Certificate Authorities are involved, but the user still has the same guarantees: it is talking in private to a server which is operated by the owner of `foo.com`.
