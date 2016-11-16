# JSON serialization in Swift

Since everything on the web is wrong:

```swift
let serialized : Data = try!JSONSerialization.data(withJSONObject: ["someKey": "someValue"], options: []);
```
