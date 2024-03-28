---
title: What is `CIColorKernel`?
justification: >-
  Vidrio's image transformations are pixel-wise, which color kernels are
  optimized for.
tags: []
summary: >-
  `CIColorKernel` is a type of `CIKernel` optimized for pixel-wise image
  transformations, with input as pixel samples instead of image samplers.
---

I've showed some uses of `CIKernel`, each of which produces an output pixel by transforming one pixel of some input images. To get the input pixels, I used code like this:

```c
vec4 i1_px = sample(image1, samplerCoord(image1));
vec4 i2_px = sample(image2, samplerCoord(image2));
```

Kernels of this form, which only examine one point of the input image, can instead be expressed as `CIColorKernel`s. Here's a `CIColorKernel` which composes two images with some opacity:

```c
kernel vec4 alpha_compose(__sample i1_px, __sample i2_px, float image2_opacity) {
  return i1_px*(1.0 - image2_opacity) + i2_px*image2_opacity;
}
```

Instead of the input being a `sampler` (an image), the input to a color kernel is a `__sample`, which is a `vec4` representing a pixel sample of an input image. A color kernel is strictly less flexible than a general kernel, which allows for some optimizations when executing it.

Here's the example kernel in use:

```
import Foundation
import CoreImage
import AppKit
let myKernel = CIColorKernel(string:
    "kernel vec4 alpha_compose(__sample i1_px, __sample i2_px, float image2_opacity) { " +
    "  return i1_px*(1.0 - image2_opacity) + i2_px*image2_opacity;" +
    "}")!
func ciImageFromPath(path: String) -> CIImage {
    let nsImage = NSImage(contentsOfFile: path)!
    let cgImage = nsImage.cgImage(forProposedRect: nil, context: nil, hints: [:])!
    return CIImage(cgImage: cgImage)
}
let inputImage1 = ciImageFromPath(path: "/Users/jim/shapes.png")
let inputImage2 = ciImageFromPath(path: "/Users/jim/Lenna.png")
let outputRect = CGRect(x: 0, y: 0, width: inputImage1.cgImage!.width, height: inputImage1.cgImage!.height)
let outputImage = myKernel.apply(
    withExtent: outputRect,
    roiCallback: { (Int32, CGRect) -> CGRect in return outputRect },
    arguments: [inputImage1, inputImage2, 0.2]
)!
let rep = NSBitmapImageRep(ciImage: outputImage.cropping(to: outputRect))
let imageData = rep.representation(using: NSBitmapImageFileType.PNG, properties: [:])!
try! imageData.write(to: URL.init(string: "file:/Users/jim/output.png")!, options: NSData.WritingOptions.atomic)
```
