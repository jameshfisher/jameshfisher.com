---
title: "Hand-coded neural networks"
tags: ["programming", "ml"]
draft: true
---

Here's a JavaScript function that
returns a positive value if both `x` and `y` are positive:

```js
function bothPos(x, y) {
  const negX = Math.max(0, -x);
  const negY = Math.max(0, -y);
  return Math.max(0, 1-negX-negY);
}
```

Surprise - this function is also a neural network!
Neural networks are usually drawn as

No, the neural network is not a series of neurons;
it's a JavaScript function which uses a restricted set of operations.

It approximates the function below,
which is perhaps how you might naturally implement it:

```js
function bothPos(x, y) {
  return x > 0 && y > 0 ? 1 : 0;
}
```

Hear "neural network" and you probably think "machine learning".
But it's useful to think of neural networks independently of machine learning.
