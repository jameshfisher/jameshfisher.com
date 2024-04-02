---
title: What is automatic differentiation?
tags: []
summary: >-
  Differentiation asks: how does tweaking the inputs change the output?
  Numerical differentiation is a simple, general way to do this.
  But it's not very accurate, and it's inefficient when there are many inputs.
---

In school, we learned how to differentiate some functions.
Maybe you remember that the derivative of `x^2` is `2x`.
But could you differentiate an _arbitrary JavaScript function_?
And what would that even mean?

Let's start small:

```js
function f(x) {
  return 7 * x;
}
```

How might you differentiate `f`?
Let's start with the stupidest thing that works!:

```
> f(3)
21
> f(3.01)
21.07
```

What happened here?
We increased the input `x` by `0.01`,
and as a result, the output increased by `0.07`.
The output increase was 7 times more than our change to the input.
In math-speak, we say that the _derivative_ of `f(3)` with respect to `x` is 7.

We've just discovered the simplest, stupidest form of differentiation:

```js
function derivative(f) {
  return (x) => {
    const changeToInput = 0.00000001;
    const changeToOutput = f(x + changeToInput) - f(x);
    return changeToOutput / changeToInput;
  };
}
```

With our magic `derivative` function,
we can differentiate `x^2` to get a function equivalent to `2x`:

```
> function square(x) { return x * x; }
> const derivative_of_square = derivative(square);
> derivative_of_square(-13)
-26
```

But JS functions can have multiple parameters.
Here's one that multiplies its arguments:

```js
function mul(a, b) {
  return a * b;
}
```

What would it even mean to find the derivative of `mul(2, 3)`?
Which argument are we tweaking, `a` or `b`?
Let's try it with both:

```
> mul(2, 3)
6
> mul(2.01, 3)
6.03
> mul(2, 3.01)
6.02
```

Above, we see that the derivative for `a` is `0.03 / 0.01 = 3`,
and the derivative for `b` is `0.02 / 0.01 = 2`.
We can package this up nicely as the array `[3, 2]`.
In math-speak, the values in this array are called _partial derivatives_,
and the entire array is called the _Jacobian_ of the `sum` function.

We can modify our `derivative` function to
find the partial derivative for each parameter,
and return the array:

```js
function derivative(f) {
  return (...args) => {
    const changeToInput = 0.00000001;

    const derivatives = [];

    for (let i = 0; i < args.length; i++) {
      const changedArgs = [...args];
      changedArgs[i] += changeToInput;
      const changeToOutput = f(...changedArgs) - f(...args);
      derivatives.push(changeToOutput / changeToInput);
    }

    return derivatives;
  };
}
```

Using this, we can find the derivative of `mul` at the arguments `(2, 3)`:

```
> derivative(mul)(2, 3)
[ 3, 2 ]
```

This is the simplest numerical differentiation method.
Its biggest problem is efficiency.
If the function `f` has a million parameters,
then evaluating `derivative(f)(...)` calls the function `f` two million times!
In the next post, we'll see _automatic differentiation_,
a technique that only calls `f` once.
