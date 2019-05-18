---
title: "What are symbols in JavaScript?"
tags: ["programming", "javascript"]
---

I stumbled across "symbols" 
when reading about JavaScript iterators.
Here's what I saw:

```js
const myIterable = {};
myIterable[Symbol.iterator] = 
  () => { /* ... */ };
```

An iterable has the unusual property `Symbol.iterator`,
but what on earth is `Symbol.iterator`?
According to Node:

```
$ node
> Symbol.iterator
Symbol(Symbol.iterator)
> typeof Symbol.iterator
'symbol'
```

Apparently `Symbol.iterator` has the type `symbol`.
If you learned JavaScript before 2015, this type didn't exist.
It seems that `symbol` is the only new JavaScript type
that has been added since JavaScript was created!
The others are `object`, `function`, `string`, `number`, `boolean`, and `undefined`.

Why was it so important to create a fundamental new data type?
Wouldn't `myIterable.iterator = ...` be enough?
No: this could clash with an existing property on the object called `iterator`.
By introducing the new `symbol` type,
the JavaScript designers were able to introduce `myIterable[Symbol.iterator]`
without the possibility of this clashing with existing properties.

You can create your own symbols with the `Symbol` function:

```
$ node
> Symbol("foo")
Symbol(foo)
> typeof Symbol("foo")
'symbol'
```

Behind the scenes,
there is a _symbol registry_.
You can think of this registry as an array of strings:

```
const registry = ["Symbol.iterator", "foo"]
```

Every time you call `Symbol(description)`,
it pushes the new string `description` to the array,
and gives you back a new `symbol` 
that contains the index of the latest string the registry.
So, given the registry above,
`Symbol("bar")` would modify the registry to `["Symbol.iterator", "foo", "bar"]`,
then return a `symbol` containing the index `2`.

Given a symbol,
you can get the description that was passed in
using `.description`.
The expression `s.description` effectively returns `registry[s]`:

```
$ node
> x = Symbol("foo")
Symbol(foo)
> x.description
'foo'
> y = Symbol()
Symbol()
> y.description
undefined
> Symbol.iterator.description
'Symbol.iterator'
```

So far, you could simulate symbols yourself using an array,
just like above - so why do they have their own new type?
Symbols are useful because of what you _can't_ do with them.
Given a `symbol`,
you cannot get access to the symbol's registry index.
The only things you can do with a symbol
are compare it to something else,
or look it up in an object
(or get the string description - an unusual operation).

Symbol comparison uses the symbols' registry indexes;
not the string descriptions!
Try it out:

```
$ node
> foo1 = Symbol("foo")
Symbol(foo)
> foo2 = Symbol("foo")
Symbol(foo)
> foo1 === foo2
false
> foo1 === foo1
true
```

The above example added two new `"foo"` descriptions
to the registry, so it would look like the following:

```
const registry = [..., "foo", "foo"]
```

So far, I've referred to "the registry",
but actually there are many.
First, there is one registry per "JavaScript realm".
In the browser, this basically means one per page/tab.
This is the registry you're modifying when creating symbols with `Symbol("foo")`.
But there is an additional table,
the "_global_ symbol registry",
which is shared between multiple realms.
(Just how "global" it is seems to be undefined.)

The _global_ registry is accessed with `Symbol.for`,
which acts a bit like `Symbol`:

```
$ node
> foo1 = Symbol.for("foo")
Symbol(foo)
> foo2 = Symbol.for("foo")
Symbol(foo)
> foo3 = Symbol("foo")
Symbol(foo)
> foo1 === foo2
true
> foo1 === foo3
false
```

Notice that `Symbol.for` does not create a new symbol every time.
If a symbol already exists with that description in the global registry,
it will return that symbol.
This means that, unlike the per-realm registries,
the global registry has unique symbol descriptions.

So, actually, a `symbol` is not just an index.
It also carries along with it 
a reference to the registry that it's a member of.
You can't _easily_ tell, given a symbol,
which registry it's a member of.
But you can exploit what we know
to determine whether a symbol 
is a member of the global registry:

```
> isGlobalSymbol = (s) => Symbol.for(s.description) === s
[Function: isGlobalSymbol]
> isGlobalSymbol(foo1)
true
> isGlobalSymbol(foo2)
true
> isGlobalSymbol(foo3)
false
```
