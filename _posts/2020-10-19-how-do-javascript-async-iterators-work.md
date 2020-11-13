---
title: "How do JavaScript async iterators work?"
tags: ["programming", "javascript"]
---

[A while ago, I described iterators in JavaScript](/2019/05/10/how-do-javascript-iterators-work/).
In this post, I describe a limitation of iterators: the provider must provide its values synchronously.
Then show how JavaScript relaxes this iterator contract
to allow providers to provide their values asynchronously.
Finally I show modern JavaScript syntax forms for consuming async iterables.

As a recap,
an _iterable_
is anything that you can call `[Symbol.iterator]()` on
and get an _iterator_ back.
An _iterator_ is anything that you can `.next()` on repeatedly,
each time getting something back that looks like `{ done: bool, value: any }`.
But typically, you call neither `[Symbol.iterator]()` nor `.next()`.
Instead use the `for (const x of iterable) { console.log(x); }` syntax form,
which desugars to something like this:

```js
const iterator = iterable[Symbol.iterator]();
let __v = iterator.next();
while (!v.done) {
  const x = v.value;
  console.log(x);
  v = iterator.next();
}
```

All of this consumer code is synchronous.
The `for...of` form is synchronous;
it will run to completion before yielding.
It uses the `value` returned from `.next()` synchronously.

Now, you _can_ use a normal iterator in an async fashion.
For example, this will print all the values of a normal iterator,
one per second,
and you could do this concurrently with other work:

```js
const iterator = myIterable[Symbol.iterator]();
function loop() {
  const v = iterator.next();
  if (!v.done) {
    console.log(v.value);
    setTimeout(loop, 1000);
  }
}
loop();
```

But this is besides the point.
A normal iterator, since it doesn't know how it is going to be used,
has to be able to provide _all_ of its values synchronously,
if asked.
But what if our iterator can't fulfil that?
For example, imagine an iterator over a sequence of web pages,
or the arbitrary stream of data coming over a network connection.
These cannot provide everything synchronously
except by blocking the entire process.

What if instead of returning `{ done: bool, value: any }`,
our iterator returned `{ done: bool, value: Promise<any> }`?
This is close, but no cigar.
Note the `done` value is still synchronous,
so the iterator must be able to know in advance how many values it will provide.
Imagine the "network connection" iterator:
it cannot know in advance when the stream will end.

Instead, these async iterators must provide something like `Promise<{ done: bool, value: any }>`.
The consumer must wait for each promise to resolve,
then check the `done` property,
before calling `.next()` again.

This is how JavaScript async iterators work.
Because this is an entirely new contract,
async iterables expose their async iterator under a different key, 
`asyncIterable[Symbol.asyncIterator]()`.
Here's an async iterable
that yields the values `0` to `99`,
with a one-second delay between calling `.next()` and yielding the value:

```js
const myAsyncIterable = {
  i: 0,
  [Symbol.asyncIterator]: function() {
    return {
      next: () => {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve({ done: this.i >= 100, value: this.i++ });
          }, 10);
        });
      }
    };
  }
};
```

And here's how to use this async iterable,
and print its values as fast as it provides them:

```js
const asyncIterator = myAsyncIterable[Symbol.asyncIterator]();
function loop() {
  asyncIterator.next().then(v => {
    if (!v.done) {
      console.log(v.value);
      loop();
    }
  });
}
loop();
```

Note that the async iterator contract 
forces the consumer to loop in an async fashion.
(The consumer _can_ still call `.next()` in a hot loop on an async iterator,
but this breaks the contract,
and it means the consumer can't access the `done` value,
so it doesn't know when to end looping.)

Because this is a Promise-based API,
you can use `async`/`await` to consume it,
like this:

```js
const it = myAsyncIterable[Symbol.asyncIterator]();
for (let v = await it.next(); !v.done; v = await it.next()) {
  console.log(v.value);
}
```

But for this pattern of consumption,
JavaScript provides a dedicated `for await` syntax form.
This does the same thing:

```js
for await (const x of myAsyncIterable) {
  console.log(x);
}
```
