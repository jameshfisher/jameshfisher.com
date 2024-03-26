---
title: How do I write a multi-line string literal in C?
tags:
  - c
  - programming
taggedAt: '2024-03-26'
---

What ways do we have to define large string literals in C? Let's take this example:

```c
#include <stdio.h>
char* my_str = "Here is the first line.\nHere is the second line.";
int main(void) {
  printf("%s\n", my_str);
  return 0;
}
```

We could first try to split this up as:

```c
char* my_str = "Here is the first line.
Here is the second line.";
```

This causes a parse error, because literal newline characters are not allowed within the quote.

We can use string literal concatenation. Multiple string literals in a row are joined together:

```c
char* my_str =
  "Here is the first line."
  "Here is the second line.";
```

But wait! This doesn't include the newline character; we still have to include it:

```c
char* my_str =
  "Here is the first line.\n"
  "Here is the second line.";
```

We can also use the backslash character at the end of a line:

```c
char* my_str = "Here is the first line.\
Here is the second line.";
```

This also doesn't include the newline! We have to include again:

```c
char* my_str = "Here is the first line.\n\
Here is the second line.";
```

Apparently in C++11 and in GCC with extensions, we can write "raw strings" like this:

```c
char* my_str = R"Here is the first line.
Here is the second line.";
```

However, `clang` doesn't seem to like this.

The "concatenated string literals" approach has the added advantage of being able to indent the string in your code. I'd use that.
