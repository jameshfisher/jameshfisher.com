---
title: Automatic differentiation with dual numbers
tags: ["machine-learning"]
summary: >-
  Differentiation asks: how does tweaking the inputs change the output?
  To accurately differentiate an arbitrary function,
  perhaps the simplest way is using "dual numbers".
---

Differentiation is the heart of most machine learning,
but how can we differentiate arbitrary functions?
Perhaps the simplest accurate method is using _dual numbers_.

Here's an example in JavaScript.
Say we're calculating the distance between two points using JavaScript:

```js
function distance(x, y) {
  return Math.sqrt(x * x + y * y);
}
```

```
> distance(3,4)
5
```

Now we want to ask:
how does tweaking `x = 3` change the output?
In math-speak, what's the _derivative_ of the distance with respect to `x`?

The poor man's way to answer this is [_numerical differentiation_](/2024/04/01/what-is-numerical-differentiation/).
We add a little bit to `x`,
and see how much it changes the output:

```js
const changeToInput = 0.00000001;
const changeToOutput = distance(3 + changeToInput, 4) - distance(3, 4);
const derivative = changeToOutput / changeToInput;
```

We get that `derivative = 0.5999999608263806`.
That's `0.6`.
Well ... almost.
The numerical error is due to our `changeToInput = 0.00000001` not being infinitesimally small.

Now let's calcuate the derivative without this numerical error!

We'll start by saying that `ε`, or _epsilon_, is a special number that's infinitesimally small.
More precisely:
it's not so small as to be zero,
but it's so small that _when you square it, you get zero_.

Then we'll calculate `distance(3+ε, 4)` in JS,
and see how many `ε`s are in the output.
And that will be the true derivative!

Does `ε` really exist?
Not in our ordinary real numbers.
We'll just say it's a different kind of number!

What is `42 + 7ε`?
Well, because `ε` is a different kind of number,
we can't simplify this expression,
so we just leave it as `42 + 7ε`.

In general, we call these [_dual numbers_](https://en.wikipedia.org/wiki/Dual_number).
They're of the form `a + bε`,
and we can represent them in TypeScript as:

```ts
type Dual = {
  // The ordinary real value part
  val: number;

  // How many tiny εs we have
  der: number;
};
```

You might vaguely remember rules from school like "the derivative of `x^n` is `n * x^(n-1)`",
or something about limits.
But dual numbers let us forget these rules and just use arithmetic!
For example, let's find the derivative of `x^2` at `x = 5`:

```
x   = 5 + ε
x^2 = x * x
    = (5 + ε)(5 + ε)
    = 5*5 + 2*5*ε + ε^2
    = 5*5 + 2*5*ε
    = 25 + 10ε
```

The value `10` there is the derivative of `x^2` at `x=5`!
We just used ordinary arithmetic, plus the rule that `ε^2 = 0`.

Now we can write this in TypeScript:

```ts
function mul(x: Dual, y: Dual): Dual {
  return {
    val: x.val * y.val,
    der: x.der * y.val + x.val * y.der,
  };
}
```

If we do the same exercise for other primitive operations like `add` and `sqrt`,
we end up with:

```ts
function add(a: Dual, b: Dual): Dual {
  return {
    val: a.val + b.val,
    der: a.der + b.der,
  };
}

function sqrt(a: Dual): Dual {
  return {
    val: Math.sqrt(a.val),
    der: a.der / (2 * Math.sqrt(a.val)),
  };
}
```

Now we can re-write our original `distance` function
to work with dual numbers instead of ordinary `number`s:

```ts
function distance(x: Dual, y: Dual): Dual {
  return sqrt(add(mul(x, x), mul(y, y)));
}
```

Now `distance` will give us the ordinary output, plus the derivative!

```
> distance(
  { val: 3, der: 1 },  // adding ε to the first argument
  { val: 4, der: 0 }
)

{ val: 5, der: 0.6 }
```

Do modern machine learning systems use this dual number trick?
No, because efficiency.
Above, you have to run the function once for every parameter you want to know about.
For GPT4, you'd have to run it 1.76 trillion times to tweak each parameter just once!

In the next post, we'll see _reverse-mode differentation_,
which lets us find the derivative for each parameter,
while running the function just once.
If you can't wait, take a look at [Andrej Karpathy's micrograd](https://github.com/karpathy/micrograd),
a famous implementation of reverse-mode autodiff.