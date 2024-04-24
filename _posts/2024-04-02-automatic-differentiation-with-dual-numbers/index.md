---
title: Automatic differentiation with dual numbers
tags:
  - machine-learning
summary: >-
  Differentiation asks: how does tweaking the inputs change the output? To
  accurately differentiate an arbitrary function, perhaps the simplest way is
  using "dual numbers".
hnUrl: 'https://news.ycombinator.com/item?id=39919049'
hnUpvotes: 2
---

<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/katex.min.css" crossorigin="anonymous">
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/katex.min.js" crossorigin="anonymous"></script>
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/contrib/auto-render.min.js" crossorigin="anonymous" onload="renderMath()"></script>
<script>
  function renderMath() {
    renderMathInElement(document.body,{
              delimiters: [
                  {left: "\\[", right: "\\]", display: true},
                  {left: "$", right: "$", display: false},
              ]
    });
  }
</script>

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

We'll start by saying that $\varepsilon$, or _epsilon_, is a special number that's infinitesimally small.
More precisely:
$\varepsilon$ is not so small as to be zero,
but $\varepsilon$ is so small that _when you square it, you get zero_.

Then we'll calculate $\text{distance}(3+\varepsilon, 4)$ in JS,
and see how many $\varepsilon$s are in the output.
And that will be the true derivative!

Does $\varepsilon$ really exist?
Not in our ordinary real numbers.
We'll just say it's a different kind of number!

What is $42 + 7\varepsilon$?
Well, because $\varepsilon$ is a different kind of number,
we can't simplify this expression,
so we just leave it as $42 + 7\varepsilon$.

In general, we call these [_dual numbers_](https://en.wikipedia.org/wiki/Dual_number).
They're of the form $a + b\varepsilon$,
and we can represent them in TypeScript as:

```ts
type Dual = {
  // The ordinary real value part
  val: number;

  // How many tiny epsilons we have
  der: number;
};
```

You might vaguely remember rules from school,
like the derivative of $x^n$ is $nx^{n-1}$,
or something about limits.
But dual numbers let us forget these rules and just use algebra!
For example, let's find the derivative of $x^2$ at $x = 5$.
We'll start by adding $\varepsilon$ to the input, to get $x = 5 + \varepsilon$.
Then we simplify $x^2$ with ordinary algebra:

<div>
  \[
  \begin{aligned}
  x^2 &= x \times x                                             \\
      &= (5 + \varepsilon)(5 + \varepsilon)                   \\
      &= (5 \times 5) + (\varepsilon \times 5) + (5\times\varepsilon) + \varepsilon^2 \\
      &= 25 + (2 \times 5 \times \varepsilon)                \\
      &= 25 + 10\varepsilon                                   \\
  \end{aligned}
  \]
<div>

The value $10$ there is the derivative of $x^2$ at $x=5$!
We just used ordinary arithmetic, plus the rule that $\varepsilon^2 = 0$.

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
  { val: 3, der: 1 },  // adding \varepsilon to the first argument
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
