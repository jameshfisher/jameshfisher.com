---
title: "How do JavaScript prototypes work?"
tags: ["programming", "javascript"]
---

[In my previous post](/2020/11/01/what-does-the-dot-do-in-javascript/),
I showed how "inheritance" works in JavaScript,
by reimplementing the forms `foo.bar`, `foo.bar()`, and `foo.bar = baz`
in plain JavaScript functions.
In this post, I show JavaScript's conventions for creating new "classes" and new objects.

If I just get one thing across in this post, it should be this:
there is not just one "prototype" concept in JavaScript!
There are _two_ completely different things called "prototype" in JavaScript.
If you confuse the two, you're in for a world of pain.
Let's see why.

A JavaScript value has two _slots_:

1. An _ownProperties_ slot.
   This is a map.
   A key is a string or symbol,
   and a value is a reference to another JavaScript value.
2. A _parent_ slot.
   (This is what I'm calling it, to avoid confusion!)
   The parent slot contains a reference to another JavaScript value.
   The parent slot is _not_ a "property" in the JavaScript sense.
   Only the values `null` and `undefined` do not have a parent slot.

I've deliberately not used the term "prototype" in my definition.
This is because JavaScript maddeningly sets out to confuse you,
and uses the term "prototype" in different contexts
to refer to one of two completely different things:

1. An own property with the string key `"prototype"`.
1. The parent slot.

Here are some of the common  confusing notations:

* Some values, notably _functions_, have an own property with the string key `"prototype"`.
  You can access this with `x.prototype`.
  The name is a design mistake;
  it should have been called `"methods"`.
  Its role will become clearer soon.
* When JavaScript scholars write `x.[[Prototype]]`,
  they are referring to the _parent_ slot of `x`.
  It does _not_ refer to the own property called `"prototype"`!
* The function `Object.getPrototypeOf(x)`
  gets the parent of `x`,
  i.e. the value referenced by the parent slot of `x`.
  It does _not_ get the own property called `"prototype"`!
* You can write `x.__proto__`,
  which also gets the parent of `x`.
  It does _not_ get the own property called `"prototype"`!

Casual commentators will say things like "`x`'s prototype",
but this is ambiguous:
it could refer to an own property of `x` with the string key `"prototype"`,
or it could refer to the parent of `x`.
I will avoid this ambiguity by saying either
"the parent of `x`", or "the `"prototype"` property of `x`".

The JavaScript runtime enforces that 
all values are linked, by their parent slots, into a big tree.
The value `null` is the root of the tree, with no parent.
The basic point of these "parent" slots forming a big tree
is to emulate the "class hierarchy" from object-oriented design,
but without having a first-class notion of "classes" in the language.
An object just "inherits" from another object!

To create new "classes", JavaScript (ab)uses the `function Foo() { ... }` form.
To create new objects, JavaScript has a `new` operator.
Here are the fundamental JavaScript syntax forms that I'll explain in this post.

We can re-write the `new` operator in plain JavaScript.
[In the spec, this function is called `Construct`](https://www.ecma-international.org/ecma-262/10.0/index.html#sec-construct).
To be honest, the spec has a lot of guff, but in essence it does this:

```js
// You should be able to replace `new Foo(x,y)` with `Construct(Foo, x, y)`
function Construct(constructor, argsList) {
  const obj = Object.create(constructor.prototype);
  const ret = constructor.call(obj, ...argsList);
  return ret instanceof Object ? ret : obj;
}
```

Here we see that `new` internally uses `Object.create`,
which is really the only way that JavaScript objects get created.
The new object's parent is the constructor's `.prototype` property.
JavaScript's decision to look for the parent under a `.prototype` property has caused much needless confusion.
It should instead be called something like `.methods`.

When I first wrote the above `Construct` function,
I discarded the return value of `constructor.call`.
You don't usually see a constructor that returns a value,
and I assumed that it would just be ignored.
_I was wrong!!_
A constructor can return a value,
and if it returns an object,
this will be used in place of the initial `obj`
(which will probably be quickly garbage-collected).
This means you can write things like:

```js
const loggers = new Map();
function Logger(filename) {
  if (loggers.has(filename)) {
    return loggers.get(filename);
  }
  else {
    loggers.set(filename, this);
    this.filename = filename;
  }
}

const logger1 = new Logger("/var/log/myapp");
const logger2 = new Logger("/var/log/myapp");

// logger1 === logger2! They are the same object!
```

Now let's look at how to define a "class" in JavaScript.
I put "class" in quotes, because really a "class" is just 
anything that would be accepted as the `constructor` argument of `Construct`, above.

When we define a function in JavaScript with the `function(){}` notation,
we should imagine that JavaScript inserts a bunch of instructions after it,
like this:

```js
// WHEN WE WRITE THIS ...
function Dog(a,b,c) { this.a = a; console.log(b, c); }

// ... THEN JAVASCRIPT INSERTS ALL THIS:

const methods = Object.create(Object.prototype);  // New, empty methods for the user to fill out
Object.defineProperty(Dog, 'prototype', 
  { value: methods, writable: true });  // Store methods under Dog.prototype, for `new` to find
Object.setPrototypeOf(Dog, Function.prototype);   // Confusing, but provides things like Dog.apply(...)
Object.defineProperty(methods, 'constructor', { value: Dog });  // Unimportant; lets us do `new dog.constructor(4,5,6)`
```

Note that every time you write `function(){}`, 
it creates a constructor, with a new `methods` object, and an implicit `this` parameter.
This is very often not your intention.
To avoid this, you should use the arrow function syntax, which is conceptually simpler.
An arrow function does not have a `.prototype`,
and it does not have an implicit `this` parameter.

Note the methods object is set to inherit from the standard Object methods,
stored in in `Object.prototype` (which should be called `Object.methods`).
Effectively, it defaults to `Dog extends Object`.
If you want a different class hierarchy, 
you need to manually fix what JavaScript created for you!
For example, if you want the hierarchy `Dog -> Animal -> Object`,
you can patch it up with `Object.setPrototypeOf`:

```js
function Animal() {}
Animal.prototype.run = function() { console.log(`Running with ${this.numLegs()} legs`); };

function Dog() {}
Dog.prototype.numLegs = function() { return 4; };

// PATCH UP THE CLASS HIERARCHY
Object.setPrototypeOf(Dog.prototype, Animal.prototype);

const lassie = new Dog();
lassie.run();  // Running with 4 legs
```

You'll see other approaches to patching up a class hierarchy.
Some others write things like `Dog.prototype = new Animal()`,
but this is just _gross_.
Others, who are less bad, might write `Dog.prototype = { ... }`,
overwriting the `prototype` property entirely,
but this is also ugly,
because it overwrites the `constructor` property too.
But having said that, is the `constructor` property useful?
It lets us write things like: 

```js
let foo1 = new Dog(1,2,3); 
let foo2 = new foo1.constructor(4,5,6);
```

IMO, the `.constructor` feature is not useful.
I never see this in real-world JavaScript.
It's probably a mis-feature.

Note that when we assign new methods,
like `Animal.prototype.run = ...`,
we have to do it with the `function() {}` form
so that the function gets an implicit `this` parameter.
Unfortunately, this also makes all of our methods constructors too!
It's really a JavaScript design mistake
that we can't bind `this` without also creating a new, unnecessary `prototype`.

You might wonder how to call `super(...)` in this world of prototypes.
There is no elegant answer.
You basically have to know which function is the super function,
and explicitly `.call()` it.
One way is like this:

```js
function Animal(prefix = "> ") {
  this.prefix = prefix;
}
Animal.prototype.speak = function(words) {
  console.log(this.prefix + words); 
};

function Dog() {
  // calling super("DOG: ") from constructor
  Animal.call(this, "DOG: ");
}

Dog.prototype.speak = function(words) {
  // calling super('WOOF' + words) from method
  Animal.prototype.speak.call(this, 'WOOF ' + words);
};

// PATCH UP THE CLASS HIERARCHY
Object.setPrototypeOf(Dog.prototype, Animal.prototype);

const lassie = new Dog();

lassie.speak("hello");
```

Modern JavaScript has a `class` notation,
which basically de-sugars into this prototype-based stuff.
I'll do a future post on how exactly it works.