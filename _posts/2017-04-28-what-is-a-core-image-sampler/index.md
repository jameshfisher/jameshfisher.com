---
title: What are samples in a Core Image kernel?
tags: []
summary: >-
  Kernels in Core Image operate on output pixels, using `samplerCoord` to find
  corresponding input pixels. `sample` then retrieves the color of the input
  pixel. Kernel can apply transformations by modifying the `samplerCoord`
  expression.
---

Here's a Core Image kernel which swaps the red and green components of an image:

```c
kernel vec4 swapRG(sampler image) {
  vec4 t = sample(image, samplerCoord(image));
  float r = t.r; t.r = t.g; t.g = r;
  return t;
}
```

We have three separate mentions of "samples": The type `sampler`, and two functions `samplerCoord` and `sample`. Here are their types - verify that they match up with the program above:

```c
varying vec2 samplerCoord(uniform sampler src);
vec4 sample(uniform sampler src, vec2 point);
```

First you must understand that kernels are applied per _output_ pixel. Not per _input_ pixel! This approach of "working backwards" is more efficient. The naive approach of working forwards from source images can do a lot of unnecessary work, i.e. the work does not affect the output image, e.g. the work outputs a pixel at a position outside the output space.

To work backwards from an output pixel, we need to find the relevant input pixel for that output. This is what `samplerCoord` helps with. A call to `samplerCoord(image)` gives us the coordinate in the input which corresponds to the current coordinate in the output space. This means, every time the kernel is called, there is an implicit "current point" in the output space; this coordinate is the position of the pixel that we're drawing.

This is indicated by the keywords `uniform` and `varying`. The `varying` attribute on the `samplerCoord` return value indicates that it varies depending on the current coordinate. But it's not clear at this point why the current point can't be passed in to the kernel as a normal parameter, e.g.:

```c
kernel vec4 swapRG(vec2 output_coord, sampler image) {
  vec4 t = sample(image, samplerCoord(image, output_coord));
  float r = t.r; t.r = t.g; t.g = r;
  return t;
}
```

Notice that `samplerCoord` is parameterized by a `sampler`. A kernel can have multiple samplers (input images) as arguments. These images can overlap each other, so we need to be able to refer to each input image's space separately. The `samplerCoord` return value is a point in the space of `image` argument.

Notice also that `samplerCoord` does not return the _pixel_ in the input image; it only returns the _point_ in that input image _space_. To get the pixel at that point, we use the `sample` function. A call to `sample(image, pt)` gets the color of `image` at the point `pt`.

Assuming that our kernel has no transformations applied to the input images (so it maps input pixels 1:1 to output pixels), a call to `sample(image, samplerCoord(image))` gets us the input pixel color for the current output pixel.

We can modify the `samplerCoord(image)` expression to apply transformations. This flips the image vertically:

```c
kernel vec4 flipVertical(sampler image) {
  vec2 p = samplerCoord(image);
  vec4 ext = samplerExtent(image);
  p.y = ext[3] - p.y;
  return sample(image, p);
}
```

To flip the image, we flip the `y` coordinate. To flip the `y` coordinate, we negate it and add the total height of the image. To get the total height of the image, we use the `samplerExtent` function:

```c
uniform vec4 samplerExtent(uniform sampler src);
```

This returns a `vec4` representing `x`, `y`, `width` and `height`. To get the height, we index into the vector: `ext[3]`. AFAIK, there is no `ext.height` syntactic sugar (like the `px.a` syntactic sugar to get the alpha component of a pixel, which is the same as `px[3]`).

(I don't think this is a great way to do a horizontal flip. GL has other ways to do this which are more convenient and efficient.)
