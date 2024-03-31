---
title: '`new Notification(...)` is deprecated'
tags: []
summary: >-
  Deprecated `new Notification()` replaced with
  `ServiceWorkerRegistration.showNotification()`.
---

Earlier I showed this example of the Notification API:

```js
Notification.requestPermission(perm => new Notification('HEY!!'));
```

Unfortunately this uses a deprecated feature.
[The `window.Notification` constructor is not marked as deprecated!](https://developer.mozilla.org/en-US/docs/Web/API/notification)
However, [it's marked as deprecated in Chrome on Android](https://stackoverflow.com/questions/19474116/the-constructor-notification-is-deprecated).
The Brave New World is service-worker notifications, which are triggered like this:

```js
Notification.requestPermission(perm =>
  navigator.serviceWorker.ready.then(reg => reg.showNotification("HEY!!")));
```

In other words, `ServiceWorkerRegistration.showNotification` is the replacement for `new Notification`.
For this to work, you need to install a service worker.
I've updated the service worker at `/service-worker.js`
so that I/you can run:

```js
Notification.requestPermission((perm) => {
  if (perm == "granted") {
    window.navigator.serviceWorker.ready.then(reg =>
      reg.active.postMessage({
        method: "notify",
        title: "HEY!!",
        options: {body: "This is some extra text under the title."}
      }));
  }
});
```
