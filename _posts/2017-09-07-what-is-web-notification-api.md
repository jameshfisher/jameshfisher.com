---
title: What is the web Notification API?
tags:
  - web
  - javascript
  - notifications
  - ux
taggedAt: '2024-03-26'
summary: >-
  The web Notification API allows web apps to display system-level
  notifications, requiring user permission. It has two key parts: requesting
  permission and creating notifications.
---

The web Notification API lets web apps on your browser display system-level notifications,
outside of any webpage viewport.
The Notification API can be demonstrated in one LOC:

```js
Notification.requestPermission(perm => new Notification('HEY!!'));
```

Click this button to see what it does:

<button onclick="Notification.requestPermission(perm => new Notification('HEY!!'))">Notify</button>

The Notification API has two important pieces.
The first is `Notification.requestPermission(...)`,
which prompts the user (you)
to allow this website to display notifications.
It accepts a callback,
which will be called once the user has made a decision.
The callback is passed a string, either `"granted"` or `"denied"`.
The above example assumes it was granted.
This status is also available as `Notification.permission`,
which is `"default"` if the user has not said either way.

The second piece of the Notification API is `new Notification(...)`.
This displays a notification, if `Notification.permission == "granted"`.

The permission is per-origin, and persistent.
Here, the origin is `https://jameshfisher.com:443`.
This means any other webpage on this origin you notifications,
and any "shared workers" for this origin can send you notifications.

Yes, the example above was just to trick you into accepting notifications from me!
If you want to change your settings, this varies per browser.
[Try here if you're using Chrome](chrome://settings/content/notifications).

The Notification API is different from the Push API.
The Push API allows remote servers to send data to your local browser.
Together, these two APIs enable "web push notifications".
I'll cover the Push API in future.
