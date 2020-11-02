---
title: "What does the dot do in JavaScript?"
tags: ["programming", "javascript"]
---

Ah, that little dot!
Every line of JavaScript you write
contains something like `foo.bar`, `foo.bar()`, or `foo.bar = baz`.
But do you know what it does?
Two concepts interact subtly here:
prototypical inheritance
and accessor properties (getters/setters).
There are some weird corner cases, and I bet you don't know all of them!
In this post series, 
I explain the behavior of `foo.bar`, `foo.bar()`, and `foo.bar = baz`
by reimplementing them in plain JavaScript.

First off, `foo.bar`, `foo.bar(x,y)`, and `foo.bar = baz`
are all "just" syntax sugar for the `foo['bar']` syntax form:

```js
x = foo.bar;    /* is sugar for */  x = foo['bar'];
foo.bar = baz;  /* is sugar for */  foo['bar'] = baz;
foo.bar(x,y);   /* is sugar for */  foo['bar'](x,y);
```

Unfortunately, it remains to explain `foo[bar]`, `foo[bar](x,y)` and `foo[bar] = baz`,
and these are not trivial.
I actually had to consult
[the frumpy](https://www.ecma-international.org/ecma-262/10.0/index.html#sec-property-accessors-runtime-semantics-evaluation)
[ECMAScript spec](https://www.ecma-international.org/ecma-262/10.0/index.html#sec-get-o-p)
to get a reasonable description.
In the spec,
these forms are called `Get`, `Set`, and `Invoke`.
Let's re-implement them as JavaScript functions.
First, here's `Get`:

```js
// You should be able to replace `obj[prop]` with `Get(obj,prop)`
function Get(obj, prop) {
  prop = typeof prop === 'symbol' ? prop : String(prop);
  for (let ancestor = obj; ancestor !== null; ancestor = Object.getPrototypeOf(ancestor)) {
    const desc = Object.getOwnPropertyDescriptor(ancestor, prop);
    if (desc) {
      return desc.get ? desc.get.call(obj)
           : desc.set ? undefined             // Accessor property with just a setter
           : desc.value;                      // Assuming data property
    }
  }
  return undefined;
}
```

Surprisingly, if we find an accessor with no getter,
we just return `undefined`, rather than searching further up the chain:

```js
const parent = { x: 5 };
const child = { set x(newX) { this.x = newX; } };
Object.setPrototypeOf(child, parent);

console.log(child.x)  // Logs undefined, not 5!
```

Next, let's reimplement the "method call" syntax, `foo[bar](x,y)`.
This is mercifully short,
because it re-uses the `Get` function:

```js
// You should be able to replace `obj[prop](x,y)` with `Invoke(obj,prop, [x,y])`.
// Idiomatic adaptation of https://www.ecma-international.org/ecma-262/10.0/index.html#sec-invoke
function Invoke(obj, prop, argumentsList = []) {
  const method = Get(obj, prop);
  if (!(method instanceof Function)) throw new TypeError(`someObj.${prop} is not a function`);
  return method.call(obj, ...argumentsList);
}
```

Surprisingly, this means that you can define a getter that returns the function to bind in the method call:

```js
const obj = { 
  i: 10,
  get add() {
    // Return the method to be called
    return function(x) { 
      this.i += x;  // `this` will be `obj`
    };
  } 
};
obj.add(2);
console.log(obj.i);  // Logs 12
```

Finally, the worst of the bunch: `foo[bar] = baz`.
This is called `Set` in the spec.
It's full of corner cases.
Here's my attempt at a reimplementation in plain JavaScript:

```js
// You should be able to replace `obj[prop] = x` with `Set(obj,prop,x)`.
// Idiomatic adaptation of https://www.ecma-international.org/ecma-262/10.0/index.html#sec-set-o-p-v-throw
// and https://www.ecma-international.org/ecma-262/10.0/index.html#sec-property-accessors
export function Set(obj, prop, val) {
  prop = typeof prop === 'symbol' ? prop : String(prop);

  // First, try to update existing own property.
  const ownPropDesc = Object.getOwnPropertyDescriptor(obj, prop);
  if (ownPropDesc) {
    if (ownPropDesc.set) {
      ownPropDesc.set.call(obj, val);
      return val;
    } 
    else if (ownPropDesc.get) {
      // Note: we end here, rather than going up the chain looking for a setter.
      throw new TypeError(`Cannot set property ${prop} of #<Object> which has only a getter`);
    }
    else {  // must be data prop; update it
      Object.defineProperty(obj, prop, { value: val });
      return val;
    }
  }
  else {
    // Not an own property. Search the prototype chain.
    for (let ancestor = Object.getPrototypeOf(obj); ancestor !== null; ancestor = Object.getPrototypeOf(ancestor)) {
      const ancestorPropDesc = Object.getOwnPropertyDescriptor(ancestor, prop);
      if (ancestorPropDesc) {
        if (ancestorPropDesc.set) {
          ancestorPropDesc.set.call(obj, val);
          return val;
        }
        else if (ancestorPropDesc.get) {
          throw new TypeError(`Cannot set property ${prop} of #<Object> which has only a getter`);
        }
        else {  // must be data prop
          if (ancestorPropDesc.writable) {
            // Note: despite the writable check, we _don't_ write to the ancestor, or continue up the chain.
            Object.defineProperty(obj, prop, { value: val, writable: true, enumerable: true, configurable: true });
            return val;
          } 
          else {
            throw new TypeError(`Cannot assign to read only property '${prop}' of object '#<Object>'`);
          }
        }
      }
    }
  
    // Not on the prototype chain either. Just set a new own property.
    Object.defineProperty(obj, prop, { value: val, writable: true, enumerable: true, configurable: true });
    return val;
  }
}
```

Before ES5 created accessor properties,
the `foo[bar] = baz` notation would basically just set an own property.
It would not traverse the prototype chain.
But now, if there is no own property,
it has to go up the chain looking for a potential setter function.
If it doesn't find find one, it falls back to creating a new own property.
