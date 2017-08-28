---
title: "How to make a custom CIFilter in Swift"
justification: "Future Vidrio requires image filters"
---

Here's an example Swift program which will swap the red and green components of an image, and save the output to a file. It uses a custom `CIFilter`, which uses a GLSL kernel, the source of which is embedded in the program.

```swift
import Foundation
import CoreImage
import AppKit
let kernels = CIKernel.kernels(with:
    "kernel vec4 swapRG(sampler image) { " +
    "  vec4 t = sample(image, samplerCoord(image)); float r = t.r; t.r = t.g; t.g = r; return t;" +
    "}")!
let myKernel = kernels[0]
class SwapRedAndGreenFilter : CIFilter {
    var inputImage:CIImage?
    override var outputImage: CIImage? {
        let src = CISampler(image: self.inputImage!)
        return self.apply(myKernel, arguments: [src], options: nil)
    }
}
let nsImage = NSImage(contentsOfFile: "/Users/jim/Lenna.png")!
let cgImage = nsImage.cgImage(forProposedRect: nil, context: nil, hints: [:])!
let inputImage = CIImage(cgImage: cgImage)
let filter = SwapRedAndGreenFilter()
filter.setValue(inputImage, forKey: kCIInputImageKey)
let outputImage = filter.outputImage!
let rep = NSBitmapImageRep(ciImage: outputImage.cropping(to: CGRect(x: 0, y: 0, width: cgImage.width, height: cgImage.height)))
let imageData = rep.representation(using: NSBitmapImageFileType.PNG, properties: [:])!
try! imageData.write(to: URL.init(string: "file:/Users/jim/output.png")!, options: NSData.WritingOptions.atomic)
```
