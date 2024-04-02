---
title: "Automatic differentiation with dual numbers"
tags: []
---

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

The poor man's way to answer this is _numerical differentiation_.
We can add a little bit to `x`, and see how much it changes the output:

```js
const changeToInput = 0.00000001;
const changeToOutput = distance(3 + changeToInput, 4) - distance(3, 4);
const derivative = changeToOutput / changeToInput;
```

We get that `derivative = 0.5999999608263806`.
That's `0.6`.
Well ... almost.
The numerical error is due to our `changeToInput = 0.00000001` not being infinitesimally small.

Here's a fun way to calculate this derivative
without this numerical flaw.

We'll start by saying that `ε`, or _epsilon_, is a special number that's infinitesimally small.
More precisely: it's not so small as to be zero,
but it's so small that _when you square it, you get zero_.

Then we'll calculate `distance(3+ε, 4)`,
and see how many `ε`s are in the output.
And that will be the true derivative!

Does `ε` really exist?
Not in our ordinary real numbers.
We'll just say it's a different kind of number!

What is `42 + 7ε`?
Well, because `ε` is a different kind of number,
we can't simplify this expression,
so we just leave it as `42 + 7ε`.

In general, we call these _dual numbers_.
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

Let's find the derivative of `x^2` at `x = 5` with a little math:

```
x   = 5 + ε
x^2 = x * x
    = (5 + ε)(5 + ε)
    = 5*5 + 2*5*ε + ε^2
    = 5*5 + 2*5*ε
    = 25 + 10ε
```

The value `10` there is the derivative of `x^2` at `x=5`!
We didn't have to remember any rules from school like "the derivative of `x^2` is `2x`".
The one rule that `e^2 = 0` got us all the way there.

We can write this in TypeScript:

```ts
function mul(x: Dual, y: Dual): Dual {
  return {
    val: x.val * y.val,
    der: x.der * y.val + x.val * y.der,
  };
}
```

We can do the same exercise for other primitive operations,
and end up with:

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

// ...
```

Now we can re-write our original `distance` function
to work with dual numbers instead of ordinary `number`s:

```ts
function distance(x: Dual, y: Dual): Dual {
  return sqrt(add(mul(x,x), mul(y,y)));
}
```

Then when we call `distance`, it will give us the ordinary output, plus the derivative!

```
> distance(
  { val: 3, der: 1 },  // adding ε to the first argument
  { val: 4, der: 0 }
)

{ val: 5, der: 0.6 }
```

You might know that differentiation
is at the heart of most machine learning.
For example, ChatGPT was trained by looking at each parameter,
and if the derivative of prediction error is positive for that parameter,
we reduce that parameter's value a little bit.

Do these machine learning systems use dual numbers?
No, because efficiency.
With this dual number system,
you have to run the function once for every parameter you want to know about.
GPT4 is estimated to have 1.76 trillion parameters,
which means running it 1.76 trillion times to tweak each parameter just once!

In the next post, we'll see _reverse-mode differentation_,
which lets us find the derivative for each parameter,
while running the function just once.