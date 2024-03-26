---
title: What are 'protocol numbers' in IP?
tags:
  - internet-protocol
  - tcp
  - udp
  - networking
taggedAt: '2024-03-26'
---

When the kernel receives IP packets, how does it know what they represent? Are they part of a TCP stream, a UDP datagram, or something else?

The answer is that all IP packets contain an _IP protocol number_. It's the ninth byte in the packet. Each protocol running over IP has its own number. TCP is number `6`; UDP is number `17`.

You can see them all at `/etc/protocols` on your machine! The official list is maintained by IANA (Internet Assigned Numbers Authority, part of ICANN) here: http://www.iana.org/assignments/protocol-numbers/protocol-numbers.xhtml
