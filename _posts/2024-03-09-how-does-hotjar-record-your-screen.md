---
title: "How does HotJar record your screen?"
tags: ["programming", "web"]
---

I was blown away when I first saw tools like HotJar.
You could see everything your users were doing!
The only thing missing was a secret recording of their webcam!

How does it work?
Capturing mouse and keyboard events is easy,
but how can you record exactly what the user sees?
Browsers have a [Screen Capture API](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Capture_API),
but these tools sure don't use that.
They need to work efficiently in the background without extra permissions.

[PostHog session replay](https://posthog.com/session-replay) is a modern, open-source implementation.
It uses [rrweb](https://github.com/rrweb-io/rrweb),
a library to "record and replay the web".
All the magic is in there.

Here's a first attempt,
which sends the DOM as HTML to your recording endpoint once per second:

```js
const sessionId = Math.random();

function snapshot() {
  return (new XMLSerializer()).serializeToString(document);
}

function sendSnapshot() {
  fetch(`/recordings/${sessionId}`, {
    method: 'POST',
    body: snapshot()
  })
}

setInterval(sendSnapshot, 1000)
```

Problems with this naive implementation:

1. It doesn't capture everything.
2. It misses changes, and captures them too late.
3. It's very inefficient (in CPU, network, and storage).

What other state is there to capture?
The HTML has references to external resources, like images and stylesheets.
To capture the image data, [rrweb draws the image to a canvas](https://github.com/rrweb-io/rrweb/blob/e607e83b21d45131a56c1ff606e9519a5b475fc1/packages/rrweb-snapshot/src/snapshot.ts#L744).
And to capture a stylesheet,
we can consult [`Document.styleSheets`](https://developer.mozilla.org/en-US/docs/Web/API/Document/styleSheets).
We also need the `window.innerWidth` and `window.innerHeight`,
and the scroll offsets for anything with a scrollbar.

To capture all changes instantly,
we can use [the `MutationObserver` API](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver).
This lets us replace `setInterval` with something like:

```js
const observer = new MutationObserver(sendSnapshot);
observer.observe(
  document.documentElement,
  { attributes: true, childList: true, subtree: true }
);
```

Finally, we can make this more efficient
by capturing _changes_ rather than _snapshots_.
The `MutationObserver` callback gets a list of [`MutationRecord`s](https://developer.mozilla.org/en-US/docs/Web/API/MutationRecord).
In theory they can be _applied_ to a snapshot to get an updated DOM.
We can send deltas these to our recording API.
We'll need to also send any external resources that the updated nodes refer to.

