---
title: "A JavaScript Promises implementation"
justification: "I use Promises all the time."
---

You can implement the `Promise` pattern yourself.
Here's an example of using `JimPromise`,
the implementation I describe in this post.
The function `httpGet` wraps `XMLHttpRequest` to provide a `Promise`-based HTTP API.

```js
// Promise<String> httpGet(String);
function httpGet(url) {
  const p = new JimPromise();
  const req = new XMLHttpRequest();
  req.onload = ()=>{
    p.fulfill(req.responseText);
  };
  req.open("GET", url);
  req.send();
  return p;
}
```

Above, we call `new JimPromise()` in the promise provider,
to get a promise to return synchronously.
Between creating the promise and returning it,
we launch some async tasks which will eventually `fulfill` the promise.

The `JimPromise` constructor is as follows.
It creates a promise in the "pending" state,
here marked by `isFulfilled = false`.
When the pending `JimPromise` is eventually fulfilled,
it needs to notify listeners.
For this, it keeps an array of callback functions, `callbacks`,
which is initialized to the empty array.

```js
function JimPromise() {
  this.callbacks = [];
}
```

After the async HTTP request completes,
the promise provider calls `p.fulfill(responseText)`.
The `fulfill` function needs to notify the listeners
by calling all of the `callbacks`:

```js
JimPromise.prototype.fulfill = function(value) {
  this.callbacks.forEach(cb => cb(value));
};
```

To subscribe to fulfilled values,
the promise-consuming code calls `registerCallback`, passing a callback.
Here's an example consumer of the `httpGet` promise:

```js
function logWebsiteManifest() {
  httpGet("/manifest.json").registerCallback(s => console.log(s));
}
```

When the  `registerCallback` handler is given a callback,
it adds it to the array:

```js
JimPromise.prototype.registerCallback = function(onFulfilled) {
  this.callbacks.push(onFulfilled);
};
```

This system now vaguely resembles the real `Promise` API,
but it's missing a lot.
One big problem is that,
if `registerCallback` is called after `fulfill`,
the callback won't be called.
To make this work,
we need to store the fulfilled value long-term,
to use it for late-registered callbacks.
When a callback is registered late,
we need to check whether the promise is already fulfilled,
and if so, use the stored value:

```js
function JimPromise() {
  this.isFulfilled = false;
  this.callbacks = [];
}

JimPromise.prototype.fulfill = function(value) {
  this.isFulfilled = true;
  this.value = value;
  this.callbacks.forEach(cb => cb(value));
};

JimPromise.prototype.registerCallback = function(cb) {
  if (this.isFulfilled) {
    cb(this.value);
  } else {
    this.callbacks.push(cb);
  }
};
```

Another problem is that callbacks should always be called asynchronously.
To do this in the browser, we use `window.setTimeout`, with a zero timeout:

```js
JimPromise.prototype.fulfill = function(value) {
  this.isFulfilled = true;
  this.value = value;
  this.callbacks.forEach(cb => window.setTimeout(() => cb(value)));
};

JimPromise.prototype.registerCallback = function(cb) {
  if (this.isFulfilled) {
    window.setTimeout(() => cb(this.value));
  } else {
    this.callbacks.push(cb);
  }
};
```

I've been careful to distinguish `registerCallback` from `then`.
The `then` function, as well as registering a callback,
is supposed to return another `Promise`.
The callback passed to `then` should return a `Promise`,
the result of which becomes the result of the `Promise` returned from `then`.
Here's an example of usage:

```js
httpGet("/users")
  .then(response => response.json())
  .then(users => httpGet(users[0].url))
  .then(response => response.json())
  .registerCallback(user => console.log("user", user));
```

And here's how we can implement `then` to chain these `Promise`s:

```js
JimPromise.prototype.then = function(onFulfilled) {
  const p = new JimPromise();
  this.registerCallback(v => onFulfilled(v).registerCallback(v2 => p.fulfill(v2)));
  return p;
};
```

Notice that
the promise-consuming code had
to use `registerCallback` as the final link in the chain,
instead of `then`.
This is because `console.log(...)` doesn't return a `Promise`.
In my opinion, this is acceptable.
However, apparently some people want to use `then` in every case.
If their `onFulfilled` callback does not return a `Promise`,
the returned value instead gets "wrapped" in a `Promise`.
This wrapping function is the static function `Promise.resolve`:

```js
JimPromise.resolve = function(value) {
  let p = new JimPromise();
  p.fulfill(value);
  return p;
};
```

With this, we can fix-up an `onFulfilled` which does not return a `Promise`:

```js
const fixupOnFulfilled = onFulfilled => v => {
  const r = onFulfilled(v);
  return (typeof r === 'object' && typeof r.then === 'function')?
    r : JimPromise.resolve(r);
};
```

Notice how I tested whether the returned value was a `Promise`:
by testing whether it has a `then` method.
If it does, we assume that it behaves like a `Promise`.
Sometimes, people refer to objects with a `then` function as `Thenable`.

We can now integrate our `fixupOnFulfilled` function into our `then` method:

```js
JimPromise.prototype.then = function(onFulfilled) {
  onFulfilled = fixupOnFulfilled(onFulfilled);
  const p = new JimPromise();
  this.registerCallback(v => onFulfilled(v).registerCallback(v2 => p.fulfill(v2)));
  return p;
};
```

There is an assumption that
the promise-providing code will eventually call `fulfill` exactly once.
We can guard against incorrect code calling `fulfill` more than once:

```js
JimPromise.prototype.fulfill = function(value) {
  if (this.isFulfilled) return;  // Alternatively, we could throw an error
  this.isFulfilled = true;
  this.value = value;
  this.callbacks.forEach(cb => window.setTimeout(() => cb(value)));
  delete this.callbacks;
};
```

The above code doesn't strictly conform to any standard.
In particular, it doesn't have any notion of failure, i.e. "rejected" promises.
I was more interested in exploring the many design decisions
in today's `Promise` specification.

Here's the implementation by the end of this post:

```js
function JimPromise() {
  this.isFulfilled = false;
  this.callbacks = [];
}

JimPromise.prototype.fulfill = function(value) {
  if (this.isFulfilled) return;  // Alternatively, we could throw an error
  this.isFulfilled = true;
  this.value = value;
  this.callbacks.forEach(cb => window.setTimeout(() => cb(value)));
  delete this.callbacks;
};

JimPromise.prototype.registerCallback = function(cb) {
  if (this.isFulfilled) {
    window.setTimeout(() => cb(this.value));
  } else {
    this.callbacks.push(cb);
  }
};

JimPromise.resolve = function(value) {
  let p = new JimPromise();
  p.fulfill(value);
  return p;
};

const fixupOnFulfilled = onFulfilled => v => {
  const r = onFulfilled(v);
  return (typeof r === 'object' && typeof r.then === 'function')?
    r : JimPromise.resolve(r);
};

JimPromise.prototype.then = function(onFulfilled) {
  onFulfilled = fixupOnFulfilled(onFulfilled);
  const p = new JimPromise();
  this.registerCallback(v => onFulfilled(v).registerCallback(v2 => p.fulfill(v2)));
  return p;
};
```
