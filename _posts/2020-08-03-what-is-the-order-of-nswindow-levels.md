---
title: What is the order of `NSWindow` levels?
tags:
  - programming
  - macos
---

If two windows on your macOS desktop overlap,
which one gets shown?
Sometimes, the user can decide: 
by clicking on a window, it comes to the front.
But windows also have a "level" property, which overrides this user-defined ordering.
The `_level` property of an `NSWindow` is an integer,
and if one window has a higher `_level` than another,
it's _always_ shown in front.

You can set this raw `_level` property of an `NSWindow` like this:

```swift
window.level = NSWindow.Level(rawValue: 9)
```

However, Apple doesn't recommend using raw integers like this.
They prefer that you use their semantic names for different levels.
Annoyingly, Apple have two parallel lists of semantic levels:
`NSWindow.Level` and `CGWindowLevelKey`.
Here's how you use `NSWindow.Level`:

```swift
let window:NSWindow = NSWindow(/* ... */)
window.level = NSWindow.Level.tornOffMenu
```

And here's how you use `CGWindowLevelKey`:

```swift
window.level = NSWindow.Level(rawValue: Int(CGWindowLevelForKey(CGWindowLevelKey.tornOffMenuWindow)))
```

Both lists of semantic names are poorly documented.
Most annoyingly, the Apple documentation does not say 
what the values are for these semantic levels,
and does not even say what their _relative_ ordering is.
Even more deceivingly, the ordering of the levels listed in the documentation 
is _not_ the numeric order of the levels!

However, we can find the raw levels by debugging,
and they turn out to be as follows,
in correct numerical order:

```swift
CGWindowLevelForKey(.baseWindow) = -2147483648
CGWindowLevelForKey(.desktopIconWindow) = -2147483603
CGWindowLevelForKey(.minimumWindow) = -2147483643
CGWindowLevelForKey(.desktopWindow) = -2147483623
CGWindowLevelForKey(.backstopMenu) = -20
NSWindow.Level.normal = CGWindowLevelForKey(.normalWindow) = 0
NSWindow.Level.floating = CGWindowLevelForKey(.floatingWindow) = 3
NSWindow.Level.submenu = 3
NSWindow.Level.tornOffMenu = CGWindowLevelForKey(.tornOffMenuWindow) = 3
NSWindow.Level.modalPanel = CGWindowLevelForKey(.modalPanelWindow) = 8
CGWindowLevelForKey(.utilityWindow) = 19
NSWindow.Level.dock = CGWindowLevelForKey(.dockWindow) = 20
NSWindow.Level.mainMenu  = CGWindowLevelForKey(.mainMenuWindow) = 24
NSWindow.Level.statusBar = CGWindowLevelForKey(.statusWindow) = 25
NSWindow.Level.popUpMenu = CGWindowLevelForKey(.popUpMenuWindow) = 101
NSWindow.Level.screenSaver = 101
CGWindowLevelForKey(.overlayWindow) = 102
CGWindowLevelForKey(.helpWindow) = 200
CGWindowLevelForKey(.draggingWindow) = 500
CGWindowLevelForKey(.screenSaverWindow) = 1000
CGWindowLevelForKey(.assistiveTechHighWindow) = 1500
CGWindowLevelForKey(.cursorWindow) = 2147483630
CGWindowLevelForKey(.maximumWindow) = 2147483631
```

Note some oddities here:

* `NSWindow.Level` is mostly a subset of `CGWindowLevelKey`.
  `CGWindowLevelKey` defines some more obscure levels.
* Many levels are synonyms.
  `NSWindow.Level.floating`, `NSWindow.Level.submenu` and `NSWindow.Level.tornOffMenu`
  are all level `3`.
* You would expect `NSWindow.Level.screenSaver == CGWindowLevelForKey(.screenSaverWindow)`,
  but they're decidedly different.
