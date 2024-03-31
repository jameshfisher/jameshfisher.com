---
title: How does network address translation work?
tags:
  - programming
  - networking
summary: >-
  NAT allows multiple devices in a local network to share a single public IP address. Routers modify IP and port information in network packets, and manage a translation table.
---

I have a laptop in front of me
and a server in the cloud.
I establish a TCP connection between them
by listening on the server,

```console
jim@remote:~$ nc -l 0.0.0.0 12345
```

then connecting from my laptop:

```console
jim@local:~$ nc 35.190.176.201 12345
```

Now a new TCP connection is established,
and we can see this connection from both machines using `lsof`.
First locally:

```console
jim@local:~$ lsof -nPi TCP | awk 'NR==1 || /12345/'
COMMAND     PID USER   FD   TYPE            DEVICE SIZE/OFF NODE NAME
nc        36761  jim    3u  IPv4 0x86646b399e45805      0t0  TCP 192.168.1.4:64125->35.190.176.201:12345 (ESTABLISHED)
```

Then from the server:

```console
jim@remote:~$ lsof -nPi TCP | awk 'NR==1 || /12345/'
COMMAND  PID USER   FD   TYPE DEVICE SIZE/OFF NODE NAME
nc      1878  jim    4u  IPv4  21055      0t0  TCP 10.142.0.2:12345->51.6.191.203:64125 (ESTABLISHED)
```

A TCP connection, traditionally, is identified by four things:
the client IP address and server IP address,
and the client port and server port.
What are these values in the above connection?

There are at least a couple of oddities here.
My laptop thinks it's connected to `35.190.176.201`,
but the server thinks its own IP address is `10.142.0.2`.
And the server thinks it's connected to `51.6.191.203`,
but my laptop thinks its own IP address is `192.168.1.4`.

The reason for this oddity is _network address translation_, or NAT.
This is a process done by _routers_,
machines which sit on the path between my laptop and my server.
Each router doing NAT is in two networks,
i.e. the router has two network interfaces,
one in each network,
each with its own assigned IP address.

My TCP connection involves
at least three networks,
two routers,
and six IP addresses!
Here they are diagrammed:

```
Machines          Networks
vvvvvvvv          vvvvvvvv

                +-my local area network-+
                |                       |
MY LAPTOP-----------192.168.1.4         |
                |                       |
      +-------------192.168.1.254       |
      |         |                       |
      |         +-----------------------+
MY HOME ROUTER
      |         +-Internet--------------+
      |         |                       |
      +-------------51.6.191.203        |
                |                       |
      +-------------35.190.176.201      |
      |         |                       |
      |         +-----------------------+
GCP ROUTER
      |         +-GCP subnet------------+
      |         |                       |
      +-------------10.142.0.1          |
                |                       |
MY SERVER-----------10.142.0.2          |
                |                       |
                +-----------------------+
```

The three networks are my local area network (LAN),
the Internet proper,
and a subnet on Google Cloud Platform (GCP).
The routers are my home router (a Sagemcom something-or-other which my ISP provided),
and an unknown router on Google Cloud Platform.
Notice that each router spans two networks,
and performs NAT between them.
Each router translates packets between one network and the other.
Both routers are doing NAT, but different types of NAT.

The GCP router's behavior is the simpler of the two.
The GCP router is doing "basic", or one-to-one NAT.
When the GCP router sees an IP packet on the Internet to `35.190.176.201`,
the GCP router puts a corresponding packet on the GCP subnet destined for `10.142.0.2`,
the IP address of my server.
That is, the router modifies the destination address of the IP packet.
Most other things about the IP packet are conserved,
such as TCP port numbers.
In the other direction,
when the GCP router sees an IP packet on the subnet from `10.142.0.2`,
it copies the packet to the Internet,
modifying the source address to `35.190.176.201`.
The GCP router's policy thus creates a one-to-one relationship
between the IP addresses `35.190.176.201` and `10.142.0.2`.
The GCP router's one-to-one NAT procedure is stateless
(except to remember the rule which binds those two addresses together).

