---
title: "What is `NSApplication`? How is it instantiated? What is `NSApp`?"
justification: "I'm making Vidrio this month. I need to understand Cocoa and Swift. `NSApp` is the heart of a Cocoa application."
---

The core of a Cocoa application is [the `NSApplication` class](https://developer.apple.com/reference/appkit/nsapplication). The docs for it say

> Every app must have exactly one instance of `NSApplication` (or a subclass of `NSApplication`). Your program’s `main()` function should create this instance by invoking the `shared()` class method.

This is a bit confusing to the beginning developer. I had never seen an `NSApplication` instance; I had never seen my `main()` function; and I had never invoked a `shared()` method. The `main()` function in Swift is created by the `@NSApplicationMain` annotation, by creating the file `main.swift` with the following contents:

```swift
import AppKit
_ = NSApplicationMain(CommandLine.argc, CommandLine.unsafeArgv)
```

This is doubly confusing, because this "`main() function`" does not invoke a `shared()` method on anything. The above docs are misleading; you are not _required_ to call this `shared()` method, because []`NSApplicationMain(...)` will do it for you](https://developer.apple.com/reference/appkit/1428499-nsapplicationmain), as it explains:

> **Creates the application**, loads the main nib file from the application’s main bundle, and runs the application.

These docs are _also_ a little confusing, because `NSApplicationMain` does not _necessarily_ create the application object. You _can_ do it yourself, in which case `NSApplicationMain(...)` will use the `NSApplication` instance you chose. The mechanism for this is the `NSApp` variable, which is explained further down:

> The `shared()` method also initializes the global variable `NSApp`, which you use to retrieve the `NSApplication` instance. `shared()` only performs the initialization once; if you invoke it more than once, it simply returns the `NSApplication` object it created previously.

Here's an example of initializing the `NSApplication` ourselves:

```swift
import AppKit
print("NSApp: \(NSApp)")
let myApp = NSApplication.shared()
print("NSApp: \(NSApp)")
print("myApp: \(myApp)")
_ = NSApplicationMain(CommandLine.argc, CommandLine.unsafeArgv)
```

This prints:

```
NSApp: nil
NSApp: Optional(<NSApplication: 0x600000101710>)
myApp: <NSApplication: 0x600000101710>
```

Notice that `NSApp` starts off as `nil`. `NSApplication.shared()` creates an object, then sets `NSApp` to point to it, and returns the object too. When `NSApplicationMain` is then called, the "Creates the application" effectively just calls `NSApplication.shared()` again, which returns the instance you created.

You can customize the behavior of `NSApplication` via standard subclassing. If you subclass `NSApplication` as `MyApplication`, then call `MyApplication.shared()` instead:

```swift
import AppKit
class MyApplication : NSApplication { }
let app: NSApplication = MyApplication.shared()
_ = NSApplicationMain(CommandLine.argc, CommandLine.unsafeArgv)
```

You might think that, if you neglect to call `shared()`, the `NSApplicationMain(...)` call defaults to `NSApplication.shared()`. This is not the case. Actually, `NSApplicationMain` uses the `NSPrincipalClass` key of your `Info.plist` to determine what class to call `shared()` on. We can emulate this behavior ourselves:

```swift
import AppKit
let principalClassName: String = Bundle.main.infoDictionary!["NSPrincipalClass"] as! String
let principalClass: NSApplication.Type = NSClassFromString(principalClassName)! as! NSApplication.Type
let app: NSApplication = principalClass.shared()
_ = NSApplicationMain(CommandLine.argc, CommandLine.unsafeArgv)
```
