---
title: What is Swift's `@NSApplicationMain` annotation?
tags: []
---

In Xcode, go to `File > New > Project`,
select "Cocoa application",
and call it "LookMaNoNSApplicationMain".
Run it.
You get an empty window which reads "LookMaNoNSApplicationMain" in the title.
When you focus the application,
you get a menu bar for it along the top.
This menu bar contains a whole lot of functionality.
You can go `View > Enter Full Screen`,
and the window maximizes.
You can go `Format > Font > Show Colors`,
and you get a color picker window.
Where did all this functionality come from?!

The default project gives you a `MainMenu.xib` and an `AppDelegate.swift`.
The `AppDelegate` class has the `@NSApplicationMain` annotation
which causes your program to read the `MainMenu.xib` file
and construct the window and menu based on its contents.
All of those menu bar items are in that `MainMenu.xib` file,
which is several hundred lines long.

One piece of complexity is the `@NSApplicationMain` annotation.
`@NSApplicationMain` is part of the Swift language, and is poorly documented.
Roughly speaking, `@NSApplicationMain` is a macro:
it rewrites your program at compile time.
To understand what rewriting `@NSApplicationMain` does,
let's manually rewrite it.

First, remove the `@NSApplicationMain` annotation in your `AppDelegate.swift`.
Then create a new file, `main.swift`, with these contents:

```swift
import Cocoa
let myApp: NSApplication = NSApplication.shared()
let myDelegate: AppDelegate = AppDelegate()
myApp.delegate = myDelegate
_ = NSApplicationMain(CommandLine.argc, CommandLine.unsafeArgv)
```

This is roughly what the `@NSApplicationMain` annotation does.
The file `main.swift` is special:
the file with this name is allowed to have statements at the top level.
You should think of the contents of `main.swift` as being like the `main()` function in C.
Now let's walk through the statements in it, line-by-line.

First, `main.swift` runs `NSApplication.shared()`,
and assigns this `NSApplication` object to `myApp`.
The [`NSApplication`](https://developer.apple.com/reference/appkit/nsapplication) documentation says

> Every app must have exactly one instance of `NSApplication` (or a subclass of `NSApplication`).
> Your program’s `main()` function should create this instance by invoking the `shared()` class method.

Notice the documentation refers to a `main()` function,
even though in Swift there is none!
The equivalent is the `main.swift` file.

Next, `main.swift` instantiates your `AppDelegate` class,
and assigns it as the `.delegate` of `myApp`.
You can now see why the default project chooses to call the class `AppDelegate`:
it is set as the `.delegate` on an `NSApplication`.

Finally, `main.swift` calls [the function `NSApplicationMain(...)`](https://developer.apple.com/reference/appkit/1428499-nsapplicationmain).
Don't confuse this with the `@NSApplicationMain` annotation in Swift!
The function `NSApplicationMain(...)` is the entry point for Cocoa applications.
`NSApplicationMain(...)` never returns;
instead, it sets up the UI event loop,
and eventually exits using the C `exit(...)` function.
