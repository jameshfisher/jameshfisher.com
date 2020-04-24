---
title: 'How to resolve "the app shows no response upon launch" in App Review'
tags: ["programming", "macos", "swift"]
---

I recently had an app rejected in Apple's App Review process,
with this message:
"We discovered one or more bugs in your app when reviewed on Mac running macOS 10.15.3.
Specifically, the app shows no response upon launch."

"The app shows no response upon launch"
is frustratingly little to go on!
However, I got past it, and here's how.

I suspected that "The app shows no response upon launch"
actually meant "When launching the app, 
it immediately exits before it is able to render any UI."
If the Apple reviewer had launched the app from the CLI,
they would have gotten an error that was a bit more specific, like this:

```
# This is how to launch a .app from the CLI
$ ./Foo.app/Contents/MacOS/Foo
Illegal instruction: 4
$ ./Bar.app/Contents/MacOS/Bar
Segmentation fault: 11
```

These errors mean that the process [received a signal from the kernel](https://en.wikipedia.org/wiki/Signal_(IPC)).
You can see the complete list of these in `man 3 signal`:

```
No    Name         Default Action       Description
1     SIGHUP       terminate process    terminal line hangup
2     SIGINT       terminate process    interrupt program
3     SIGQUIT      create core image    quit program
4     SIGILL       create core image    illegal instruction
5     SIGTRAP      create core image    trace trap
6     SIGABRT      create core image    abort program (formerly SIGIOT)
7     SIGEMT       create core image    emulate instruction executed
8     SIGFPE       create core image    floating-point exception
9     SIGKILL      terminate process    kill program
10    SIGBUS       create core image    bus error
11    SIGSEGV      create core image    segmentation violation
...
...
31    SIGUSR2      terminate process    User defined signal 2
```

These errors are still frustratingly vague,
and there are many things that can cause them.
My method was to find the most likely causes,
and add safety checks at all places where it could occur,
and if the safety check fails, display an error message box.

First, here's my error message box function,
which will ensure the Apple reviewer has something to screenshot and send back to me:

```swift
func errorMessageBox(_ errorText: String) {
    let alert = NSAlert()
    alert.messageText = "Error"
    alert.informativeText = errorText
    alert.runModal()
}
```

Now, here are all of the Swift operations I found
that can cause an "illegal instruction" error,
also called a "fatal error".

## Uncaught errors cause a segmentation fault

Example unsafe code:

```swift
enum MyError: Error {
    case genericError(String)
}

class App {
  var slider: NSSlider
  @objc func sliderChanged(sender: AnyObject) throws {
    throw MyError.genericError("This exception will not be caught")
  }
  func init() throws {
    slider = NSSlider()
    slider.target = self
    slider.action = #selector(sliderChanged)

    // now change the slider, so tht the callback is called ...
  }
}
```

In many languages, if an error/exception is not caught,
then the runtime catches it and shows some useful error (e.g. a stacktrace).
Not so in Swift, where an uncaught error causes a segmentation fault!

```
$ ./Foo.app/Contents/MacOS/Foo
Segmentation fault: 11
```

To fix this, make sure all unexpected errors are caught,
and instead display a useful error:

```swift
@objc func sliderChanged(sender: AnyObject) {
  do {
    throw MyError.genericError("This exception will be caught")
  } catch {
    errorMessageBox("sliderChanged: unexpected error: \(error)")
  }
}
```

## Force-unwrapping an nil value causes a segmentation fault

Swift has several ways to do unsafe type casting.
If the type cast fails at runtime, it causes 

Force-unwrapping an optional is a common unsafe operation,
with the `!` postfix operator:

```swift
let x = Optional<String>.none
print(x!)
```

This causes:

```
$ ./Foo.app/Contents/MacOS/Foo
Segmentation fault: 11
```

There is also "implicit" unwrapping
on values of type `Foo`, like:

```swift
var x: String!  // This is actually an optional, `String?`
print(x)  // this implicitly does `x!`
```

Here is an example safe version:

```swift
let x = Optional<String>.none
if let s = x {
  print(x)
} else {
  errorMessageBox("Unexpected nil")
}
```

## Unsafe downcast causes abort trap

[Swift's `as!` operator](https://docs.swift.org/swift-book/LanguageGuide/TypeCasting.html#ID341) 
lets you cast a value to a subclass type,
for example:

```swift
let x: AnyObject = NSString()
let y = x as! NSInteger
print(y)
```

When run, this results in:

```
$ ./Foo.app/Contents/MacOS/Foo
Could not cast value of type '__NSCFConstantString' (0x7fff89f904e0) to 'NSNumber' (0x7fff8a508200).
Abort trap: 6
```

Here is a safe version, using `as?`:

```swift
let x: AnyObject = NSString()
if let y = x as? NSInteger {
    print(y)
} else {
    errorMessageBox("Expected x to be NSInteger")
}
```

## `try!` causes illegal instruction

```swift
func throwingFunc() throws -> String {
    throw MyError.genericError("this will cause an illegal instruction")
}

let x = try! throwingFunc()
print(x)
```

```
$ ./Foo.app/Contents/MacOS/Foo
Fatal error: 'try!' expression unexpectedly raised an error: Foo.MyError.genericError("this will cause an illegal instruction"): file /path/to/project/main.swift, line 123
Illegal instruction: 4
```

Safe versions can use `try` or `try?`.

## Index out of range causes illegal instruction

Unsafe code:

```swift
let x = [1,2,3]
print(x[42])
```

This causes:

```
$ ./Foo.app/Contents/MacOS/Foo
Illegal instruction: 4
```

Here's a safer equivalent:

```swift
let x = [1,2,3]
if x.contains(42) {
    print(x[42])
} else {
    errorMessageBox("x does not have index 42")
}
```

## Are there any more?

For me, a `try!` during initialization turned out to be the reason the app was exiting without displaying any UI.
However, I'm sure there are more reasons that programs could exit early.
Let me know of any more important classes of error.
