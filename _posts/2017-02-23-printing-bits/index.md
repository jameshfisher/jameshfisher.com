---
title: How do I print bits in C?
tags:
  - bitwise-operations
  - c
  - programming
taggedAt: '2024-03-26'
summary: >-
  A program in C that prints the individual bits of various data types,
  showing how they are represented in memory.
---

(For the byte-by-byte version, see ["How do I print bytes in C?"](/2016/12/22/printing-bytes/).)

What do the individual bits of values in C look like? We can see the bits by printing them out with this fun program:

```c
#include <stdio.h>
#include <stdint.h>
#include <limits.h>
#include <arpa/inet.h>
#include <errno.h>

void print_byte_as_bits(char val) {
  for (int i = 7; 0 <= i; i--) {
    printf("%c", (val & (1 << i)) ? '1' : '0');
  }
}

void print_bits(char * ty, char * val, unsigned char * bytes, size_t num_bytes) {
  printf("(%*s) %*s = [ ", 15, ty, 16, val);
  for (size_t i = 0; i < num_bytes; i++) {
    print_byte_as_bits(bytes[i]);
    printf(" ");
  }
  printf("]\n");
}

#define SHOW(T,V) do { T x = V; print_bits(#T, #V, (unsigned char*) &x, sizeof(x)); } while(0)

int main() {
  SHOW(int, 0);
  SHOW(int, 1);
  SHOW(int, 17);
  SHOW(int, -17);
  SHOW(int, 256);
  SHOW(int, INT_MAX);
  SHOW(int, ~INT_MAX);
  SHOW(unsigned int, 17);
  SHOW(unsigned int, -17);  // no compiler error!
  SHOW(unsigned int, UINT_MAX);
  SHOW(unsigned int, UINT_MAX+1);
  SHOW(unsigned char, 255);
  SHOW(long, 17);
  SHOW(short, 17);
  SHOW(uint32_t, 17);
  SHOW(uint32_t, htonl(17));
  SHOW(uint16_t, 17*256+18);
  SHOW(uint16_t, htons(17*256+18));
  SHOW(void*, &errno);
  SHOW(unsigned int, 1 << 1);
  SHOW(unsigned int, 1 << 2);
  SHOW(unsigned int, 1 << 4);
  SHOW(unsigned int, 1 << 8);
  SHOW(unsigned int, 1 << 16);
  return 0;
}
```

Here are the results:

```
$ ./a.out
(            int)                0 = [ 00000000 00000000 00000000 00000000 ]
(            int)                1 = [ 00000001 00000000 00000000 00000000 ]
(            int)               17 = [ 00010001 00000000 00000000 00000000 ]
(            int)              -17 = [ 11101111 11111111 11111111 11111111 ]
(            int)              256 = [ 00000000 00000001 00000000 00000000 ]
(            int)          INT_MAX = [ 11111111 11111111 11111111 01111111 ]
(            int)         ~INT_MAX = [ 00000000 00000000 00000000 10000000 ]
(   unsigned int)               17 = [ 00010001 00000000 00000000 00000000 ]
(   unsigned int)              -17 = [ 11101111 11111111 11111111 11111111 ]
(   unsigned int)         UINT_MAX = [ 11111111 11111111 11111111 11111111 ]
(   unsigned int)       UINT_MAX+1 = [ 00000000 00000000 00000000 00000000 ]
(  unsigned char)              255 = [ 11111111 ]
(           long)               17 = [ 00010001 00000000 00000000 00000000 00000000 00000000 00000000 00000000 ]
(          short)               17 = [ 00010001 00000000 ]
(       uint32_t)               17 = [ 00010001 00000000 00000000 00000000 ]
(       uint32_t)        htonl(17) = [ 00000000 00000000 00000000 00010001 ]
(       uint16_t)        17*256+18 = [ 00010010 00010001 ]
(       uint16_t) htons(17*256+18) = [ 00010001 00010010 ]
(          void*)           &errno = [ 00001000 11000100 11100110 11100110 11111111 01111111 00000000 00000000 ]
(   unsigned int)           1 << 1 = [ 00000010 00000000 00000000 00000000 ]
(   unsigned int)           1 << 2 = [ 00000100 00000000 00000000 00000000 ]
(   unsigned int)           1 << 4 = [ 00010000 00000000 00000000 00000000 ]
(   unsigned int)           1 << 8 = [ 00000000 00000001 00000000 00000000 ]
(   unsigned int)          1 << 16 = [ 00000000 00000000 00000001 00000000 ]
```

Observations:

* My machine puts most-significant bytes in lower memory addresses
* Zero is always represented with every byte set to 0
* The maximum value for unsigned types is represented with every byte set to 255
* Signed types use a twos complement representation
* `htonl` and `htons` reverse the byte order
* "Network longs" are four bytes; but `long` on my machine is eight bytes
* Bit shifting is less intuitive in a MSB representation
* Bit shifting works "as if" it were LSB representation
