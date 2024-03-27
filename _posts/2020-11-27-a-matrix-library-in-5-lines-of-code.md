---
title: A matrix library in 5 lines of code
tags:
  - mathematics
  - programming
  - js
  - graphics
summary: >-
  A 5-line matrix library, and how to derive it without rote memorization.
---

Here's an animation of a pulsating rectangle, spinning around the origin.
It's nothing special, except that it's drawn with the power of ✨matrix math✨,
using my own matrix library (5 lines of code!).

<canvas id="anim" style="background-color: rgb(255,255,200); width: 400px"></canvas>

For years, on and off, I tried to internalize matrix operations, but it never stuck.
I remember watching a Khan Academy linear algebra course around ten years ago,
where Sal's guidance was basically,
"A matrix is a grid of numbers.
Here is the matrix multiplication number-crunching algorithm."

Sal Khan is a _great_ teacher, but this approach was wrong.
Recently, I watched [Grant Sanderson's _Essence of Linear Algebra_ course](https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab),
which made things not just clear, but almost ... obvious!
Here is the fundamental insight:
a matrix describes a linear function by recording where the basis vectors move to.
This insight is so important that I'll say it again:

> **A matrix describes a linear function by recording where the basis vectors move to.**

Everything else follows smoothly from this definition of a matrix.
Armed with just this insight,
I no longer have to _remember_ how to "multiply matrices".
Instead, I can just work it out from the definition
(which is that matrix "multiplication" is actually _function composition_.)
Here is my tiny matrix math library:

```js
const zipWith = (f, a, b) => a.map((k, i) => f(k, b[i]));  // helper

// Vector ops
const vecScale = (n, v) => v.map(c => n*c);
const vecAdd = (v1, v2) => zipWith((c1,c2)=>c1+c2, v1, v2);

// Matrix ops
const matApply = (mat, vec) => zipWith(vecScale, vec, mat).reduce(vecAdd);
const matMul = (m2, m1) => m1.map(v => matApply(m2,v));
```

In this system, matrices are written in "column-major format":
a list of basis vectors.
Here are some examples for 2D matrix math:

```js
const identity = [
  [1, 0],  // the x basis vector ("i-hat"). It hasn't moved anywhere.
  [0, 1],  // the y basis vector ("j-hat"). It hasn't moved anywhere.
];

const rotateClockwise90 = [
  [-1, 0],  // the rotated x basis vector ("i-hat")
  [ 1, 0],  // the rotated y basis vector ("j-hat")
];

// Common matrix constructors
const rotate = a => [[Math.cos(a), Math.sin(a)], [-Math.sin(a), Math.cos(a)]];
const scaleSep = (s) => [ [s[0], 0], [0, s[1]] ];
const scale = s => scaleSep([s,s]);
```

For my purposes (graphics programming),
linear functions have at least two big deficiencies.
Linear functions can't describe _translation_ (that is, moving stuff!),
because they preserve the origin point.
And linear functions can't describe _projection_
(that is, simulating a camera),
because they keep parallel lines parallel.

[In my next post, I describe _homogeneous coordinates_](/2020/11/28/homogeneous-coordinates-in-2d-from-scratch/),
a mathematical hack that builds on top of plain linear algebra,
and allows describing translation and projection.
Stay tuned!

<script>
  const canvasEl = document.getElementById("anim");
  canvasEl.width = 800;
  canvasEl.height = 500;
  const ctx = canvasEl.getContext("2d");

  const drawShape = shape => {
    ctx.beginPath();
    ctx.moveTo(shape[0][0] + canvasEl.width/2, shape[0][1] + canvasEl.height/2);
    for (const p of shape.slice(1)) {
      ctx.lineTo(p[0] + canvasEl.width/2, p[1] + canvasEl.height/2);
    }
    ctx.closePath();
    ctx.lineWidth = 4;
    ctx.stroke();
  };

  const zipWith = (f, a, b) => a.map((k, i) => f(k, b[i]));

  const vecScale = (n, v) => v.map(c => n*c);
  const vecAdd = (v1, v2) => zipWith((c1,c2)=>c1+c2, v1, v2);
  const matApply = (mat, vec) => zipWith(vecScale, vec, mat).reduce(vecAdd);
  const matMul = (m2, m1) => m1.map(v => matApply(m2,v));

  // Convenience fns
  const matSeq = ms => ms.slice(1).reduce((acc,m) => matMul(m,acc), ms[0]);
  const matApplyToShape = (m, s) => s.map(p => matApply(m, p));

  // Done with generic matrix lib
  // Now our 2D homogeneous coordinates lib

  const rotate = a => [[Math.cos(a), Math.sin(a)], [-Math.sin(a), Math.cos(a)]];
  const scaleSep = (s) => [ [s[0], 0], [0, s[1]] ];
  const scale = s => scaleSep([s,s]);

  const unitSquare = [[-1, 1], [-1, -1], [1, -1], [1, 1]];
  const fatRectangle = matApplyToShape(scaleSep([1, 0.5]), unitSquare);

  const viewMatrix = scale(50);

  const onFrame = ts => {
    const animMatrix = matSeq([
      rotate(ts / 300),
      scale(Math.sin(ts/1000)),
    ]);

    const objectWorldSpace = matApplyToShape(animMatrix, fatRectangle);

    canvasEl.width = canvasEl.width; // clear

    ctx.strokeStyle = 'lightgrey';
    drawShape(matApplyToShape(viewMatrix, [[-0.1,0], [0.1,0]])); // draw the origin
    drawShape(matApplyToShape(viewMatrix, [[0,-0.1], [0,0.1]])); // draw the origin

    ctx.strokeStyle = 'black';
    drawShape(matApplyToShape(viewMatrix, objectWorldSpace));

    window.setTimeout(() => window.requestAnimationFrame(onFrame), 20);
  };

  window.requestAnimationFrame(onFrame);
</script>
