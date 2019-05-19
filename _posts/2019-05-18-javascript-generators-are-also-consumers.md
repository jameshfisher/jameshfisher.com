---
title: "JavaScript generators are also consumers!"
tags: ["programming", "javascript"]
---

[Yesterday, I introduced JavaScript _generators_]({% post_url 2019-05-17-what-is-function-star-in-javascript %})
motivated by the example of generating the Fibonacci sequence.
This is the way generators are usually introduced:
as _generators_ of data.
But, despite their name,
generators can also be _consumers_ of data!

Say you want to create a `metric` object
that your application can pass numbers to with `metric.log(4.3)`.
The `metric` object will batch these into groups of 5 numbers,
then send each batch to a central metric tracking system.
Here's how you could do it in traditional JavaScript:

```js
function Metric() {
  this.batch = [];
  this.log = function(n) {
    this.batch.push(n);
    if (this.batch.length == 5) {
      send(this.batch);
      this.numbers = [];
    }
  }
}
const metric = new Metric();

metric.log(2.3);
metric.log(42);
// ...
```

But with a _generator_,
you can implement the metric in one line:

```js
function* Metric() {
  for (;;) send([yield, yield, yield, yield, yield]);
}
const metric = Metric();
metric.next();

metric.next(2.3);
metric.next(42);
// ...
```

How does this work?
A generator is a kind of JavaScript iterator,
meaning you can call `.next()` on it.
Most standard iterators (like arrays)
will ignore any arguments passed to `.next()`,
but generators can accept arguments!
This is how we get numbers into our metric object:
`metric.next(2.3)`.

Conversely,
examples usually show the generator _providing_ data,
with expressions like `yield x`.
But the `yield` expression can also _consume_ data:
the expression `yield x` evaluates to
the value passed into the next `.next()` call.

Because we're using `yield` as part of a complex expression above,
evaluation order is important.
In the expression `[yield, yield, yield, yield, yield]`,
which order will they yield in?
[The JS spec demands that expressions in an array literal are evaluated left-to-right](http://www.ecma-international.org/ecma-262/5.1/#sec-11.1.4).
So the values in each batch will be in the order that they were produced by the application.

Notice, above, that we have to call `metric.next()`
to initialize the `metric`.
This pushes the generator's program counter
from the start of the function body
to the first `yield` expression,
making it ready to accept the first value in the array.
