---
title: "Babel JS from the ground up"
tags: ["programming", "web", "javascript"]
---

"Babel is a JavaScript compiler", say the docs.
But what does that mean and how can I use it?
Unlike most guides, I'll start at the API, and work our way up to CLI usage.
Here's a hello world:

```ts
import {parse} from '@babel/parser';
import generate from '@babel/generator';

function identity(inputJs: string): string {
  const ast = parse(inputJs);
  const output = generate(ast, {}, inputJs);
  return output.code;
}

console.log(identity(`const foo = bar.baz;`));
```

Can you guess what this prints?
Yes, it prints the original input, `const foo = bar.baz;`.
We used Babel to parse the string into an AST,
then write it out to a string again.
Here, it preserved it character-for-character,
but it doesn't always do so
(it's prone to moving comments around, for example).

Babel did the hard work of parsing the input into an AST, then stringifying it again.
[Babel's parser](https://babeljs.io/docs/en/next/babel-parser.html) and generator 
has hardcoded knowledge of JavaScript,
and various extensions like JSX and TypeScript.
(The parser accepts "plugins", but they're not really plugins.
They're just strings like `"jsx"` or `"typescript"`,
which enable certain productions in the parser.
You can't use Babel to transform C++, for example.)

Note Babel didn't complain that `bar` is undefined in the input.
And if you give it TypeScript, it won't do type-checking.
Babel is only about local syntactic transformation.
It will catch syntax errors, but nothing more.

Babel is basically a pure function,
which consumes a single block of JavaScript,
and generates a single block of JavaScript.
For example, it won't follow `import`s or `require`s.
Babel is not a "bundler".

So far, so useless.
Babel's power is in transforming the AST before writing it out again.
You could do what you like with the `ast` value, since it's mutable.
But more conventionally, 
you'll use `"@babel/traverse"`,
giving it a _visitor_ which is called for each node in the AST.
Your visitor then mutates the AST.
Here's an example:

```ts
import {parse} from '@babel/parser';
import generate from '@babel/generator';
import traverse from "@babel/traverse";

const inputJs = `const foo = () => bar.baz;`;

const reverseIdentifiersVisitor: babel.Visitor = {
  Identifier: path => {
    path.node.name = path.node.name.split("").reverse().join("");
  }
};

const ast = parse(inputJs);
traverse(ast, reverseIdentifiersVisitor);
const output = generate(ast, {}, inputJs);

console.log(output.code);
```

Can you guess what this prints?
Yes, it reverses each of the "identifiers" in the `inputJs` string,
like this:

```js
const oof = () => rab.zab;
```

These visitors are usually wrapped into _plugins_.
Here we wrap our visitor into a conventional Babel plugin:

```ts
import * as babel from "@babel/core";

const reverseIdentifiersPlugin: babel.PluginItem = () => ({
  visitor: reverseIdentifiersVisitor
});

const result = babel.transformSync(inputJs, {
  configFile: false,
  plugins: [ reverseIdentifiersPlugin ]
});

console.log(result.code);
```

In this example, the plugin is a JavaScript function,
but this is usually wrapped into a module with a default export.
Like this:

```js
// node_modules/babel-plugin-transform-reverse-identifiers/index.js
module.exports = () => ({
  visitor: {
    Identifier: path => {
      path.node.name = path.node.name.split("").reverse().join("");
    }
  }
});
```

You can then either import it,
or just pass the module name to Babel,
which does some magic dynamic `require`ing.
Here, we reverse the identifiers, 
then transform arrow functions using a standard Babel plugin:

```js
babel.transformSync(inputJs, {
  configFile: false,
  plugins: [ 
    "babel-plugin-transform-reverse-identifiers",
    "@babel/plugin-transform-arrow-functions" 
  ]
});
```

As a Babel user,
you probably won't specify plugins directly.
Instead, Babel has the notion of _presets_.
A preset is a set of plugins (and possibly more presets).
For example:

```js
// node_mobules/my-preset/index.js
module.exports = () => ({
  plugins: [ 
    "babel-plugin-transform-reverse-identifiers",
    "@babel/plugin-transform-arrow-functions" 
  ]
});

// Using the preset module
const result = babel.transformSync(inputJs, {
  configFile: false,
  presets: [ "my-preset" ]
});
```

I've been showing this with `configFile: false`,
but it's more common to configure Babel with a config file:

```js
// babel.config.json
{
  "presets": [
    "./my-preset.js"
  ]
}

// Usage
import * as babel from "@babel/core";
const inputJs = `const foo = () => bar.baz;`;
const result = babel.transformSync(inputJs);  // Finds and uses babel.config.json
console.log(result.code);
```

You probably won't be using Babel's JavaScript API.
Instead, you'll use the CLI,
like this:

```shell
$ npm install --save-dev @babel/cli
$ npx babel src/ --out-dir lib/
Successfully compiled 1 file with Babel (231ms).
```

If you want to know more, don't go to the Babel docs.
I found them pretty disorganized.
Instead, you should read [this handbook by Jamie Kyle](https://github.com/jamiebuilds/babel-handbook/blob/master/translations/en/),
which is a principled guide.
