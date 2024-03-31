---
title: What do DNS datagrams look like?
tags:
  - dns
  - udp
  - networking
  - internet-protocol
taggedAt: '2024-03-26'
summary: >-
  The structure and contents of a DNS request datagram,
  including the header, question section, and how to represent it in C.
---

Let's write a DNS request. We'll query the DNS server at `8.8.8.8` for information about the domain `www.google.com`.

DNS works over UDP. A DNS request is sent to a DNS server in a single datagram to UDP port 53. The response is another single datagram. (This is not strictly true; TCP is also used in places. Let's ignore that here.)

The format for a request datagram is in RFC 1035. Here's the header:

```
                                    1  1  1  1  1  1
      0  1  2  3  4  5  6  7  8  9  0  1  2  3  4  5
    +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
    |                      ID                       |
    +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
    |QR|   Opcode  |AA|TC|RD|RA|   Z    |   RCODE   |
    +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
    |                    QDCOUNT                    |
    +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
    |                    ANCOUNT                    |
    +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
    |                    NSCOUNT                    |
    +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
    |                    ARCOUNT                    |
    +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
```

Filling in our values, we get a very simple header:

```
                                    1  1  1  1  1  1
      0  1  2  3  4  5  6  7  8  9  0  1  2  3  4  5
    +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
    |                      42                       |
    +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
    | 0|     0     | 0| 0| 0| 0|   0    |     0     |
    +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
    |                       1                       |
    +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
    |                       0                       |
    +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
    |                       0                       |
    +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
    |                       0                       |
    +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
```

This is now followed by a question section.

"The question section contains fields that describe a question to a name server.  These fields are a query type (QTYPE), a query class (QCLASS), and a query domain name (QNAME)."

```
                                    1  1  1  1  1  1
      0  1  2  3  4  5  6  7  8  9  0  1  2  3  4  5
    +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
    |                                               |
    /                     QNAME                     /
    /                                               /
    +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
    |                     QTYPE                     |
    +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
    |                     QCLASS                    |
    +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
```

Let's first figure out the QNAME. This is "a domain name represented as a sequence of labels, where each label consists of a length octet followed by that number of octets.  The domain name terminates with the zero length octet for the null label of the root.  Note that this field may be an odd number of octets; no padding is used."

This is rather confusing, since the diagram very clearly shows that the QNAME must have padding.

For `www.google.com`, the labels are `www`, `google` and `com`. So we get `3www6google3com0`; an even number of octets. Phew, ambiguity avoided.

The QTYPE is a two-octet number. We'll use an `A` query to get the host for the domain. An `A` query is number 1.

The QCLASS should be set to 1, "the Internet". (There are some funny other options: "CSNET", "CHAOS", and "Hesiod".)

So we get our query section:

```
                                    1  1  1  1  1  1
      0  1  2  3  4  5  6  7  8  9  0  1  2  3  4  5
    +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
    |           3           |           w           |
    +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
    |           w           |           w           |
    +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
    |           6           |           g           |
    +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
    |           o           |           o           |
    +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
    |           g           |           l           |
    +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
    |           e           |           3           |
    +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
    |           c           |           o           |
    +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
    |           m           |           0           |
    +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
    |                       1                       |
    +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
    |                       1                       |
    +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
```

Which makes our complete datagram:

```
                                    1  1  1  1  1  1
      0  1  2  3  4  5  6  7  8  9  0  1  2  3  4  5
    +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
    |                      42                       |
    +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
    | 0|     0     | 0| 0| 0| 0|   0    |     0     |
    +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
    |                       1                       |
    +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
    |                       0                       |
    +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
    |                       0                       |
    +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
    |                       0                       |
    +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
    |           3           |           w           |
    +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
    |           w           |           w           |
    +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
    |           6           |           g           |
    +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
    |           o           |           o           |
    +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
    |           g           |           l           |
    +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
    |           e           |           3           |
    +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
    |           c           |           o           |
    +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
    |           m           |           0           |
    +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
    |                       1                       |
    +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
    |                       1                       |
    +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
```

Bits and bytes here are in "network byte order": "whenever a multi-octet field represents a numeric quantity the left most bit of the whole field is the most significant bit.  When a multi-octet quantity is transmitted the most significant octet is transmitted first." So our bytes are:

```
                                    1  1  1  1  1  1
      0  1  2  3  4  5  6  7  8  9  0  1  2  3  4  5
    +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
    |           0           |           42          |
    +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
    |           0           |           0           |
    +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
    |           0           |           1           |
    +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
    |           0           |           0           |
    +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
    |           0           |           0           |
    +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
    |           0           |           0           |
    +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
    |           3           |          'w'          |
    +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
    |          'w'          |          'w'          |
    +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
    |           6           |          'g'          |
    +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
    |          'o'          |          'o'          |
    +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
    |          'g'          |          'l'          |
    +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
    |          'e'          |           3           |
    +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
    |          'c'          |          'o'          |
    +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
    |          'm'          |           0           |
    +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
    |           0           |           1           |
    +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
    |           0           |           1           |
    +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
```

Which we can express in C as:

```
char msg[] = {
   0 ,  42,                           // HEADER: ID
   0 ,  0 ,                           // HEADER: Various flags
   0 ,  1 ,                           // HEADER: QDCOUNT
   0 ,  0 ,                           // HEADER: ANCOUNT
   0 ,  0 ,                           // HEADER: NSCOUNT
   0 ,  0 ,                           // HEADER: ARCOUNT
   3 , 'w', 'w', 'w',                 // QUESTION: QNAME: label 1
   6 , 'g', 'o', 'o', 'g', 'l', 'e',  // QUESTION: QNAME: label 2
   3 , 'c', 'o', 'm',                 // QUESTION: QNAME: label 3
   0 ,                                // QUESTION: QNAME: null label
   0 ,  1 ,                           // QUESTION: QTYPE
   0 ,  1                             // QUESTION: QCLASS
};
```
