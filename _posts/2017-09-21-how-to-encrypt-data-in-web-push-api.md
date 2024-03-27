---
title: How can I encrypt data in the Web Push API?
tags: []
---

Here's a service worker push handler I wrote:

```js
self.addEventListener("push", (ev) => {
  self.registration.showNotification(ev.data.title);
});
```

I then pushed an event to it with:

```
curl https://android.googleapis.com/gcm/send -H 'Authorization: key=MY_SERVER_KEY' -H 'Content-Type: application/json' -d '{"data":{"method":"notification","title":"There's a new post!"},"to":"DEVICE_TOKEN"}'
```

This is wrong for a whole bunch of reasons!
I got an error in my service worker:

```
Uncaught TypeError: Cannot read property 'title' of null
```

Why is `data == null`?
It turns out that
Google have decided this push data
is too juicy to be seen by intermediary push services like GCM/FCM
("wait, I thought Google _wanted_ to see my data?").
Instead, Google have decided on an encryption scheme for such data,
so that push services can never read it.
The user agent (browser) generates a private key for each new push subscription.
The corresponding _public_ key is given to the web application,
which the web application then passes to some server.
The server then encrypts any data with this public key,
and the user agent (browser) decrypts it before passing it on to the web application.

In full, when doing `PushManager.subscribe`,
my browser gives me an object like this:

```json
{
  "endpoint": "https://android.googleapis.com/gcm/send/DEVICE_TOKEN",
  "expirationTime": null,
  "keys": {
    "p256dh":"1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef=",
    "auth":"1234567890abcdef=="
  }
}
```

The `keys.p256dh` is the asymmetric public key.
The `keys.auth` is apparently a "shared authentication secret",
"to allow the client to authenticate that the message was sent by a trusted server".
(This seems to duplicate the purpose of the device token and/or capability URL?)
The web application is supposed to serialize all of the `PushSubscription` (e.g. with `JSON.stringify`),
and send this to the application server.

Now, on the application server,
it's more complicated than a `curl` command.
Instead, Google have made [this `web-push` library for Node.js](https://github.com/web-push-libs/web-push)
(nope, there's not one for Go).

```
npm install web-push --save
```

```js
const webpush = require('web-push');
webpush.setGCMAPIKey('YOUR_SERVER_KEY');
const pushSubscription = {endpoint:"...",keys:{p256dh:"...",auth:"..."}};
webpush.sendNotification(pushSubscription, JSON.stringify({method:"notification",title:"There's a new post!"}));
```

Then, on the server worker `push` event, there is an object has a `data`,
but it's a [`PushMessageData`](https://developer.mozilla.org/en-US/docs/Web/API/PushMessageData).
This has a method `.json()` to parse it from JSON into an ordinary object.
So our service worker `push` handler looks like this:

```js
self.addEventListener("push", (ev) => {
  let data = ev.data.json();
  if (data.method === "notification") {
    self.registration.showNotification(data.title, data.options);
  } else {
    console.log("Received push with unknown method: ", data, ev);
  }
});
```
