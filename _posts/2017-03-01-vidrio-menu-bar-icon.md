---
title: "Vidrio gets a menu bar"
justification: "I'm releasing Vidrio this month. It really needs a tray icon, but I dunnae know how to do it."
---

Currently Vidrio is a standard macOS program: it has an icon in the dock, and when you focus the app, it shows its menu along the top. I don't want that; it should be a tray icon. Vidrio is different to standard windowed applications; it's present all the time, no matter which app you have focussed. That's what tray icons represent, and that's why Vidrio should have a tray icon.

macOS doesn't call it a "tray"; it's the "menu bar". [Ray Wenderlich has a tutorial on adding a menu bar icon to your app](https://www.raywenderlich.com/98178/os-x-tutorial-menus-popovers-menu-bar-apps), which I'm following.

In short, add an item to the menu bar, getting a reference to it, which you should store in your `AppDelegate`, then add a `.image` and `.menu` to it, like so:

```swift
@NSApplicationMain
class AppDelegate: NSObject, NSApplicationDelegate {
    let statusItem = NSStatusBar.system().statusItem(withLength: -2)
    // ...
     func applicationDidFinishLaunching(_ aNotification: Notification) {
        if let button = statusItem.button {
            button.image = NSImage(named: "StatusBarButtonImage")
        }
        let menu = NSMenu()
        menu.addItem(NSMenuItem(title: "Quit App", action: #selector(NSApp.terminate), keyEquivalent: "q"))
        statusItem.menu = menu
        // ...
    }
}
```
