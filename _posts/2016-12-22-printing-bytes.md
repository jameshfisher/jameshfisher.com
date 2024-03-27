---
title: How do I print bytes in C?
tags:
  - c
  - programming
  - bitwise-operations
taggedAt: '2024-03-26'
summary: >-
  Useful to show how C represents various data types.
---

What do the individual bytes of values in C look like? We can see the bytes by printing them out with this fun program:

```c
#include <stdio.h>
#include <stdint.h>
#include <limits.h>
#include <arpa/inet.h>
#include <errno.h>

void print_bytes(char * ty, char * val, unsigned char * bytes, size_t num_bytes) {
  printf("(%*s) %*s = [ ", 15, ty, 16, val);
  for (size_t i = 0; i < num_bytes; i++) {
    printf("%*u ", 3, bytes[i]);
  }
  printf("]\n");
}

#define SHOW(T,V) do { T x = V; print_bytes(#T, #V, (unsigned char*) &x, sizeof(x)); } while(0)

int main() {
  SHOW(int, 0);
  SHOW(int, 1);
  SHOW(int, 17);
  SHOW(int, -17);
  SHOW(int, 256);
  SHOW(int, INT_MAX);
  SHOW(int, INT_MAX+1);
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
% ./a.out
(            int)                0 = [   0   0   0   0 ]
(            int)                1 = [   1   0   0   0 ]
(            int)               17 = [  17   0   0   0 ]
(            int)              -17 = [ 239 255 255 255 ]
(            int)              256 = [   0   1   0   0 ]
(            int)          INT_MAX = [ 255 255 255 127 ]
(            int)        INT_MAX+1 = [   0   0   0 128 ]
(   unsigned int)               17 = [  17   0   0   0 ]
(   unsigned int)              -17 = [ 239 255 255 255 ]
(   unsigned int)         UINT_MAX = [ 255 255 255 255 ]
(   unsigned int)       UINT_MAX+1 = [   0   0   0   0 ]
(  unsigned char)              255 = [ 255 ]
(           long)               17 = [  17   0   0   0   0   0   0   0 ]
(          short)               17 = [  17   0 ]
(       uint32_t)               17 = [  17   0   0   0 ]
(       uint32_t)        htonl(17) = [   0   0   0  17 ]
(       uint16_t)        17*256+18 = [  18  17 ]
(       uint16_t) htons(17*256+18) = [  17  18 ]
(          void*)           &errno = [   8   4 147 225 255 127   0   0 ]
(   unsigned int)           1 << 1 = [   2   0   0   0 ]
(   unsigned int)           1 << 2 = [   4   0   0   0 ]
(   unsigned int)           1 << 4 = [  16   0   0   0 ]
(   unsigned int)           1 << 8 = [   0   1   0   0 ]
(   unsigned int)          1 << 16 = [   0   0   1   0 ]
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
