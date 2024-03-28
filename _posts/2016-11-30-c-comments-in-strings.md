---
title: Can I put comments in string literals in C?
tags:
  - c
  - programming
  - syntax-highlighting
taggedAt: '2024-03-26'
summary: >-
  C string literals can contain comment-like characters, which are treated as
  literal text, not as comments.
---

What happens if your C string literal contains comment-like delimiters?

```c
char* my_str = "some /*string*/ with a URL https://www.google.com";
```

Thankfully, this "works". That is, this program is the same as:

```c
char* my_str = "some /" "*string*" "/ with a URL https:/" "/www.google.com";
```

I was concerned, because one syntax highlighter (Pygments) screws this up.
