---
title: "What is simulated annealing?"
tags: ["programming"]
---

Below you see a bunch of points,
and some lines jumping around.
The computer is trying to fit a straight line
to the points as closely as possible.
To do so, it's using a technique called _simulated annealing_.
In this post I show you
what simulated annealing is,
what problems it can solve,
and how to implement it.

<canvas width="400" height="400" style="height: 400px; width: 400px; border: 2px solid black;" id="chart"></canvas>
<p>
  <span id="state"></span>
  <button onclick="run()">Run it again!</button>
</p>

If you read [the Wikipedia page on simulated annealing](https://en.wikipedia.org/wiki/Simulated_annealing),
you'll find a bunch of physics mumbo-jumbo,
claiming that the algorithm is a simulation of how metals behave as they cool.
In reality,
"simulated annealing" is a just a variation of "trial-and-error",
a technique you learned in school!
In trial-and-error,
you repeatedly generate guesses
until you find the solution,
or until you find a guess that's good enough.
Simulated annealing improves on trial-and-error by

1. Generating the next guess
   by mutating a previous one.
2. Jumping around more at the beginning,
   and less as you come to the end.

Click the "Run it again" button above,
and you can see these two ideas in action.
The red line is the best guess so far;
the blue line is the current guess.
The blue lines are mutations of the red one,
and gradually, the mutations become less radical.
Here's the algorithm in JavaScript:

```js
// I chose zero as my initial guess
// (but you could start anywhere).
let best = [0,0,...];

for (let temp = 100; temp > 0.1; temp *= 0.95) {
  // Mutation. I've chosen to mutate more with temp.
  current = best + rand()*temp;

  if (loss(current) < loss(best)) {
    // Could accept this probabilistically with temp.
    best = current;
  } else {
    // Could probabilistically move anyway.
  }
}
```

The key idea in annealing is
"jumping around more at the beginning".
This idea helps if similar guesses tend to have similar error.
This is a property of most functions we want to optimize!
It includes, for example, all continuous functions.
(One thing that annealing shouldn't help for
is breaking a [cryptographic hash function](https://en.wikipedia.org/wiki/Cryptographic_hash_function),
where "a miss is as good as a mile".)

If similar guesses tend to have similar error,
we wish to seek out areas of generally low error.
Near the beginning,
we have no reason to think that we are in such an area,
so we should jump around more.
There are at least two ways to implement this
"jumping around more near the beginning":

1. Be more likely to accept the new guess _even if it's worse_.
   This will cause you to jump around more
   because your travel will be a _random walk_.
   This technique seems to be the traditional annealing algorithm.
2. Apply more mutation to the previous guess.
   This will cause you to jump around more
   because your jumps can skip directly over barriers.
   This technique is apparently called ["quantum annealing"](https://en.wikipedia.org/wiki/Quantum_annealing)
   (warning: another Wikipedia page of excessive physics).

In the algorithm above,
`temp` is the "temperature",
nomenclature from the traditional "annealing" analogy.
A better name might be `jumpiness`:
it controls how much to jump around.
As such, it gradually decreases with time.
Just like physical temperature,
I decided to reduce `temp` using exponential decay:
`temp *= 0.95`.
But many variations exist,
and you shouldn't get hung up on it.

<script>
  const rand = () => Math.random() - 0.5;

  const sleep = ms =>
    new Promise(resolve => setTimeout(resolve, ms));

  const comp = (m, x) => m.w * x + m.b;

  const canvas = document.getElementById('chart');
  const stateEl = document.getElementById('state');

  const ctx = canvas.getContext('2d');
  const pt = ([x,y]) => [200 + x*5, 200 - y*5];

  function redraw(points, current, best, t) {
    ctx.clearRect(0,0,400,400);

    ctx.strokeStyle = 'grey';

    ctx.beginPath();
    ctx.moveTo(...pt([-1000, 0]));
    ctx.lineTo(...pt([ 1000, 0]));
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(...pt([0, -1000]));
    ctx.lineTo(...pt([0,  1000]));
    ctx.stroke();

    for (p of points) {
      const [x,y] = pt(p);
      ctx.beginPath();
      ctx.arc(x,y,3,0,Math.PI*2,true);
      ctx.fill();
    }

    ctx.strokeStyle = 'red';
    ctx.beginPath();
    ctx.moveTo(...pt([-1000, comp(best, -1000)]));
    ctx.lineTo(...pt([ 1000, comp(best,  1000)]));
    ctx.stroke();

    ctx.strokeStyle = 'blue';
    ctx.beginPath();
    ctx.moveTo(...pt([-1000, comp(current, -1000)]));
    ctx.lineTo(...pt([ 1000, comp(current,  1000)]));
    ctx.stroke();

    stateEl.innerText = `Temperature: ${t.toFixed(2)}`;
  }

  function genPoints() {
    const m = {w: rand()*5, b: rand()*50};
    const points = [];
    for (let i = -30; i < 30; i += 0.5+rand()) {
      const pt = [i, comp(m, i)];
      pt[0] += rand()*10;
      pt[1] += rand()*10;
      points.push(pt);
    }
    return points;
  }

  const loss = (points, m) => {
    let total = 0;
    for ([x,y] of points) {
      total += Math.pow(comp(m,x) - y, 2);
    }
    return total;
  }

  let simId = 0;
  async function run() {
    const me = ++simId;

    const points = genPoints();

    let current = { w: 0, b: 0 };
    let best = current;

    for (let t = 50; t > 0.1; t *= 0.95) {
      if (simId !== me) return;
      redraw(points, current, best, t);
      current = {
        w: best.w + rand() * t, 
        b: best.b + rand() * t * 10
      };
      if (loss(points, current) < loss(points, best)) best = current;
      await sleep(100);
    }
  }
  run();
</script>