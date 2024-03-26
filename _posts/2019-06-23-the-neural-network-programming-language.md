---
title: The neural network programming language
draft: true
tags:
  - neural-networks
  - ml
  - javascript
  - programming
  - machine-learning
taggedAt: '2024-03-26'
---

Here's a JavaScript function that
returns a positive value if both `x` and `y` are positive:

```js
function isNeg(x) {
  return Math.max(0, -x);
}
function bothPos(x, y) {
  return Math.max(0, 1-isNeg(x)-isNeg(y));
}
```

Surprise - the functions here are also neural networks!
Neural networks are usually drawn as labelled, weighted graphs,
but you can also view neural networks as a restricted programming language.

The above functions are in a subset of JavaScript that I call _NN_.
They approximate the one function below written in full JavaScript:

```js
function bothPos(x, y) {
  return x > 0 && y > 0;
}
```

This is perhaps how you might more naturally implement `bothPos`.
So why would we ever use this more restrictive neural network language?
Compared to JavaScript, the language _NN_ has two separate purposes.
Its first (philosophical) purpose is to model how real, physical neurons work.
Its second (much more specific) purpose is to allow for training:
you can take any function here,
compute its "loss" against a training set,
compute the _gradient_ of that loss,
then adjust the constant numbers in the function
to (hopefully) improve the function.

This language is quite restrictive.
Its only base data type is the floating-point number.
Its only expressions are (non-recursive) function calls
and the odd expression

```ebnf
expr ::=
  "Math.max(0, " ")"
```

This can't be done:

```js
function max(x, y) {
  // ???
}
```
