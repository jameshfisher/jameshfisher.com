---
title: >-
  devices(for:) was deprecated in macOS 10.15: Use
  AVCaptureDeviceDiscoverySession instead
tags:
  - programming
  - macos
  - swift
---

In my app, I had a call to [`AVCaptureDevice.devices()`](https://developer.apple.com/documentation/avfoundation/avcapturedevice/1386237-devices),
which looked like:

```swift
let avCaptureDevices = AVCaptureDevice.devices(for: AVMediaType.video)
```

Since macOS 10.15, this generates this deprecation warning:

> `devices(for:)` was deprecated in macOS 10.15: Use `AVCaptureDeviceDiscoverySession` instead.

Xcode sometimes gives a nice "Fix" button for deprecations,
but not this time.
So what is the equivalent of my old call to `AVCaptureDevice.devices()`?
The Apple docs don't say,
but I believe it is as follows:

```swift
let deviceDiscoverySession = AVCaptureDevice.DiscoverySession(
    deviceTypes: [ .builtInWideAngleCamera, .externalUnknown ],
    mediaType: .video,
    position: .unspecified
)
let avCaptureDevices = deviceDiscoverySession.devices
```

Non-obviously, you should include the device type `.externalUnknown`.
If you don't include `.externalUnknown`, 
your users won't be able to use that fancy new camera they bought.
This device type includes USB webcams,
which were only implicitly included in `AVCaptureDevice.devices(for: AVMediaType.video)`.
