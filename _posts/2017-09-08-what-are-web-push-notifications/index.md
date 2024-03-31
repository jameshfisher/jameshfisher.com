---
title: What are web push notifications?
draft: true
tags: []
---

You probably know what mobile push notifications are.
On your phone, there's a notification center,
which shows things like
"Remember to practice French today!" (sent by Duolingo to your Duolingo app instance),
or "Could you review the Goat & Boot pub?" (sent Google to your Google Maps app instance).
Your app instances can ask you for permission to receive these push notifications.
If you authorize it,
your phone will display notifications which the app developers send to that app instance.

The same technology exists for browsers!
Websites can ask you for permission to receive push notifications.
If you authorize it,
your browser will display notifications which the website owner sends to your browser.

There are two APIs:
the [Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
and the [Notification API](https://developer.mozilla.org/en-US/docs/Web/API/notification).
The Push API enables data to be sent from website operators to your browser.
The Notification API lets web apps on your browser to display system-level notifications,
outside of any webpage viewport.
In mobile push notifications,
these two separate pieces of functionality are confused and mixed together.

The mobile OS operators operate central _push notification gateways_.
Apple has one called APNs, and Google has one called FCM.
These gateways are central internet services
which mobile app instances can subscribe to
and app developers can publish to.
