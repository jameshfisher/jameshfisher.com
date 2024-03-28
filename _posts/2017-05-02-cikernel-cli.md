---
title: How to make a Core Image kernel program running on the CLI
justification: I'm learning Core Image and Swift
tags: []
summary: >-
  A Swift CLI program that applies a Core Image kernel to image files, allowing
  operations like averaging two images.
---

Here's a CLI program which lets you apply a Core Image kernel to image files to generate a new image file. Example of use to average two images:

```
swift main.swift 'return (sample(i1, samplerCoord(i1)) + sample(i2, samplerCoord(i2))) / 2.0;' /Users/jim/Lenna.png /Users/jim/shapes.png /Users/jim/dev/kern_blend/out.png
```


```swift
import Foundation
import CoreImage
import AppKit
let kernelFunctionBody = CommandLine.arguments[1]
var imageArguments : [CIImage] = []
var outputRect = CGRect(x: 0, y: 0, width: 0, height: 0)
var kernelParams : [String] = []
for i in 2...CommandLine.arguments.count-2 {
  let nsImage = NSImage(contentsOfFile: CommandLine.arguments[i])!
  let cgImage = nsImage.cgImage(forProposedRect: nil, context: nil, hints: [:])!
  imageArguments.append(CIImage(cgImage: cgImage))
  outputRect = CGRect(x: 0, y: 0, width: cgImage.width, height: cgImage.width)
  kernelParams.append("sampler i" + String(i-1))
}
let kernelParamString = kernelParams.joined(separator: ", ")
let kernels = CIKernel.kernels(with: "kernel vec4 k(" + kernelParamString + ") {" + kernelFunctionBody + "}")!
let myKernel = kernels[0]
if #available(OSX 10.11, *) {
  let outputImage = myKernel.apply(
    withExtent: outputRect,
    roiCallback: { (Int32, CGRect) -> CGRect in return outputRect },
    arguments: imageArguments
  )!
  let rep = NSBitmapImageRep(ciImage: outputImage.cropping(to: outputRect))
  let imageData = rep.representation(using: NSBitmapImageFileType.PNG, properties: [:])!
  try! imageData.write(to: URL.init(string: "file:" + CommandLine.arguments[CommandLine.arguments.count-1])!, options: NSData.WritingOptions.atomic)
} else {
  print("Must have 10.11 or higher.")
}
```
