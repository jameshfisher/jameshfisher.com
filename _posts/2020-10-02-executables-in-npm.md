---
title: Executables in npm?
tags:
  - programming
---

NPM is not just for distributing Node.js modules.
An NPM package can contain arbitrary stuff.
For example, NPM can be used to distribute _executables_.
NPM even has a few features to help with this use-case.
Let's take a look.

Download the tarball for [the `rollup` package](https://unpkg.com/browse/rollup/)
and look inside:

```shell
$ wget https://registry.npmjs.org/rollup/-/rollup-2.28.2.tgz
$ tar -ztvf rollup-2.28.2.tgz
-rwxr-xr-x  0 0      0       71182 26 Oct  1985 package/dist/bin/rollup
-rw-r--r--  0 0      0      167272 26 Oct  1985 package/dist/shared/index.js
-rw-r--r--  0 0      0         524 26 Oct  1985 package/dist/loadConfigFile.js
...
```

The file at `package/dist/bin/rollup` has its executable bit set.
When you run `npm install rollup`,
this all gets copied into `node_modules`,
and you can run the executable:

```shell
$ ls -l node_modules/rollup/dist/bin/rollup
-rwxr-xr-x  1 jim  staff  71182 26 Oct  1985 node_modules/rollup/dist/bin/rollup
~/dev/tmp/rollup_hw
$ ./node_modules/rollup/dist/bin/rollup

rollup version 2.28.2
=====================================

Usage: rollup [options] <entry file>
...
```

Naturally enough, this executable is a `node` script,
though it could be anything:

```shell
$ head -1 node_modules/rollup/dist/bin/rollup
#!/usr/bin/env node
```

However, it's not recommended to run the script directly via this path.
When you `npm install rollup`,
it also creates the symlink `node_modules/.bin/rollup`:

```shell
$ ls -ahl node_modules/.bin/rollup
lrwxr-xr-x  1 jim  staff    25B 30 Sep 11:35 node_modules/.bin/rollup -> ../rollup/dist/bin/rollup
```

This is created not because of the executable bit on the file,
but because `rollup`'s `package.json` has this config:

```json
{
  "bin": {
    "rollup": "dist/bin/rollup"
  }
}
```

But it's not really recommended to run `./node_modules/.bin/rollup` directly, either.
One option is `npm install rollup --global`, followed by just running `rollup`.
This method is recommended by the `rollup` docs, but it's not very nice.
It assumes that `npm install --global` puts the `rollup` executable on the `$PATH`
(on my machine, this happens to work because [`nvm`](https://github.com/nvm-sh/nvm) sets this up).
It pollutes your `$PATH`.
And it makes you forget to specify your dependencies in your `package.json`.

A more reliable method is `npm run-script` (or `npm run`).
This reads commands from your local `package.json`,
and runs them with `node_modules/.bin` added to the `PATH`.
For example, if we add this to our local `package.json`:

```json
{
  "scripts": {
    "build": "rollup main.mjs --file bundle.js"
  }
}
```

Then we can run `npm run-script build`,
which effectively runs `./node_modules/.bin/rollup main.mjs --file bundle.js`.
If you want to run this as a one-off command 
instead of saving it to your `scripts`, 
you can run `npx -c 'rollup main.mjs --file bundle.js'`.

Even more lazily, you can run `npx foo bar baz`,
but this has quite a bit of magic.
First it looks for `foo` on the path, e.g. `npx ssh-keygen bar baz` will just run `ssh-keygen bar baz`.
Failing that, it looks for `./node_modules/.bin/foo`.
If that doesn't exist, it will try to install the package `foo` (to a secret cache!),
and then "will try to guess the name of the binary to invoke".
IMO, this is pretty dodgy behavior.
