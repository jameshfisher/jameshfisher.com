---
title: What are automatic variables (dollar variables) in a `Makefile`?
tags:
  - make
  - c
  - programming
taggedAt: '2024-03-26'
summary: >-
  Automatic variables in a Makefile, like `$@` for the target and `$^` for the
  dependencies, reduce repetition in rules.
---

Suppose in your `Makefile` you wrote:

```Makefile
prog: main.c
	clang -o prog main.c
```

There are a couple of repetitions: you mention `main.c` twice, and `prog` twice. You can eliminate the repetition with _automatic variables_:

```Makefile
prog: main.c
  clang -o $@ $^
```

`$@` ("dollar at") is part of the `Makefile` language. In your recipe, it refers to the thing it is going to build (above, that's `prog`). Mnemonic: it's the target you're aiming _at_.

`$^` ("dollar caret") refers to the dependencies/inputs (above, that's `main.c`). If it contains multiple dependencies, they are separated by spaces.
