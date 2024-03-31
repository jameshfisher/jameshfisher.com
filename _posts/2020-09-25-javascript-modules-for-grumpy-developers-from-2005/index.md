---
title: JavaScript modules for grumpy developers from 2005
tags:
  - programming
  - web
  - javascript
summary: >-
  JavaScript modules enable better dependency management and scoping. A guide for developers like me who still use `<script>` tags everywhere.
---

These days you keep bumping into things like `<script type="module">`
or `import`/`export` keywords
or files with the extension `.mjs`.
What is all this,
and why can't I just keep using `<script language="Javascript" type="text/javascript">`
for all my dependencies?
This was my attitude too, and this post is for you.

When I learned JavaScript,
it only ran in the browser,
and there was only one way to load and run it.
You put `<script type="text/javascript" src="some/path.js"></script>` in your HTML.
When the HTML parser hits this tag,
it pauses parsing,
fetches the file at `some/path.js`,
runs it as JavaScript which is expected to inject its goodies somewhere in the `window` object
(and maybe do some awful calls to `document.write`),
then finally the browser continues parsing the HTML.
Similarly, `<script>document.write('hello!');</script>`
is an inline version.
(Note that at some point,
HTML5 hipsters stopped writing `type="text/javascript"`,
and browsers decided that `<script>` means the same thing.)
Arguably, the `eval()` function in JavaScript is another method to load and run JavaScript,
but the less we say about that the better.
Let's look at the problems in this system:

1. The HTML parser is blocked while the script is fetched.
   The result is pages that are slow to load and render.
   As a workaround, web developers moved their `<script>` tags
   from the `<head>` to the bottom of the `<body>` tag,
   so that the page would parse and render before tackling the blocking `<script>`s.
