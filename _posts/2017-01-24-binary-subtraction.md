---
title: Binary subtraction
---

Remember how subtraction works. We work from the least-significant bits to the most-significant, and pairwise subtract them. `1-1=0`, `1-0=1`, `0-0=0`.

But `0-1` presents a problem: it's negative 1. We represent this by outputting `1` and _carrying_ a `1` to be subtracted from the next bits. We end up with the following logic table. It shows inputs `CI` (carry in), `A` (the bit being subtracted from), and `B` (the bit to subtract). These are mapped to outputs `CO` (carry out) and `O` (output).

```
(Inputs)  | (Outputs)
CI  A  B  | CO  O
== == ==  | == ==
 0  0  0  |  0  0
 0  0  1  |  1  1
 0  1  0  |  0  1
 0  1  1  |  0  0
 1  0  0  |  1  1
 1  0  1  |  1  0
 1  1  0  |  0  0
 1  1  1  |  1  1
```

The meaning here is that `CO` and `O` together represent the result of `A - (B+CI)`. This is a number between -2 and 1. Here's the meaning:

```
CO  O | Meaning
== == | =======
 0  0 |       0
 0  1 |       1
 1  0 |      -2
 1  1 |      -1
```

This is not arbitrary. The relation is that `Meaning = ( CO * -2) + O`. This is precisely "two's complement representation": `CO` and `O` placed side-by-side are the two's complement representation of the number.
