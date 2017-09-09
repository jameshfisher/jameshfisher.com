---
title: "Service worker hello world"
---

The following service worker gets a ping message and responds to it with "pong":

```js
self.addEventListener("message", (ev) => ev.source.postMessage("pong"));
```

I'm hosting this service worker at `/service-worker.js`.
This page registers that service worker as its controller,
wait for the service worker to be ready,
then send it a "ping" message:

```js
if (window.navigator && window.navigator.serviceWorker) {
  window.navigator.serviceWorker.addEventListener("message", (ev) => console.log("Received message:", ev.data));
  window.navigator.serviceWorker.register("/service-worker.js");
  window.navigator.serviceWorker.ready.then((reg) => reg.active.postMessage("ping"));
}
```

Open the JavaScript console.
You should see:

```
Received message: pong
```

<script>
if (window.navigator && window.navigator.serviceWorker) {
  window.navigator.serviceWorker.addEventListener("message", (ev) => console.log("Received message:", ev.data));
  window.navigator.serviceWorker.register("/service-worker.js");
  window.navigator.serviceWorker.ready.then((reg) => reg.active.postMessage("ping"));
}
</script>
