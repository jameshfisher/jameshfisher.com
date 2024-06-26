---
title: How do I find out which preprocessor my C compiler uses?
tags:
  - c
taggedAt: '2024-03-26'
summary: >-
  To find out which preprocessor your C compiler uses, run the compiler with the
  `-print-prog-name=cpp` flag, which shows the path to the preprocessor
  subprogram it calls.
---

When you run `clang main.c`, the compiler first runs the preprocessor on `main.c`. You can run just the preprocessor step with `clang -E main.c`.

Which preprocessor does `clang` use? The compiler calls out to subprogram for this. You can ask the compiler which subprograms it uses with the `-print-prog-name` flag.

```
% clang -print-prog-name=cpp
/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/cpp
```

The main interesting thing is that this preprocessor is not a `clang` preprocessor; it's the one provided by Xcode on my system.
