---
title: "The Electron process architecture is the Chromium process architecture"
tags: ["programming", "javascript", "electron"]
---

The Electron docs describe Electron as basically a mash-up of Node.js and Chromium. 
My mental model was that there are two kinds of process.
An Electron app has a single "Main" process,
which is basically a NodeJS process,
and which you launch with something like `electron main.js`.
Then this can launch "Renderer" processes,
each of which is basically a new Chromium process,
and which you launch with something like:

```js
const { app, BrowserWindow } = require('electron');
app.whenReady().then(() => {
  const window = new BrowserWindow();
});
```

This mental model was simplistic.
If you actually list processes with `ps` or Activity Monitor,
you'll find that
what Electron calls a "process" is a bit different to
what your OS calls a "process"!
An empty Electron app on macOS has processes like this:

```
-+- Electron main.js
 |--- Electron Helper (GPU) --type=gpu-process
 \--- Electron Helper --type=utility --utility-sub-type=network.mojom.NetworkService
```

[This process architecture comes from Chromium](https://www.chromium.org/developers/design-documents/multi-process-architecture).
Look at the process tree for Chrome running on your computer,
and you'll see basically the same thing:

```
-+= Google Chrome
 |--- Google Chrome Helper (GPU) --type=gpu-process
 |--- Google Chrome Helper --type=utility --utility-sub-type=network.mojom.NetworkService
 |--- Google Chrome Helper --type=utility --utility-sub-type=audio.mojom.AudioService
 |--- Google Chrome Helper --type=ppapi-broker
 |--- Google Chrome Helper (Renderer) --type=renderer
 |--- Google Chrome Helper (Renderer) --type=renderer
 ... an ungodly amount of these ...
 \--- Google Chrome Helper (Renderer) --type=renderer
```

Running `new BrowserWindow()` will create a native window,
but does not create any new OS processes.
To do that, we need to load a renderer in the window with `.loadFile` or `.loadURL`.
For example, this `main.js`:

```js
const { app, BrowserWindow } = require('electron');
app.whenReady().then(() => {
  for (let i = 0; i < 3; i++) {
    const window = new BrowserWindow();
    window.loadFile('./index.html');
    // We now have a window.webContents
  }
});
```

... will give us three Renderer processes:

```
-+- Electron main.js
 |--- Electron Helper (GPU) --type=gpu-process
 |--- Electron Helper --type=utility --utility-sub-type=network.mojom.NetworkService
 |--- Electron Helper (Renderer).app/Contents/MacOS/Electron Helper (Renderer) --type=renderer
 |--- Electron Helper (Renderer).app/Contents/MacOS/Electron Helper (Renderer) --type=renderer
 \--- Electron Helper (Renderer).app/Contents/MacOS/Electron Helper (Renderer) --type=renderer
```

So, my _new_ mental model is that an Electron instance is basically a Chromium instance.
It just has some Node.js integration:
the Chromium browser process runs a Node.js module on start-up,
and a Chromium renderer process can run a Node.js module by calling `require`.
