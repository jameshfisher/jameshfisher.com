---
title: What is the web Background Sync API?
tags: []
summary: >-
  The Background Sync API lets service workers execute tasks even when the
  client page is not active. It
  queues jobs that run as `sync` events, which can trigger desktop
  notifications.
---

Without the Background Sync API,
service workers only run while client pages are active
(or when they receive a push from a server).
The Background Sync API allows service worker jobs
to be queued by web applications,
so they will run regardless of whether client pages are open.
This is designed for offline use-cases like "upload this file when on WiFi".

The queued job happens as a `sync` event,
which the service worker can listen for:

```js
self.addEventListener("sync", (ev) => {
  self.registration.showNotification("Syncing!");
});
```

If you add this to your service worker,
and request notification permissions (with `Notification.requestPermission(...)`),
you can trigger a "Syncing!" desktop notification by triggering a sync.
In Chrome, you can simulate a sync event by opening Developer Tools,
going to Application,
and for your service worker, click "Sync" ("Emulate background sync event").

To queue a sync for real, use `ServiceWorkerRegistration.sync.register('someTag')`,
e.g. by:

```js
navigator.serviceWorker.ready.then(reg => reg.sync.register("someTag"));
```

My service worker at `/service-worker.js` shows a notification when it gets a `sync` event.
You can trigger the above JS with this button:

<button onclick="navigator.serviceWorker.ready.then(reg => reg.sync.register('someTag'));">Sync</button>

The sync functionality above does not provide any ability to _schedule_ a job
for a specified time in the future;
nor does it provide for repeating jobs.
However, these are provided by a "periodic sync" API, currently in bleeding-edge Chrome.
See next blog post!
