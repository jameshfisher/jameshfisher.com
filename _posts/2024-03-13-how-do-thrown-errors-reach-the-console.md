---
title: "How do errors in a web page reach the dev console?"
tags: ["programming", "web"]
---

When you write `throw new Error("blah")` in JavaScript,
this often results in a message in the console.
What are the steps that lead to this message?

First, we go up the call stack until the nearest `catch` block.
If there is no `catch` block, an `ErrorEvent` is created,
and `window.dispatchEvent` is called with it.
These errors can be observed by adding an event listener:

```js
window.addEventListener("error", (errorEvent) => {
  // ...
});
```

The browser's console is one such event listener.
We can see this by cancelling the events before they reach the console output:

```js
window.addEventListener("error", (errorEvent) => {
  errorEvent.preventDefault();
});
```

Despite GPT-4's beliefs, `throw new Error()` does _not_ propagate through the DOM tree.
If you throw an error in a button click event listener,
the error does is not dispatched on the button element,
and it does not bubble up to the button's ancestor elements.
The error event is dispatched directly on the `window` object.

However, other events _do_ propagate through the DOM.
If an image fails to load,
an "error" event is dispatched on the image element.
This event does not bubble, but it does have a capture phase.
We can capture these resource errors in their capture phase using:

```js
window.addEventListener("error", (errorEvent) => {
  // ...
}, true);
```