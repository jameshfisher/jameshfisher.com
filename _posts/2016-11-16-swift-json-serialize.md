---
title: How do I serialize JSON in Swift?
tags:
  - swift
  - programming
taggedAt: '2024-03-26'
summary: >-
  Serialize JSON in Swift with
  `JSONSerialization.data(withJSONObject:options:)`.
---

Everything on the web is wrong; here's how you do it:

```swift
let serialized : Data = try!JSONSerialization.data(withJSONObject: ["someKey": "someValue"], options: []);
```
