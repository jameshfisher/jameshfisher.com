---
title: "An interpreter in Haskell"
tags: ["programming", "haskell"]
---

I haven't touched Haskell for a couple of years.
To get back into it,
I made an interpreter for a small imperative language.
Haskell is great for making interpreters!

First I define the syntactic structure.
My language has integers (its only native datatype),
pure operators on integers,
a set of global variables,
some control flow constructs,
and two I/O primitives.
Below the syntax is encoded as the type `E` (for "expression").

```haskell
data E =
  -- literals
    EInt Int
  -- pure operators
  | EBinOp Op E E
  | ENot E
  -- global variables
  | EGet String
  | ESet String E
  -- control flow
  | EIf E E E
  | ESeq E E
  | EWhile E E
  | EDoWhile E E
  | ESkip
  -- I/O
  | EWriteByte E
  | EReadByte

data Op = Add | Sub | Eq | Lt | Lte | And  -- and many more
```

Here's an example of a program written in this language,
called `writeXsForever`.

```haskell
writeXsForever :: E
writeXsForever = EWhile (EInt 1) (EWriteByte (EInt 120))
```

You might be able to eyeball this expression and guess its intended behavior.
My intended behavior for this program is that it writes the byte `x` to stdout repeatedly forever!
But to give this program meaning, I must define the interpreter.
In Haskell, the interpreter could be a function with the type:

```haskell
eval :: E -> IO ()
```

My interpreter is more complex for two reasons.
First, since the interpreter is evaluating an _expression_,
it needs to return the value that expression evaluated to;
in my language this is always an `Int`.
Second, my language has mutable global variables (`Map String Int`)
which must be "threaded" through each evaluation.

```haskell
eval :: Map.Map String Int -> E -> IO (Int, Map.Map String Int)
```

The Haskell `main` function begins the interpreter by calling `eval` on the root expression of the program:

```
main :: IO ()
main = do
  eval Map.empty writeXsForever
  return ()
```

```console
$ ./jimscript
xxxxxxxxxxxxxxxx^C
$
```

Now I define `eval` case-by-case on each syntactic form in `E`.
I start with perhaps the simplest, `EInt`,
a literal which evaluates to itself
and does not modify any variables:

```haskell
eval vars (EInt i) = return (i, vars)
```

Next, I interpret `BinOp`, the syntax form for all binary operators on integers.
Notice how we evaluate the left-hand side expression before the right-hand side,
and that this matters because of to the side-effects that expressions can have
on global variables and on input/output.
Notice the "threading" of `vars` through each evaluation gets quite verbose
(I've chosen not to abstract this,
because I plan to implement more sophisticated variable "scoping" in future).
Also notice that `evalOp` is rather tedious,
translating between `Op` values and Haskell functions which implement them.
Much of the work in writing an interpreter is handed off to the host language!

```haskell
eval vars (EBinOp op e1 e2) = do
  (val1, vars') <- eval vars e1
  (val2, vars'') <- eval vars' e2
  return (evalOp op val1 val2, vars'')

evalOp :: Op -> Int -> Int -> Int
evalOp Add a b = a + b
evalOp Sub a b = a - b
evalOp Eq a b = if a == b then 1 else 0
evalOp Lt a b = if a < b then 1 else 0
evalOp Lte a b = if a <= b then 1 else 0
evalOp And a b = if a == 0 || b == 0 then 0 else 1
```

The global variable map has primitive "get" and "set" expressions,
which are evaluated as follows.
Notice the call to `error` if the variable isn't set
(I'm not a Haskell purist).

```haskell
eval vars (EGet var) = case Map.lookup var vars of
  Nothing -> error $ "no such variable: " ++ var
  Just x -> return (x, vars)
eval vars (ESet var e) = do
  (val, vars') <- eval vars e
  return (val, Map.insert var val vars)
```

On to control flow,
an interesting one is `EWhile`.
Its "looping" behavior is implemented using Haskell recursion;
notice the subcall evaluating a new `EWhile` with the new global variable set:

```haskell
eval vars (EWhile c e) = do
  (cond, vars') <- eval vars c
  case cond of
    0 -> return (0, vars')
    _ -> do
      (_, vars'') <- eval vars' e
      eval vars'' (EWhile c e)
```

On to I/O, here's the interpreter for `IWriteByte`.
My language can only write to stdout,
but it could be extended to write to files, sockets and so on
(but this would want a native string datatype, not just integers).

```haskell
eval vars (EWriteByte byteE) = do
  (byte, vars') <- eval vars byteE
  if byte < 0 then error $ "Tried to print byte < 0: " ++ show byte
  else if 255 < byte then error $ "Tried to print byte > 255: " ++ show byte
  else PosixIO.fdWrite PosixIO.stdOutput [Char.chr byte]
  return (byte, vars')
```

Now here are some more interesting JimScript programs:

```haskell
writeTheAlphabet :: E
writeTheAlphabet =
  ESeq
    (ESet "x" (EInt 1))
    (EWhile (ENot (EBinOp Eq (EGet "x") (EInt 27))) (ESeq
      (EWriteByte (EBinOp Add (EInt 64) (EGet "x")))
      (ESet "x" (EBinOp Add (EGet "x") (EInt 1)))))
```

```console
$ ./jimscript
ABCDEFGHIJKLMNOPQRSTUVWXYZ
```

```haskell
uppercase :: E
uppercase =
  (EDoWhile (ESeq
      (ESet "c" EReadByte)
      (EIf (EBinOp Eq (EGet "c") (EInt (-1)))
        ESkip
        (EIf (EBinOp And
                (EBinOp Lte (EInt 97) (EGet "c"))
                  (EBinOp Lte (EGet "c") (EInt 122)))
          (EWriteByte (EBinOp Sub (EGet "c") (EInt 32)))
          (EWriteByte (EGet "c")))))
    (ENot (EBinOp Eq (EGet "c") (EInt (-1)))))
```

```console
$ ./jimscript
hello
HELLO
```

Programs in this language are Haskell expressions of type `E`;
there is no defined syntax.
I might define a syntax and write a parser next.

Addendum:
some of the `eval` definitions were long-winded so I omitted them.
Here's are the rest.

```haskell
eval vars (ENot e) = do
  (v, vars') <- eval vars e
  case v of
    0 -> return (1, vars)
    _ -> return (0, vars)
eval vars (EIf c t e) = do
  (cond, vars') <- eval vars c
  case cond of
    0 -> eval vars' e
    _ -> eval vars' t
eval vars (EDoWhile e c) = do
  (_, vars') <- eval vars e
  (cond, vars'') <- eval vars' c
  case cond of
    0 -> return (0, vars'')
    _ -> eval vars'' (EDoWhile e c)
eval vars (ESeq e1 e2) = do
  (_, vars') <- eval vars e1
  eval vars' e2
eval vars ESkip = return (0, vars)
eval vars EReadByte = do
  exp :: Either Exception.SomeException (String,Foreign.C.Types.CSize) <- Exception.try (PosixIO.fdRead PosixIO.stdInput 1)
  case exp of
    Left _ -> return (-1, vars)
    Right (str,count) -> do
      if count == 0 then
        return (-1, vars)
      else do
        let [c] = str
        return (Char.ord c, vars)
```
