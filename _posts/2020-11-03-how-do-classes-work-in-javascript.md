---
title: How do classes work in JavaScript?
tags:
  - programming
  - javascript
---

JavaScript classes are syntactic sugar.
Here I show how to de-sugar the `class` notation
into traditional prototype-based JavaScript.
If you don't know how prototypes work in JavaScript,
first read [how the dot works](/2020/11/01/what-does-the-dot-do-in-javascript/),
then [how `function(){}` and `new` work](/2020/11/02/how-do-javascript-prototypes-work/).

Let's start from an empty class, like `class Logger { }`.
This is just sugar for a constructor function `function Logger() { }`.
You then instantiate and use it in the normal way with `new`.

The constructor, by default, has no parameters and does no special initialization.
To change this, you must define a method called `constructor`:

```js
class Logger {
  constructor(prefix = "> ") { 
    this.prefix = prefix; 
  }
}

// IS SUGAR FOR ...

function Logger(prefix) {
  this.prefix = prefix;
};
```

Other methods are attached to the prototype, like this:

```js
class Logger {
  // ...
  log(line) {
    console.log(this.prefix + line);
  }
}

// IS SUGAR FOR ...

Logger.prototype.log = function(line) {
  console.log(this.prefix + line);
};
```

Notice above that we write `this.prefix`.
If you come from e.g. Java, you might expect you can write `foo` in a method 
as a shorthand for `this.foo`.
Thankfully, JavaScript does not have this design mistake!
If you want to access a property, you are required to write `this.foo`,
and if you want to call another method,
you are required to write `this.foo()`.

You can also write `static` methods.
These are attached to the constructor function itself,
rather than to its prototype:

```js
class Logger {
  // ...
  static version() { return "1.0.0"; }
}

// IS SUGAR FOR ...

Logger.version = function() { return "1.0.0"; };
```

Now let's write a subclass, `FileLogger`.
For now, it will just keep the same behavior as `Logger`:

```js
class FileLogger extends Logger { }

// IS SUGAR FOR ...

function FileLogger(...args) {
  return Logger.call(this, ...args) || this;
}

Object.setPrototypeOf(FileLogger.prototype, Logger.prototype);
Object.setPrototypeOf(FileLogger, Logger);
```

Suddenly things are a bit subtler!
The constructor of a subclass has to call the superclass constructor,
so that the new object is initialized properly.
It also has to deal with the possibility that the superclass constructor
_returns an object_.
Normal JavaScript constructors are allowed to return an object,
to be used instead of the `this` value passed in.
This is rare/unusual in classical JavaScript.

We set up a prototype chain from `FileLogger.prototype` to `Logger.prototype`.
This is normal, and makes inherited instance methods work.
But notice we also make the `FileLogger` a child of `Logger`:
this is necessary for inherited static methods.
You can call `FileLogger.version()`,
which will call the inherited `Logger.version()`.

The most confusing part of JavaScript classes is `super`.
Original JavaScript had no `super` keyword or functionality;
you had to build it yourself.
In JavaScript classes,
the `super` keyword is overloaded and means two rather different things.
The first form is in property accesses or method calls, like this:

```js
class FileLogger extends Logger {
  // ...
  log(s) {
    super.log(s);
    fs.appendFileSync(this.file, this.toLine(s)+'\n');
  }
}

// IS SUGAR FOR ...

FileLogger.prototype.log = function(s) {
  Logger.prototype.log.call(this, s);
  fs.appendFileSync(this.file, this.toLine(s) + "\n");
};
```

The second form of `super` is as a function, like `super(x,y,z)`.
This form is only available in a constructor,
and it is _mandatory_ in subclass constructors.
You may first encounter its weirdness when reading a runtime error like this:

```
ReferenceError: Must call super constructor in derived class before accessing 'this' or returning from derived constructor
```

Here's an example of how to interpret `super` as a function call:

```js
class FileLogger extends Logger {
  constructor(file) {
    console.log("In subclass constructor");
    super("");
    this.file = file;
  }
}

// IS SUGAR FOR ...

function FileLogger(file) {
  // Code before super(...) is fine, as long as it doesn't use `this`.
  // We can't use `this` because it's not yet initialized by the superclass constructor.
  console.log("In subclass constructor");

  // Call super(""), **potentially getting a new object!**
  const _this = Logger.call(this, "") || this;

  // We can now use `this`, 
  // but referring to the potentially-new object from the superclass constructor.
  _this.file = file;

  // Always use `return` due to the (possibly) new object.
  return _this;
}
```
