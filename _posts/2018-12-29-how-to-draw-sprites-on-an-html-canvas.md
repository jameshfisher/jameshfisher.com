---
title: How to draw sprites on an HTML canvas
tags:
  - programming
  - animation
  - web
---

In [my previous post](/2018/12/28/a-cat-walk-cycle/)
I animated a "walk cycle" as a GIF.
In today's post I animate the walk cycle as a "sprite sheet"
drawn on an HTML canvas.
Here's the finished canvas:

<div><canvas id="canvas" style="image-rendering: pixelated;"></canvas></div>

This animation is generated from the following PNG image.
The PNG contains four sprites for the cat walk cycle,
plus a background that we will draw under the cat.

<p><img id="sprite" src="/assets/2018-12-29-sprite-canvas/cat-sprite.png" style="width: 480px; image-rendering: pixelated;"/></p>

This uses [the `ctx.drawImage` method of HTML canvas 2D context](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage).
`drawImage` can take an `Image` object as the source;
we give it an `Image` which has loaded the PNG.
This looks like:

```js
const canvasEl = document.getElementById("canvas");
const ctx = canvasEl.getContext("2d");
const imageEl = new Image();
function draw(sx, sy, w, h, dx, dy) {
  ctx.drawImage(imageEl, sx, sy, w, h, dx, dy, w, h);
}
```

Instead of relying on GIF for animation,
we use `window.requestAnimationFrame` in a loop,
and `window.setTimeout` to control the frame rate:

```js
imageEl.addEventListener("load", () => {s
  function loop() {
    // draw() here ...
    window.setTimeout(() => window.requestAnimationFrame(loop), 100);
  }
  window.requestAnimationFrame(loop);
});
```

At each frame,
we clear the canvas,
then draw the background,
then draw the cat:

```js
ctx.clearRect(0, 0, SPRITE_W, SPRITE_H);
const bgX = - ((frameNum * SPRITE_SPEED_PX) % BG_W);
draw(0, SPRITE_H, BG_W, BG_H, bgX,        0);
draw(0, SPRITE_H, BG_W, BG_H, bgX + BG_W, 0);
draw(SPRITE_W * (frameNum % SPRITE_NUM_FRAMES), 0, SPRITE_W, SPRITE_H, 12, 0);
```

<script>
    const SPRITE_NUM_FRAMES = 4;
    const SPRITE_W = 24;
    const SPRITE_H = 24;
    const SPRITE_SPEED_PX = 2;

    const BG_W = SPRITE_W * SPRITE_NUM_FRAMES;
    const BG_H = SPRITE_H;
    
    const CANVAS_W = 48;
    const CANVAS_H = SPRITE_H;

    const ZOOM = 10;

    const canvasEl = document.getElementById("canvas");
    canvasEl.width = CANVAS_W;
    canvasEl.height = CANVAS_H;
    canvasEl.style.width = (CANVAS_W*ZOOM) + "px";

    let frameNum = 0;

    const ctx = canvasEl.getContext("2d");
    const imageEl = new Image();

    function draw(sx, sy, sw, sh, dx, dy) {
      ctx.drawImage(imageEl, sx, sy, sw, sh, dx, dy, sw, sh);
    }

    imageEl.addEventListener("load", () => {
      function loop() {
        ctx.clearRect(0, 0, SPRITE_W, SPRITE_H);

        const bgX = - ((frameNum * SPRITE_SPEED_PX) % BG_W);

        draw(0, SPRITE_H, BG_W, BG_H, bgX,        0);
        draw(0, SPRITE_H, BG_W, BG_H, bgX + BG_W, 0);

        draw(SPRITE_W * (frameNum % SPRITE_NUM_FRAMES), 0, SPRITE_W, SPRITE_H, 12, 0);

        frameNum++;
        window.setTimeout(() => window.requestAnimationFrame(loop), 100);
      }
      window.requestAnimationFrame(loop);
    });
    imageEl.src = '/assets/2018-12-29-sprite-canvas/cat-sprite.png';
</script>
