---
title: "What is npm?"
tags: ["programming", "javascript"]
---

Recently I wrote about Node.js's two module systems,
[the traditional CommonJS module system](/2020/09/27/what-does-the-require-function-do-in-nodejs/),
and [the newer ECMAScript module system](/2020/09/29/ecmascript-modules-in-nodejs/).
These module systems are related to, but distinct from, package systems.
A _module_ is a thing loaded and executed at runtime.
A _package_ is a thing downloaded at "install time".
Packages can provide modules.
There is only one one package system for Node.js that's worth mentioning: NPM.
Let's take a look.

[The NPM docs](https://docs.npmjs.com/about-packages-and-modules#about-package-formats)
have an excellent, succinct definition of a "package":

> * a) A folder containing a program described by a `package.json` file.
> * b) A gzipped tarball containing (a).
> * c) A URL that resolves to (b).
> * d) A `<name>@<version>` that is published on the registry with (c).
> * e) A `<name>@<tag>` that points to (d).
> * f) A `<name>` that has a latest tag satisfying (e).
> * g) A `git` url that, when cloned, results in (a).

Note that this definition does not mention "Node.js modules".
An NPM package can contain arbitrary stuff.
For example, you can distribute CSS via NPM.
Just throw it anywhere in the folder.
The contents are limited only by the vague NPM terms of use.

Yes, you can `npm install foo/bar/baz/`,
a directory that contains a `package.json`.
The `package.json` just has to have `name` and `version` fields.
This adds `"packagename": "file:foo/bar/baz"` to your `dependencies`,
and creates `node_modules/packagename` as a symlink to it.

Yes, you can `npm install tarball.tar.gz`,
a gzipped tarball containing a `package.json`.
This adds `"packagename": "file:tarball.tar.gz"` to your `dependencies`,
and unzips the gzipped tarball into `node_modules/packagename`.

Yes, you can `npm install http://example.com/tarball.tar.gz`.
This adds `"packagename": "http://example.com/tarball.tar.gz"` to your `dependencies`,
and unzips the gzipped tarball into `node_modules/packagename`.

Yes, you can `npm install 'git://github.com/jameshfisher/lodash.git#jims-fork'`.
This adds `"lodash": "git://github.com/jameshfisher/lodash.git#jims-fork"` to your `dependencies`,
checks out the specified commit, and copies it into `node_modules/lodash`.
This could come in handy for maintaining your own fork of a package.


Onto more familiar territory.
When we run `npm install lodash@4.17.20`,
the `4.17.20` is a "version".
This identifier maps to the URL `https://registry.npmjs.org/lodash/-/lodash-4.17.20.tgz`,
a raw URLs to a tarball hosted on the NPM registry.
However, NPM adds `"lodash": "^4.17.20"` to your `dependencies`,
rather than adding the raw URL.
You can query the NPM API to get the URL with:

```
$ curl -s https://registry.npmjs.org/lodash | jq '.versions | .["4.17.20"].dist.tarball'
"https://registry.npmjs.org/lodash/-/lodash-4.17.20.tgz"
```

NPM has a separate thing called "tags" 
which uses the same syntax as versions.
For example, `npm install jquery@beta` installs the `beta` tag.
Currently, the `beta` tag maps to version `3.5.1`.
NPM puts `"jquery": "^3.5.1"` in your `dependencies`,
so the fact that you installed a tag is lost.
You can see the current tag-to-version mapping with:

```
$ curl -s https://registry.npmjs.org/jquery | jq '.["dist-tags"].beta'
"3.5.1"
```

When you run `npm install jquery`,
this is equivalent to `npm install jquery@latest`.
It puts `"jquery": "^3.5.1"` in your dependencies,
and forgets that you just installed `latest`.

Next time, I'll look at making an example package, publishing it, and showing it in use.
