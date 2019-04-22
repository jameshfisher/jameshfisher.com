---
title: "Node.js addon hello world"
tags: ["programming"]
---

We're going to make a native extension called `addon`.
Here's `main.js`, which uses this extension:

```js
// main.js
const addon = require('./addon');
console.log(addon.hello());
```

And here it is in action:

```shell
$ node main.js
world
```

Now, you _could_ implement `addon` in JavaScript, like this:

```js
// addon.js
module.exports.hello = () => 'world';
```

But instead,
we're going to implement `addon` in C++ 
as a [Node.js addon](https://nodejs.org/api/addons.html)!
Instead of a file called `addon.js`,
we'll be making `addon.node`.
The extension `.node` tells Node.js that it's a native module,
not a JavaScript module.

These `.node` files can be built with a tool called `node-gyp`:

```shell
$ npm install -g node-gyp
```

To use it,
first create the following `binding.gyp` file:

```python
# binding.gyp
{
  "targets": [
    {
      "target_name": "addon",
      "sources": [ "addon_src.cc" ]
    }
  ]
}
```

Then run `node-gyp configure`,
which uses the above `binding.gyp` file.
Our `binding.gyp` says we're going to build `addon.node`
from the source file `addon_src.cc`.
Make that next:

```cpp
// addon_src.cc
#include <node.h>

using v8::FunctionCallbackInfo;
using v8::Isolate;
using v8::Local;
using v8::NewStringType;
using v8::Object;
using v8::String;
using v8::Value;

void Method(const FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = args.GetIsolate();
  args.GetReturnValue().Set(String::NewFromUtf8(
      isolate, "world", NewStringType::kNormal).ToLocalChecked());
}

void Initialize(Local<Object> exports) {
  NODE_SET_METHOD(exports, "hello", Method);
}

NODE_MODULE(NODE_GYP_MODULE_NAME, Initialize)
```

With everything in place,
we can build our `addon.node` file with `node-gyp build`:

```shell
$ node-gyp build
$ cp build/Release/addon.node .
$ node main.js  # uses addon.node!
world
```
