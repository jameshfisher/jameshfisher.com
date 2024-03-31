---
title: What is Swift's `@NSApplicationMain` annotation?
justification: >-
  I'm making Vidrio this month. I need to understand Cocoa and Swift. The
  `@NSApplicationMain` annotation is one barrier to understanding.
tags: []
summary: >-
  The `@NSApplicationMain` annotation in Swift is a macro that calls
  `NSApplicationMain(...)` to set up the Cocoa application's UI event loop.
---

In Xcode, go to `File > New > Project`, select "Cocoa application", and call it "LookMaNoNSApplicationMain". Run it. You get an empty window which reads "LookMaNoNSApplicationMain" in the title. When you focus the application, you get a menu bar for it along the top. This menu bar contains a whole lot of functionality. You can go `View > Enter Full Screen`, and the window maximizes. You can go `Format > Font > Show Colors`, and you get a color picker window. Where did all this functionality come from?!

The default project gives you a `MainMenu.xib` and an `AppDelegate.swift`. The `AppDelegate.swift` looks like this:

```swift
import Cocoa
@NSApplicationMain
class AppDelegate: NSObject, NSApplicationDelegate {
    @IBOutlet weak var window: NSWindow!
}
```

The `AppDelegate` class has the `@NSApplicationMain` annotation which causes your program to read the `MainMenu.xib` file and construct the window and menu based on its contents. All of those menu bar items are described in that `MainMenu.xib` file, which is several hundred lines long.

The first piece of complexity is the `@NSApplicationMain` annotation. `@NSApplicationMain` is part of the Swift language. Roughly speaking, `@NSApplicationMain` is a macro: it rewrites your program at compile time.

To understand what rewriting `@NSApplicationMain` does, let's manually rewrite it. First, remove the `@NSApplicationMain` annotation in your `AppDelegate.swift`. Then create a new file, `main.swift`, with these contents:

```swift
import AppKit
_ = NSApplicationMain(CommandLine.argc, CommandLine.unsafeArgv)
```

Run your application again: it should behave exactly the same. This is roughly what the `@NSApplicationMain` annotation does: create the above `main.swift` file. The file `main.swift` is special: the file with this name is allowed to have statements at the top level. You should think of the contents of `main.swift` as being like the `main()` function in C.

`main.swift` calls [the function `NSApplicationMain(...)`](https://developer.apple.com/reference/appkit/1428499-nsapplicationmain). Don't confuse this with the `@NSApplicationMain` annotation in Swift! The function `NSApplicationMain(...)` is the entry point for Cocoa applications. `NSApplicationMain(...)` never returns; instead, it sets up the UI event loop, which eventually exits using the C `exit(...)` function.

Notice that the behavior of `@NSApplicationMain` doesn't depend on the class it is attached to! Indeed, you can create a new class `Foo`, and move the annotation there, which does not affect how the application behaves:

```swift
import Cocoa
class AppDelegate: NSObject, NSApplicationDelegate {
    @IBOutlet weak var window: NSWindow!
    func applicationDidFinishLaunching(_ aNotification: Notification) {
        print("finished loading")
    }
}
@NSApplicationMain
class Foo: NSObject, NSApplicationDelegate { }
```

The above program prints `"finished loading"`, indicating that the `AppDelegate` class is being used, rather than the `Foo` class. What a strange design!

There are still many more mysteries in the default project, which I will cover in future posts:

* How does your `AppDelegate` class get found and instantiated?
* There is no reference to `MainMenu.xib` in `main.swift`, so how does `MainMenu.xib` get loaded?
* What are the contents of `MainMenu.xib`?
* How does your app's `NSApplication` instance (which I'll cover in future) get instantiated?
