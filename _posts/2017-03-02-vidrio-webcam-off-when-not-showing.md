---
title: "Vidrio turns the webcam off when not showing it"
justification: "I want Vidrio to have a pause/unpause feature. This is a precursor."
---

[Vidrio](https://vidr.io/) has a slider which determines the opacity of the displayed webcam feed. You can slide this to 0%; this is identical to there being no webcam feed at all. In this situation, Vidrio should turn off the webcam feed and remove the overlay from the desktop. I can later implement pause/unpause on top of this: just set the opacity to 0%.

This was pretty simple:

```swift
var captureSession:AVCaptureSession!
// ...
if opacity == 0 {
    if captureSession.isRunning {
        captureSession.stopRunning()
    }
} else {
    if !captureSession.isRunning {
        captureSession.startRunning()
    }
}
```

Actually, the `stopRunning` and `startRunning` methods seem to be idempotent, so you can just do:

```swift
var captureSession:AVCaptureSession!
// ...
if opacity == 0 {
    captureSession.stopRunning()
} else {
    captureSession.startRunning()
}
```

I find the initial version clearer, so I went for that.
