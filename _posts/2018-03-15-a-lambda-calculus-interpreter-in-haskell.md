---
title: A lambda calculus interpreter in Haskell
tags:
  - programming
summary: >-
  A lambda calculus interpreter in Haskell, using de Bruijn indexing and lazy
  evaluation, with simple integer literals added.
---

A few days ago, I wrote an interpreter for a small imperative language in Haskell.
Today I wrote an interpreter for one of the smallest functional languages:
the lambda calculus.
It's small enough to show you the whole thing in one go.
Here's `Main.hs`:

```haskell
module Main where

data E
  = EApp E E
  | EAbs E
  | EVar Int  -- EVar n refers to the variable bound by the nth-innermost abstraction
  | EInt Int  -- literals
  deriving (Show)

eval :: E -> E
eval (EApp fun arg) = case eval fun of
  EAbs body -> eval $ sub 0 body where
                sub n e = case e of
                  EApp e1 e2 -> EApp (sub n e1) (sub n e2)
                  EAbs e' -> EAbs $ sub (n+1) e'
                  EVar n' | n == n'    -> arg  -- substitute. arg has no free vars.
                          | otherwise  -> EVar n'
                  EInt i -> EInt i
  other -> EApp other arg
eval x = x

main :: IO ()
main = print $ eval $ EApp (EApp (EAbs (EAbs (EVar 1))) (EInt 42)) (EInt 43)
```

The language itself is given by the datatype `E` (for "expression").
There are three forms of expression in the lambda calculus:
abstraction (functions),
application (function calls),
and variables.

In lambda calculus notation,
`x` and `y` are variables,
`\x y. x` is an abstraction (the function `fst`, returning its first argument),
`(\x y. x) a b` is an application (calling `fst` with the arguments `a` and `b`, which should yield `a`).

My implementation uses "de Bruijn indexing",
a variant of the lambda calculus which avoids explicit variable names,
instead referring identifying variables numerically.
In de Bruijn notation,
`1` and `2` are variables,
`\ \ 1` is an abstraction (the same function `fst`),
and `(\ \ 1) 1 2` is an application (calling `fst` with two unbound variables).
The variable `0` refers to the value bound by the innermost abstraction;
the variable `1` refers to the value bound by the second-innermost abstraction;
et cetera.
De Bruijn indexing simplifies implementation
by avoiding variable name clashes.

I've also added literal integers to the language,
which are not in the pure lambda calculus.
(One can encode such things using "Church encoding.")

My Haskell function `eval` is the entire interpreter.
It repeatedly evaluates function applications until no more applications can be done.
Function application is done by substitution.
The evaluation order is "lazy":
arguments are not evaluated unless forced.

I might extend this language in future with "IO actions",
a Haskell feature,
letting me write expressions which can (for example)
read from standard input
and write to standard output.
