---
title: How do I pack bits in C? (An answer using masks)
tags:
  - c
  - programming
  - bitwise-operations
  - data-structures
taggedAt: '2024-03-26'
summary: >-
  Efficient packing of game player data into 16 bits using bitwise operations on
  a `uint16_t` type.
---

An exercise in packing information into bits instead of bytes.

```c
#include <stdbool.h>
#include <stdio.h>
#include <stdint.h>

// Consider this struct
struct player_inefficient {
  bool is_male;
  bool is_cpu;
  int num_lives;  // out of 3
  int points; // in range 0-1000
};

// The information in this struct is packed inefficiently:
//
// - the booleans are only a single bit of information, not 8.
// - the num_lives only requires 2 bits.
// - the points only requires 10 bits.
//
// The player only requires 14 bits, but our compiler stores it in 96 bits!
// Let's pack the information more efficiently. It can all fit in 16 bits:

// Let's number our bits from 0 to 15:
//
//      1 1 1 1 1 1
//      5 4 3 2 1 0 9 8 7 6 5 4 3 2 1 0
//     +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
//     |        points         | L |M|C|
//     +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
//     |       1       |       0       | bytes

typedef uint16_t player;

#define BIT(N) (1 << (N))
#define ANY_SET(F,B) ((F) & (B))
#define GET_BIT(F,N) ANY_SET((F), BIT(N))
#define SET_BITS(F,B) ((F) | (B))
#define UNSET_BITS(F,B) ((F) & ~(B))
#define N_BITS(N) (BIT(N)-1)
#define GET_N_BITS(F,N) ((F) & N_BITS(N))
#define N_BITS_ABOVE_OFFSET(N,O) (N_BITS(N) << (O))
#define GET_N_BITS_ABOVE_OFFSET(F,N,O) (((F) >> (O)) & N_BITS(N))
#define UNSET_N_BITS_ABOVE_OFFSET(F,N,O) UNSET_BITS((F), N_BITS_ABOVE_OFFSET((N),(O)))
#define SET_N_BITS_ABOVE_OFFSET(F,N,O,B) SET_BITS(UNSET_N_BITS_ABOVE_OFFSET((F),(N),(O)), (B) << (O))
#define GET_ALL_BITS_ABOVE_OFFSET(F,O) ((F) >> (O))
#define SET_ALL_BITS_ABOVE_OFFSET(F,O,B) (((B) << (O)) | GET_N_BITS((F), (O)))

// Our booleans are represented by bits 0 and 1.
#define player_IS_MALE BIT(0)
#define player_IS_CPU  BIT(1)

bool player_is_male(player p) { return GET_BIT(p, 0); }
player player_set_male(player p, bool is_male) {
  return is_male ? SET_BITS(p, BIT(0)) : UNSET_BITS(p, BIT(0));
}

bool player_is_cpu(player p)  { return GET_BIT(p, 1); }
player player_set_cpu(player p, bool is_cpu) {
  return is_cpu ? SET_BITS(p, BIT(1)) : UNSET_BITS(p, BIT(1));
}

// The num_lives is represented by bits 2 and 3.

unsigned char player_get_lives(player p) {
  return GET_N_BITS_ABOVE_OFFSET(p, 2, 2);
}

player player_set_lives(player p, unsigned char num_lives) {
  return SET_N_BITS_ABOVE_OFFSET(p, 2, 2, num_lives);
}

unsigned short player_get_points(player p) {
  return GET_ALL_BITS_ABOVE_OFFSET(p, 4);
}

player player_set_points(player p, unsigned short points) {
  return SET_ALL_BITS_ABOVE_OFFSET(p, 4, points);
}

int main(void) {
  printf("sizeof(struct player) = %zu (%ld bits)\n", sizeof(struct player), sizeof(struct player)*8);
  printf("sizeof(struct player) = %zu (%ld bits)\n", sizeof(struct player), sizeof(struct player)*8);

  player p = 0;
  p = player_set_male(p, true);
  p = player_set_cpu(p, false);
  p = player_set_lives(p, 2);
  p = player_set_points(p, 789);
  printf("p.is_male = %d, p.is_cpu = %d, p.num_lives = %d, p.points = %d\n", player_is_male(p), player_is_cpu(p), player_get_lives(p), player_get_points(p));
  // Prints:
  //   p.is_male = 1, p.is_cpu = 0, p.num_lives = 2, p.points = 789

  return 0;
}
```
