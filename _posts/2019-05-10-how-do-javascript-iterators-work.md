---
title: How do JavaScript iterators work?
tags:
  - programming
  - javascript
---

For JavaScript programmers,
each passing year introduces a new way to loop over an array.
Here are some of the ways I _won't_ be talking about:

```js
var arr = [1,2,3,4,5];

// Old-school, just like in C
for (var i = 0; i < arr.length; i++) console.log(arr[i]);

// for...in loops over object properties
for (var i in arr) console.log(arr[i]);

// forEach applies a function to each value
arr.forEach(n => console.log(n));
```

Since around 2015,
there's yet another way:
the `for...of` statement.
Here's what it looks like:

```js
for (var n of arr) {
  console.log(n);
}
```

The `for...of` statement is best seen as syntactic sugar.
The above loop would de-sugar to the following:

```js
var iterator = arr[Symbol.iterator]();
var v = iterator.next();
while (!v.done) {
  var n = v.value;
  console.log(n);
  v = iterator.next();
}
```

There are many mysterious things in here,
so let's unpack it!
The `for...of` statement
does not just work on arrays -
it works on _iterables_.
An iterable
is anything that you can call `[Symbol.iterator]()` on
and get an _iterator_ back.
The code above does that to the array `arr`,
and gets back an iterator 
that it assigns to `iterator`.

Down the rabbithole:
what's an iterator?
Well, that's anything that you can `.next()` on repeatedly,
and get something that looks like `{ done: bool, value: any }`.
The code above repeatedly calls `iterator.next()` 
until it's marked as `done`,
and for each loop, it calls `console.log` on the returned `value`.

As I said,
arrays are one kind of iterable.
But because this just works with ordinary JavaScript objects and methods,
we can define our own iterables!
Here's another way we could define `arr`
that has the same result when applying `for...of` to it:

```js
const arr = {};
arr[Symbol.iterator] = function() {
  let nextVal = 1;
  return {
    next: function() {
      const v = nextVal++;
      return { done: v > 5, value: v };
    }
  };
};
for (var n of arr) {
  console.log(n);
}
```

The above code also prints numbers 1 through 5 to the console.
However, it only keeps the state `nextVal`,
so it's more memory-efficient than keeping the entire array in memory.
