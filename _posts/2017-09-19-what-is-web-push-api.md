---
title: "What is the web Push API?"
---

The [Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
lets a web application "subscribe" for notifications from a remote server.
The following code will log a `PushSubscription` object:

```js
navigator.serviceWorker.ready.then(reg => {
  reg.pushManager.subscribe({userVisibleOnly: true}).then(sub => {
    console.log("Subscription:", sub);
    window.sub = sub;
  });
})
```

The `PushSubscription` object has one important property:
`endpoint`, a URL which can be used to send push notifications to this web application.
When I run the above, I get an endpoint which looks like:

```
https://android.googleapis.com/gcm/send/SOME_DEVICE_TOKEN
```

[The Push API spec](https://www.w3.org/TR/push-api/#push-service)
says that the way to use this URL is described by
[the "Web Push Protocol"](https://tools.ietf.org/html/draft-ietf-webpush-protocol-12).
But this draft spec is expired and vague on details,
so it's currently impossible to do anything with it in a browser-agnostic way.
However, I was able to get this working by doing:

```
$ curl -H 'Authorization: key=MY_SERVER_KEY' -H 'Content-Type: application/json' -d '{"data": {"example":"data"},"to":"SOME_DEVICE_TOKEN"}' https://android.googleapis.com/gcm/send
```

Hooray, I get a push notification!
But This borked API means your application server needs
separate logic for every possible push service!
This is pretty rough.
