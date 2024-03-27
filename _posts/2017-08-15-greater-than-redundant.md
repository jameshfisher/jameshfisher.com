---
title: Greater-than is redundant
tags: []
---

The following two expressions are the same: `a < b`, `b > a`. To know what they mean, you have to use the counter-intuitive memory aid: "the smaller number eats the bigger one". Why do we do this to ourselves? We do we have both? We don't have flipped subtraction, division, or assignment operators. Why would you need `5 =: x`? It would be simpler to abolish `>` and instead use `<` in every case:

```
if (5 < 10) { ... }
if (2 < x && x < 10) { ... }
```

With this restriction, numbers appear in your comparison in the same order they do on the traditional left-to-right number line. You don't need the silly memory aid; you just remember that the expression `a < b` lays out the numbers on the number line. The expression `2 < x && x < 10` is a slight expansion of the mathematical shorthand `2 < x < 10`, which is itself a symbolic representation of

```
         |--x--|
...-0-1-2-.....-10-11-12-...
```
