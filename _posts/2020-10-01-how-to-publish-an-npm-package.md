---
title: "How to publish an npm package"
tags: ["programming", "javascript"]
---

Here I publish an NPM package `@jameshfisher/numsyslib`
that contains a Node.js module
that exports an example function `stringifyRoman`
that converts a JavaScript `number` to a Roman numeral.
Like this:

```shell
$ npm init -y
$ npm install @jameshfisher/numsyslib
$ node
> const numsyslib = require('@jameshfisher/numsyslib')
undefined
> numsyslib.stringifyRoman(24)
'XXIV'
```

The name of this package is `@jameshfisher/numsyslib`.
The prefix `@jameshfisher/` is a [scope](https://docs.npmjs.com/about-scopes),
which matches [my npm account `jameshfisher`](https://www.npmjs.com/~jameshfisher).
First, let's create the npm package locally:

```bash
mkdir numsyslib
cd numsyslib
echo '{ "name": "@jameshfisher/numsyslib", "version": "0.0.1" }' > package.json
nano index.js  # copy the following contents
```

```js
function divmod(x, y) {
  const rem = x % y;
  return [ (x - rem)/y, rem ];
}

function hierarchicize(x, levels) {
  const counts = [];
  for (const num of levels) {
    const [div, mod] = divmod(x, num);
    counts.push(div);
    x = mod;
  }
  return counts;
}

exports.stringifyRoman = number => {
  if (number < 0) { throw new Error("The Romans did not have negative numerals"); }
  if (number === 0) { return 'nulla'; }
  const [thousands, hundreds, tens, ones] = hierarchicize(number, [1000,100,10,1]);
  return 'M'.repeat(thousands) +
    ['', 'C', 'CC', 'CCC', 'CD', 'D', 'DC', 'DCC', 'DCCC', 'CM'][hundreds] +
    ['', 'X', 'XX', 'XXX', 'XL', 'L', 'LX', 'LXX', 'LXXX', 'XC'][tens] +
    ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'][ones];
};
```

We can install and use this local package with `npm install local/path/to/numsyslib/`.

To publish this package for the world to use, 
I first [signed up on the web](https://www.npmjs.com/signup) for the `jameshfisher` account.
Only this account can publish packages beginning with the `@jameshfisher/` scope.
Then I logged in via the CLI:

```shell
$ npm login
Username: jameshfisher
Password:
Email: (this IS public) jameshfisher@gmail.com
Logged in as jameshfisher on https://registry.npmjs.org/.
```

This stored some kind of cookie:

```
$ cat ~/.npmrc
//registry.npmjs.org/:_authToken=SUPER_SECRET_STRING
$ npm whoami
jameshfisher
```

Publishing the package was then a one-liner:

```
$ cd local/path/to/numsyslib/
$ npm publish --access public
npm notice
npm notice 📦  @jameshfisher/numsyslib@0.0.1
npm notice === Tarball Contents ===
npm notice 766B index.js
npm notice 58B  package.json
npm notice === Tarball Details ===
npm notice name:          @jameshfisher/numsyslib
npm notice version:       0.0.1
npm notice package size:  567 B
npm notice unpacked size: 824 B
npm notice shasum:        e0208708a799ccc5c470d763984865e987c803d8
npm notice integrity:     sha512-52LLwY08oSdyA[...]3B0fSWH1gOFOw==
npm notice total files:   2
npm notice
+ @jameshfisher/numsyslib@0.0.1
```

You can now run:

```shell
$ npm install @jameshfisher/numsyslib
$ node
> const numsyslib = require('@jameshfisher/numsyslib')
undefined
> numsyslib.stringifyRoman(24)
'XXIV'
>
```

[This package is now visible on the registry](https://www.npmjs.com/package/@jameshfisher/numsyslib).
You can see it via the API with `curl -s https://registry.npmjs.org/@jameshfisher/numsyslib`.

Some CDNs make the contents of published NPM packages available over the web.
For example these are now available:

```
https://unpkg.com/@jameshfisher/numsyslib@0.0.1/index.js
https://cdn.jsdelivr.net/npm/@jameshfisher/numsyslib@0.0.1/index.js
```

You can link to this directly from your web app.
However, it's not very useful and will throw an error,
because it's [a CommonJS module]({% post_url 2020-09-27-what-does-the-require-function-do-in-nodejs %}),
which web browsers don't understand.
To make it useful for the web,
we could publish an additional plain JavaScript file,
or use [the UMD format](https://github.com/umdjs/umd),
which both unpkg and jsDelivr recommend.
I'll cover UMD in a future post.
