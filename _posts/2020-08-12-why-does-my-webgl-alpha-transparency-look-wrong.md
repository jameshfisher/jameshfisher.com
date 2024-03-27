---
title: Why does my WebGL alpha-transparency look wrong?
tags:
  - programming
  - web
  - webgl
---

When using WebGL and creating a partially transparent canvas,
you may have noticed that the transparency _looks wrong_.
Perhaps you see harsh edges between areas with `alpha = 0` and areas with non-zero alpha.
In short, the solution to your problem is to write:

```javascript
const gl = canvas.getContext("webgl", { premultipliedAlpha: false });
```

But what is this doing, and what is "premultiplied alpha"?
First, let's see how normal alpha-compositing works.
The following is a `<div id="outer">` containing a `<div id="inner">`,
with this CSS:

```css
#outer { background-color: black; }
#inner { background-color: red; opacity: 0.5; }
```

<style>
#outer { background-color: black; }
#inner { background-color: red; opacity: 0.5; }
</style>

<div>
  <div id="outer" style="display: inline-block; padding: 1em;">
    <div id="inner" style="width: 3em; height: 3em;"></div>
  </div>
</div>

What color is the inner square?
Due to its `opacity: 0.5`,
it is half way between its own `red` color and the `black` color behind it.
Formally, the alpha-compositor performs this calculation:

```
composite = opacity*foreground + (1-opacity)*background
          = 0.5*red + 0.5*black
          = 0.5*rgb(255,0,0) + 0.5*rgb(0,0,0)
          = rgb(127,0,0) + rgb(0,0,0)
          = rgb(127,0,0)
```

We can verify this by observing that this looks the same:

```css
#outer2 { background-color: black; }
#inner2 { background-color: rgb(127,0,0); }
```

<style>
#outer2 { background-color: black; }
#inner2 { background-color: rgb(127,0,0); }
</style>

<div>
  <div id="outer2" style="display: inline-block; padding: 1em;">
    <div id="inner2" style="width: 3em; height: 3em;"></div>
  </div>
</div>

This is normal alpha-compositing, as performed by CSS and most other graphics systems.
I imagine normal alpha-compositing as modelling a "spray paint".
Your spray paint covers up the previous color of the surface,
and replaces it with the color of the spray paint.

But with premultiplied alpha,
the compositor instead performs this calculation:

```
composite = foreground + (1-opacity)*background
          = red + 0.5*black
          = rgb(255,0,0) + 0.5*rgb(0,0,0)
          = rgb(255,0,0) + rgb(0,0,0)
          = rgb(255,0,0)
```

Notice that the `foreground` color is not multiplied by the opacity in the calculation;
it is assumed to be "pre-multiplied" by the producer of the foreground.

This is the compositing equation used by default when the foreground is a WebGL canvas.
What is the point of this alternative alpha-compositing equation?
One advantage is efficiency;
the compositor saves a multiplication.
(Apparently there are also other advantages of correctness.)

Here's one way to premultiply alpha in a WebGL fragment shader:

```glsl
void main(void) {
  // ... do everything you were doing before, then ...

  gl_FragColor.rgb *= gl_FragColor.a;  // premultiply alpha
}
```

If your WebGL does not premultiply alpha,
you'll get weird results.
Note that colors can be outside the normal range.
For example,
if we were to place a red square on top of a white square, we'd get:

```
composite = foreground + (1-opacity)*background
          = red + 0.5*white
          = rgb(255,0,0) + 0.5*rgb(255,255,255)
          = rgb(255,0,0) + rgb(127,127,127)
          = rgb(382,127,127)
```

I'm not sure what the compositor is _supposed_ to do with the red value `382`.
Chrome's compositor seems to cap the values, i.e. the resulting pixel would be `rgb(255,127,127)`.

Another weird result of not pre-multiplying alpha is due to an optimization.
If `alpha == 0`, Chrome's compositor does not calculate `foreground + (1-alpha)*background`;
instead, it just takes `background`.
This is a safe optimization if the alpha has been premultiplied, because `foreground` will be zero.
But if it hasn't been premultiplied, this optimization means the `foreground` color is not added.
As a result, you'll see harsh transitions between pixels with `alpha == 0` and those with non-zero alpha.

So one way to fix this is to premultiply your alpha,
but another is to tell the browser to use the normal alpha-compositing function:

```javascript
const gl = canvas.getContext("webgl", { premultipliedAlpha: false });
```
