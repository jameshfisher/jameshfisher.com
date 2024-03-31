---
title: What are the stages of C compilation?
tags:
  - c
taggedAt: '2024-03-26'
summary: >-
  C compilation involves 6 stages: preprocessing, parsing, AST generation, LLVM
  IR production, assembly generation, and linking to produce the final
  executable or shared library.
---

C compilation goes through several stages. For `clang`, the C compiler on my machine, these are:

```
+----+        +----+           +-----+       +---------+       +----+       +----+       +-----------+
| .c |--cpp-->| .i |--parser-->| AST |--??-->| LLVM IR |--??-->| .s |--as-->| .o |--ld-->| a.out/.so |
+----+        +----+           +-----+       +---------+       +----+       +----+       +-----------+
```

1. Take `main.c`, preprocess to produce tokens (a `.i` file). This is done by the C preprocessor, `cpp`.
2. Take tokens, parse into AST.
3. Take AST, produce LLVM IR ("Intermediate Representation").
4. Take LLVM IR, produce assembly (a `.s` file).
5. Take assembly, produce object file (a `.o` file). This is done by the assembler, `as`.
6. Take object file, produce executable (`a.out`) or dynamic library (`.so`).

I'll cover these stages in future posts.
