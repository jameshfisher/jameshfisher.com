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
$ npm install --save-dev node-gyp  # install for this project
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

Then run `npx node-gyp configure`,
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
  v8::MaybeLocal<v8::String> str = String::NewFromUtf8(isolate, "world", NewStringType::kNormal);
  v8::Local<v8::String> checkedString = str.ToLocalChecked();
  v8::ReturnValue<v8::Value> retVal = args.GetReturnValue();
  retVal.Set(checkedString);
}

void Initialize(Local<Object> exports) {
  NODE_SET_METHOD(exports, "hello", Method);
}

NODE_MODULE(NODE_GYP_MODULE_NAME, Initialize)
```

With everything in place,
we can build our `addon.node` file with `npx node-gyp build`:

```shell
$ npx node-gyp build
```

If you get build errors here, it's likely because the V8 API has changed.
The above example works for Node 12.x.
[Consult the addons docs for a latest working example](https://nodejs.org/api/addons.html).
Due to V8 API instability,
[Node.js provides "Native Abstractions for Node.js"](https://github.com/nodejs/nan), 
a bunch of macros which are hopefully more stable.
I'll do a future post on a NAN hello world.

If you don't get build errors,
you should now have a file at `build/Release/addon.node`.
Copy it to the local directory,
and run our main script:

```shell
$ npx node-gyp build
$ cp build/Release/addon.node .
$ node main.js  # uses addon.node!
world
```

(Copying the `addon.node` file to the local directory is a bit ugly.
A popular alternative is [the `bindings` npm package](https://www.npmjs.com/package/bindings),
which has logic to `require` from all common locations that `node-gyp` outputs to.)