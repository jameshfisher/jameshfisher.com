---
title: "What are JavaScript source maps?"
tags: ["programming", "web"]
---

<script src="{% link assets/2020-09-26/generated.js %}"></script>

Open the dev tools on this page,
and you'll see it executes a strange `source.jimscript` file.
It's basically English, but you can step through and debug it:

<img src="{% link assets/2020-09-26/jimscript.png %}"/>

But what on earth is JimScript,
and how does the browser know how to execute it?
Nowadays, when you use the browser dev tools to debug JavaScript,
it lies to you about what it's actually running.
This is due to a feature called "source maps".
Here's a 5 minute intro to the web feature.

First, and rather insanely, [the specification for this major browser feature is a random deleted Google Docs document](https://stackoverflow.com/questions/64102986/where-is-the-specification-standard-for-javascript-source-maps).
So instead, we must learn by example.

When a browser loads a JavaScript file,
it looks for a source map for that file.
You can set this with an `X-SourceMap` header,
or more commonly, with a comment in the JavaScript file itself, like this:

```js
function main(x) {
  const result = x*2;
  console.log(result);
}
main(3);
//# sourceMappingURL=./generated.js.map
```

That comment can go anywhere in the file,
but at the end is idiomatic.
The URL can be a relative URL,
which is interpreted relative to the URL of the JavaScript.
The idiom seems to be to keep the map URL next to the JavaScript URL,
e.g. the map for `https://foo.com/scripts/main.js`
is typically hosted at `https://foo.com/scripts/main.js.map`.
The idiomatic file extension is `.map`, but the browser doesn't care.
The browser doesn't even care about `Content-Type` for this resource.
And the browser doesn't respect CORS or anything;
you can set `//# sourceMappingURL=https://google.com/`,
and the browser will happily load that page
and give you a syntax error when trying to parse it as a source map.

The source map is JSON format and will look something like this:

```
{
  "version":3,
  "sources":["source.jimscript"],
  "names":["main"],
  "mappings":"CAECA;CACAA;CACAA;;CAEA",
  "file":"generated.js"
}
```

Clearly, the `mappings` is the mysterious magic.
But I won't go into the syntax here;
instead we just need to understand the content.
For that, we can use [the `source-map` library](https://github.com/mozilla/source-map),
which exposes a parser and a generator for source maps.
This will read a source map and print a less mysterious representation:

```js
const { readFileSync } = require('fs');
const { SourceMapConsumer } = require('source-map');
(async () => {
  await SourceMapConsumer.with(
    JSON.parse(readFileSync('./generated.js.map')), 
    null, 
    consumer => consumer.eachMapping(console.log)
  );
})();
```

We get:

```
$ node parse.js
Mapping {
  generatedLine: 1,
  generatedColumn: 1,
  lastGeneratedColumn: null,
  source: 'source.jimscript',
  originalLine: 3,
  originalColumn: 1,
  name: 'main'
}
Mapping {
  generatedLine: 2,
  generatedColumn: 1,
  lastGeneratedColumn: null,
  source: 'source.jimscript',
  originalLine: 4,
  originalColumn: 1,
  name: 'main'
}
Mapping {
  generatedLine: 3,
  generatedColumn: 1,
  lastGeneratedColumn: null,
  source: 'source.jimscript',
  originalLine: 5,
  originalColumn: 1,
  name: 'main'
}
Mapping {
  generatedLine: 5,
  generatedColumn: 1,
  lastGeneratedColumn: null,
  source: 'source.jimscript',
  originalLine: 7,
  originalColumn: 1,
  name: null
}
```

So the source map is basically a series of statements of the form:

> The characters starting at `generatedLine`:`generatedColumn` of the generated file
> come from `originalLine`:`originalColumn` of the source `source`,
> where it had the name `name`.

Importantly, the mappings are from the generated file back to the original source files.
They are _not_ mappings from source files to generated files.
When you place a breakpoint in a source file using dev tools,
the browser has to try to reverse the mapping, 
to find a reasonable breakpoint in the generated JavaScript.
But a given position in a source file might not have any equivalent position in a generated file.
Or it might have multiple positions in the generated file!

Note that each mapping only defines a starting index.
The ending index is implicitly defined by the start of the next mapping.

We learn from the source map that our file was generated from a `source.jimscript` file
(at least in part; a generated file can have many sources).
That source file is _referenced_ with a relative URL,
from which the browser downloads the source file.
(Alternatively, the source map can specify `sourcesContent`,
which dumps the entire source into the source map file.
Either way, your entire source code is exposed.)

Lots of compilers generate source maps.
For example, TypeScript will generate a source map with:

```
$ npx tsc --sourceMap --outDir dist src/main.ts
```
