---
title: How can I do DNS lookup in Go?
tags:
  - golang
  - dns
  - networking
  - programming
taggedAt: '2024-03-26'
summary: >-
  Using the Go `"net"` package to look up IP addresses for a given domain name, using either the C stdlib or a pure Go DNS resolver.
---

Go's `"net"` package in the stdlib has standard DNS client functions.
For example, given a domain name, you can look up IP addresses:

```go
package main

import (
	"net"
	"fmt"
	"os"
)

func main() {
	ips, err := net.LookupIP("google.com")
	if err != nil {
		fmt.Fprintf(os.Stderr, "Could not get IPs: %v\n", err)
		os.Exit(1)
	}
	for _, ip := range ips {
		fmt.Printf("google.com. IN A %s\n", ip.String())
	}
}
```

Go's stdlib either uses the C stdlib (via cgo), or a pure Go DNS resolver.
On my machine, it uses cgo, which you can see with:

```
$ GODEBUG=netdns=9 go run main.go
go package net: using cgo DNS resolver
go package net: hostLookupOrder(google.com) = cgo
google.com. IN A 216.58.204.46
google.com. IN A 2a00:1450:4009:80d::200e
```
