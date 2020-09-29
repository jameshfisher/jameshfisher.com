---
title: "How do ECMAScript modules work in Node.js?"
tags: ["programming", "javascript"]
---

Traditionally, Node.js uses the "CommonJS" module system,
which [I described recently]({% post_url 2020-09-27-what-does-the-require-function-do-in-nodejs %}).
But since 2015, the JavaScript world has had [ECMAScript modules]({% post_url 2020-09-25-javascript-modules-for-grumpy-developers-from-2005 %}).
Node.js now supports ECMAScript modules as well as CommonJS modules.
They're inter-operable, too, but this can make things pretty complex.
Let's take a look.

When `node` first runs, you give it a module to run,
e.g. with `node file.js`, or `node .`.
Node must decide whether that module is ECMAScript or CommonJS.
_You_ might decide by eyeballing the file contents,
e.g. seeing whether it has `import` annotations or `require` calls.
But Node.js does not look at the contents, or execute them, to make this decision.
First, it looks at the file extension.
The extension `.mjs` signals ECMAScript; 
the extension `.cjs` signals CommonJS.
If the extension is just `.js`,
it will look for a `package.json` in the path from the root to the file,
and check the `type` field,
which can be `"module"` (ECMAScript) or `"commonjs"`.
Otherwise, it guesses that the module is CommonJS,
and we'll get runtime `SyntaxError`s if this guess is wrong.

The Node REPL is in CommonJS mode.
Like the console in the browser,
you can't use static `import`s here.
Because of this, I fall back into the habit of using CommonJS.
However, you can use the dynamic `import(...)` call!
To make this useable,
start the REPL with `--experimental-repl-await`,
so you can write things like `const { readFileSync } = await import('fs')`.

[Node's `require` behavior is pretty complex](https://nodejs.org/api/modules.html#modules_all_together).
For example, a module at `node_modules/express/lib/express.js` might have a call to `require('body-parser')`.
At runtime, this might resolve to the file at `node_modules/body-parser/index.js`.
This happens by crawling the filesystem and `package.json` files to find a module that matches the string.
ECMAScript `import` in the browser is much more restricted:
you can only specify a relative URL like `import * as m from './myModule.js'`,
or an absolute URL like `import * as $ from 'https://example.com/jquery.js'`.
But Node's ECMAScript module system has the same complex resolution algorithm as its `require` system.
For example, an ECMAScript module at `node_modules/express/lib/express.mjs`
can have a call to `import * as bodyParser from 'body-parser'`,
which also resolves to the file at `node_modules/body-parser/index.js`.

([The "import maps" proposal](https://github.com/WICG/import-maps)
would provide a resolution algorithm for ECMAScript modules in the browser
that allows you to write things like `import * as $ from 'jquery'`
and have this resolve to e.g. `https://example.com/node_modules/jquery/index.js`.
But this browser feature is not really implemented or available yet.)

From an ECMAScript module, you can only use `import`, not `require`.
And from a CommonJS module, you can only use `require`, not `import`.
Trying to mix the two forms in the same file will give you errors.

If you `require(foo)`, but `foo` resolves to an ECMAScript module, you'll get an error.
And if you `import foo` but `foo` resolves to a CommonJS module ... what do you think happens?
Nope, it's _not_ an error.
Actually, the CommonJS module is executed,
and its `exports` object is used as the `default` export.
This is how the old CommonJS ecosystem is made available to the new ECMAScript ecosystem!

So, you can write `import foo from './foo.cjs'`,
which is roughly equivalent to `const foo = require('./foo.cjs')`.
If you're used to writing `const {x,y,z} = require('./foo.cjs')` in CommonJS,
you might try writing `import {x,y,z} from './foo.cjs'` in ECMAScript modules.
But this doesn't work: the module `./foo.cjs` can't have `x,y,z` exports;
it can only have a `default` export!

To make things more complex,
a Node.js module can be _both_ a CommonJS module _and_ an ECMAScript module.
The `exports` field of a `package.json` can explicitly declare things like:

```json
{
    "exports": {
        "import": "./index.mjs",
        "require": "./index.cjs"
    }
}
```

The Node.js resolution algorithm knows whether it's `require`ing or `import`ing.
If it's `require`ing, it will pick `./index.cjs`.
If it's `import`ing, it will pick `./index.mjs`.
This means a single npm package can provide for both module systems.

Note that in some packages you might see a different format in the `package.json`,
like:

```json
{
    "main": "./index.cjs",
    "module": "./index.mjs"
}
```

But this `module` field is ignored by Node.js.
Node.js only respects the `main` field, and so will always run this module as CommonJS.
The `module` field is only read by some bundling tools,
like [rollup](https://github.com/rollup/rollup/wiki/pkg.module).
