---
title: "Why is my WebGL texture upside-down?"
tags: ["programming", "webgl"]
---

To get a texture into your WebGL program,
you use [`texImage2D`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D),
and since you're on the web, you'll probably use an `<img>` element or similar as the source for the texture.
If you do, you'll be in for a confusing surprise when you render the texture:
it's upside-down!
The Y-axis is flipped!
Here's why, and how to fix it.
But if you're just here for the solution, you want:

```js
gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
```

The WebGL `texImage2D` function is a thin wrapper over
(the underlying `glTexImage2D` C function)[https://www.khronos.org/registry/OpenGL-Refpages/es2.0/xhtml/glTexImage2D.xml].
This C function does not take an `HTMLImageElement` source;
it just takes a `const void * data`.
It expects the pixels in that array to be stored in bottom-to-top order:

> The first element corresponds to the lower left corner of the texture image. 
> Subsequent elements progress left-to-right through the remaining texels in the lowest row of the texture image, 
> and then in successively higher rows of the texture image. 
> The final element corresponds to the upper right corner of the texture image.

Despite this,
[the spec for the WebGL `texImage2D` function](https://www.khronos.org/registry/webgl/specs/latest/1.0/#TEXIMAGE2D_HTML)
says:

> The first pixel transferred from the source to the WebGL implementation 
> corresponds to the upper left corner of the source.

So, the browser copies pixels from the `<img>` in top-to-bottom order,
even though OpenGL expects them in bottom-to-top order!
I can think of no reason for this perverse behavior
except that it's a mistake in the design of WebGL.

Happily, the spec basically admits that it's a mistake,
and provides a way to fix this behavior:

> This behavior is modified by the `UNPACK_FLIP_Y_WEBGL` pixel storage parameter, 
> except for `ImageBitmap` arguments, 
> as described in the abovementioned section.

So, it's highly likely that you want this for every program you write:

```js
const gl = displayCanvasEl.getContext("webgl");
gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
```

Strangely, you won't find this advice on MDN or elsewhere.