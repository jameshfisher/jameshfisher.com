---
title: "What is a subnet?"
---

IP addresses look like this: `51.6.191.203` (in IP version 4).
These are four decimal numbers separated by dots.
Each number represents one byte of a 32-bit address.
We can thus work with IP addresses in C using a `uint32_t`:

```c
#include <stdio.h>
#include <stdint.h>
typedef uint32_t ipv4;
ipv4 parse_ipv4_decimal(char * s) {
  uint32_t b1,b2,b3,b4;
  sscanf(s, "%u.%u.%u.%u", &b1, &b2, &b3, &b4);
  return (b1<<24) | (b2<<16) | (b3<<8) | b4;
}
void print_ip_dotted_decimal(ipv4 ip) {
  uint32_t byte = (1<<8)-1;
  printf("%u.%u.%u.%u", ip >> 24, ip>>16 & byte, ip>>8 & byte, ip & byte);
}
int main(void) {
  ipv4 my_ip = parse_ipv4_decimal("51.6.191.203");
  print_ip_dotted_decimal(my_ip) printf("\n");
  return 0;
}
```

The IP address space is subdivided into many "subnets",
or sets of IP addresses.
This helps divide up ownership of the address space.
For example,
the IP address `192.168.1.4`
is currently leased by my laptop from my home router,
which owns the subnet containing addresses beginning with `192.168.1`.
And the IP address `51.6.191.203`
is currently leased by my home router from an ISP called PlusNet,
which owns the large subnet which contains this IP address.

"Subnets" are not arbitrary sets of addresses.
There is a strict ordering on IP addresses,
where the left-most byte is most significant.
Thus the entire range is written
`0.0.0.0`, `0.0.0.1`, `0.0.0.2`, ..., `0.0.0.255`, `0.0.1.0`, ..., `255.255.255.254`, `255.255.255.255`.
A subnet is always a _contiguous_ set of addresses under this ordering.
For example, {`1.2.3.4`, `255.254.253.252`} is not a valid subnet.
This ordering lets us describe the subnet owned by PlusNet as:
"IP addresses in the range `51.6.0.0` ... `51.7.255.255`".
Since this ordering is the same as `<` on `uint32_t`,
we can define subnets like this in C:

```c
struct subnet { ipv4 min; ipv4 max; };
bool in_subnet(ipv4 ip, struct subnet sn) {
  return sn.min <= ip && ip <= sn.max;
}
int main(void) {
  ipv4 my_ip = parse_ipv4_decimal("51.6.191.203");
  struct subnet plusnet = { parse_ipv4_decimal("51.6.0.0"), parse_ipv4_decimal("51.7.255.255") };
  if (in_subnet(my_ip, plusnet))  printf("My IP is owned by PlusNet\n");
  return 0;
}
```

Actually, subnets are more restrictive than this.
A subnet could not have the range `51.6.0.0` ... `51.7.255.254`,
for example.
To see why, we need to switch to binary.
We commonly write IP addresses in decimal:

```c
void print_byte(uint8_t b) { int i = 8; while (i--) printf("%d", b&(1<<i)?1:0); }
void print_ipv4_binary(ipv4 ip) {
  print_byte(ip >> 24); printf(".");
  print_byte(ip >> 16); printf(".");
  print_byte(ip >>  8); printf(".");
  print_byte(ip);
}

int main(void) {
  ipv4 my_ip = parse_ipv4_decimal("51.6.191.203");
  struct subnet plusnet = { parse_ipv4_decimal("51.6.0.0"), parse_ipv4_decimal("51.7.255.255") };
  printf("My IP:       "); print_ipv4_binary(my_ip);       printf("\n");
  printf("PlusNet min: "); print_ipv4_binary(plusnet.min); printf("\n");
  printf("PlusNet max: "); print_ipv4_binary(plusnet.max); printf("\n");
  return 0;
}
```

