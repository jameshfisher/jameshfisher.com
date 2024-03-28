---
title: What are AMD modules? Fetch your sick bag
tags:
  - programming
  - javascript
  - web
summary: >-
  "Simplified CommonJS wrapping" feature is a hacky attempt to support
  synchronous `require` calls by using regexes. It's gross.
---

I don't think anyone would object to
the claim that JavaScript has too many module systems.
From the olden days we have raw `<script>` loading,
where dependencies are implicit,
and exports are vomited onto the `window` object.
Node.js gave us [the CommonJS module system](/2020/09/27/what-does-the-require-function-do-in-nodejs/),
where a module's dependencies are synchronously, dynamically `require()`d,
and its exports placed on an `exports` object.
[ECMAScript 2015 gave us "ES modules"](/2020/09/25/javascript-modules-for-grumpy-developers-from-2005/),
where a module's dependencies are statically `import`ed before execution,
and its exports are statically defined, top-level variables.

Unfortunately, _none_ of these systems are really acceptable for use in the browser.
Raw `<script>`s aren't acceptable because they're ... not modules.
CommonJS is not acceptable because it loads modules synchronously,
but the necessary HTTP requests in the browser are fundamentally asynchronous.
ECMAScript modules are not acceptable because they don't have wide enough support yet.

So, enter [Asynchronous Module Definition](https://github.com/amdjs/amdjs-api/blob/master/AMD.md), or AMD.
This appeared around 2011.
AMD modules look like this:

```js
// This is https://example.com/modules/printCounter.js
define(
  ['./counter', 'print'],       // names of dependencies
  function (counter, print) {   // the dependency modules passed in
    return {                    // our module object, with one function
      printAndIncrement: () => {
        print(counter.get());
        counter.increment();
      }
    }
  }
);
```

You know you're looking at AMD (or something like it)
if you see calls to a `define` function,
or the inclusion of an "AMD loader" script,
like `<script src="lib/require.js"></script>`.

An AMD module like this assumes a global `define` function,
which is provided by an "AMD loader" like [RequireJS](https://requirejs.org/).
The AMD loader knows how to load a module given its name.
For example, the name `./counter` might map to the file `https://example.com/modules/counter.js`.
The AMD loader loads this, e.g. by inserting `<script src='/modules/counter.js'></script>` into the document.

So far, sensible enough,
but it all goes wrong from here.
For some reason, AMD also defines a form called "Simplified CommonJS wrapping",
which might be the most disgusting thing in the JavaScript ecosystem.
It claims to turn a CommonJS module into an AMD-compatible module, like this:

```js
define(function (require, exports, module) {
  var messages = require('./messages');  // synchronous, dynamic require!
  var print = require('print');          // just like in Node.js! <3
  print(messages.getHello());
});
```

But _how the hell_ can the AMD loader turn those synchronous, dynamic `require` calls
into asynchronous module loads?!
Buckle up.
The loader takes your function,
and before calling it,
it calls `.toString()` on the function
(a feature that JavaScript really _shouldn't_ provide),
then does some regex searches to find calls to `require`.
Yep, it turns out regular expressions can solve the halting problem after all.
To see the insanity, take the following module:

```js
define(function (require) {
  var someString = "require('./nonExistentModule')";
  print(someString);
});
```

This module will cause the loader to make an HTTP request for `nonExistentModule.js`,
which of course causes an error.
It makes me feel sick that someone even entertained the idea of making a module system this way.
