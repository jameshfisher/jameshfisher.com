---
title: "What are promises in JavaScript?"
tags: ["programming", "javascript"]
---

A `Promise` in JavaScript is a object
representing a value which may be available in the future.
For example, when asking the JavaScript runtime to make a request to Twitter,
it might give you a `Promise` of the HTTP response
instead of giving you the response immediately.
We can use this promise object to get the response later.
Promises have become prominent in JavaScript in recent years.
Where older DOM APIs use plain callbacks and the `addEventListener` method,
but newer DOM APIs tend to use the `Promise` construction.
I've used promises for a while,
but have never delved into their precise semantics or implementation.

Let's look at a specific DOM API:
the Fetch API, used to make HTTP requests.
Here's an example which gets the Content-Type of the file at `{% link manifest.json %}`:

```js
fetch(new Request("{% link manifest.json %}")).then(response => {
  console.log("Content-Type", response.headers.get("Content-Type"));
});
```

This prints:

```
Content-Type application/json; charset=utf-8
```

We can give the `fetch` function a type like:

```
type Window {
  Promise<Response> fetch(Request);
}
```

Typically with DOM APIs,
we never construct the `Promise` object ourselves;
we get it as the response to some API call like `fetch`.
Given the `Promise<Response>` object,
we are able to get the `Response`
by calling `then` on it.
We can give `then` a type, too:

```
type Promise<T> {
  Promise<T2> then(onFulfilled: T -> Promise<T2>);
}
```

The first argument to `then` is a callback function,
which we can call `onFulfilled`.
We say a `Promise` is "fulfilled" when the promised object of type `T` is available.
At this time, our `onFulfilled` function is called,
and the promised object is provided as the only argument.
In my example, `onFulfilled` takes the promised `response` object.

If `p` is a `Promise`,
then the expression `p.then(onFulfilled)` is another `Promise`.
If our function `onFulfilled` returns a `Promise` that resolves with object `x`,
then `p.then(onFulfilled)` also resolves with object `x`.
For this reason, the return type of the `onFulfilled`
matches the return type of `then`:
they are both `Promise<T2>`.

According to the types, `onFulfilled` should return another promise,
but my example `onFulfilled` does not return anything!
Is this an error?
Not exactly.
My example `onFulfilled` returns `undefined`,
the value implicitly returned when the end of a JavaScript function body is reached.
Then `undefined` is then used to resolve
the promise given by the `fetch(...).then(...)` expression.
We can see this with:

```js
fetch(new Request("{% link manifest.json %}")).then(response => {
  console.log("Content-Type", response.headers.get("Content-Type"));
}).then(x => {
  console.log("mystery", x);
});
```

... which prints `mystery undefined`.
This behavior is one instance of a more general rule:
if the value `x` returned by `onFulfilled` is not a `Promise` object,
then it is converted to a `Promise` object that resolves to `x`.
Arguably, this is ugly, and to be type-correct, we should have written:

```js
fetch(new Request("{% link manifest.json %}")).then(response => {
  console.log("headers", response.headers.get("Content-Type"));
  return Promise.resolve(undefined);
});
```

Above, we use the static function `Promise.resolve`,
which creates a new `Promise`
that resolves to the argument.
We can give `Promise.resolve` a type:

```
Promise<T> Promise.resolve<T>(T t);
```

The return value of `onFulfilled`
becomes the return value of the entire promise.
This allows us to "chain" promises together.
To demonstrate, consider getting the resource at `{% link manifest.json %}`
as a JSON object:

```js
fetch(new Request("{% link manifest.json %}"))
  .then(response => response.json())
  .then(json => console.log("json", json));
```

This works because of the type of `Response.json`:

```
type Response {
  Promise<Object> json();
}
```

We can call `then` more than once on the same `Promise`,
and each `onFulfilled` will be called.
For example:

```js
let p = fetch(new Request("{% link manifest.json %}"));
p.then(response => { console.log("Content-Type", response.headers.get("Content-Type")); });
p.then(response => { console.log("Content-Length", response.headers.get("Content-Length")); });
p.then(response => { console.log("Etag", response.headers.get("Etag")); });
```

This prints three separate lines:

```
Content-Type application/json; charset=utf-8
Content-Length 423
Etag e579ac-1a7-59c7a99a
```

We can call `then` on a `Promise` after it has been fulfilled.
The `onFulfilled` callback will be called with the fulfilled value.
For example:

```js
let p = fetch(new Request("{% link manifest.json %}"));
p.then(() => {
  // `p` is now fulfilled. Can we call `then` on `p` again? Yes!
  p.then(response => {
    console.log("Content-Type", response.headers.get("Content-Type"));
  });
});
```

When calling `p.then(onFulfilled)`,
`onFulfilled` is called asynchronously,
even if `p` is already fulfilled:

```js
let p = fetch(new Request("{% link manifest.json %}"));
p.then(() => {
  // `p` is now fulfilled.
  p.then(response => {
    console.log("this prints second");
  });
  console.log("this prints first");
});
```

This post's description of promises leaves out the possibility of failure.
Promises do not always get resolved to a value;
sometimes they are "rejected" with an error.
I'll describe this in a future post.
This post also leaves out any implementation details.
I'll also do a post showing a `Promise` implementation.
