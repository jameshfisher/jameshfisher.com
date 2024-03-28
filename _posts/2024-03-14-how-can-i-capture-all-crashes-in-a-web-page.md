---
title: How can I capture all crashes in a web page?
tags:
  - programming
  - web
summary: >-
  Including uncaught errors, unhandled promise rejections, image load failures,
  Content Security Policy violations, and `console.error` calls.
---

Services like [Sentry](https://sentry.io/)
have JS libraries that capture things that go wrong in your web page.
How do they work?

There are many kinds of "things that can go wrong",
and they must be captured in different ways:

* `window.addEventListener("error", handler)`
  handles errors that are `throw`n by JS but not caught by `try`/`catch`.
  This is because if no `catch` block is found,
  an `ErrorEvent` is created and dispatched directly on the `window` object.
* `window.addEventListener("error", handler, true)`
  handles `error` events in their _capture_ phase.
  This is needed to capture events that are dispatched on DOM elements.
  For example, if an `img` source fails to load,
  an "error" event is dispatched on that `img` element.
  Note that this event does not _bubble_, but it does have a _capture_ phase.
* `window.addEventListener("unhandledrejection", handler)`
  handles unhandled `Promise` rejections.
  (Note that, since Promises can be implemented in JS,
  this depends on the implementation.
  For example, [Bluebird dispatches this event](http://bluebirdjs.com/docs/api/error-management-configuration.html).)
* `window.addEventListener("securitypolicyviolation", handler)`
  handles `Content-Security-Policy` violations.
* `console.error` can be overridden.

Note there is also `window.onerror`,
an old and non-standard API
which seems to capture the same errors as `window.addEventListener("error")`.
I don't see a reason to use it.

Below is a small playground demonstrating these different kinds of crashes.

<style>
  #crashlog > div {
    background: #eee;
    margin: 0.5em;
    border-radius: 0.5em;
  }
</style>

<div>
  <button onclick="causeUncaughtError()">Cause uncaught error</button>
  <button onclick="causeUnhandledRejection()">Cause unhandled exception</button>
  <button onclick="causeImageFailure()">Cause image failure</button>
  <button onclick="causeCSPViolation()">Cause CSP violation</button>
  <button onclick="causeConsoleError()">Cause console error</button>
<div>
<div id="crashlog" style="font-family: monospace; font-size: 0.8em;"></div>

<div id="resources">
</div>

<script>
  // https://stackoverflow.com/a/18391400/229792
  if (!('toJSON' in Error.prototype)) {
    Object.defineProperty(Error.prototype, 'toJSON', {
        value: function () {
            var alt = {};

            Object.getOwnPropertyNames(this).forEach(function (key) {
                alt[key] = this[key];
            }, this);

            return alt;
        },
        configurable: true,
        writable: true
    });
  }

  const cspMetaEl = document.createElement('meta');
  cspMetaEl.setAttribute("http-equiv", "Content-Security-Policy");
  cspMetaEl.setAttribute("content", "img-src 'self';");
  document.head.appendChild(cspMetaEl);

  const crashlogEl = document.getElementById("crashlog");
  const resourcesEl = document.getElementById("resources");

  function report(source, data) {
    const crashEl = document.createElement("div");
    crashEl.innerText = `${source}: ${JSON.stringify(data)}`;
    crashlogEl.appendChild(crashEl);
  }

  window.addEventListener("error", (errorEvent) => {
    const { filename, lineno, colno, error, message } = errorEvent;
    report("window.addEventListener('error')", { filename, lineno, colno, error, message });
  });
  window.addEventListener("error", (errorEvent) => {
    report("window.addEventListener('error', ..., true)", errorEvent);
  }, true);
  window.addEventListener("unhandledrejection", (ev) => {
    report("window.addEventListener('unhandledrejection')", ev)
  });
  window.addEventListener('securitypolicyviolation', (event) => {
    const { blockedURI, violatedDirective, originalPolicy } = event;
    report("window.addEventListener('securitypolicyviolation')", { blockedURI, violatedDirective, originalPolicy });
  });

  let originalConsoleError = console.error;
  console.error = function() {
    report("console.error", arguments);
    originalConsoleError.apply(console, arguments);
  };

  function clear() {
    crashlogEl.innerText = '';
  }

  function causeUncaughtError() {
    clear();
    throw new Error('An error from the button');
  }

  function causeUnhandledRejection() {
    clear();
    new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(new Error('rejected!'));
      }, 100);
    });
  }

  function causeImageFailure() {
    clear();
    const imgEl = document.createElement("img");
    imgEl.setAttribute("src", "/fakeimage/" + Math.random().toString());
    resourcesEl.appendChild(imgEl);
  }

  function causeCSPViolation() {
    clear();
    const imgEl = document.createElement("img");
    imgEl.setAttribute("src", "https://example.com/csp-violation.png");
    resourcesEl.appendChild(imgEl);
  }

  function causeConsoleError() {
    clear();
    console.error("A console error");
  }
</script>