```
$ ./a.out
My IP:       00110011.00000110.10111111.11001011
PlusNet min: 00110011.00000110.00000000.00000000
PlusNet max: 00110011.00000111.11111111.11111111
```

(The dots here are cosmetic.)
In this notation,
we can describe the PlusNet subnet as
"IP addresses beginning with `00110011.00000110` or `00110011.00000111`".
But wait!
This is the same as saying "IP addresses beginning with `00110011.0000011`".
All subnets can be described by a bitstring prefix.
Ownership of the IP address space is hierarchical,
with the left-hand side being the top of the hierarchy.
PlusNet was given ownership of all addresses
beginning with the 15 bits `001100110000011`.

So we can change our subnet definition in C:

```c
struct subnet { uint32_t prefix; uint8_t prefix_len_bits; };

bool in_subnet(ipv4 ip, struct subnet sn) {
  ipv4 first_addr = sn.prefix << (32-sn.prefix_len_bits);
  ipv4 mask = ~((1<<(32-sn.prefix_len_bits))-1);
  return (ip & mask) == first_addr;
}

int main(void) {
  ipv4 my_ip = parse_ipv4_decimal("51.6.191.203");
  struct subnet plusnet = { 0b001100110000011, 15 };
  printf("My IP:       "); print_ipv4_binary(my_ip);       printf("\n");
  if (in_subnet(my_ip, plusnet))  printf("My IP is owned by PlusNet\n");
  return 0;
}
```

The subnet scheme "all addresses beginning with the bitstring ..."
does not translate very well back into the "dotted decimal" notation.
The best we have is what's called "CIDR notation",
which is the first IP address in the subnet,
followed by the length of the prefix in bits:

```c
void print_subnet_cidr(struct subnet sn) {
  ipv4 first_addr = sn.prefix << (32-sn.prefix_len_bits);
  print_ip_dotted_decimal(first_addr);
  printf("/%d", sn.prefix_len_bits);
}

int main(void) {
  struct subnet plusnet = { 0b001100110000011, 15 };
  printf("PlusNet subnet CIDR: "); print_subnet_cidr(plusnet); printf("\n");
  return 0;
}
```

This prints:

```
PlusNet subnet CIDR: 51.6.0.0/15
```

Does the subnet `51.6.0.0/15` contain the IP address `51.7.123.42`?
At first, it doesn't look like it; `51.7` doesn't match `51.6`.
But the decimal notation is deceiving!
`51.7.123.42` _is_ part of `51.6.0.0/15`.
With CIDR notation, one must always stop and think,
and occasionally mentally convert to binary.
There is an unfortunate contradiction between our notation which uses decimal
and our subnet scheme which uses binary,
and the confusing CIDR notation is the result.

Notice that our definition of `in_subnet`
first computes a `first_addr` and a `mask`.
It would be wasteful to compute these every time we call the function.
Instead, we can use these two variables as the _definition_ of our subnet:

```c
struct subnet { uint32_t first_addr; uint32_t mask; };

bool in_subnet(ipv4 ip, struct subnet sn) {
  return (ip & sn.mask) == sn.first_addr;
}

int main(void) {
  ipv4 my_ip = parse_ipv4_decimal("51.6.191.203");
  uint32_t plusnet_prefix = 0b001100110000011;
  uint8_t prefix_len_bits = 15;
  ipv4 plusnet_first_addr = plusnet_prefix << (32-prefix_len_bits);
  ipv4 plusnet_mask = ~((1<<(32-prefix_len_bits))-1);
  struct subnet plusnet = { plusnet_first_addr, plusnet_mask };
  if (in_subnet(my_ip, plusnet))  printf("My IP is owned by PlusNet\n");
  return 0;
}
```

The expression `(ip & sn.mask) == sn.first_addr` is efficient to compute.
This, I think, explains _why_ subnets are defined this way:
so that networking gear can be simple and fast.
