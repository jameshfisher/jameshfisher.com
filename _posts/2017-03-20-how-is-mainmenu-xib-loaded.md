---
title: How is `MainMenu.xib` found in Cocoa?
justification: >-
  I'm making Vidrio this month. I need to understand Cocoa and Swift. Nib/xib
  files seem fairly fundamental to the Cocoa loading process.
tags: []
---

In Xcode, go to `File > New > Project`, select "Cocoa application". Run it. You get an empty window, and a menu bar for it along the top. This menu bar contains a whole lot of functionality. Where did all this functionality come from?!

In short: the default project gives you a `MainMenu.xib` and an `AppDelegate.swift`. The `AppDelegate` class has the `@NSApplicationMain` annotation, which causes your program to call the `NSApplicationMain` function, which in turn has some routines which load the `MainMenu.xib` file, which contains several hundred lines which describe the window, menu, and other things.

But how does `NSApplicationMain` find your `MainMenu.xib` file, and what does it do with it then? [The docs for `NSApplicationMain` are a bit vague:](https://developer.apple.com/reference/appkit/1428499-nsapplicationmain)

> Creates the application, **loads the main nib file from the application’s main bundle,** and runs the application.

First, how does `NSApplicationMain` find your `MainMenu.xib` file? The search procedure begins with key `NSMainNibFile` in `Info.plist`. If this key exists, it's used to load the file. We can emulate this behavior in our `main.swift`:

```swift
import Cocoa
let myApp: NSApplication = NSApplication.shared()
let mainBundle: Bundle = Bundle.main
let mainNibFileBaseName: String = mainBundle.infoDictionary!["NSMainNibFile"] as! String
mainBundle.loadNibNamed(mainNibFileBaseName, owner: myApp, topLevelObjects: nil)
_ = NSApplicationMain(CommandLine.argc, CommandLine.unsafeArgv)
```

However, if the `NSMainNibFile` key is not present, `NSApplicationMain` falls back the first nib/xib file which it happens to find in the main bundle. We can't emulate this behavior easily. If you have nib/xib files in your bundle which you don't want to use as the main nib, you should hide them away so that `NSApplicationMain` doesn't find them.
