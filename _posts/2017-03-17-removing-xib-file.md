---
title: How to make a Cocoa application without a `.xib` file
justification: Vidrio has some random .xib file which I want to get rid of.
tags:
  - ios
  - macos
  - app-development
  - xcode
  - objective-c
  - swift
  - cocoa
  - nib-file
  - xib-file
taggedAt: '2024-03-26'
---

In XCode, go to `File > New > Project...` and select "Cocoa Application". Call it "Foo", then uncheck all of the "Use Storyboards", "Use Core Data", and other nonsense. You get a project which, when you run it, displays a window with the title "Foo". How does that window get there?

Turns out, even though you unchecked "Use Nonsense", you still get a nonsense file: that `MainMenu.xib`. What is it, and how do we get rid of it? Cocoa applications begin with a call to [`NSApplicationMain`](https://developer.apple.com/reference/appkit/1428499-nsapplicationmain). In C and Objective-C, you call `NSApplicationMain` from your `main` function. The call to `NSApplicationMain` never returns; instead, it sets up the UI event loop which runs until the program exits with the `exit` function.

It is the `NSApplicationMain` call which "loads the main nib file from the application’s main bundle". (For "nib", read "xib": the "nib" format is an older syntax which was replaced with the XML-based "xib" format.)

It is unclear how `NSApplicationMain` finds the "main xib file" which it loads. One way is via the `NSMainNibFile` in your `Info.plist` file. However, if you remove this key in the `plist` file, Cocoa still finds your xib file. It will even find your xib file if you rename it `Foo.xib`. It is as if Cocoa falls back to a general search for files ending in `.xib`.

If, like me, you're using Swift, it will also be unclear how `NSApplicationMain` is called. You will have seen [the similarly named `@NSApplicationMain` annotation on your `AppDelegate` class](https://developer.apple.com/library/content/documentation/Swift/Conceptual/Swift_Programming_Language/Attributes.html).  You can see it in the default `AppDelegate.swift`, which looks like:

```swift
import Cocoa
@NSApplicationMain
class AppDelegate: NSObject, NSApplicationDelegate {
    @IBOutlet weak var window: NSWindow!
}
```

The `@NSApplicationMain` annotation can be seen a bit like a macro. Roughly, it will create a `main.swift` file with these contents:

```swift
import AppKit
let app: NSApplication = NSApplication.shared()
let appDelegate = AppDelegate()  // Instantiates the class the @NSApplicationMain was attached to
app.delegate = appDelegate
_ = NSApplicationMain(CommandLine.argc, CommandLine.unsafeArgv)
```

The `main.swift` file is special: it can contain top-level statements. It's a bit like the body of the `main` function in C. Replace `@NSApplicationMain` with this `main.swift`, and then you can remove your `MainMenu.xib` file.
