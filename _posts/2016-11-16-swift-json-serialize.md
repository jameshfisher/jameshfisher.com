---
title: How do I serialize JSON in Swift?
---

Everything on the web is wrong; here's how you do it:

```swift
let serialized : Data = try!JSONSerialization.data(withJSONObject: ["someKey": "someValue"], options: []);
```
