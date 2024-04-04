---
title: Variables in bash
draft: true
summary: >-
  Bash variables are made of ASCII letters/digits/underscores. They store
  strings and are dynamically scoped.
tags:
  - bash
  - variables
  - shell
  - programming
taggedAt: '2024-04-04'
---

If you want to understand a programming language,
start with its variables.
I'm learning Bash,
so let's see how Bash variables work.

Bash variables have names, like `foo` or `i2`.
They're made of ASCII letters, digits, and `_` (and the first char must not be a digit).
(Except, possibly, for some "special" variables, like `1`, the first argument.)

To assign to a variable, we write assignment statements like:

```bash
a=3           # variable `a` gets the value "3"
b1=           # variable `b1` gets the value ""
  FOO= 45     # variable `FOO` gets the value " 45"
echo = baz    # not an assignment! Instead, calls `echo` with two arguments
```

Notice that they're all assigned strings,
and that whitespace around the `=` is significant.
All bash variables are strings.
Yes, bash can treat these variables as integers sometimes,
but in "storage", they are strings.

Bash variables are _dynamically scoped_.
To illustrate:
