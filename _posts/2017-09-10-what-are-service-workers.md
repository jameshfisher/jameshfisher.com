---
title: What are service workers?
tags: []
summary: >-
  Service workers are scripts that run outside the browser context, allowing web
  apps to perform tasks like caching, network requests, and offline
  functionality.
---

The Service Worker API lets a webpage register a script as a "service worker" in the local browser.
Web applications can use service workers to run code outside the "browsing context".
In Chrome, you can view all the service workers that sites have registered on your browser.
In Developer Tools, go to Application, Service Workers, and check "Show all".
I have quite a few.

All service workers have a URL.
This resolves to the JavaScript that the service worker runs.
Most websites seem to have one global service worker,
e.g. `https://www.youtube.com/sw.js` or `https://www.theguardian.com/service-worker.js`.
How did these service workers get onto my browser?
[The Guardian's website is open source](https://github.com/guardian/frontend) and
[we can see where the service worker is registered](https://github.com/guardian/frontend/blob/a01e2bd8d1ba32c9778982e0150d93c5d63f667f/static/src/javascripts/bootstraps/enhanced/main.js#L299):

```js
const navigator = window.navigator;
if (navigator && navigator.serviceWorker) {
    navigator.serviceWorker.register('/service-worker.js');
}
```

After registration, the JavaScript runs.
The Guardian's service worker's purpose, apparently, is
to block requests to `adsafeprotected.com` from any pages on `theguardian.com`,
depending on whether the user visits a page with the hash `#noias`.
The service worker can be on or off.
This is stored as a global variable:

```js
var blockIAS = false;
```

In service workers, there is no `window` object on which globals are stored.
Instead there is an implicit `self` object, which is a `ServiceWorkerGlobalScope`.
Thus the above line is the same as

```js
self.blockIAS = false;
```

The `blockIAS` is controlled by "client" webpages.
Those pages can send the service worker messages.
Service workers, when they run, register event listeners.
The Guardian's service worker listens for two types of event,
and one is:

```js
this.addEventListener('message', function (event) {
  blockIAS = !!event.data.ias;
});
```

Notice the reference to `this`.
At the global scope, `this` refers to the same `self` object.
This is the same as how global `this` refers to the `window` object in a browser context.

This `message` handler will receive messages sent by "client" pages calling `postMessage`.
Client pages can send a message with a boolean inside,
like this:

```js
navigator.serviceWorker.register('/service-worker.js')
.then(function () {
    return navigator.serviceWorker.ready;
})
.then(function (swreg) {
    swreg.active.postMessage({ ias: window.location.hash.indexOf('noias') > -1 });
});
```

The second event listener registered is `fetch`:

```js
this.addEventListener('fetch', function (event) { /* ... */ });
```

The `fetch` handler intercepts HTTP requests made by `theguardian.com` pages.
In effect, this handler is a local web server.
The `event.request` is a `Request` object, the same as in the Fetch API.
An `event.respondWith(...)` function takes a `Response`, as in the Fetch API.
If the handler doesn't call this, the browser does its normal request logic.
The Guardian's service worker matches on the request,
and if it's bad, returns a "forbidden" response.

Web pages have up to one service worker at `navigator.serviceWorker.controller`.
I have a tab I have open on [The Guardian website](https://www.theguardian.com/uk),
and in the console I get:

```
> window.navigator.serviceWorker.controller
ServiceWorker {scriptURL: "https://www.theguardian.com/service-worker.js", state: "activated", onstatechange: null, onerror: null}
```

On non-controlled pages, `window.navigator.serviceWorker.controller` is `null`.
Pages set their controller with the `navigator.serviceWorker.register(...)` method shown earlier.

A page with a service worker under `controller` is a "client" of that service worker.
In the list of service workers in Chrome,
you see a list of each service worker's clients.
The Guardian's has just one client: the tab I have open.
