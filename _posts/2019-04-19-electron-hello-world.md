---
title: Electron hello world
tags:
  - programming
---

First, install Electron via NPM:

```shell
$ npm init -y
$ npm install --save electron
```

Then create a web page to display in `index.html`:

```html
<!DOCTYPE html><html><body>Hello World!</body></html>
```

Then create `main.js`,
your app's entry point,
which loads that web page in an Electron window:

```js
const {app, BrowserWindow} = require('electron');

// Keep a global reference.
// A windows is closed when its object is GC'd!
let mainWindow;

app.on('ready', () => {
  mainWindow = new BrowserWindow({});
  mainWindow.loadFile('index.html');
  mainWindow.on('closed', () => app.quit());
});
```

Finally, run your app with the `electron` binary:

```
$ ./node_modules/.bin/electron .
```

If all goes well,
you'll get a new window which says "Hello world!".
