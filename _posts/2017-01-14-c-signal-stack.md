---
title: How do C signals interact with the stack?
---

We know how C functions work. The program maintains a _call stack_, which contains _stack frames_ corresponding to nested _function calls_. Calling a function means pushing a new stack frame onto the stack, and returning from a function means popping its stack frame off the stack.

C signal handlers are functions, but the calling mechanism is clearly different. They don't get called in a "normal" way, and they don't get to "return" a value. So how do these functions work? And how do they interact with "normal" C functions?

The BSD manual for `sigaction` explains:

> Normally, signal handlers execute on the current stack of the process.  This may be changed, on a per-handler basis, so that signals are taken on a special signal stack.

So signal handlers _do_ reuse the same stack, under normal conditions.
