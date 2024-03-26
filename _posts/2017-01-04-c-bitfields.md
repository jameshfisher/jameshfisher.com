---
title: What are 'bitfields' in C?
tags:
  - c
  - programming
  - data-structures
taggedAt: '2024-03-26'
---

I've previously written that "Struct fields have a fixed byte offset". This is not actually true, because of a feature called _bitfields_. They allow us to do bit packing, but without all the bitwise operators, with greater safety, and greater clarity. The cost is some language complexity.

I'll take the previous example and rewrite it using bitfield feature:

```c
#include <stdbool.h>
#include <stdio.h>
#include <stdint.h>

struct player {
  bool is_male : 1;
  bool is_cpu : 1;
  unsigned char num_lives : 2;
  unsigned short points : 10;
};

int main(void) {
  struct player p;
  p.is_male = true;
  p.is_cpu = false;
  p.num_lives = 2;
  p.points = 789;
  printf("p.is_male = %d, p.is_cpu = %d, p.num_lives = %d, p.points = %d\n", p.is_male, p.is_cpu, p.num_lives, p.points);
  // Prints:
  //   p.is_male = 1, p.is_cpu = 0, p.num_lives = 2, p.points = 789

  return 0;
}
```

So much shorter! But how does this language feature work? Find out in the next episode of jameshfisher
