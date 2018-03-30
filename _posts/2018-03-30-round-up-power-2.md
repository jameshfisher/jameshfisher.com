---
title: "Rounding up to the next power of two in C"
tags: ["programming", "c"]
---

I was writing a memory allocator in C.
My approach was to pad each allocation to a power of two number of bytes
so that the allocations could be cleanly packed together.
For example, if the program does `malloc(49)`,
requesting a 49-byte memory allocation,
we round this up to 64 bytes.
For this,
I wanted a function `next_pow2`
so that `next_pow2(49) = 64`,
`next_pow2(64) = 64`,
`next_pow2(65) = 128`,
et cetera.

How do we implement `next_pow2`?
A natural implementation is to check all the powers of two,
stopping at the first one which is big enough:

```c
uint64_t next_pow2(uint64_t x) {
  uint64_t p = 1;
  while (p < x) p *= 2;
  return p;
}
```

The above algorithm uses ordinary arithmetic.
We can do better if we work with the binary representation of numbers in C.
In binary representation, adding a `0` doubles the number,
just as adding a `0` in decimal multiplies by ten.
So `p * 2` can be done as `p << 1`,
using the bitwise left shift operator `<<`
to shifts the number up by one and add a rightmost `0`:

```c
uint64_t next_pow2(uint64_t x) {
  uint64_t p = 1;
  while (p < x) p <<= 1;
  return p;
}
```

For a 64-bit number,
the `while` loop can still take up to 64 iterations.
The number of operations is linear in the number of bits.
We can do better and make this a logarithmic number of operations.
One logarithmic-time algorithm is
to use binary search instead of linear search:

```c
uint64_t pow2(uint8_t e) { return ((uint64_t)1) << e; }

uint64_t next_pow2(uint64_t x) {
  uint8_t lo = 0, hi = 63;
  while (lo < hi) {
    uint8_t test = (lo+hi)/2;
    if (x < pow2(test)) { hi = test; }
    else if (pow2(test) < x) { lo = test+1; }
    else { return pow2(test); }
  }
  return pow2(lo);
}
```

The above logarithmic-time approach has a lot of branching.
There is another logarithmic-time algorithm which uses no branching,
[which I originally found here](https://graphics.stanford.edu/~seander/bithacks.html#RoundUpPowerOf2).
It relies on a function `next_pow2m1`,
which finds the next number of the form `2^n - 1`:

```c
uint64_t next_pow2(uint64_t x) {
	return next_pow2m1(x-1)+1;
}
```

To implement `next_pow2m1`, let's see an example:
`next_pow2m1(0b00010100) = 0b00011111`.
Notice that in binary representation,
this is equivalent to "fill with `1`s everything after the first `1`".
We can do that with iterated bitwise or:

```c
uint64_t next_pow2m1(uint64_t x) {
	for (int i = 0; i < 63; i++) x |= x>>1;
  return x;
}
```

We can make this branchless by expanding the loop:

```c
uint64_t next_pow2m1(uint64_t x) {
  x |= x>>1;    // Iteration 1
  x |= x>>1;    // Iteration 2
  ...
  x |= x>>1;    // Iteration 63
  return x;
}
```

Here's what happens in each iteration:

```
x = 0010000000000000
x = 0011000000000000
x = 0011100000000000
x = 0011110000000000
x = 0011111000000000
x = 0011111100000000
x = 0011111110000000
x = 0011111111000000
x = 0011111111100000
x = 0011111111110000
x = 0011111111111000
x = 0011111111111100
x = 0011111111111110
x = 0011111111111111
```

This is still linear-time.
But we can do this faster by reusing the `1` bits from previous iterations!:

```c
uint64_t next_pow2m1(uint64_t x) {
  x |= x>>1;
	x |= x>>2;
	x |= x>>4;
	x |= x>>8;
	x |= x>>16;
	x |= x>>32;
  return x;
}
```

Now see how the rightmost bit doubles in size each time:

```
x = 0010000000000000
x = 0011000000000000
x = 0011110000000000
x = 0011111111000000
x = 0011111111111111
```

This is the most efficient "portable C" implementation of `next_pow2` I've seen.
However, there's a still more efficient constant-time implementation.
The above algorithm effectively finds the rightmost `1` bit,
but there's a constant-time function for that:
`__builtin_clzl`, "count leading zeros".
This is provided by GCC (not portable C).
It does have a gotcha:
`__builtin_clzl(0)` is undefined,
so we need to special-case for it.
Here's our final constant-time implementation of `next_pow2`:

```c
uint64_t next_pow2(uint64_t x) {
	return x == 1 ? 1 : 1<<(64-__builtin_clzl(x-1));
}
```

But how is `__builtin_clzl` implemented?
We can see by compiling to assembly:

```console
$ cc -O0 -std=c99 -S next_pow2.c
```

We get these instructions:

```gas
movq	$42, -8(%rbp)
bsrq	-8(%rbp), %rax
```

The `bsrq` instruction is ["Bit Scan Reverse"](https://c9x.me/x86/html/file_module_x86_id_20.html).
As usual, there is literally no official documentation on this instruction.
