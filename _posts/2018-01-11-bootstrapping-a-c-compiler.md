---
title: Bootstrapping a C compiler
tags: []
summary: >-
  I propose BootstrapCC, a project to build a C compiler from a tiny handwritten
  program, avoiding the trust problem in Thompson's "Reflections on Trusting
  Trust".
---

In ["Reflections on Trusting Trust"](https://dl.acm.org/citation.cfm?id=358210),
Ken Thompson shows that you can't trust a program on your computer,
even if you "compiled it from source" yourself,
because your compiler is also untrusted.
It's not good enough to recompile your compiler,
because for that you need another untrusted compiler.
The `gcc` currently on your machine has a very long compilation ancestry,
completely lost to the sands of time.

In response, people say "it's turtles all the way down".
The saying implies the stack is infinite, but it's not.
A fix to the trust problem is to rebuild the stack of turtles yourself.
Imagine a project called "BootstrapCC".
BootstrapCC begins with a handwritten ELF x86 program, `b0`.
The program `b0` has a tiny job: to transform ASCII hex into binary.
`b0` is our first compiler,
and ensures that the rest of our source can be written in readable ASCII.
`b0` is small and trivial enough to be hand-verified.

BootstrapCC builds the binary `b1` using `b0`,
then builds `b2` using both of those, and so on.
Eventually, BootstrapCC produces `bn`,
a compiler for the subset of C used by the [Tiny C Compiler](https://bellard.org/tcc/).
From here, BootstrapCC can compile TCC,
from which most other things in existence can be built.
Along the way,
BootstrapCC creates successively higher-level languages:
an assembler, an IR, perhaps a stack-based language or a Lisp.

BootstrapCC does not rely on the lost 70-year lineage of modern programs.
BootstrapCC does rely on some things, such as Intel hardware and the OS.
But this is a much smaller footprint.

People are aware of the "trusting trust" paper,
but they treat it as a curiosity.
[Some people are fanatical about compiling their programs themselves](https://www.gentoo.org/),
but don't take it to its logical conclusion.
[Lots of people love creating new programming languages](http://fll.presidentbeef.com/),
but all of them are written in some other language.
[There are even lots of people creating new compilers](https://en.wikipedia.org/wiki/Category:C_compilers),
but all of them need compiling with something else.
BootstrapCC, sadly, is fictional,
and I'm not aware of any project which performs this the bootstrapping process I described here.

**Update!: BootstrapCC exists!**
It's [a wonderful-looking project called `stage0`](https://github.com/oriansj/stage0),
which describes itself thus:

> This is a set of manually created hex programs in a Cthulhu Path to madness fashion. 
> Which only have the goal of creating a bootstrapping path to a C compiler capable of compiling GCC, 
> with only the explicit requirement of a single 1 KByte binary or less.
> 
> Additionally, all code must be able to be understood by 70% of the population of programmers. 
> If the code can not be understood by that volume, 
> it needs to be altered until it satisfies the above requirement.
