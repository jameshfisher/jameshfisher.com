---
title: What is a `union` in C?
tags:
  - c
  - programming
  - data-structures
  - semantics
taggedAt: '2024-03-26'
summary: >-
  A `union` in C allows one variable to hold different data types, where the
  storage is shared. The size of a `union` is at least the size of its largest
  member. Fields in a `union` have the same byte offset.
---

```c
#include <stdio.h>
#include <stddef.h>
#include <assert.h>

// Example `union` in C
union int_or_char {
  int i;
  char c;
};

// Compare it to this to the similar `struct`
struct int_and_char {
  int i;
  char c;
};

int main(void) {
  // The struct makes room for both fields:
  assert(sizeof(struct int_and_char) >= sizeof(int) + sizeof(char));

  // But the union has a weaker constraint. It only makes room for each field individually:
  assert(sizeof(union int_or_char) >= sizeof(int));
  assert(sizeof(union int_or_char) >= sizeof(char));

  // Let's see the real sizes my compiler chooses.
  printf("sizeof(int) = %zu\n", sizeof(int));
  printf("sizeof(char) = %zu\n", sizeof(char));
  printf("sizeof(struct int_and_char) = %zu\n", sizeof(struct int_and_char));
  printf("sizeof(union int_or_char) = %zu\n", sizeof(union int_or_char));

  // This prints:
  //
  //   sizeof(int) = 4
  //   sizeof(char) = 1
  //   sizeof(struct int_and_char) = 8
  //   sizeof(union int_or_char) = 4
  //
  // The struct must be at least 4+1=5 bytes. My compiler chooses to pad the struct to 8 bytes.
  // The union must be at least max(4,1)=4 bytes. My compiler does no padding.

  // Now let's make some!
  struct int_and_char iac;
  union int_or_char ioc;

  // We already know how structs work:
  iac.i = 42;
  iac.c = 'c';
  printf("iac.i = %d; iac.c = '%c'\n", iac.i, iac.c);
  // Prints: iac.i = 42; iac.c = 'c'

  // Now let's try the same with the union:
  ioc.i = 42;
  ioc.c = 'c';
  printf("ioc.i = %d; ioc.c = '%c'\n", ioc.i, ioc.c);

  // This prints: ioc.i = 99; ioc.c = 'c'

  // Wait, where did 99 come from?! We need to understand how fields correspond
  // to byte offsets. Struct fields have a fixed byte offset. We can print out
  // the offsets:

  printf("Offset of iac.i = %ld\n", (void*)&iac.i - (void*)&iac);
  printf("Offset of iac.c = %ld\n", (void*)&iac.c - (void*)&iac);
  // Prints:
  //   Offset of iac.i = 0
  //   Offset of iac.c = 4

  // Union fields also have a fixed byte offset. Let's print those, too:
  printf("Offset of ioc.i = %ld\n", (void*)&ioc.i - (void*)&ioc);
  printf("Offset of ioc.c = %ld\n", (void*)&ioc.c - (void*)&ioc);
  // Prints:
  //   Offset of ioc.i = 0
  //   Offset of ioc.c = 0

  // Both offsets are 0! This explains the weird result above: by doing `ioc.c = 'c'`,
  // we wrote over part of our integer! We can see this in more detail by printing the bytes:

  unsigned char * bytes = (unsigned char *) &ioc;
  printf("Bytes of ioc: %d %d %d %d\n", bytes[0], bytes[1], bytes[2], bytes[3]);
  // Prints:
  //   Bytes of ioc: 99 0 0 0

  // By doing `ioc.c = 'c'`, we set the first byte to `99` (the ASCII code for 'c').
  // The integer `i` is then interpreted as `99` (since my x86 machine uses an
  // LSB representation).

  // By the way, there's a nicer way of getting field offsets without declaring
  // a value of that type: the `offsetof` macro, from stddef.h.
  printf("offsetof(struct int_and_char, c) = %zu\n", offsetof(struct int_and_char, c));
  // Prints: offsetof(struct int_and_char, c) = 4

  // You may wonder whether union field offsets are guaranteed to be 0. The
  // answer is YES:
  //
  //     "... A pointer to a union object, suitably converted, points to each of
  //     its members (or if a member is a bit-field, then to the unit in which
  //     it resides), and vice versa."
  //
  //                  — ANSI/ISO 9899:1990 (the ANSI C standard) Section 6.5.2.1

  return 0;
}
```
