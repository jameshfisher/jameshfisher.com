---
title: WebGL hello world
tags: []
---

<div><canvas id="canvas" width="100" height="100"></canvas></div>

<script>
  const canvasEl = document.getElementById("canvas");
  const ctx = canvasEl.getContext("webgl");
  ctx.clientWidth = canvas.width;
  ctx.clientHeight = canvas.height;
  ctx.clearColor(0,1,0,1);
  ctx.clear(ctx.COLOR_BUFFER_BIT);
</script>

You should see a green square above this line.
It's a `<canvas>` element, and its content is rendered with WebGL.
The code looks like this:

```html
<div><canvas id="canvas" width="100" height="100"></canvas></div>

<script>
  const canvasEl = document.getElementById("canvas");
  const ctx = canvasEl.getContext("webgl");
  ctx.clientWidth = canvas.width;
  ctx.clientHeight = canvas.height;
  ctx.clearColor(0,1,0,1);
  ctx.clear(ctx.COLOR_BUFFER_BIT);
</script>
```

For old-school HTML canvas, we use `canvasEl.getContext("2d")`.
For WebGL, we pass a different string: `"webgl"`.
(There are other strings available,
including `"webgl2"` and `"bitmaprenderer"`.)
A WebGL context is mostly unrelated to a `"2d"` context;
its methods and properties are entirely different.

The main thing we do is set the "color buffer" to entirely green.
(We also set up some canvas and GL client sizes.
I'll deal with canvas/CSS/GL dimensions in a future post.)
