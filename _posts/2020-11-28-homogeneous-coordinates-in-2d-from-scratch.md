---
title: 'Homogeneous coordinates in 2D, from scratch'
tags:
  - mathematics
  - programming
  - js
  - graphics
---

Here's an animation of a spinning, orbiting rectangle.
You can also see, in black, the _projection_ of this rectangle,
as seen from the origin point (marked with a cross).
All of this is described with a tiny library
that uses _homogeneous coordinates_
to describe the rotation, scaling, translation, and projection.

<canvas id="anim" style="background-color: rgb(255,255,200); width: 400px"></canvas>

In [my previous post](/2020/11/27/a-matrix-library-in-5-lines-of-code/)
I showed a matrix library in 5 lines of code.
Matrices can describe several operations you will use in graphics programming;
most importantly, _rotation_ and _scaling_.

But for graphics programming,
plain linear algebra has at least two big deficiencies.
Linear functions can't describe _translation_ (that is, moving stuff!),
because they preserve the origin point.
And linear functions can't describe _projection_
(that is, simulating a camera),
because they keep parallel lines parallel.

The _homogeneous coordinates_ system is a kind of mathematical hack 
that allows describing translation and projection.
It builds on top of plain linear algebra,
but adds an extra dimension, usually called _w_.
Imagine all true 2D points being drawn on the plane `w=1`
by a laser pen that sits at the origin.
Or again, the point `[2,3]`
is modelled by all points that pass through the straight line going through `[0,0,0]` and `[2,3,1]` (the laser line).
Or again more formally,
the two-dimensional point `[2,3]`
is modelled by all three-dimensional points `[2w, 3w, w]`.

We can _translate_ the two-dimensional drawing on the `w=1` plane
by skewing space.
We move the `w` basis vector by the amount to translate.

And we can _project_ the two-dimensional drawing onto a one-dimensional line.
The very definition of homogeneous coordinates behaves like projection.
We can exploit this by squashing and skewing space.
(This projection transformation is a bit hard to describe.
I'll try to animate it in a future post.)

Here is my 6-line homogeneous coordinates library
(which builds on the 5-line matrix library in my previous post):

```js
const rotateHom2d = a => [[Math.cos(a), Math.sin(a), 0], [-Math.sin(a), Math.cos(a), 0], [0, 0, 1]];
const scaleSepHom2d = (s) => [ [s[0], 0, 0], [0, s[1], 0], [0, 0, 1] ];
const scaleHom2d = s => scaleSepHom2d([s,s]);
const translateHom2d = v => [[1, 0, 0], [0, 1, 0], [v[0], v[1], 1]];
const unHom2d = ([x,y,w]) => [x/w, y/w];

// Projects from origin onto line y=1. Results are in x-coord after normalizing with `unHom2d`.
const projectHom2d = [ [1,0,0], [0,1,1], [0,0,0] ];
```

In this post, I described homogeneous coordinates for transforming 2D space, and projecting it onto a line.
But it can be used in much the same way to transform 3D space, and project it onto a plane.
I'll show this in a future post.

<script>
  const canvasEl = document.getElementById("anim");
  canvasEl.width = 800;
  canvasEl.height = 500;
  const ctx = canvasEl.getContext("2d");

  const drawShape = shape => {
    ctx.beginPath();
    ctx.moveTo(shape[0][0], shape[0][1]);
    for (const p of shape.slice(1)) {
      ctx.lineTo(p[0], p[1]);
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

  const rotateHom2d = a => [[Math.cos(a), Math.sin(a), 0], [-Math.sin(a), Math.cos(a), 0], [0, 0, 1]];
  const scaleSepHom2d = (s) => [ [s[0], 0, 0], [0, s[1], 0], [0, 0, 1] ];
  const scaleHom2d = s => scaleSepHom2d([s,s]);
  const translateHom2d = v => [[1, 0, 0], [0, 1, 0], [v[0], v[1], 1]];
  const unHom2d = ([x,y,w]) => [x/w, y/w];

  const projectHom2d = [ [1,0,0], [0,1,1], [0,0,0] ];

  const drawShapeHom2d = shape => drawShape(shape.map(unHom2d));

  const unitSquare = [[-1, 1, 1], [-1, -1, 1], [1, -1, 1], [1, 1, 1]];
  const fatRectangle = matApplyToShape(scaleSepHom2d([1, 0.5]), unitSquare);

  const viewMatrix = matSeq([
    scaleHom2d(50),
    translateHom2d([canvasEl.width/2, 50]),  // move origin to center of canvas
  ]);

  const viewProjectionMatrix = matSeq([
    projectHom2d,
    viewMatrix
  ]);

  const onFrame = ts => {
    const spinAndOrbitAnimMatrix = matSeq([
      rotateHom2d(ts / 300),        // spinning
      translateHom2d([2, 0]),       // spinning off to the right
      rotateHom2d(ts / 3000),       // spinning, orbiting the origin
      translateHom2d([0, 4.5]),     // spinning, orbiting the origin, up above y=1 line
    ]);
  
    const objectWorldSpaceHom2d = matApplyToShape(spinAndOrbitAnimMatrix, fatRectangle);

    canvasEl.width = canvasEl.width; // clear

    ctx.strokeStyle = 'lightgrey';
    drawShapeHom2d(matApplyToShape(viewMatrix, [[-0.1,0,1], [0.1,0,1]])); // draw the origin
    drawShapeHom2d(matApplyToShape(viewMatrix, [[0,-0.1,1], [0,0.1,1]])); // draw the origin

    const yEquals1 = [[-1000,1,1], [1000,1,1]];
    drawShapeHom2d(matApplyToShape(viewMatrix, yEquals1));

    ctx.strokeStyle = 'red';
    drawShapeHom2d(matApplyToShape(viewMatrix, objectWorldSpaceHom2d));

    ctx.strokeStyle = 'black';
    drawShapeHom2d(matApplyToShape(viewProjectionMatrix, objectWorldSpaceHom2d));

    window.setTimeout(() => window.requestAnimationFrame(onFrame), 20);
  };

  window.requestAnimationFrame(onFrame);
</script>
