---
title: How to use keycastr
justification: >-
  I'm making Vidrio. Keycastr is a tool specifically for screencasting. This is
  the first market I want to capture.
tags: []
summary: >-
  Keycastr is a tool that displays your keystrokes on the screen during
  screencasts, but has some issues like not displaying over maximized windows,
  fixed positioning, and using obscure key symbols.
---

Screencasting usually involves explaining how to use some software. The viewer can usually see where you're moving the mouse cursor. But it's not obvious when the presenter does any mouse clicks (or other gestures), and it's not obvious  what the presenter is doing with the keyboard.

[Keycastr](https://github.com/keycastr/keycastr) displays your keystrokes on screen so that the viewer can see them.

```bash
brew tap caskroom/cask
brew cask install keycastr
```

You then have to add Keycastr to your list of Accessibility apps. This is allows it to intercept keystrokes.

Launch Keycastr. It has a menu bar icon. You can toggle keycasting with Control+Option+Command+K.

Keycastr has a number of issues which could be fixed:

* It doesn't display over the top of maximized windows! This is a serious deficiency which we can fix.
* The display can't be repositioned; it's always in the bottom-left. This is annoying when presenting an app which shows important things in the bottom-left.
* The Shift key never appears!
* It shows control keys using the traditional characters, e.g. ⌘ is Command, ⌥ is Option, ⌃ is Control. I have a tough time remembering which is which, especially since two of these don't appear on the physical key! I don't think many users know these symbols. Instead, it should just write out the name of the key (which _is_) written on the physical key).