By contrast, my home router is doing _one-to-many_ NAT.
When my home router receives a packet on my LAN,
if the packet's destination address is not in the LAN,
the home router puts a corresponding packet on the Internet,
with the source IP address modified to `51.6.191.203`
so that the home router will receive the destination's response.
So far, so similar.

But one-to-many NAT must do more than this,
because when the home router receives a response packet on the Internet,
there is no way to tell which host on my LAN to forward it to.
The router's modification of the outgoing packets' source addresses must have an _inverse_.
This is not possible at the IP level,
because there are many IP addresses on my LAN,
but the router only has one source IP address available on the Internet!
To get more addresses,
one-to-many NAT works at the TCP level,
which has a 16-bit source port field.
This effectively gives the home router 65,536 addresses on the Internet.

So my home router,
when copying the packet from `192.168.1.4:64125`,
notes down in a "translation table"
that all response on the Internet to port `64125`
should be forwarded to `192.168.1.4`.
When the home router receives a packet on the Internet,
the router looks up the packet's destination TCP port
in the translation table
to find the host on the LAN to forward the packet to.

What happens if another host on my LAN, say `192.168.1.6`,
opens a connection with source port `64125`?
I tried this by listening on port `12346` on the server,
then connecting to it from my Android phone,
telling `nc` to use a specific source port with the `-p` flag.
The server shows two connections to the same IP address and port, `51.6.191.203:64125`!

```console
jim@remote:~$ lsof -nPi TCP | awk 'NR==1 || /1234/'
COMMAND   PID USER   FD   TYPE DEVICE SIZE/OFF NODE NAME
nc      13020  jim    4u  IPv4  40075      0t0  TCP 10.142.0.2:12345->51.6.191.203:64125 (ESTABLISHED)
nc      13021  jim    4u  IPv4  40078      0t0  TCP 10.142.0.2:12346->51.6.191.203:64125 (ESTABLISHED)
```

Both of these connections work - but how?
If the server sends both packets for both connections to `51.6.191.203:64125`,
how can my home router distinguish them?
The answer is the distinct ports `12345` and `12346`.
My home router's translation table is not as simple as `port -> ipaddr`.
Actually the translation table is `(port,port,ipaddr) -> ipaddr`,
and contains the entries:

```
(64125, 12345, 51.6.191.203) -> 192.168.1.4
(64125, 12346, 51.6.191.203) -> 192.168.1.6
```

Because this is a more specific lookup than just one port,
the router can have more than 65,536 addresses to work with.

But still - what happens if two separate hosts on my LAN choose the same source port
and they connect to the same IP address and port?
I tried it,
by using `nc -l 0.0.0.0 12345` twice,
then connecting from two hosts,
both using source port `42202`.

Both connections still work as expected!
How?
My server reports these two connections:

```console
jim@remote:~$ lsof -nPi TCP | awk 'NR==1 || /12345/'
COMMAND   PID USER   FD   TYPE DEVICE SIZE/OFF NODE NAME
nc      13020  jim    4u  IPv4  40075      0t0  TCP 10.142.0.2:12345->51.6.191.203:42202 (ESTABLISHED)
nc      13041  jim    4u  IPv4  40278      0t0  TCP 10.142.0.2:12345->51.6.191.203:1024 (ESTABLISHED)
```

Notice that the server is connected to remote port `1024`.
My home router noticed that there was a clash,
and rewrote the source port to a new free port!
So my translation table is still too simplified,
and it's actually a `(port,port,ipaddr) -> (ipaddr,port)`,
with the entries:

```
(42202, 12345, 51.6.191.203) -> (192.168.1.4,42202)
(1024,  12345, 51.6.191.203) -> (192.168.1.6,42202)
```

There are many things I have not covered in this post.
For instance, when do entries get removed from the translation table?
What does my home router do with packets which don't match an entry in the table?
