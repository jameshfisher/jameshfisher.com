---
title: JavaScript live bindings are just concatenation
tags:
  - programming
  - web
  - javascript
---

[The other day I wrote an intro to ECMAScript modules](/2020/09/25/javascript-modules-for-grumpy-developers-from-2005/),
and concluded that "live bindings" are a fundamentally new magic language feature.
I wrote things like:

> The form `import { n } from './counter.js'`
> is _like_ `import * as tmp from './counter.js'; const n = tmp.n`.
> But it's not the same if `a` is a mutable value!
> Here we can truly see the "live bindings" at work:
> 
> ```js
> import { n, incr as increment } from './counter.js';
> console.log(typeof n);  // claims that n is just an ordinary 'number' ...
> console.log(n);         // with the value 5
> increment();            // so this shouldn't do anything ...
> console.log(n);         // but now n == 6! Only possible with 'live bindings'.
>                         // OK, so if `n` can change, can't we change it from here?
> n++;                    // Nope, this throws "Assignment to constant variable"!
> ```
> 
> The above would be impossible in old-school JavaScript,
> a lexically scoped language.
> Some (unpleasant) magic is going on here.

I wasn't exactly wrong,
but there is a much easier way to understand the semantics of ECMAScript modules,
which doesn't invoke the new idea of a "live binding":
ECMAScript modules are just concatenation!
Well, _almost_.

I realized this when looking at the output from [rollup](https://github.com/rollup/rollup),
an ECMAScript module bundler.
You give it an "entry point" file with ECMAScript imports,
and it spits out a bundle in plain old JavaScript,
with no "live binding" magic.
That bundle is basically concatenation with some variables renamed.
Here's an example input:

```js
// counter.js
export let n = 0;
export function increment() { n++; };

// main.js
import { n, increment } from './counter.js';
console.log(n);
increment();
console.log(n);
```

And here's what rollup spits out when bundling `main.js`:

```js
let n = 0;
function increment() { n++; };

console.log(n);
increment();
console.log(n);
```

If you've ever seen the output from a CommonJS bundler,
you'll find this output comparatively pleasant.
It's precisely the input modules,
with the `import` and `export` annotations stripped,
then concatenated.
A "live binding" is then just an ordinary variable at the top-level scope.

Onto the details and corner-cases.
Consider a restricted form of ES modules,
in which you can only write:

```js
export { x, y, z };               // Exporting
import { x, y } from './foo.js';  // Importing
```

With this restricted form,
executing a module basically means:

1. Gather all of its dependencies.
2. Sort the dependencies topologically.
3. Concatenate all the dependencies.
4. Execute the concatenated file.

There are just a few error cases to check for.
If you find a circular dependency between modules, that's an error.
If a module assigns to an imported variable, that's an error.
These are static checks before execution.

However, ES modules have some other forms of `export` and `import`.
Most can be dealt with by just renaming variables.
The form `import { x as y }` is dealt with 
by renaming the variable `y` to `x`.
Similarly, the (bizarre and useless) "default export" feature
just amounts to giving a fresh name to the default export.

The form `import * as foo` causes more trouble,
because it allows _dynamic_ access to the module `foo`,
but the concatenation method erases any runtime concept of a module `foo`.
The calling module might call a function on it, like `console.log(foo)`,
or it might try to assign properties to the module, like `foo.newProp = 42`,
or it might try to get its properties dynamically, like `console.log(foo[i++])`.
To cover these cases, 
rollup creates an esoteric-looking new object for `foo`:

```
// Original
import * as foo from './sub.js';
console.log(foo);

// Compiled
var foo = /*#__PURE__*/Object.freeze({
	__proto__: null,
	get bar () { return bar; }
	get baz () { return baz; }
  // ...
});
console.log(foo);
```

The comment `/*#__PURE__*/` can be ignored.
The `Object.freeze` prevents properties being changed or added.
And the `get` keyword creates a [getter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get),
which makes `foo.q` behave as a reference to the `q` variable,
rather than as a copy of `q`.
