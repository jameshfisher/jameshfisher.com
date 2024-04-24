---
title: "What is Monte Carlo integration?"
tags:
  - monte-carlo-integration
  - monte-carlo
  - integration
  - numerical-methods
  - probability
  - statistics
  - math
  - programming
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

What's the average distance that someone can jump?
Let's estimate it!
I have a silly function that gives me
the distance that someone can jump,
based on their height `h` in centimeters:

```js
function jumpDistance(h: number): number {
  return h < 0 || h > 360 ? 0 : 300 * Math.sin(h * (Math.PI / 400));
}
```

Next we'll describe the heights of people in the population.
To start, let's say the population is just two people:
Jane is 160 cm tall, and Peter is 180 cm tall.
Then we can estimate the average jump distance:

```js
const janeJump = jumpDistance(160);
const peterJump = jumpDistance(180);
const averageJump = (janeJump + peterJump) / 2;
```

With a bigger population,
we can describe the population with an array of heights:

```js
const populationHeights = [160, 180, 170, 190, 150];
let totalJump = 0;
for (const h of populationHeights) {
  totalJump += jumpDistance(h);
}
const averageJump = totalJump / populationHeights.length;
```

For a yet larger population,
we can describe the population by keeping a tally for each height:

```js
const populationHeights = new Map([
  [160, 23],
  [170, 45],
  [180, 32],
  [190, 12],
  [200, 8],
]);
let totalJump = 0;
let totalPeople = 0;
for (const [h, count] of populationHeights) {
  totalJump += count * jumpDistance(h);
  totalPeople += count;
}
const averageJump = totalJump / totalPeople;
```

For an even larger population,
we can describe the population by a probability distribution,
like $\text{Normal}(\mu=170, \sigma=20)$.
Then the precise average jump distance is:

<p>
  \[
    \int_{h = -\infty}^{\infty} \text{jumpDistance}(h) \, \text{Normal}(h; \mu=170, \sigma=20) \, dh
  \]
</p>

Yuck!
Suddenly we can't solve the problem by just running the code,
because there are infinitely many heights to consider.
Our nice finite loop turned into an infinite integral.
And it's horrible to solve analytically,
especially because `jumpDistance` is a piecewise function.

What can we do instead?
If we have access to a function that gives us the population count at each height,
we can do what we were doing before,
but with some chosen heights:

```ts
function popCountForHeight(h: number) {
  return 1000 * Math.exp(-0.5 * ((h - 170) / 20) ** 2);
}

let totalJump = 0;
let totalPeople = 0;
for (let h = 0; h < 360; h += 1) {
  const count = popCountForHeight(h);
  totalJump += count * jumpDistance(h);
  totalPeople += count;
}
const averageJump = totalJump / totalPeople;
```

This approach could be called a Riemann sum.
One problem with this approach is that
we need to know a range of heights to consider
that will cover most of the population,
but not too much that we're wasting time on heights that are very unlikely.
Above, we chose to consider heights from 0 to 360 cm.

Another approach is to sample from the distribution:

```js
const populationHeights = new NormalDistribution({ mean: 170, stdDev: 20 });

let totalJump = 0;
let totalPeople = 0;
for (let i = 0; i < 1000; i++) {
  const h = populationHeights.sample();
  totalJump += jumpDistance(h);
  totalPeople++;
}
const averageJump = totalJump / totalPeople;
```

Surprise, this is Monte Carlo integration!