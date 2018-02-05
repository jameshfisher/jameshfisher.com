---
title: "What is DHCP?"
tags: ["programming", "unix", "networking"]
---

When your computer joins a network,
it is given an IP address.
This happens using a protocol called
[DHCP, or "Dynamic Host Configuration Protocol"](https://en.wikipedia.org/wiki/Dynamic_Host_Configuration_Protocol).
Unlike many protocol names,
this one is pretty descriptive:
it's a protocol
used to configure "hosts" (like your computer)
dynamically (at connection time)
rather than statically (prior to connection).

DHCP is client-server.
Your computer is the client,
there is a DHCP server somewhere on your network.
The clients and server work together to assign "leases" of IP addresses to hosts on the network.

DHCP happens over UDP.
This means we can use `tcpdump` to see DHCP conversations.
DHCP uses UDP ports 67 and 68,
so we can use the expression `udp port 67 or port 68`
to filter to DHCP traffic:

```console
$ sudo tcpdump -n 'udp port 67 or port 68'
tcpdump: verbose output suppressed, use -v or -vv for full protocol decode
listening on eth0, link-type EN10MB (Ethernet), capture size 262144 bytes
```

You might not see any traffic here.
To see some, I'll trigger some DHCP traffic.
The following command should give you some DHCP traffic:

```bash
sudo dhclient -r eth0 && sudo dhclient eth0
```

The `dhclient` program acts as the DHCP client for your computer.
The above command says
"release my current lease on interface `eth0`,
then request a new lease for `eth0`."
This gives us some UDP packets:

```
22:15:10.013139 IP 10.99.0.171.68 > 10.99.0.1.67: BOOTP/DHCP, Request from 88:99:aa:bb:cc:dd, length 300
22:15:10.098185 IP 0.0.0.0.68 > 255.255.255.255.67: BOOTP/DHCP, Request from 88:99:aa:bb:cc:dd, length 300
22:15:10.098233 IP 10.99.0.1.67 > 10.99.0.171.68: BOOTP/DHCP, Reply, length 548
22:15:10.098457 IP 0.0.0.0.68 > 255.255.255.255.67: BOOTP/DHCP, Request from 88:99:aa:bb:cc:dd, length 300
22:15:10.098480 IP 10.99.0.1.67 > 10.99.0.171.68: BOOTP/DHCP, Reply, length 548
```

Notice that `tcpdump` classifies these as `Request` or `Reply`.
DHCP is mostly request-response.
The UDP port is used to classify client and server:
the server uses port `67`;
clients use port `68`.

The first packet, from our machine, notifies the server that we are releasing our lease.
The following four packets set up a new lease,
and the packets are known respectively as "Discover, Offer, Request, Acknowledge", or "DORA".
A client sends a "Discover" packet,
then the DHCP server replies with some "Offers".
The client then sends a "Request" for an offer,
then the server replies "Acknowledging" that request.

`tcpdump -v` shows more details from the packets.

```
21:46:01.018467 IP (tos 0x0, ttl 64, id 26302, offset 0, flags [DF], proto UDP (17), length 328)
    10.99.0.171.68 > 10.99.0.1.67: BOOTP/DHCP, Request from 88:99:aa:bb:cc:dd, length 300, xid 0x934dec11, Flags [none]
	  Client-IP 10.99.0.171
	  Client-Ethernet-Address 88:99:aa:bb:cc:dd
	  Vendor-rfc1048 Extensions
	    Magic Cookie 0x63825363
	    DHCP-Message Option 53, length 1: Release
	    Server-ID Option 54, length 4: 10.99.0.1
	    Hostname Option 12, length 14: "jamess-machine"
21:46:01.094134 IP (tos 0x10, ttl 128, id 0, offset 0, flags [none], proto UDP (17), length 328)
    0.0.0.0.68 > 255.255.255.255.67: BOOTP/DHCP, Request from 88:99:aa:bb:cc:dd, length 300, xid 0x13a51822, Flags [none]
	  Client-Ethernet-Address 88:99:aa:bb:cc:dd
	  Vendor-rfc1048 Extensions
	    Magic Cookie 0x63825363
	    DHCP-Message Option 53, length 1: Discover
	    Requested-IP Option 50, length 4: 10.99.0.171
	    Hostname Option 12, length 14: "jamess-machine"
	    Parameter-Request Option 55, length 13:
	      Subnet-Mask, BR, Time-Zone, Default-Gateway
	      Domain-Name, Domain-Name-Server, Option 119, Hostname
	      Netbios-Name-Server, Netbios-Scope, MTU, Classless-Static-Route
	      NTP
21:46:01.094169 IP (tos 0x0, ttl 255, id 0, offset 0, flags [DF], proto UDP (17), length 576)
    10.99.0.1.67 > 10.99.0.171.68: BOOTP/DHCP, Reply, length 548, xid 0x13a51822, Flags [none]
	  Your-IP 10.99.0.171
	  Client-Ethernet-Address 88:99:aa:bb:cc:dd
	  Vendor-rfc1048 Extensions
	    Magic Cookie 0x63825363
	    DHCP-Message Option 53, length 1: Offer
	    Server-ID Option 54, length 4: 10.99.0.1
	    Lease-Time Option 51, length 4: 3600
	    Subnet-Mask Option 1, length 4: 255.255.255.0
	    BR Option 28, length 4: 10.99.0.255
	    Domain-Name Option 15, length 12: "ec2.internal"
	    Domain-Name-Server Option 6, length 4: 10.99.0.2
	    Hostname Option 12, length 14: "ip-10-99-0-171"
	    MTU Option 26, length 2: 9001
	    Default-Gateway Option 3, length 4: 10.99.0.1
21:46:01.094612 IP (tos 0x10, ttl 128, id 0, offset 0, flags [none], proto UDP (17), length 328)
    0.0.0.0.68 > 255.255.255.255.67: BOOTP/DHCP, Request from 88:99:aa:bb:cc:dd, length 300, xid 0x13a51822, Flags [none]
	  Client-Ethernet-Address 88:99:aa:bb:cc:dd
	  Vendor-rfc1048 Extensions
	    Magic Cookie 0x63825363
	    DHCP-Message Option 53, length 1: Request
	    Server-ID Option 54, length 4: 10.99.0.1
	    Requested-IP Option 50, length 4: 10.99.0.171
	    Hostname Option 12, length 14: "jamess-machine"
	    Parameter-Request Option 55, length 13:
	      Subnet-Mask, BR, Time-Zone, Default-Gateway
	      Domain-Name, Domain-Name-Server, Option 119, Hostname
	      Netbios-Name-Server, Netbios-Scope, MTU, Classless-Static-Route
	      NTP
21:46:01.094639 IP (tos 0x0, ttl 255, id 0, offset 0, flags [DF], proto UDP (17), length 576)
    10.99.0.1.67 > 10.99.0.171.68: BOOTP/DHCP, Reply, length 548, xid 0x13a51822, Flags [none]
	  Your-IP 10.99.0.171
	  Client-Ethernet-Address 88:99:aa:bb:cc:dd
	  Vendor-rfc1048 Extensions
	    Magic Cookie 0x63825363
	    DHCP-Message Option 53, length 1: ACK
	    Server-ID Option 54, length 4: 10.99.0.1
	    Lease-Time Option 51, length 4: 3600
	    Subnet-Mask Option 1, length 4: 255.255.255.0
	    BR Option 28, length 4: 10.99.0.255
	    Domain-Name Option 15, length 12: "ec2.internal"
	    Domain-Name-Server Option 6, length 4: 10.99.0.2
	    Hostname Option 12, length 14: "ip-10-99-0-171"
	    MTU Option 26, length 2: 9001
	    Default-Gateway Option 3, length 4: 10.99.0.1
```

The bodies of the messages
contain the essential ethernet address and IP address fields.
For example, the last message says
"I, the DHCP server, lease the IP address `10.99.0.171`
to the client with ethernet address `88:99:aa:bb:cc:dd`".
There are also a bunch of "extension" fields,
with other stuff unrelated to assigning IP addresses.
One important extension is the `Domain-Name-Server` field.
Above, the DHCP server says "you should send DNS lookups to `10.99.0.2`."
