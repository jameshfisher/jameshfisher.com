---
title: "What is the type of a constant in C?"
---

When we write expressions like this in C:

```c
bool b = 1234567890 > 09876;
```

What are the types of those constants? The number `1234567890` - what is its type? How does C represent it when compiling it? The C Programming Language says:

> An integer constant like `1234` is an `int`. A `long` constant is written with a terminal `l` (ell) or
`L`, as in `123456789L`; an integer constant too big to fit into an `int` will also be taken as a `long`.
Unsigned constants are written with a terminal `u` or `U`, and the suffix `ul` or `UL` indicates
`unsigned long`.

> Floating-point constants contain a decimal point (`123.4`) or an exponent (`1e-2`) or both; their
type is `double`, unless suffixed. The suffixes `f` or `F` indicate a `float` constant; `l` or `L` indicate
a `long double`.

Here are some examples:

```c
0                       // int
0l                      // long
1234                    // int
1234L                   // long
0ul                     // unsigned long
0u                      // unsigned int
2147483647              // int (just)
2147483648              // long
2147483647u             // unsigned int
2147483648u             // unsigned long (but could have fitted into an unsigned int)
0x0101010101010101ULL   // unsigned long long
```
