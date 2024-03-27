---
title: How does the Node.js REPL display previews?
tags:
  - programming
  - javascript
---

When typing in the `node` repl,
you get instant previews as you type, 
like this:

<asciinema-player src="/assets/2020-10-05/math_random.cast" autoplay loop theme="solarized-light"></asciinema-player>

Clearly, the REPL is _executing_ your code every time you hit a key.
But how can this be safe?!
Imagine the chaos if you typed `rm -rf /foo/bar/baz` 
and your shell tried to execute it at every keystroke!

The Node.js REPL implementation uses [the `inspector` module](https://nodejs.org/api/inspector.html),
which is an interface to V8.
Here's a basic REPL for Node.js:

```js
const readline = require('readline');
const inspector = require('inspector');
const session = new inspector.Session();
session.connect();
const rl = readline.createInterface({ input: process.stdin });
rl.on('line', function(line) {
  session.post(
    'Runtime.evaluate', 
    { expression: line }, 
    function cb(err, res) {
      console.log(res.result.value);
    }
  );
});
```


The key is that, for previews,
[the REPL passes `throwOnSideEffect: true` to V8](https://github.com/BridgeAR/node/blob/b38d26a1685630eaf0a2aa2a933934e80f0a3f57/lib/internal/repl/utils.js#L291).
I'm not sure exactly what V8 considers a side-effect,
but apparently it doesn't consider `Math.random()` to have side-effects.
I'm like 99% sure it would consider "deleting all my files" to be a side-effect, though.

<link rel="stylesheet" type="text/css" href="/assets/2020-10-05/asciinema-player.css" />

<script src="/assets/2020-10-05/asciinema-player.js"></script>
