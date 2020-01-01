---
title: "How does Glitch refresh my app?"
tags: ["programming", "web"]
---

<div id="display" style="display: none; outline: 5px solid red; padding: 2em;"></div>
<script>
  function showHash() {
    const displayEl = document.getElementById("display");
    displayEl.style.display = "block";
    displayEl.innerHTML = atob(window.location.hash.slice(1));
  }
  if (window.location.hash) showHash();
  window.onhashchange = showHash;
</script>

A small mystery presented itself the other day.
I was making an app with [Glitch](http://glitch.com/),
a web platform for building web apps.
The app I was making is at [`toupac.glitch.me`](https://toupac.glitch.me/),
and I had that window open while coding.
In another tab with URL `glitch.com/edit`,
I was editing the source for the app.

Every time I edited the source,
my web app would refresh,
showing the latest version.
This was a cool feature,
but how was Glitch doing it?

My first thought was "WebSocket".
But nope, nothing,
and no other network activity either.
This makes sense,
because if my app _did_ have WebSocket activity,
it would mean Glitch injects some code into my app to make it refresh,
which would be ugly.

I figured the editor and the app must be talking via some local browser magic instead.
Maybe a [shared worker](https://developer.mozilla.org/en-US/docs/Web/API/SharedWorker),
or [service worker](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API),
shared between the tabs?
But there was no evidence of these either,
and this theory presented another problem:
the editor is on `glitch.com` but the app is on `glitch.me`,
which I think means
these pages shouldn't be allowed to talk to each other!

I got a clue when I realized that
the magic only happened
when I loaded my web app directly from the editor
by clicking on "Show in a new window".
If I opened my app by typing in the URL directly,
it wouldn't refresh when I edited the source.
There was something special about that "Show in a new window" button in the editor.
It must get special powers over the window it opens,
letting it refresh the window when it pleases.

I found the source in the Glitch editor.
Edited for clarity,
it looked like this:

```js
const appUrl = "https://toupac.glitch.me";
let previewWindow;
function showInNewWindow() {
  previewWindow = window.open(appUrl, "_blank");
}
function updatePreview() {
  previewWindow.location = appUrl;
}
```

It turns out that [`window.open` returns a `WindowProxy` object](https://developer.mozilla.org/en-US/docs/Web/API/Window/open)
that you can then manipulate like a `Window` object.
I've used `window.open` many times,
but never realized it gave you magic powers over the window you open!

I've reproduced this functionality below.
Click the button to open a new window. 
The new window will show the contents of the textarea.
When you edit the textarea,
the contents will refresh in the new window.

<button id="open-window">Show new window</button>
<textarea rows="10" id="source" style="width: 100%; font-family: monospace;">&lt;h1 style='color: blue'&gt;Hello, world!&lt;/h1&gt;</textarea>
<script>
    let w;
    const sourceEl = document.getElementById("source");
    let baseUrl = window.location.href;
    if (baseUrl.indexOf("#") === -1) {
        baseUrl = baseUrl.slice(0, baseUrl.indexOf("#"));
    }
    const latestUrl = () => baseUrl + "#" + btoa(sourceEl.value);
    document.getElementById("open-window").onclick = () => {
        w = window.open(latestUrl(), '_blank');
    };
    sourceEl.oninput = () => {
        if (w) {
            w.location = latestUrl();
        }
    };
</script>
