---
title: Writing a parser in Haskell
tags:
  - programming
  - haskell
summary: >-
  I write a parser for JimScript, an imperative programming language, in
  Haskell. The parser goes through three stages: tokenization, nesting, and
  parsing.
---

Previously I wrote an interpreter for an imperative programming language, "JimScript".
JimScript programs looked like this:

```haskell
writeTheAlphabet :: E
writeTheAlphabet =
  ESeq
    (ESet "x" (EInt 65))
    (EWhile (EBinOp Lte (EGet "x") (EInt 90)) (ESeq
      (EWriteByte (EGet "x"))
      (ESet "x" (EBinOp Add (EGet "x") (EInt 1)))))
```

JimScript programs were rather unreadable,
because they were written as Haskell expressions.
But now JimScript has its own syntax,
and the above program can be written like this file, `write_the_alphabet.jimscript`:

```scheme
#/usr/bin/env jimscript
(set x 'A')
(while (<= x 'Z')
  (write x)
  (set x (+ x 1)))  # increment
```

The JimScript interpreter reads files like the above
and transforms them into Haskell values before execution.
After reading `write_the_alphabet.jimscript`,
we get the Haskell string `"#/usr/bin/env [...] (+ x 1))))"`.
To transform this `String` into an `E` (expression value),
there are three stages: tokenization, nesting, then parsing.

```haskell
main :: IO ()
main = do
  (f:_) <- Environment.getArgs
  script <- readFile f
  let e = parse . nest . tokenize $ script
  eval Map.empty e
  return ()
```

The token type `T` includes literals, symbols, and parentheses.

```haskell
data T
  = TOpen
  | TClose
  | TSymbol String
  | TInt Int
```

After tokenization, the string is transformed into a flat list of tokens.
Our `write_the_alphabet.jimscript` program is tokenized to
`[TOpen, TSymbol "set", TSymbol "x", ..., TClose, TClose, TClose]`.
Notice there is no `TChar`,
so the expression `'A'` in the source syntax is sugar for the integer `65`.

The next stage, _nesting_, uses the `TOpen` and `TClose` tokens
to make a tree structure which I call a nest, type `N`:

```haskell
data N
  = NList [N]
  | NSymbol String
  | NInt Int
```

(The source syntax might look like S-expressions, but they're not quite.
S-expressions have an additional form `(a . b)` which makes them binary trees;
my "nest" type is not a binary tree but a _rose tree_.)
After nesting, our `write_the_alphabet.jimscript` looks like:

```haskell
NList [NSymbol "seq",
  NList [NSymbol "set", NSymbol "x", NInt 65],
  NList [NSymbol "while", NList [NSymbol "<=", NSymbol "x", NInt 90],
    NList [NSymbol "write", NSymbol "x"],
    NList [NSymbol "set",NSymbol "x", NList [NSymbol "+", NSymbol "x", NInt 1]]]]
```

Finally, the nested lists are _parsed_ to produce the abstract syntax proper;
the `writeTheAlphabet` value which you first saw.
Now let's look at the implementation of tokenization, nesting, and parsing.

Tokenization looks at the first character of the string
and uses this to determine which kind of token is first;
with this decision, it greedily takes the largest possible token of that type.
Tokenization also strips out whitespace and comments.

```haskell
tokenize :: String -> [T]
tokenize [] = []
tokenize ('#':cs) = tokenize $ dropWhile (/= '\n') cs
tokenize ('(':cs) = TOpen : tokenize cs
tokenize (')':cs) = TClose : tokenize cs
tokenize ('\'':'\\':'\\':'\'':cs) = TInt (Char.ord '\\') : tokenize cs
tokenize ('\'':'\\':'\'':'\'':cs) = TInt (Char.ord '\'') : tokenize cs
tokenize ('\'':'\\':'n':'\'':cs) = TInt (Char.ord '\n') : tokenize cs
tokenize ('\'':c:'\'':cs) = TInt (Char.ord c) : tokenize cs
tokenize (c : cs)
  | Char.isNumber c = TInt (read $ c : takeWhile Char.isNumber cs) : tokenize (dropWhile Char.isNumber cs)
  | isSymbolChar c = TSymbol (c : takeWhile isSymbolChar cs) : tokenize (dropWhile isSymbolChar cs)
  | Char.isSpace c = tokenize cs
  | otherwise      = error $ "unexpected character: " ++ [c]

isSymbolChar c = Char.isAlphaNum c || elem c "=+<-/%"
```

Nesting is a slightly subtle process,
which uses two mutually recursive functions, `nestOne` and `nestMany`.
`nestOne` finds the first nest from the list of tokens,
and also hands back any remaining tokens.
`nestMany` takes as many nests as possible.

```haskell
nestOne :: [T] -> ([N], [T])
nestOne []               = ([], [])
nestOne (TOpen     : ts) = let (ns, ts') = nestMany [] ts in ([NList ns], ts')
nestOne (TSymbol s : ts) = ([NSymbol s], ts)
nestOne (TInt i    : ts) = ([NInt i], ts)
nestOne (TClose    : ts) = ([], ts)

nestMany :: [N] -> [T] -> ([N], [T])
nestMany prev ts = case nestOne ts of
  ([], ts') -> (prev , ts')
  (ns, ts') -> nestMany (prev++ns) ts'

nest :: [T] -> N
nest ts = case nestMany [] ts of
  (ns, []) -> NList $ NSymbol "seq" : ns
  _ -> error "unexpected content"
```

Finally, parsing takes a nest and converts it to the more restrictive expression datatype `E`.
Each expression form has one way to be represented as a nest.
`parse` matches on the nest to find the appropriate expression.

```haskell
parse :: N -> E
parse (NInt i) = EInt i
parse (NList [NSymbol "-", NInt i]) = EInt $ negate i
parse (NList [NSymbol "+", a, b]) = EBinOp Add (parse a) (parse b)
parse (NList [NSymbol "-", a, b]) = EBinOp Sub (parse a) (parse b)
parse (NList [NSymbol "/", a, b]) = EBinOp Div (parse a) (parse b)
parse (NList [NSymbol "%", a, b]) = EBinOp Mod (parse a) (parse b)
parse (NList [NSymbol "=", a, b]) = EBinOp Eq (parse a) (parse b)
parse (NList [NSymbol "!=", a, b]) = EBinOp Neq (parse a) (parse b)
parse (NList [NSymbol "<", a, b]) = EBinOp Lt (parse a) (parse b)
parse (NList [NSymbol "<=", a, b]) = EBinOp Lte (parse a) (parse b)
parse (NList [NSymbol "and", a, b]) = EBinOp And (parse a) (parse b)
parse (NList [NSymbol "not", a]) = ENot (parse a)
parse (NList [NSymbol "get", NSymbol a]) = EGet a
parse (NList [NSymbol "set", NSymbol a, b]) = ESet a (parse b)
parse (NList [NSymbol "if", a, b, c]) = EIf (parse a) (parse b) (parse c)
parse (NList (NSymbol "seq" : xs)) = foldr1 ESeq $ map parse xs
parse (NList (NSymbol "while" : a : bs)) = EWhile (parse a) (foldr1 ESeq $ map parse bs)
parse (NList [NSymbol "do-while", a, b]) = EDoWhile (parse a) (parse b)
parse (NList [NSymbol "skip"]) = ESkip
parse (NList [NSymbol "write", a]) = EWriteByte (parse a)
parse (NList [NSymbol "read"]) = EReadByte
parse (NSymbol a) = EGet a
parse r = error $ "did not match: " ++ show r
```

[The JimScript source is on GitHub](https://github.com/jameshfisher/jimscript).
