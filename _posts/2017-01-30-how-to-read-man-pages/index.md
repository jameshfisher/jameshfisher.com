---
title: How do I read `man` pages?
tags:
  - man
  - posix
  - c
  - documentation
  - programming
taggedAt: '2024-03-26'
summary: >-
  The `man` command is used to access the UNIX manual pages, which are organized
  into numbered sections. `man` searches a predefined path to find the
  relevant manual page.
---

UNIX systems traditionally come with a built-in manual. How do we read it?

The manual is accessed with a command called `man`. You will probably have seen that you can read about a UNIX command by prepending it with `man`. For example, to learn about `ls`, we run:

```sh
man ls
```

This shows a page like:

```
LS(1)                     BSD General Commands Manual                    LS(1)

NAME
     ls -- list directory contents

SYNOPSIS
     ls [-ABCFGHLOPRSTUW@abcdefghiklmnopqrstuwx1] [file ...]

DESCRIPTION
     For each operand that names a file of a type other than directory, ls
     displays its name as well as any requested, associated information.  For
     each operand that names a file of type directory, ls displays the names of
     files contained within that directory, as well as any requested, associated
     information.

[...]

SEE ALSO
     chflags(1), chmod(1), sort(1), xterm(1), compat(5), termcap(5), symlink(7), sticky(8)

[...]
```

The `man` command is essentially a file viewer. The manual contents are stored on your machine as files. It has some logic to find the "`man` page" for `ls`, then displays that page. You can use `--path` to skip the second step and just print where the page is located:

```
% man --path ls
/usr/share/man/man1/ls.1
```

What does that file look like?

```
% cat /usr/share/man/man1/ls.1
.\" Copyright (c) 1980, 1990, 1991, 1993, 1994
.\"	The Regents of the University of California.  All rights reserved.
.\"
.\" This code is derived from software contributed to Berkeley by
.\" the Institute of Electrical and Electronics Engineers, Inc.
[...]
.\"     @(#)ls.1	8.7 (Berkeley) 7/29/94
.\" $FreeBSD: src/bin/ls/ls.1,v 1.69 2002/08/21 17:32:34 trhodes Exp $
.\"
.Dd May 19, 2002
.Dt LS 1
.Os
.Sh NAME
.Nm ls
.Nd list directory contents
.Sh SYNOPSIS
.Nm ls
.Op Fl ABCFGHLOPRSTUW@abcdefghiklmnopqrstuwx1
.Op Ar
.Sh DESCRIPTION
For each operand that names a
.Ar file
of a type other than
directory,
.Nm ls
displays its name as well as any requested,
associated information.
[...]
```

This is `troff` format; it is consumed by a program called `troff`. The GNU version is `groff`. You can show the `man` page in its familiar format by running:

```
% groff -man -T utf8 /usr/share/man/man1/ls.1

LS(1)                     BSD General Commands Manual                    LS(1)

NAME
     ls — list directory contents

SYNOPSIS
     ls [−ABCFGHLOPRSTUW@abcdefghiklmnopqrstuwx1] [file ...]
[...]
```

How did `man` determine that the page for `ls` was in the file at `/usr/share/man/man1/ls.1`? `man` has a _search path_, which you can see with `man --path`:

```
% man --path
/Users/jhf/.opam/system/share/man:/Users/jhf/bin/depot_tools/man:/Users/jhf/Library/Haskell/share/man:/usr/local/share/man:/usr/share/man:/Applications/Xcode.app/Contents/Developer/usr/share/man:/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/share/man:/Users/jhf/.opam/system/man
```

There are lots of extra directories in my setup. The important one for now is `/usr/share/man`. Here's the top level of it:

```
% ls /usr/share/man
man1   man2   man3   man4   man5   man6   man7   man8   man9   mann   whatis
```

All paths in the `man` search path have this top-level structure: `man1`, `man2`, etc. These numbers are the _sections_ of the manual. You can see that `ls` is in section 1 because it's in `/usr/share/man/man1/...`, and when `man` displays it, the header shows `LS(1)`.

The manual's sections are:

```
Section   Content                 Examples    Notes
========  ======================  ==========  =====
1         Commands                ls(1)       The familiar section; man looks here first
2         System calls            mmap(2)     My machine has 245 system calls
3         Library functions       malloc(3)   By far the largest, with 13K entries
4         Special files; drivers  random(4)   46
5         File formats            utf(5)      196
6         Games and screensavers  banner(6)   Ignore this section
7         Miscellaneous           ascii(7)    52
8         Sysadmin commands       ping(8)     Unclear distinction with section 1
```

`man` searches each section in order. If there is an entry in an earlier section, this takes priority. For example, there is an entry `random(4)`, but you can't access it using `man random`, because there is a C library function called `random`, and this is documented in section 3. To access a page in a specific section, run:

```
man 4 random    # gets page "random" from section 4 of the manual
```

Each section has an "intro" page. For example, `man 3 intro` gives an introduction to C library functions.
