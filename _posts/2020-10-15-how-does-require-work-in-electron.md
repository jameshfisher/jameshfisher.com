---
title: How does `require` work in Electron?
tags:
  - programming
  - electron
  - javascript
summary: >-
  `require` in Electron works like Node.js, allowing you to load modules, but
  each Renderer process has its own isolated module state. Relative module
  resolution depends on whether you use `loadFile` or `loadURL`.
---

[Electron apps copy the Chromium process architecture](/2020/10/14/the-electron-process-architecture-is-the-chromium-process-architecture/).
When you start an app with something like `electron main.js`,
this starts the Chromium browser process.
You pass it a Node.js module like `main.js`.
[Node.js uses the CommonJS system](/2020/09/27/what-does-the-require-function-do-in-nodejs/),
so the initial module can `require` further modules.
For example, this script will act much like a Node.js script:

```js
const { readFileSync } = require('fs');
console.log(readFileSync('README.md').toString());

const {getValue, increment} = require('./counter.js');
increment();
console.log(getValue());
```

The additional power of Electron comes from `require('electron')`.
This module provides an API for launching new Renderer processes
by running things like:

```js
const { app, BrowserWindow } = require('electron');
app.whenReady().then(() => {
  const window = new BrowserWindow();
  window.loadFile('./index.html');
});
```

The Renderer processes act much like ordinary web pages.
But you can allow them to use the Node.js module system, too!
To do so, we pass:

```js
const window = new BrowserWindow({
  webPreferences: {
    nodeIntegration: true
  }
});
```

With `nodeIntegration: true` set,
`require` becomes available to JavaScript in the context of that page,
and we can write things like:

```html
<!doctype html>
<html>
  <body>
    <h1>Renderer</h1>
    <script>
      const electron = require('electron');
      console.log(electron);
    </script>
  </body>
</html>
```

The Node.js module system is stateful.
For example, we can have a `counter.js` module like:

```js
let counter = 0;
exports.getValue = () => counter;
exports.increment = () => counter++;
```

In a typical Node.js app,
this module would be loaded once,
and the `counter` state would be shared globally.
This is not the case in Electron.
Each Renderer process is isolated,
and its modules will have their own state.
In other words,
you can't use modules for sneaky inter-process communication
(we have other things for that).

The `require('electron')` module is a built-in,
but we can require local modules in the file system too.
As far as I can tell,
Electron searches for modules in the same way Node.js does.
But relative to what starting filepath?

If you use `loadFile`, modules seem to be resolved relative to the loaded file.
For example, if you `loadFile("foo/bar/baz.html")`,
then a call to `require('some_module)'` on that page
will look for a module at `foo/bar/baz/node_modules/some_module`.
But if you use `loadURL` with a non-file protocol,
`require('some_module')` won't search for modules on disk;
it seems to only work for built-in modules like `"electron"` or `"fs"`.
This is a good thing
(and you probably shouldn't be using `nodeIntegration` with `loadURL` anyway!).

Even though we _can_ use `require` to load our dependencies in Renderer processes,
I'm not sure we _should_.
I feel like it's better to stick to the standard ways to load dependencies in a browser,
like `<script>` and `import`.

(Although using `import` in a Renderer process is probably another can of worms.
It's ambiguous: does it use the browser's module resolution, or that from Node.js?
Another post for another time.)
