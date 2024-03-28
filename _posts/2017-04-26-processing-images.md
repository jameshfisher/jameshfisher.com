---
title: How to apply a `CIFilter` to an image in Swift
justification: Future Vidrio feature requires image processing.
tags: []
summary: >-
  Using `CIFilter` to apply a sepia tone filter to an `NSImage` and save the result to a file.
---

```swift
import Foundation
import CoreImage
import AppKit
let nsImage = NSImage(contentsOfFile: "/Users/jim/Lenna.png")!
let cgImage = nsImage.cgImage(forProposedRect: nil, context: nil, hints: [:])!
let inputImage = CIImage(cgImage: cgImage)
let filter = CIFilter(name: "CISepiaTone")!
filter.setValue(inputImage, forKey: kCIInputImageKey)
filter.setValue(1, forKey: kCIInputIntensityKey)
let outputImage = filter.outputImage!
let rep = NSBitmapImageRep(ciImage: outputImage)
let imageData = rep.representation(using: NSBitmapImageFileType.PNG, properties: [:])!
try! imageData.write(to: URL.init(string: "file:/Users/jim/output.png")!, options: NSData.WritingOptions.atomic)
```
