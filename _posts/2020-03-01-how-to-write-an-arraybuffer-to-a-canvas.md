---
title: "How to write an ArrayBuffer to a canvas"
tags: ["programming", "javascript", "web"]
---

I'm playing with [WebGPU](https://github.com/gpuweb/gpuweb).
But it's currently very bleeding-edge,
and Chrome hasn't implemented direct GPU integration with `canvas` yet.
As a workaround to display stuff,
WebGPU lets you read data as an [`ArrayBuffer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer),
and we can write that `ArrayBuffer` to a `canvas` 
using the traditional `2d` context.
Here's a canvas which I've written an `ArrayBuffer` to:

<div>
  <canvas id="example-canvas" width="256" height="256"/>
</div>

The `ArrayBuffer` is interpreted as pixel data as follows.
Each pixel is four bytes: 
red, green, blue and alpha, in that order.
Pixels are in "reading" order:
top-to-bottom, left-to-right.
The `ArrayBuffer` contains no image dimension metadata,
or any other metadata.
We provide these dimensions by wrapping the `ArrayBuffer`
with an `ImageData`.
We can then pass that to `ctx.putImageData`.
To demonstrate,
here's the JavaScript that generated the canvas above:

```js
const ctx = canvas.getContext('2d');

const WIDTH = 256;
const HEIGHT = 256;

const arrayBuffer = new ArrayBuffer(WIDTH * HEIGHT * 4);
const pixels = new Uint8ClampedArray(arrayBuffer);
for (let y = 0; y < HEIGHT; y++) {
  for (let x = 0; x < WIDTH; x++) {
    const i = (y*WIDTH + x) * 4;
    pixels[i  ] = x;   // red
    pixels[i+1] = y;   // green
    pixels[i+2] = 0;   // blue
    pixels[i+3] = 255; // alpha
  }
}

const imageData = new ImageData(pixels, WIDTH, HEIGHT);
ctx.putImageData(imageData, 0, 0);
```

<script>
  const canvas = document.getElementById("example-canvas");
  const ctx = canvas.getContext('2d');

  const WIDTH = 256;
  const HEIGHT = 256;
  
  const arrayBuffer = new ArrayBuffer(WIDTH * HEIGHT * 4);
  const pixels = new Uint8ClampedArray(arrayBuffer);
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      const i = (y*WIDTH + x) * 4;
      pixels[i  ] = x;   // red
      pixels[i+1] = y;   // green
      pixels[i+2] = 0;   // blue
      pixels[i+3] = 255; // alpha
    }
  }

  const imageData = new ImageData(pixels, WIDTH, HEIGHT);
  ctx.putImageData(imageData, 0, 0);
</script>