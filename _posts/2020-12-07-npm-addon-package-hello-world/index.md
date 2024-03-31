---
title: NPM addon package hello world
tags:
  - programming
  - npm
  - node
  - javascript
summary: >-
  How to create an NPM addon package from C++ code using the `node-gyp`
  tool and a `binding.gyp` file, with a JavaScript wrapper module for a more
  idiomatic API.
---

[In a previous post I showed how to build an `addon.node` file](/2019/04/20/nodejs-addon-hello-world/)
which can then be used as a Node.js module with `require('./addon')`.
These C++ addons are frequently distributed via NPM.
Let's make an NPM package from some C++.

Typically, an npm package does _not_ contain any `.node` files.
Instead, it will somehow generate the appropriate `.node` files at install time,
for the correct architecture, OS, Node.js version, et cetera.
When you `npm install` a package,
the package can specify arbitrary scripts to run at install time,
like this:

```json
{
  "name": "arithmetic",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "preinstall": "echo preinstalling",
    "install": "echo installing",
    "postinstall": "echo postinstalling"
  }
}
```

If you `npm install` this package, it will print

```shell
$ npm install ../arithmetic
preinstalling
installing
postinstalling
```

If you use npm, you probably know that "https://github.com/zloirock is looking for a good job".
You know this due to [the noisy `postinstall` script on the `core-js` package](https://github.com/zloirock/core-js/blob/76d9bf50b1b15439366af92885c5a7a1d0ad61c6/packages/core-js/package.json#L55)
which everything depends on.

The `install` script can do whatever it likes to generate the `.node` files.
The `install` script in the `node-sass` npm package downloads the prebuilt files.
But more typically, it will compile them from C++ source.
This convention is strong enough that it's built into `npm`.
[According to the docs](https://docs.npmjs.com/cli/v6/using-npm/scripts#default-values),

> If there is a `binding.gyp` file in the root of your package
> and you haven't defined your own `install` or `preinstall` scripts,
> `npm` will default the `install` command to `"node-gyp rebuild"`.

The package needs to ensure the `node-gyp` tool is available,
typically by adding [the `node-gyp` npm package](https://www.npmjs.com/package/node-gyp) as a dependency
(not a dev-dependency!).

The `node-gyp` tool looks for a `binding.gyp` file.
Here is ours:

```python
# binding.gyp
{
  "targets": [
    {
      "target_name": "arithmetic",
      "sources": [ "arithmetic.cc" ]
    }
  ]
}
```

This will compile `build/Release/arithmetic.node` from our source file `arithmetic.cc`.
Here it is, a module that defines a single function `increment`:

```cpp
#include <assert.h>
#include <node_api.h>
#include <stdio.h>
napi_value Increment(napi_env env, napi_callback_info cb_info) {
  napi_status status;

  size_t argc = 1;
  napi_value args[1];
  status = napi_get_cb_info(env, cb_info, &argc, args, nullptr, nullptr);
  assert(status == napi_ok);

  double arg_value;
  status = napi_get_value_double(env, args[0], &arg_value);
  assert(status == napi_ok);

  napi_value return_value;
  status = napi_create_double(env, arg_value + 1.0, &return_value);
  assert(status == napi_ok);

  return return_value;
}

napi_value Init(napi_env env, napi_value exports) {
  napi_status status;
  napi_property_descriptor incrementDescriptor = { "increment", 0, Increment, 0, 0, 0, napi_default, 0 };
  status = napi_define_properties(env, exports, 1, &incrementDescriptor);
  assert(status == napi_ok);
  return exports;
}

NAPI_MODULE(NODE_GYP_MODULE_NAME, Init)
```

(I'll write a future post on how this `napi_` API works,
and the alternative C++ APIs for writing Node.js addons.)

For me, `node-gyp` places its output at `build/Release/arithmetic.node`.
You could set `"main": "build/Release/arithmetic.node"` in your package.
But more typically, you wrap your native addon with a JavaScript module.
This can provide a more idiomatic JavaScript API.
Here's ours:

```js
const nativeArithmetic = require('./build/Release/arithmetic.node');
exports.increment = function(n) {
    if (typeof n !== 'number') {
        throw new Error("Expected one numeric argument");
    }
    return nativeArithmetic.increment(n);
};
```

Our wrapper module checks types before calling into the native module.
(If the native module is given bad arguments,
an `assert` fails, causing the process to abort!
Nastier than a thrown exception!)

While `node-gyp` puts its output at `build/Release/arithmetic.node` in my configuration,
apparently it can place its output in several possible locations.
[The `bindings` package](https://www.npmjs.com/package/bindings) helps here,
and tries to `require()` the module from common output locations.
We use it like this:

```js
const nativeArithmetic = require('bindings')('arithmetic.node');
```

Finally, here is the `package.json` with the important properties:

```json
{
  "name": "arithmetic",
  "version": "0.0.1",
  "main": "index.js",
  "scripts": {
    "install": "node-gyp rebuild"
  },
  "dependencies": {
    "bindings": "^1.5.0",
    "node-gyp": "^7.1.2"
  }
}
```
