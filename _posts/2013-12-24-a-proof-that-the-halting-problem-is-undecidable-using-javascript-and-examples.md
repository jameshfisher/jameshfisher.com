---
title: "A proof that the Halting problem is undecidable, using JavaScript and examples"
tags: ["programming"]
---

Having read a few proofs that the halting problem is undecidable,
I found that they were quite inaccessible 
(using no examples, or obscure programming languages),
or that they glossed over important details 
(such as the distinction between a program and its source).
To counter this, I've attempted to re-hash the proof 
using a familiar language, JavaScript,
with numerous examples along the way.

This famous proof tells us that there is no general method
to determine whether a program will finish running.
To illustrate this, 
we can consider programs as JavaScript function calls,
and ask whether it is possible to write a JavaScript function which will tell us
whether a function call will ever return.

Programs, modelled as JavaScript function calls,
consist of a JavaScript anonymous function and a list of arguments in parentheses.
Anonymous functions look like `(function (x, y) { return x + y == 3; })`,
or `(function (x) { return x.length > 0; })`.
They can take as many parameters as they like.
Arguments look like `('foo', 'bar')`, or `('blah')`.
Putting an anonymous function and some function arguments together,
we get a function call, like `(function (x) { return 0 < x; })(1)`.
This function call is a program, and when run, it returns `true`, since `0 < 1`.

Notice that both JavaScript functions and function arguments can be encoded as strings.
The function `(function (x, y) { return x + y == 3; })`
is simply encoded as the JavaScript string `"(function (x, y) { return x + y == 3; })"`,
and the input `('foo', 'bar')` is encoded as `"('foo', 'bar')"`.

A function can be run on an input 
by encoding both as strings, 
concatenating them, 
and running `eval` on that string.
For example, to run the function `(function (x) { return x == 0; })` on on arguments `(3)`,
we encode them as strings `"(function (x) { return x == 0; })"` and `"(3)"`,
concatenate them to get `"(function (x) { return x == 0; })(3)"`,
and run `eval("(function (x) { return x == 0; })(3)")`,
which will evaluate to `false`.

However, `eval` does not always evaluate to a value.
We might pass `eval` a string that is not syntactically correct (say, `"(+("`),
in which case `eval` always notices and informs us that the string has a syntax error.

More perniciously, if we define the program badly,
the interpreter might not evaluate to anything at all:
it will just keep running forever.
The simplest example would be 
a string-encoded program like `"(function () { while (true); })()"`,
which will make `eval` run forever.
`eval` does not notice when we give it a program that will run forever;
it simply runs it forever.

Therefore, `eval` will always do one of the following things:

* complain about a syntax error
* return a value, such as `false`
* run forever

If `eval` does not run forever 
(i.e. it has a syntax error, or it returns a value), 
we say that it *halts*.
Now, wouldn't it be nice if `eval` complained when it is not going to halt,
just like it complains if we give it a program with a syntax error?
Let's think about how we could get it to do that.

We want to write a function `h = function (funcString, argString) { ... }` which,
when given a string-encoded function `funcString` and string-encoded arguments `argString`,
tells us whether `eval(funcString + argString)` would halt.
For example, `h("(function (x,y) { return x < y; })", "(5,3)")` 
must return `true` 
because `eval` would halt, 
returning `false`.
Also, `h("(", "((")` must return `true`, 
because there is a syntax error.
But `h("(function () { while (true); })", "()")` must return `false`, 
because it would cause `eval` to loop.

How might we implement `h`?
We might start by checking for syntax errors:
we can define a parser and parse the strings;
if they don't parse, we return `true`.
After that, we need to check whether the parsed program would halt.
We could perform simple checks:
if the program just has a single `return` statement, it must halt, so return `true`.
We could perform more intelligent checks:
if the program has no loops, 
it must get to the end of the program and halt; 
so we return `true`.
We could check if all the loops look like `for (var i = 0; i < n; i++) { ... }`;
if they do, then all those loops will end when `i` reaches `n`,
and the program will halt when all the looping ends; so we return `true`.
We could even run the program for a little while, 
and if it halts, then we can return `true`.

