---
title: Webcam video filter
draft: true
tags: []
---

We assume we have a video stream, e.g.:

```
let captureSession = AVCaptureSession()
captureSession.sessionPreset = AVCaptureSessionPresetPhoto
```

Then we add an output to the capture session:

```
let videoOutput = AVCaptureVideoDataOutput()
captureSession.addOutput(videoOutput)
```

Then we set a delegate for the `videoOutput`:

```
videoOutput.setSampleBufferDelegate(self, queue: DispatchQueue(label: "sample buffer delegate"))
```

The `videoOutput` will call 
`captureOutput(AVCaptureOutput!, didOutputSampleBuffer: CMSampleBuffer!, from: AVCaptureConnection!)` 
on its delegate whenever a new buffer is received from the `captureSession`, 
i.e. a new frame from the webcam. 
So we start to implement that:

```
func captureOutput(_ captureOutput: AVCaptureOutput!, didOutputSampleBuffer sampleBuffer: CMSampleBuffer!, from connection: AVCaptureConnection!) {
    // ...
}
```

From the sample buffer, we can get a `CVImageBuffer` (a "pixel buffer") with:

```
let pxbuf = CMSampleBufferGetImageBuffer(sampleBuffer)!
```

To apply a filter to this, we need to get it into the CoreImage framework, i.e. a `CIImage`:

```
let camImg = CIImage(cvImageBuffer: pxbuf)
```

We choose an arbitrary filter:

```
let comicEffect = CIFilter(name: "CIComicEffect")!
```

We call the filter with the `CIImage` as input and get a `CIImage` as output:

```
comicEffect.setValue(camImg, forKey: kCIInputImageKey)
let filteredCIImage = comicEffect.value(forKey: kCIOutputImageKey) as! CIImage!
```

Now we just need to repeatedly display the output `CIImage`.
