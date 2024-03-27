---
title: Run-length encoding in C
tags: []
---

Run-length encoding is a "compression" scheme
which works well on inputs with lots of consecutive repeated characters,
e.g. `aaaabbbaaaaaaaa`.
We run-length encode this string as (`a`,3), (`b`,3), (`a`,8).
This is decoded by taking each pair (_c_,_n_) and outputting _c_ _n_ times.
To run-length encode a bytestring,
we can represent each pair with two bytes, `cn`.
This restricts us to a max of 255 bytes repeated per pair;
if we reach the max, we can use another pair to continue.
The following C program implements this.
`./rle encode` encodes its stdin on stdout;
and `./rle decode` does the inverse.
An example of usage:

```console
$ cc -o rle rle.c
$ echo "Hello world..." | ./rle encode | hexdump -C
00000000  48 01 65 01 6c 02 6f 01  20 01 77 01 6f 01 72 01  |H.e.l.o. .w.o.r.|
00000010  6c 01 64 01 2e 03 0a 01                           |l.d.....|
00000018
$ echo "Hello world..." | ./rle encode | ./rle decode
Hello world...
```

Here's the program:

```c
#include <stdlib.h>
#include <stdio.h>
#include <stdint.h>
#include <string.h>
#include <unistd.h>
int guard(char* err, int x) { if (x == -1) { perror(err); exit(1); } return x; }
void put(uint8_t c) { guard("could not write byte", write(1, &c, 1)); }
int get(uint8_t* buf) { return guard("could not read byte", read(0, buf, 1)); }
void encode(void) {
  uint8_t c;
  if (get(&c) == 0) return;
  put(c);
  uint8_t n = 1;
  uint8_t new_c;
  while (get(&new_c) != 0) {
    if (new_c == c) {
      if (n == UINT8_MAX) { put(n); n = 1; put(c); }
      else { n++; }
    } else {
      put(n); put(new_c);
      c = new_c; n = 1;
    }
  }
  put(n);
}
void decode(void) {
  uint8_t c; uint8_t n;
  while (get(&c) != 0) {
    get(&n);
    for (int i = 0; i < n; i++) put(c);
  }
}
void usage(char* pname) { fprintf(stderr, "Usage: %s (encode|decode)\n", pname); exit(1); }
int main(int argc, char* argv[]) {
  if (argc < 2) usage(argv[0]);
  else if (strcmp(argv[1], "encode") == 0) encode();
  else if (strcmp(argv[1], "decode") == 0) decode();
  else usage(argv[0]);
  return 0;
}
```
