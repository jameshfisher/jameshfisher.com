---
title: "Web Notification API onclick"
---

I've covered before that the browser Notification API lets you display desktop notifications like this:

```js
Notification.requestPermission(perm =>
  navigator.serviceWorker.ready.then(reg => reg.showNotification("HEY!!")));
```

And when I click that notification ... nothing happens.
Actually, something does happen: a Chrome window focuses.
An arbitrary Chrome window.
This is not what I want.

We want to supply a callback for notification clicks.
This is yet another service worker event type!
This time, it's `onnotificationclick`.
Drop this in your service worker:

```js
self.addEventListener("notificationclick", (ev) => {
  console.log("Notification clicked!");
});
```

Now when you click the notification, the console logs that line.
Now more useful: I would like notification clicks to open a webpage.
This can be done with `clients.openWindow`:

```js
self.addEventListener("notificationclick", (ev) => {
  clients.openWindow("https://jameshfisher.com/");
});
```
