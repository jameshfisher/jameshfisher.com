---
title: How does a Morris approximate counter work?
tags:
  - c
  - programming
---

If you want to count to a very big number,
then your standard 32-bit or 64-bit types
will limit you.
The ordinary solution is to use more memory:
switch 128 bits, or to a "bignum" type.
But what if you don't have the space to store this number,
and you actually don't care about the _exact_ value of the counter,
only an approximation?
In this case,
you could use an "approximate counter", invented by Robert Morris:

```c
#include <math.h>
#include <stdio.h>
#include <stdint.h>
#include <limits.h>
#include <stdlib.h>

typedef uint8_t morris_t;
morris_t morris_new(uint64_t v) { return round(log2(v + 2)); }
uint64_t morris_estimate(morris_t c) { return (2 << c) - 2; }
morris_t morris_increment(morris_t c) { return (rand() % (2<<c)) ? c : c+1; }

```

Here's an example of usage which re-creates the unix tool `wc -c`,
counting the number of characters from stdin:

```c
#include "morris.c"
#include <unistd.h>
int guard(int n, char* err) { if (n == -1) { perror(err); exit(1); } return n; }
int main(void) {
  sranddev();
  char buf[1024];
  morris_t bytes_seen = morris_new(0);
  for (;;) {
    ssize_t bytes_read = guard(read(0, buf, sizeof(buf)), "could not read stdin");
    if (bytes_read == 0) break;
    while (bytes_read--) bytes_seen = morris_increment(bytes_seen);
  }
  printf("     %llu\n", morris_estimate(bytes_seen));
  return 0;
}
```

```console
$ cc wc.c
$ cat wc.c | wc -c    # first, the exact answer ...
     471
$ cat wc.c | ./a.out  # the estimated answer - a bit off, but in the ballpark
     254
$ cat wc.c | ./a.out  # try it again - a different answer, also in the ballpark
     510
```

But how does the Morris counter work?
Forget _counting_ for the moment, and concentrate on just _storing_ large numbers.
The floating-point standard IEEE 754 shows how to do this:
it stores numbers in the form _sig_ * 2 ^ _exp_.
The 32-bit `float` type dedicates 8 bits to the exponent, _exp_.
A `float` can represent much larger numbers than an `int`;
the price it pays for this is accuracy.
Our Morris counter is very similar:
its 8 bits are just like the 8-bit exponent part of a `float`.
Just like the `float`, the Morris counter can represent very large numbers,
but it sacrifices accuracy.

To initialize a Morris counter with a value,
we find the exponent, using `round(log2(v))`.
For example, instead of storing the exact value 32,
instead store the exponent 5, since 2 ^ 5 = 32.
To get the actual counter, calculate `pow(2, 5)`, or `2 << 5` in C.

Then, to increment the counter,
do so _probabilistically_.
If the counter currently stores `5`,
this represents a range of 2 ^ 32 possible values.
The counter should only be incremented if it represents the maximum value in that range.
The probability of this is 1/32,
and so we increment with this probability.

Actually, the implementation I showed is _slightly_ different:
the implementation has a mysterious `+ 2` in the initialization,
and a mysterious `- 2` in the estimate function.
Where does this constant come from?
Honestly, I don't know.
[Here's a comprehensive analysis by Flajolet.](http://algo.inria.fr/flajolet/Publications/Flajolet85c.pdf)

(I learned about this at [Redis Day London 2018](https://redislabs.com/community/redis-day-london-2018/),
in a talk that [Elena Kolevska](http://www.elenakolevska.com/)
gave about Redis cache eviction.
[You can see the Redis implementation here.](https://github.com/antirez/redis/blob/129f2d2746ca80451d8c84b223b568298020b125/src/evict.c#L315))
