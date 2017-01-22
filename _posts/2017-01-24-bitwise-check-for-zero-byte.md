---
title: "Quickly checking for a zero byte in C using bitwise operations"
---

I stumbled upon this magic way to check whether a 64-bit word contains a zero byte:

```c
bool contains_zero_byte(uint64_t v) {
  return (v - UINT64_C(0x0101010101010101)) & ~(v) & UINT64_C(0x8080808080808080);
}
```

This only performs four operations: a subtraction, a bitwise not, and two bitwise ands. "Traditional" approaches to this problem perform many more operations.

But _how the fuck does it work_? First I simplified it:

```c
bool contains_zero_byte_32(uint32_t v) {
  uint32_t ones = 0b00000001000000010000000100000001;
  uint32_t v_sub_ones = v - ones;
  uint32_t notv = ~v;
  uint32_t test = v_sub_ones & notv;
  uint32_t mask = 0b10000000100000001000000010000000;
  uint32_t ans = test & mask;
  return ans;
}
```

Those magic numbers look less random in binary. The first magic number is the byte `00000001` repeated. The second magic number is the byte `10000000` repeated.

Let's walk through an example. The unsigned int `0x3f00b3ff` certainly does contain a zero byte, so this should give us non-zero:

```
       0x3f00b3ff = [ 00111111 00000000 10110011 11111111 ]
             ones = [ 00000001 00000001 00000001 00000001 ]
0x3f00b3ff - ones = [ 00111101 11111111 10110010 11111110 ]
     ~ 0x3f00b3ff = [ 11000000 11111111 01001100 00000000 ]
             test = [ 00000000 11111111 00000000 00000000 ]
             mask = [ 10000000 10000000 10000000 10000000 ]
              ans = [ 00000000 10000000 00000000 00000000 ]
```

Indeed it does give us a non-zero `ans`, indicating the presence of a zero byte. Now consider the unsigned int `0xb33ff00f`. This does not contain a zero byte (note that `00` is not aligned to a byte boundary). Here's the algorithm at work:

```
       0xb33ff00f = [ 10110011 00111111 11110000 00001111 ]
             ones = [ 00000001 00000001 00000001 00000001 ]
0xb33ff00f - ones = [ 10110010 00111110 11101111 00001110 ]
     ~ 0xb33ff00f = [ 01001100 11000000 00001111 11110000 ]
             test = [ 00000000 00000000 00001111 00000000 ]
             mask = [ 10000000 10000000 10000000 10000000 ]
              ans = [ 00000000 00000000 00000000 00000000 ]
```

It works here, too: there were no zero bytes, so `ans` came out as zero.

(Note that in these examples I've laid out the bits in the order that C bitwise operations treat them. They may be laid out differently in memory.)

Enough examples; how do we show it works in general? We "prove by cases". First, we show it works when there are no zero bytes; then we show it works when there is at least one zero byte.

To we show that if there are no zero bytes, we must show the expression returns 0. Let's work backwards. Because of the `mask`, the expression returns `0` if there are no "high" bits set in any of the bytes of `test`. So we must show that no high bits in `test` are set. Now, `test` is generated as the _bitwise and_ of `v_sub_ones` and `notv`, so we must show that for each byte's high bit, it is either `0` in `v_sub_ones` or it is `0` in `notv`.

Consider each byte separately. Because no byte is zero, it is either positive or it is negative. We again prove by cases, and show that in both cases, the byte's high bit is either `0` in `v_sub_ones` or it is `0` in `~v`. If the byte is negative, its high bit will be `1`, because the computer uses two's complement representation. Thus, for negative bytes, the high bit will be `0` in `notv`.

Now consider the case where the byte is positive. We wish to show that its high bit is `0` in `v_sub_ones`. Treat the entire subtraction as byte-wise subtraction, so that `v_sub_ones[n] = v[n]-1`. Decrementing a positive byte results in either a positive byte or a zero byte, and in either case, the high bit is `0` (again, two's complement). Thus we have shown that if there are no zero bytes, the answer will be `0`.

But why were we able to treat the subtraction as byte-wise subtraction? The subtraction algorithm doesn't work like that! Well, it does work like this for our particular case where there are no zero bytes and we are subtracting `1`. It is _only_ when doing `00000000 - 00000001` that the carry bit will be set when crossing the byte boundary.

Now consider the other major case, where there is at least one zero byte. It is enough to just consider the least-significant zero byte. We will show that for this byte, its corresponding high bit in `test` is set. It is set because its high bit is set in `~b` and in `b-1`. Here, `~b` is `~00000000`, which is `11111111`, which has its high bit set. Now the subtraction. The subtraction is `00000000 - 00000001`, which produces `11111111`, which has its zero bit set. Thus both high bits are set for this byte, and the high bit in `test` will not be zero.

Again, why was there no carry bit in the subtraction? This is because we picked the least-significant zero byte, where there are no zero bytes to the right of it. Because carry can only happen for a zero byte, there will be no carry into the chosen byte.

Since the algorithm works when there are no zero bytes and where there are some, it always works. This was a rather arduous proof - I would like to hear a more elegant one!

[Here's the original source for the mysterious expression.](http://lemire.me/blog/2017/01/20/how-quickly-can-you-remove-spaces-from-a-string/)