2. Scripts can't state their dependencies or download them.
   In the old days, dependencies were just described in READMEs, like
   "make sure to load jQuery before loading this library."
   As a workaround,
   things like [RequireJS](https://requirejs.org/) appeared,
   but they're fundamentally hacks
   (e.g. RequireJS works by "loading each dependency as a script tag, using `head.appendChild()`").
3. A `<script>` does not have its own scope.
   Its "exports" are all just injected on the global `window` object.
   All of its internal variables and dependencies are hanging out for the world to see.
   As a workaround, a `<script>` can create its own scope,
   with something like `(function() { ... })()`.

Problem 1 is just a browser design flaw.
There is no good use-case for `<script>` tags blocking the HTML parser,
or for gross things like `document.write()`.
This was fixed with two new attributes on the `<script>` tag,
called `async` and `defer`.
A `<script async>` will fetch the script in parallel with HTML parsing,
and run it "whenever it's ready".
Not many guarantees,
so your awful `document.write()` will behave unpredictably
(and actually, is banned in `async` scripts in Chrome, at least).
A `<script defer>` is similar,
but rather than running "whenever it's ready",
the script is instead put in a queue,
to be run immediately after HTML parsing completes
(but before the `DOMContentLoaded` event).
Some people will tell you that
"`defer`red scripts will always happen after `async`d scripts",
but they're wrong;
`async`d scripts can execute at pretty much any time.

If your approach to JavaScript dependency management is still
"put all the dependency `<script>` tags in the HTML",
then `<script async>` actually makes things worse,
because the scripts won't run in any guaranteed order.
You'll need `<script defer>` for that.

But anyway,
we still have Problem 2 (dependency management)
and Problem 3 (scoping).
So along came ECMAScript 2015 with "JavaScript modules",
which tries to tackle these problems.
Here's a "hello world" in JavaScript modules:
we have a classic `<script>` that calls `import(...)`.
This returns a promise of a module.
The script then logs some info about the module:

```html
<script>
  const url = '/myModule.js';
  import(url).then(module => {
    console.log(Object.keys(module));
    console.log(module.x);
  });
</script>
```

This makes a request to the URL `/myModule.js`.
(Some people also use the file extension `.mjs` for "module JS".
But this is just a convention and the browser doesn't care.
The web doesn't know about file extensions, or even files.)
Anyway, from the URL `/myModule.js`, we serve this JavaScript:

```js
console.log("executing module");
const myNumber = 5;
export { myNumber as x };
```

The console reports:

```
executing module    // The module executed
["x"]               // Keys of the module object
5                   // Value of the `x` key
```

The `import(url)` expression can also be used from within a module itself.
This is how we can express dependencies, and subdependencies.
Importantly, the `import(url)` expression can take relative URLs,
which are interpreted relative to _the URL of the calling module_.
Within a module, the expression `import.meta.url` is
the absolute URL of the current module.
For example, if the following module is served from `https://example.com/foo/bar.js`,
then it will log `Going to import https://example.com/foo/dependency.js`:

```js
(async () => {
  console.log("Going to import", new URL("./dependency.js", import.meta.url).href);
  const dependency = await import("./dependency.js");
  console.log(dependency);
})();
```

However, oddly,
conventional relative URLs like `dependency.js` are banned.
If you try to `import("dependency.js")`,
you'll get an obscure error like "Failed to resolve module specifier 'dependency.js'".
The reason is that relative URLs are forced to start with `./` or `../`.
Any other forms (called "bare imports") are reserved for mysterious future uses
(such as this ["import maps"](https://github.com/WICG/import-maps) feature).

Now what if we try loading our module twice, like this?

```js
const module1 = await import(url);
const module2 = await import(url);
```

The browser only fetches and executes the module at that URL once.
It then provides a reference to the module's exports each time it's imported.
This is critical for a module system,
since a module may be a dependency of many other modules.
It's also important that the module is only executed once,
because modules can have internal mutable state!

The most general form of `export` statement is
`export { a as b, c as d }`
as the last line of the module.
It takes the variables `a` and `c` in scope at that point.
(It _doesn't_ take expressions;
if you write something like `export { 5+5 as x }`,
you'll get a syntax error.)
The `export` statement then exposes "live bindings"
to those variables with names `b` and `d`.

Note that `export` is a _statement_, not an _expression_.
And note also that it's a _static_ annotation,
used at "compile" time rather than runtime.
This might be surprising,
since JavaScript is ordinarily very dynamic.

It's important to understand that `export` does not export the _value_ of the variable;
it exports a "live binding" to the variable.
Rather than exporting the value of `myNumber`,
it exports something like the function `() => myNumber`.
Here's a test to see the difference.
We have this module:

```js
let n = 5;
function incr() { n++; }
export { n as n, incr as incr };
```

Then we import it, and use the `incr` function:

```js
const module = await import('/myModule.js');
console.log(module.n);
module.incr();
console.log(module.n);
```

What do you think -- does `module.n` get incremented?
If you think of `export { n as n }` as exporting the _value_ of `n`,
you might expect that this logs `5` twice.
But it doesn't; it logs `5` then `6`!

Next, try incrementing the value from outside the module:

```js
const module = await import('/myModule.js');
console.log(module.n);
module.n++;
console.log(module.n);
```

This time, it logs `5` twice.
The expression `module.n++` is shorthand for `module.n = module.n+1`.
However, the property `n` is read-only.
The above silently fails,
but if you use a static import (see below),
you'll get an error `Cannot assign to read only property 'n' of object '[object Module]'`.

There are _many_ other syntactic forms of export statement.
Too many, in my opinion.
But they can all be understood in terms of
`export { a as b, c as d }` as the last line of the module.
Let's see some of them:

* You can put `export { e as f }` at other top-level points in the module.
  It adds `e as f` into the final export list at the bottom.
  But you can't put `export` statements anywhere else,
  such as in an `if` condition --
  you'll get a syntax error.
* `export { e }` is sugar for `export { e as e }`.
* `export const x = 5` is sugar for `const x = 5; export { x }`.
* `export default <expr>` is sugar for `const tmp = <expr>; export { tmp as default }`.

That last one, the `default` keyword,
is a rather pointless complexification.
You'll see in a minute that
it adds even more pointless complexification to `import`ing, too.

So, now we get to all the forms of `import`.
Earlier I showed you the `import()` call,
which returns a promise of a module.
This is actually known as a "dynamic `import`" expression,
to contrast it from the more commonly used static `import` statements.

The most general form of static `import` statement is
`import * as myModule from './myModule.js'`.
This is mostly equivalent to the dynamic statement
`const myModule = await import('./myModule.js')`,
except that you can't use `await` at the top-level in JS modules.
The static form can magically import the module synchronously,
because the browser has fetched and executed all static dependencies before it runs the module.

You can get away with only writing static `import` statements in this form.
But there are myriad other syntactical forms of `import`.

The form `import { n } from './myModule.js'`
is _like_ `import * as tmp from './myModule.js'; const n = tmp.n`.
But it's not the same if `a` is a mutable value!
Here we can truly see the "live bindings" at work:

```js
import { n, incr as increment } from './myModule.js';
console.log(typeof n);  // claims that n is just an ordinary 'number' ...
console.log(n);         // with the value 5
increment();            // so this shouldn't do anything ...
console.log(n);         // but now n == 6! Only possible with 'live bindings'.
                        // OK, so if `n` can change, can't we change it from here?
n++;                    // Nope, this throws "Assignment to constant variable"!
```

The above would be impossible in old-school JavaScript,
a lexically scoped language.
Some (unpleasant) magic is going on here.

The form `import d from './myModule.js'` stands for
`import { default as d } from '/myModule.js'`.
Careful:
you will forever find yourself writing `import myModule from './myModule.js'`
to import the entire module,
where in fact you meant to write `import * as myModule from './myModule.js'`.

So, what's the point of this weird "default export" concept?
IMO, it reeks of design by committee.
Some designers wanted a module to only export a single value,
whereas others a module to only export a set of named values.
Inevitably, the committee gave us _both_ options,
and we paid the price with this weird extra language feature
that doesn't exist in any other languages.

Finally, to end where I started,
I haven't yet mentioned `<script type="module">`.
This is how you import a JavaScript module directly from HTML,
rather than using `import()`.
By default, it is `defer`red, even when written inline.
So, for example,
these will run in the opposite order:

```html
<script type="module">console.log("module");</script>

<script>console.log("classic script");</script>
```

There's more to say about modules, but this should be enough to get you started.
It's got some weird design decisions, but it's better than the situation in 2005.
