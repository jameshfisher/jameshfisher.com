---
title: "WebGL canvas size vs. CSS size vs. viewport vs. clipspace vs. world space"
---

There are lots of different widths and heights in WebGL!
This post tries to clarify the pipeline
which transforms your world coordinates into physical pixels.
Start with a canvas:


```html
<canvas id="foo" width="150" height="100"></canvas>
```

The `width` and `height` attributes on the `<canvas>` element
specify how many canvas pixels you have to play with.
This canvas is a `width`x`height` array of logical pixels (RGBA points).
You use a 2D context or a WebGL context to draw to the canvas:

```js
const fooEl = document.getElementById("foo");
const gl = fooEl.getContext("webgl");
```

Your context ultimately edits a that array of RGBA points.
These are not physical pixels!
You get a bit closer to physical pixels by controlling the canvas's CSS:

```css
canvas#foo { width: 300px; height: 200px; }
```

The CSS `width` and `height`
specify how that canvas pixel array will be displayed.
The units above are CSS pixels, which still are not physical pixels.
The CSS sizes default to the same as the `width` and `height` attributes.
(This may be undesirable:
high-DPI screens can have four physical pixels per CSS pixel,
making your canvas blurry.
To deal with these screens, you can set the CSS sizes to double the canvas sizes.)

In WebGL, you draw to the canvas using shaders.
Your vertex shader does not use canvas space or CSS space;
it uses yet another space: "clip space".
Clip space is a square between `(-1,-1)` and `(1,1)`.
That is, the clip space square is two units wide and centered on the origin.
(Okay, you could say clip space is a cube. Ignore that for now.)

Drawing in clip space is transformed to the canvas pixel array by a "viewport".
The viewport defaults to stretching the two-unit square
to the full width and height of the canvas pixel array.
A new viewport can be set with `gl.viewport(x,y,width,height)`.
(You'll want to do this if you change the canvas array size.)

In summary, to draw to the screen in WebGL, there's a very long line of transformations:

```
vertex attributes --[vertex shader]--> clip space --[viewport]--> canvas space --[CSS]--> HTML frame space --[browser, OS, hardware]--> physical pixel space
```
