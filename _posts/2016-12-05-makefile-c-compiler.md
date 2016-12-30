---
title: Setting C compiler in a `Makefile`
---

How do you set your C compiler in a `Makefile`? You might write:

```Makefile
a.out: main.c
	clang main.c
```

`clang` is your C compiler. Alternatively, you can write:

```Makefile
a.out: main.c
	cc main.c
```

This does the same thing, because `cc` is a symbolic link to `clang` (on my machine):

```bash
% ls -l `which cc`
lrwxr-xr-x  1 root  wheel  5  7 Oct 13:11 /usr/bin/cc -> clang
```

You can also write:

```Makefile
a.out: main.c
	$(CC) main.c
```

This again does the same thing, because `$(CC)` in a `Makefile` expands to `cc`. `CC` is a predefined variable. The point of this is that you may want to redefine `CC`.
