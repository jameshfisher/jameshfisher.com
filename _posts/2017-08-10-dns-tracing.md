---
title: How to trace a DNS lookup
tags: []
summary: >-
  Tracing a DNS lookup for `ws-mt1.pusher.com` using `dig +trace` reveals the
  iterative process of resolving the domain name, starting from the root name
  servers and following referrals to the top-level domain and authoritative name
  servers.
---

We want to find an IP address for `ws-mt1.pusher.com`.
We could use `dig` to ask a well-known DNS server like `8.8.8.8` for an `A` record:

```
$ dig @8.8.8.8 ws-mt1.pusher.com A

; <<>> DiG 9.8.3-P1 <<>> @8.8.8.8 ws-mt1.pusher.com A
; (1 server found)
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 34532
;; flags: qr rd ra; QUERY: 1, ANSWER: 3, AUTHORITY: 0, ADDITIONAL: 0

;; QUESTION SECTION:
;ws-mt1.pusher.com.		IN	A

;; ANSWER SECTION:
ws-mt1.pusher.com.	43	IN	CNAME	edge106-mt1.pusher.com.
edge106-mt1.pusher.com.	7183	IN	CNAME	ec2-54-197-34-162.compute-1.amazonaws.com.
ec2-54-197-34-162.compute-1.amazonaws.com. 85534 IN A 54.197.34.162

;; Query time: 13 msec
;; SERVER: 8.8.8.8#53(8.8.8.8)
;; WHEN: Sun Aug 27 10:28:51 2017
;; MSG SIZE  rcvd: 129
```

Here, `dig` found that `ws-mt1.pusher.com.` is at address `54.197.34.162`.
`dig` found this with just one network round trip,
because `8.8.8.8` has cached all the answers.
This obscures how `8.8.8.8` knows the answer to the question.
Instead of directly asking `8.8.8.8`, we can follow the authority all the way from the root name servers.
The `dig` tool has an option to do this, `+trace`:

> `+[no]trace`:
>
> Toggle tracing of the delegation path from the root name servers for the name being looked up.
> Tracing is disabled by default.
> When tracing is enabled, dig makes iterative queries to resolve the name being looked up.
> It will follow referrals from the root servers,
> showing the answer from each server that was used to resolve the lookup.

Let's trace the delegation path for `ws-mt1.pusher.com`!

```
$ dig @8.8.8.8 +trace +question ws-mt1.pusher.com A

; <<>> DiG 9.8.3-P1 <<>> @8.8.8.8 +trace +question ws-mt1.pusher.com A
; (1 server found)
;; global options: +cmd
;.				IN	NS
.			170574	IN	NS	a.root-servers.net.
...
.			170574	IN	NS	f.root-servers.net.
...
;; Received 228 bytes from 8.8.8.8#53(8.8.8.8) in 31 ms

;ws-mt1.pusher.com.		IN	A
com.			172800	IN	NS	a.gtld-servers.net.
...
com.			172800	IN	NS	i.gtld-servers.net.
...
;; Received 495 bytes from 198.97.190.53#53(198.97.190.53) in 107 ms

;ws-mt1.pusher.com.		IN	A
pusher.com.		172800	IN	NS	ns-74.awsdns-09.com.
pusher.com.		172800	IN	NS	ns-703.awsdns-23.net.
...
;; Received 203 bytes from 192.43.172.30#53(192.43.172.30) in 21 ms

;ws-mt1.pusher.com.		IN	A
ws-mt1.pusher.com.	60	IN	CNAME	edge121-mt1.pusher.com.
edge121-mt1.pusher.com.	7200	IN	CNAME	ec2-54-236-213-148.compute-1.amazonaws.com.
...
;; Received 250 bytes from 205.251.194.191#53(205.251.194.191) in 309 ms
```

1. `dig` asks `8.8.8.8`, "What are the name servers for the root zone, `.`"?
   `8.8.8.8` responds: "The name servers for `.` are `a.root-servers.net.`, ..."
   `dig` arbitrarily picks `f.root-servers.net.`,
   and resolves it to `198.97.190.53`.
1. `dig` asks `198.97.190.53`, "what are the addresss for `ws-mt1.pusher.com.`?"
   `198.97.190.53` responds: "I don't know. Ask one of the name servers for `com.`, which are: `a.gtld-servers.net.`, ..."
   `dig` arbitrarily picks `i.gtld-servers.net.`,
   and resolves it to `192.43.172.30`.
1. `dig` asks `192.43.172.30`, "what are the addresses for `ws-mt1.pusher.com.`?"
   `192.43.172.30` responds: "I don't know. Ask one of the name servers for `pusher.com.`, which are: `ns-74.awsdns-09.com.`, ..."
   `dig` arbitrarily picks `ns-703.awsdns-23.net.`,
   and resolves it to `205.251.194.191`.
1. `dig` asks `205.251.194.191`, "what are the addresses for `ws-mt1.pusher.com.`?"
   `205.251.194.191` responds: "I don't know, but it's the same as `ec2-54-236-213-148.compute-1.amazonaws.com.` - look that up instead."

Notice that, even here, this is not the whole process!
When a name server responds saying "the name server is `i.gtld-servers.net.`",
you then need to perform a recursive DNS subquery to find out an address for `i.gtld-servers.net.`.
`dig` omits this detail here.

Also, our search for an address did not complete!
The search finished with a `CNAME`,
meaning we have to start all over again looking for the new name `ec2-54-236-213-148.compute-1.amazonaws.com.`!
Let's do that:

```
$ dig @8.8.8.8 +trace +question ec2-54-236-213-148.compute-1.amazonaws.com. A

; <<>> DiG 9.8.3-P1 <<>> @8.8.8.8 +trace +question ec2-54-236-213-148.compute-1.amazonaws.com. A
; (1 server found)
;; global options: +cmd
;.				IN	NS
.			229778	IN	NS	d.root-servers.net.
...
;; Received 228 bytes from 8.8.8.8#53(8.8.8.8) in 24 ms

;ec2-54-236-213-148.compute-1.amazonaws.com. IN A
com.			172800	IN	NS	h.gtld-servers.net.
...
;; Received 492 bytes from 199.7.91.13#53(199.7.91.13) in 106 ms

;ec2-54-236-213-148.compute-1.amazonaws.com. IN A
amazonaws.com.		172800	IN	NS	u1.amazonaws.com.
...
;; Received 192 bytes from 192.55.83.30#53(192.55.83.30) in 65 ms

;ec2-54-236-213-148.compute-1.amazonaws.com. IN A
compute-1.amazonaws.com. 900	IN	NS	u1.amazonaws.com.
...
;; Received 438 bytes from 205.251.195.199#53(205.251.195.199) in 708 ms

;ec2-54-236-213-148.compute-1.amazonaws.com. IN A
ec2-54-236-213-148.compute-1.amazonaws.com. 604800 IN A	54.236.213.148
...
;; Received 358 bytes from 156.154.64.10#53(156.154.64.10) in 15 ms
```

Finally, we get an address `54.236.213.148`!
Naive DNS queries would take dozens of round trips,
taking seconds to complete.
This is why we have caching/TTLs and DNS recursion!
