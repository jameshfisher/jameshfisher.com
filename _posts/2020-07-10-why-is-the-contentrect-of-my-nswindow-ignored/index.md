---
title: Why is the `contentRect` of my `NSWindow` ignored?
tags:
  - programming
summary: >-
  Calling `setFrameAutosaveName` on an `NSWindow` causes its size and position
  to be saved to user defaults, overriding the `contentRect` passed to the
  constructor. To avoid this, do not call `setFrameAutosaveName`.
---

When creating an `NSWindow`,
you can pass a `contentRect` to set its size and position.
But for me, the size and position were being ignored.
The culprit was a call to `setFrameAutosaveName`.
Here I describe what `setFrameAutosaveName` does,
since it has no documentation.

Create a new macOS app in Xcode,
and it will give you some Swift like this:

```swift
var window = NSWindow(
    contentRect: NSRect(x: 0, y: 0, width: 480, height: 300),
    styleMask: [.titled, .closable, .miniaturizable, .resizable, .fullSizeContentView],
    backing: .buffered, defer: false)
window.center()
window.setFrameAutosaveName("Main Window")
window.contentView = NSHostingView(rootView: contentView)
window.makeKeyAndOrderFront(nil)
}
```

The window it gives you can be resized and repositioned with the mouse.
But try playing around with the `contentRect: NSRect(x: 0, y: 0, width: 480, height: 300)`,
and you'll find that the values are stubbornly ignored!
There are a couple of reasons for this.

The first reason is the call to `window.center()`.
This changes the position of the window to be centered on the display,
so your earlier `x` and `y` values are effectively ignored.
But removing `window.center()` still won't fix the issue.

The second, more interesting reason is the call to
`window.setFrameAutosaveName("Main Window")`.
[There are no docs for `setFrameAutosaveName`](https://developer.apple.com/documentation/appkit/nswindow/1419509-setframeautosavename),
but here's what it does.
When the user moves or resizes a window that has an autosave name,
the size and position are saved to the user defaults under that autosave name.
Then when a window is created with an autosave name,
if a size and position have been saved to user defaults,
these preferences override the `contentRect` passed in the constructor.
Here you can see the defaults after I moved and resized my `"Main Window"` window:

```
$ defaults read baz.ContentRectTest
{
    "NSWindow Frame Main Window" = "565 282 680 600 0 0 1680 1027 ";
}
```

The format here seems to be:

```
"NSWindow Frame \(autosaveName)" = "\(window.frame.x) \(window.frame.y) \(window.frame.width) \(window.frame.height) \(screen.x) \(screen.y) \(screen.width) \(screen.height - menuBar) ";
```

I don't know why it also saves the details of the screen.
