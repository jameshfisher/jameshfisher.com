---
title: How do I replace target/action with callbacks in Swift?
tags:
  - swift
  - objective-c
taggedAt: '2024-03-26'
---

`NSButton` uses the target/action pattern: a `button : NSButton` has two properties `button.target` and `button.action` which specify what to call when the button is clicked.

This is rather different to the way I'm used to programming: I'd like to just set `button.onClick = { ... do some stuff ... }`. In short, this is how to do it:

```
class CallbackWrapper {
    var callback : () -> ();
    init(callback: @escaping () -> ()) {
        self.callback = callback;
    }
    @objc public func callCallback() {
        self.callback();
    }
}

func setTargetActionCallback(control: NSControl, callback: @escaping () -> ()) {
    let wrapper = CallbackWrapper(callback: callback);
    control.target = wrapper;
    control.action = #selector(CallbackWrapper.callCallback);
    let key = UnsafeMutablePointer<Int8>.allocate(capacity: 1);
    objc_setAssociatedObject(control, key, wrapper, .OBJC_ASSOCIATION_RETAIN);
}
```

Explanation:

* We wrap the callback in an object, so `wrapper.callCallback()` is the same as `callback()`
* We use `wrapper` as the target and its `callCallback` method as the action
* We set the wrapper as an associated object of the button. This is important because `button.target` is a weak reference, for questionable design reasons!

Thanks to [Mike Ash](https://www.mikeash.com/pyblog/friday-qa-2015-12-25-swifty-targetaction.html) and Ham Chapman for finding that post.
