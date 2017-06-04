---
title: "Defining the sine function as an oscillator"
---

When I do something trigonometric, I reach for a library implementing common trig functions, e.g. `Math.sin`. From school through university through work, I've been taught to treat these functions as black boxes. Before we had calculators at school, there were books of sine tables - more black boxes. How do these functions actually work? How do you define `sin(x)`?

```js
function sin(x) {
  return /* ??? */;
}
```

One definition of sine which I was familiar with is: sine is the function traced out by a point on a rotating circle, when viewing the circle from the edge. If you try to implementing sine with this definition, you look up the definition of a circle, plug in the angles, and get ...

```js
function sin(x) {
  return Math.sin(x);
}
```

... great. But a different definition of sine is: sine is the function traced out by an object on a spring. A spring exerts a force on the object, pushing it back towards the equilibrium. An ideal spring is a "simple harmonic oscillator", which means that it exerts a force proportional to the distance from the equilibrium.

Based on this definition, we can write a `sin` function which works by simulating a spring:

```js
var delta = 0.001;
function springSin(x) {
  var velocity = delta;
  var y = 0;
  for (var t = 0; t < x; t += delta) {
    y += velocity;
    velocity -= y * (delta * delta);
  }
  return y;
}
```

We can optimize this using the repeating and symmetric nature of the sine function:

```js
var delta = 0.001;
function optimizedSpringSin(x) {
  var sign = 1;
  if (x < 0) { x = -1; sign = -sign; }  // [0, inf]
  x = x % (2 * Math.PI); // [0, 2*Math.PI]
  if (Math.PI < x) { x -= Math.PI; sign = -sign; } // [0, Math.PI]
  if (Math.PI/2 < x) { x = Math.PI - x; } // [0, 1/2 Math.PI]
  // Now x is in [0, 1/2 PI]
  return springSin(x) * sign;
}
```

Here's a plot of the `Math.sin` function (green) next to the `optimizedSpringSin` function (black, slightly offset):

<canvas id="c"></canvas>
<script>
  var delta = 0.001;
  function springSin(x) {
    var velocity = delta;
    var y = 0;
    for (var t = 0; t < x; t += delta) {
      y += velocity;
      velocity -= y * (delta * delta);
    }
    return y;
  }
  function optimizedSpringSin(x) {
    var sign = 1;
    if (x < 0) { x = -1; sign = -sign; }  // [0, inf]
    x = x % (2 * Math.PI); // [0, 2*Math.PI]
    if (Math.PI < x) { x -= Math.PI; sign = -sign; } // [0, Math.PI]
    if (Math.PI/2 < x) { x = Math.PI - x; } // [0, 1/2 Math.PI]
    // Now x is in [0, 1/2 PI]
    return springSin(x) * sign;
  }

  var canvas = document.getElementById("c");
  var ctx = canvas.getContext("2d");
  canvas.width = 1000;
  canvas.height = 400;

  function clear() {
    ctx.fillStyle = 'white';
    ctx.fillRect(0,0,canvas.width, canvas.height);
  }

  function drawSin(sinf, color, offset) {
    ctx.fillStyle = color;
    for (var x = 0; x < canvas.width; x++) {
      ctx.fillRect(x, offset, 1, 1);
      ctx.fillRect(x, offset - sinf(x/50) * 50, 1, 1);
    }
  }
  clear();
  drawSin(Math.sin, 'green', 200);
  drawSin(optimizedSpringSin, 'black', 205);
</script>


Why does the iterative `springSin` function approximate the true sine function? Because there's a relationship between oscillation and circles/triangles. Unfortunately I don't understand that relationship.

The actual implementation of `sin` in math libraries uses a "Taylor series approximation" of the sine function. Unfortunately I don't understand that, either.