But when can we return `false`?
If we just return `false` after doing all the checks we can think of,
then we might incorrectly identify some halting inputs as not halting.
So what we really need is a single, unified way to check whether it halts.

It's fun to think of more powerful ways that we could check for halting.
Sadly, though, Alan Turing burst this bubble in 1936,
by showing that however you write `h`, it will always have a bug.
Whatever your `h` looks like, there will always be arguments to it 
which cause your program to either 

* incorrectly return `true` (i.e., your `h` says it halts, but actually it doesn't), or 
* incorrectly return `false` (i.e., your `h` says it doesn't halt, but actually it does), or
* go into a loop (which is a bug).

Turing's proof works by contradiction:
assume that you have written a correct version of `h`,
and then show that this leads to an absurdity.
Specifically, and strangely, 
we can show that if your version of `h` is correct, 
then it must have a bug!
From this reasoning, 
it follows that your `h` must always have a bug:
if it does have a bug, it obviously has a bug,
but if it doesn't have a bug, then, well, it must have a bug!

So let's assume you've written a correct `h`, 
which looks like `function (funcString, argString) { ... }`.
Then we can define another function, `g`, which looks like this:

```js
// Your correct solution for h
var h = function (funcString, argString) { ... };

var g = function (funcString) {
  // Notice we pass in funcString as the *arguments* string 
  // as well as the function string!
  if (h(funcString,funcString)) {
    while (true);
  }
  else {
    return false;
  }
}
```

So `g` is a function which takes a string-encoded function as an argument.
Here's what `g(funcString)` does:

* if `funcString(funcString)` halts, `g` loops.
* otherwise, `g` returns `false`.

Passing a function to itself is a little mind-bending, 
so let's work through some examples.
What would `g("(function (x) { return 2; })")` do?
Well, it first passes that string to `h`, which tells us whether this halts:

```js
eval("(function (x) { return 2; })(function (x) { return 2; })")
```

Try it for yourself: 
it halts, and returns `2`. 
So `h` would tells us that this halts,
i.e. `h` returns `true`.
Because of this, `g` then goes into an infinite loop.

Now let's try `g("(function () { while (true); })")`.
This program would simply loop, ignoring its arguments.
Specifically, when passed itself as an argument, 
it ignores it, and loops forever.
So `h("(function () { while (true); })", "(function () { while (true); })")`
would return `false`.
In this case, `g` returns `false`.

The function `g`, like `h` and everything else, can be written as a string:

```js
var gString = "(function (funcString) { if (h(funcString,funcString)) { while (true); } else { return false; }})";
```

What is the point of this nonsense function `g`?
Here's where it gets really interesting.
A crazy thought: what happens if we run `g(gString)`?
That is, what happens when we call `g` with the string-encoded version of itself as its own argument?
Well, running through it, `g` passes the string to `h` as both arguments, like so:

```js
if (h(gString,gString)) {
  while (true);
}
else {
  return false;
}
```

Now `h` either returns `true` or returns `false`.
It turns out that, in either case, we get a strange contradiction:

* Assume `h(gString,gString)` returns `true`.
  Then, because our definition of `h` is correct,
  `h` is is telling us that `eval(gString + gString)` halts.
  What is `eval(gString + gString)`?
  It is the same as `g(gString)`.
  Therefore, `h` is telling us that `g(gString)` halts.

  But look at the definition of `g`:
  when `h` returns `true`, `g` loops!
  So `g(gString)` does not halt,
  i.e., `h` has given us the wrong answer!

* Assume `h(gString,gString)` returns `false`.
  Then `h` is is telling us that `eval(gString + gString)`, i.e. `g(gString)`, does not halt.

  But by the definition of `g`,
  when `h` returns `false`, `g` returns `false`, i.e. it halts!
  So `g(gString)` does halt,
  and, `h` has given us the wrong answer!

So whether `h` returns `true` or `false`, 
it gives us the wrong answer.
But this was all based on the assumption that our definition of `h` was correct:
so if `h` is correct, then 
we can define a string `gString` such that `h(gString,gString)` is incorrect.
Therefore, writing a correct version of `h` is impossible, and this is the halting problem!

_[This article was previously published here](https://www.reddit.com/r/programming/comments/1tm041/a_proof_that_the_halting_problem_is_undecidable/)._