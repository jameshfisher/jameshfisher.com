---
title: "How to write a DNS server in Go"
---

Here's a DNS server written in Go.
It uses the package `github.com/miekg/dns`,
which is an alternative to the standard library's DNS stuff,
and also lets you implement a DNS server rather than just a client.
The example DNS server below only knows how to answer `A` queries,
and for these, it only knows the IP addresses of two domains.

```go
package main

import (
	"net"
	"strconv"
	"log"
	"github.com/miekg/dns"
)

var domainsToAddresses map[string]string = map[string]string{
	"google.com.": "1.2.3.4",
	"jameshfisher.com.": "104.198.14.52",
}

type handler struct{}
func (this *handler) ServeDNS(w dns.ResponseWriter, r *dns.Msg) {
	msg := dns.Msg{}
	msg.SetReply(r)
	switch r.Question[0].Qtype {
	case dns.TypeA:
		msg.Authoritative = true
		domain := msg.Question[0].Name
		address, ok := domainsToAddresses[domain]
		if ok {
			msg.Answer = append(msg.Answer, &dns.A{
				Hdr: dns.RR_Header{ Name: domain, Rrtype: dns.TypeA, Class: dns.ClassINET, Ttl: 60 },
				A: net.ParseIP(address),
			})
		}
	}
	w.WriteMsg(&msg)
}

func main() {
	srv := &dns.Server{Addr: ":" + strconv.Itoa(53), Net: "udp"}
	srv.Handler = &handler{}
	if err := srv.ListenAndServe(); err != nil {
		log.Fatalf("Failed to set udp listener %s\n", err.Error())
	}
}
```

Example usage:

```
$ sudo go run main.go &
$ dig @127.0.0.1 jameshfisher.com

; <<>> DiG 9.8.3-P1 <<>> @127.0.0.1 jameshfisher.com
; (1 server found)
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 25014
;; flags: qr aa rd; QUERY: 1, ANSWER: 1, AUTHORITY: 0, ADDITIONAL: 0
;; WARNING: recursion requested but not available

;; QUESTION SECTION:
;jameshfisher.com.		IN	A

;; ANSWER SECTION:
jameshfisher.com.	60	IN	A	104.198.14.52

;; Query time: 0 msec
;; SERVER: 127.0.0.1#53(127.0.0.1)
;; WHEN: Sun Aug 27 00:27:06 2017
;; MSG SIZE  rcvd: 66
```

This program could be extended with more custom logic.
For example, at Pusher (the company I work for),
we could operate a DNS server which resolves a Pusher app's domain to the cluster that the app is on.
