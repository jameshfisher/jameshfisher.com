---
title: "Two kinds of DNS server: authoritative vs. recursive"
---

A DNS name server is anything serving DNS responses to DNS requests.
But there are _two_ kinds of name servers out there:
authoritative name servers and recursive name servers.
Authoritative name servers don't need to consult any higher authority to serve their responses;
they are the ultimate authority on the domains they are serving responses about.
Conversely, recursive name servers serve their responses by consulting higher authorities;
the recursive name servers are useful because
they cache those responses and reduce the load on authoritative servers.
The recursive name servers are a sort of global CDN for the DNS.

Name servers can be authoritative and recursive, but they broadly fall into those two categories.
For examples:

* Your WiFi router (e.g. at `192.168.1.254`) runs a name server.
  It is recursive, and you can often configure it via some web interface.
  My "PlusNet" router uses some PlusNet-operated name server at `212.159.6.10`.
* Google operates a name server at `8.8.8.8`.
  It is (entirely?) recursive.
* Amazon Route53 operates name servers at many IPs, e.g. `205.251.197.202`.
  It is an authoritative name server; not recursive.
* NASA operates one of the 13 root name servers at `192.203.230.10`.
  It is an authoritative name server, not recursive.

A way to check whether a name server is authoritative is to query it for a common domain, e.g.

```
$ dig @192.203.230.10 google.com.

; <<>> DiG 9.8.3-P1 <<>> @192.203.230.10 google.com.
; (1 server found)
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 20137
;; flags: qr rd; QUERY: 1, ANSWER: 0, AUTHORITY: 13, ADDITIONAL: 14
;; WARNING: recursion requested but not available
...
...
```

Notice that `dig` says "recursion requested but not available".
The server at `192.203.230.10` is therefore an authoritative name server only.
