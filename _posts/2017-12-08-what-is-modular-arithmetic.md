---
title: What is modular arithmetic?
tags: []
summary: >-
  Modular arithmetic involves operations like addition, subtraction,
  multiplication, and exponentiation that "wrap around" a fixed modulus. This is
  useful for cryptography like RSA.
---

I was looking into RSA, an asymmetric cryptosystem.
The RSA algorithm relies on "modular exponentiation".
But what is modular exponentiation,
and what are the properties of modular exponentiation
that make it useful for cryptography?

Let's start with exponentiation.
You likely saw exponentiation in school.
3<sup>7</sup>, or "3 to the power 7",
is 3 multiplied by itself 7 times,
3&times;3&times;3&times;3&times;3&times;3&times;3,
or 2187.
Modular exponentiation is the same operation, modulo some natural number.

You might have seen modular arithmetic in school.
You've certainly worked with modular _addition_ when telling the time.
Modular arithmetic is arithmetic where the numbers "wrap around".
In normal addition, 3+11 is 14,
but on a 12-hour clock-face, 3+11 is <span class="answer">2. (3am + 11 hours = 2pm.)</span>
Computers often use modular arithmetic, with a power-two modulus.
Addition over `unsigned char` values does arithmetic modulo 256.
For example, what is 156+240 in `unsigned char`s?
<span class="answer">140. 156+240 = 396. 396 hours around a 256-hour clock reaches 140.</span>
There are modular versions of all the normal operations,
such as addition, subtraction, multiplication, and exponentiation.
What is 3&times;5 on the clock-face?
<span class="answer">3. Compute 3&times;5 = 15,
then count 15 hours around the clock-face from noon.</span>

In traditional notation,
we write 3&times;7 ≡ 3 (mod 12).
This relation _a_ ≡ _b_ (mod _n_) can be defined in terms of normal equality:
_a_ = _b_+_kn_.
For example, 38 = 17 + 3&times;7,
so we can say 38 ≡ 17 (mod 7), taking _k_ = 3.
Notice we can also say 38 ≡ 17 (mod 3), taking _k_ = 7.
What _k_ shows that 15:00 is 3pm, i.e. that 15 ≡ 3 (mod 12)?
<span class="answer">_k_=1. 15 hours around the clock goes once around, then three hours more.</span>

Addition is iterated stepping,
multiplication is iterated addition,
and exponentiation is iterated multiplication.
All this is true in normal arithmetic and in modular arithmetic.
We can define these naïvely in C:

```c
#include <stdio.h>
#include <stdint.h>
typedef unsigned int uint;
uint mod_incr(uint x, uint n) { return (x+1 == n) ? 0 : x+1; }
uint mod_add(uint a, uint b, uint n) { uint x = a; while (b--) x = mod_incr(x,n);  return x; }
uint mod_mul(uint a, uint b, uint n) { uint x = 0; while (b--) x = mod_add(x,a,n); return x; }
uint mod_exp(uint b, uint e, uint n) { uint x = 1; while (e--) x = mod_mul(x,b,n); return x; }
int main(void) {
  printf("3  + 11 = %u (mod 12)\n", mod_add(3, 11, 12));
  printf("3  *  7 = %u (mod 12)\n", mod_mul(3,  7, 12));
  printf("11 ^  8 = %u (mod 12)\n", mod_exp(11, 8, 12));
  return 0;
}
```

```
$ clang main.c
$ ./a.out
3  + 11 = 2 (mod 12)
3  *  7 = 9 (mod 12)
11 ^  8 = 1 (mod 12)
```

Every time the number is operated on (incremented),
the above algorithm checks whether the number has wrapped around,
and if so, resets it to zero.
But there's another way to compute a modular expression:
compute it in ordinary arithmetic,
then apply the "modulo" at the end.
In C, we can redefine our functions using the `%` (remainder) operator.
(This is equivalent as long as the numbers are non-negative.)

```c
uint mod_incr(uint x, uint n) { return (x+1) % n; }
uint mod_add(uint a, uint b, uint n) { return (a+b) % n; }
uint mod_mul(uint a, uint b, uint n) { return (a*b) % n; }
uint mod_exp(uint b, uint e, uint n) { uint x = 1; while (e--) x *= b; return x % n; }
```

In normal arithmetic over the integers,
each of these operations has an _inverse_.
Subtraction is the inverse of addition,
because (_a_ + _b_ ) - _b_ = _a_.
The inverse of multiplication is division,
because (_a_&times;_b_) / _b_ = _a_
(unless _b_ is zero!).
And exponentiation has as its inverse the "nth root":
_b_&radic;(_a_ <sup>_b_</sup>) = _a_.
There are inverses in modular arithmetic, too,
but they don't work how you might expect!

Say you're at noon, then go forward 3 hours.
How do you undo this operation?
How do you undo "going 3 hours around the clock-face"?
One answer is "by going back 3 hours".
But another answer is "by going forward until you loop back to the original time".
So in clock arithmetic, the inverse of +3 is <span class="answer">+9 (adding 3 then adding 9 leaves you in the same place)</span>.
In general, for modulus _n_, the inverse of _+b_ is _+(n-b)_.

How about the inverse of multiplication and exponentiation?
This gets closer to the territory of the RSA algorithm,
and I'll cover them in future posts.
