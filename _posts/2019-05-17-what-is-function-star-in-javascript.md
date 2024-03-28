---
title: What is `function*` in JavaScript?
tags:
  - programming
  - javascript
summary: >-
  JavaScript's `function*` defines a generator function, which can be used to
  generate and consume data.
---

In JavaScript, `function*` defines a _generator function_.
But what are generator functions,
and what are they useful for?
As an artificial task,
say you want to print the next Fibonacci number
every time the user presses a button,
like this:

<div>
  <button onclick="showNextFib()">Show next</button>
  <span id="fib"></span>
</div>

<script>
    const fibEl = document.getElementById("fib");
    let x = 1, y = 2;
    function showNextFib() {
      fibEl.innerText = x;
      const z=x+y;
      x = y;
      y = z;
    }
    showNextFib();
</script>

Since the mid-90s,
you could implement this in the browser with something like:

```js
<button onclick="showNextFib()">Show next</button>
<span id="fib"></span>

<script>
  const fibEl = document.getElementById("fib");
  let x = 1, y = 2;
  function showNextFib() {
    fibEl.innerText = x;
    const z=x+y;
    x = y;
    y = z;
  }
  showNextFib();
</script>
```

Depending on who you speak to,
this code has some problems.
It has global state,
so you can only have one Fibonacci sequence in your program.
And it mixes up the _abstract concept_ of Fibonacci numbers with the _display_ of those numbers.
You could solve these problems
by using [a JavaScript _iterator_](/2019/05/10/how-do-javascript-iterators-work/)
to generate the Fibonacci numbers:

```js
function FibIterator() {
  this.state = { x: 1, y: 2 };
  this.next = function() {
    const ret = this.state.x;
    const z = this.state.x + this.state.y;
    this.state.x = this.state.y;
    this.state.y = z;
    return { done: false, value: ret };
  }
};
const fibs = new FibIterator();
function showNextFib() {
    fibEl.innerText = fibs.next().value;
}
```

Above, the `fibs` object is defined with an internal `state`
plus a `next` function which steps from one state to the next,
and returns part of that state.
This is the general pattern of a JavaScript _iterator_.

Now we finally get to generators!
JavaScript, as of 2015,
gives you a fundamentally new way to implement `FibIterator`:
as a _generator function_.
It looks like this:

```js
function* FibIterator() {
  let x = 1, y = 2;
  for (;;) {
    yield x;
    const z=x+y;
    x = y;
    y = z;
  }
}
const fibs = FibIterator();
```

There are two new keywords here, `function*` and `yield`.
The `function*` keyword lets you declare a _generator function_
instead of a normal function.
When you call a generator function, like `FibIterator()`,
the function body is not actually executed,
and you do not get back that function's return value.
Instead, you get back an _iterator_.
You can think of the state of the iterator `fibs` as containing:

1. The state of the local variables in that function call.
   In our `FibIterator` example,
   `fibs.localVars` could be `x = 3; y= 5`.
2. A program counter.
   This points to one of the `yield` expressions in the function body
   (or to the start of the function body,
   if `.next()` hasn't been called yet).
   In our `FibIterator` example,
   `fibs.programCounter` could point to the `yield x` expression.

When the UI component of our program calls `fibs.next()`,
the runtime executes the function body of `fibs`,
starting at `fibs.ProgramCounter`,
with the local variables set to `fibs.localVars`.
If the execution hits a `yield x` expression,
the `fibs.next()` call returns `{ done: false, value: x }`.
If the execution instead hits a `return x` expression,
the `fibs.next()` call returns `{ done: true, value: x }`.

This mechanism lets us write `FibIterator` with an infinite loop,
using `for (;;)` or `while (true)`.
Normally in JavaScript,
infinite loops will lead to your program freezing
and your computer getting hot,
because nothing else can happen until that loop terminates.
But the `yield` expression lets you jump out of that infinite loop
to make progress on other useful things,
like drawing a new number to the screen and waiting for more input.

Now you've seen how JavaScript generators can be used to _generate_ data.
But, surprise, generators can also be used to _consume_ data!
[Read my next post to find out how ...](/2019/05/18/javascript-generators-are-also-consumers/)
