---
title: How to pass multiple inputs to a `CIKernel`
justification: Vidrio will be using `CIKernel`s with multiple inputs.
tags: []
summary: >-
  A `CIKernel` in Swift can have multiple inputs, including image samplers and other data types. Example: an alpha-compositing kernel.
---

I previously described how to create a custom `CIFilter` which swapped the red and green channels of an input image. That filter had a single input parameter: the input image. But kernels are C functions, and they can have many parameters of many types.

Here's an example with multiple inputs. It alpha-composes two images with a configurable alpha value. (It ignores the alpha components of the input images and returns an opaque image.) Its parameters are therefore the two images (`sampler`s) and the alpha value for the top image (a `float`).

We don't actually need to create `CIFilter` objects at all! A `CIFilter` just wraps a `CIKernel` object, and the `CIKernel` is more interesting.

```swift
import Foundation
import CoreImage
import AppKit
let kernels = CIKernel.kernels(with:
    "kernel vec4 alpha_compose(sampler image1, sampler image2, float image2_opacity) { " +
    "  vec4 i1_px = sample(image1, samplerCoord(image1)); " +
    "  vec4 i2_px = sample(image2, samplerCoord(image2)); " +
    "  vec4 out_px = (i1_px * (1.0 - image2_opacity)) + (i2_px * image2_opacity); " +
    "  out_px.a = 1.0; " +
    "  return out_px;" +
    "}")!
let myKernel = kernels[0]
func ciImageFromPath(path: String) -> CIImage {
    let nsImage = NSImage(contentsOfFile: path)!
    let cgImage = nsImage.cgImage(forProposedRect: nil, context: nil, hints: [:])!
    return CIImage(cgImage: cgImage)
}
let inputImage1 = ciImageFromPath(path: "/Users/jim/shapes.png")
let inputImage2 = ciImageFromPath(path: "/Users/jim/Lenna.png")
let outputRect = CGRect(x: 0, y: 0, width: inputImage1.cgImage!.width, height: inputImage2.cgImage!.width)
let outputImage = myKernel.apply(
    withExtent: outputRect,
    roiCallback: { (Int32, CGRect) -> CGRect in return outputRect },
    arguments: [inputImage1, inputImage2, 0.2]
)!
let rep = NSBitmapImageRep(ciImage: outputImage.cropping(to: outputRect))
let imageData = rep.representation(using: NSBitmapImageFileType.PNG, properties: [:])!
try! imageData.write(to: URL.init(string: "file:/Users/jim/output.png")!, options: NSData.WritingOptions.atomic)
```

Notice that our kernel has normal typed parameters, but since we compile it at runtime in Swift, we don't have access to that type-safety. Instead, we pass arguments to our filter using `.apply`, with an array of arguments which are checked for compatibility at call-time.
