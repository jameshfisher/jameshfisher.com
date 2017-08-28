---
title: "How to write a webcam app in Swift on macOS"
---

Here we set up a panel which displays the device webcam.

```swift
import Cocoa
import AVFoundation
class AppDelegate: NSObject, NSApplicationDelegate {
    var panel: NSPanel!
    var videoPreviewLayer:AVCaptureVideoPreviewLayer!
    var captureSession:AVCaptureSession!
    func applicationDidFinishLaunching(_ aNotification: Notification) {
        let screenRect:CGRect = NSScreen.main()!.frame
        panel = NSPanel(
            contentRect: NSRect(x: 0, y: 0, width: screenRect.width/2, height: screenRect.height/2),
            styleMask: NSWindowStyleMask.nonactivatingPanel,
            backing: NSBackingStoreType.buffered,
            defer: false
        )
        let lvl_key:CGWindowLevelKey = CGWindowLevelKey.maximumWindow
        let lvl:CGWindowLevel = CGWindowLevelForKey(lvl_key)
        panel.level = Int(lvl)
        panel.orderFront(nil)
        captureSession = AVCaptureSession()
        captureSession.sessionPreset = AVCaptureSessionPresetMedium
        let webcamCaptureDevice:AVCaptureDevice = AVCaptureDevice.defaultDevice(withMediaType: AVMediaTypeVideo)
        let webcamInput:AVCaptureDeviceInput = (try! AVCaptureDeviceInput(device: webcamCaptureDevice))
        captureSession.addInput(webcamInput)
        let view:NSView = NSView(frame: NSRect(x: 0, y: 0, width: 500, height: 500))
        view.wantsLayer = true
        videoPreviewLayer = AVCaptureVideoPreviewLayer(session: captureSession) as AVCaptureVideoPreviewLayer
        videoPreviewLayer.videoGravity = AVLayerVideoGravityResizeAspectFill
        videoPreviewLayer.frame = CGRect(x: -screenRect.width/2, y: 0, width: screenRect.width/2, height: screenRect.height/2)
        let viewLayer:CALayer = CALayer()
        viewLayer.frame = CGRect(x: 0, y: 0, width: 500, height: 500)
        viewLayer.addSublayer(videoPreviewLayer)
        viewLayer.sublayerTransform = CATransform3DMakeScale(-1, 1, 1)
        view.layer = viewLayer
        panel.contentView = view
        captureSession.startRunning()
    }
    func applicationWillTerminate(_ aNotification: Notification) {
        captureSession.stopRunning()
    }
}
let app: NSApplication = NSApplication.shared()
let appDelegate: AppDelegate = AppDelegate()
app.delegate = appDelegate
_ = NSApplicationMain(CommandLine.argc, CommandLine.unsafeArgv)
```
