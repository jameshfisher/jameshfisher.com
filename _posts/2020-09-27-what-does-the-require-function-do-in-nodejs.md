---
title: What does the `require` function do in Node.js?
tags:
  - programming
  - javascript
---

[The other day I wrote an intro to "JavaScript modules"](/2020/09/25/javascript-modules-for-grumpy-developers-from-2005/).
But technically, I only wrote an intro to _ECMAScript modules_,
one of the two major module systems in JavaScript.
The other is the "CommonJS" module system,
which is mainly used in Node.js,
and is identified by calls to a `require` function.
Here's a brief intro to that system.

Here's an example CommonJS module,
which you could use in Node.js:

```js
let x = 5;
exports.x = x;
exports.increment = function() {
	x++;
};
```

Then to use it:

```
> require('myModule.js')
Uncaught Error: Cannot find module 'myModule.js'
```

Whoops, Node.js can't even find our module.
This very unhelpful error message is because,
to load a file with a relative path,
we have to use an explicit `./` prefix:

```
> const m = require('./myModule.js')
undefined
> m.x
5
> m.increment()
undefined
> m.x
5
```

A CommonJS module exports things by adding properties to an `exports` object.
Our module exports an `x` and an `increment`.
But if you've used ECMAScript modules,
this module might not work as you expected:
`m.x` does not get incremented after calling `m.increment()`!

The original variable `x` _does_ get incremented,
but `m.x` is not a reference to that variable.
The line `exports.x = x` _copies_ the value of `x`,
rather than making a reference to it.
This is different to the "live binding" semantics of ECMAScript modules.
To make this work as expected, we can export a getter function:

```
exports.x = () => x;
```

As you can see, CommonJS modules can have internal state.
`require`ing a module multiple times will only execute the module script once,
and return the same `exports` object from every `require` call.
Thus, the module's state can be shared.
For example:

```js
const m1 = require('./myModule.js');
const m2 = require('./myModule.js');
console.log(m1.x());  // logs 5
m2.increment();
console.log(m1.x());  // logs 6
```

So this is how you load a local module you've written.
But what about external "packages"?
Every Node.js developer has written `const express = require('express')`,
but what does this do?
[The full search algorithm](https://nodejs.org/api/modules.html#modules_all_together)
is a bit horrifying.
But in a standard setup,
this loads the JavaScript file at `./node_modules/express/index.js`.
You can equivalently write `const express = require('./node_modules/express/index.js')`.
You can also use `require.resolve` to debug it:

```
> require.resolve('express')
'/Users/jim/dev/tmp/node_require/node_modules/express/index.js'
```

According to the algorithm,
before finding `./node_modules/express/index.js`,
it tried looking for `express` in the core Node.js modules.
This didn't exist, so it looked in `node_modules`,
and found a directory called `express`.
(If there was a `./node_modules/express.js`,
it would load that directly.)
It then loaded `./node_modules/express/package.json`,
and looked for an `exports` field, but this didn't exist.
It also looked for a `main` field, but this didn't exist either.
It then fell back to `index.js`, which it found.

It's a bit deceptive that Node.js looks in `package.json` files.
It gives the impression that Node.js knows about _packages_,
but actually Node.js (should) really only know about _modules_.
NPM, a package manager, only really knows about _packages_.
Some things like `express` are both Node.js modules and NPM packages.
Other things are Node.js modules, but not NPM packages (like a local file `./myModule.js`);
Yet other things are NPM packages, but not Node.js modules (like [this Python package on NPM](https://www.npmjs.com/package/npm-python)).

When a module has its own dependencies,
how do these get resolved?
The `express` module has a call to `require('body-parser')`.
You might think that it has its own `node_modules`,
like `./node_modules/express/node_modules/body-parser/index.js`.
If this was present, it would load!
However, this is unconventional;
typically all recursive subdependencies are flattened into one big `node_modules` directory.
To make this work,
`require()` looks for `node_modules` in all of the parent directories of the caller.
