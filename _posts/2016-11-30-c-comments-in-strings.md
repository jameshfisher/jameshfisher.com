What happens if your C string literal contains comment-like delimiters?

```c
char* my_str = "some /*string*/ with a URL https://www.google.com";
```

Thankfully, this "works". That is, this program is the same as:

```c
char* my_str = "some /" "*string*" "/ with a URL https:/" "/www.google.com";
```

I was concerned, because one syntax highlighter (Pygments) screws this up.
