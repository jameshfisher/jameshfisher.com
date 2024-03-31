---
title: WebAssembly hello world
tags: []
summary: >-
  A WebAssembly program that prints `42` to the console, demonstrating
  the structure and usage of WebAssembly.
---

If your browser supports WebAssembly,
copy-pasting the following into the console
will print `42`:

```js
const module = WebAssembly.Module(new Uint8Array([
  0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x02, 0x60, 0x01, 0x7f, 0x00, 0x60,
  0x00, 0x00, 0x02, 0x0f, 0x01, 0x07, 0x69, 0x6d, 0x70, 0x6f, 0x72, 0x74, 0x73, 0x03, 0x6c, 0x6f,
  0x67, 0x00, 0x00, 0x03, 0x02, 0x01, 0x01, 0x07, 0x05, 0x01, 0x01, 0x65, 0x00, 0x01, 0x0a, 0x08,
  0x01, 0x06, 0x00, 0x41, 0x2a, 0x10, 0x00, 0x0b,
]));
const instance = new WebAssembly.Instance(module, {imports:{log:console.log}})
instance.exports.e();
```

Why does this print `42` to the console?
The mysterious hex is a WebAssembly program, which we compile and "instantiate".
WebAssembly programs have "imports" and "exports".
We pass `console.log` to the program as the import called `log`.
The program exports a function called `e`,
which when called calls `log` with the number `42`.
(You can see the number 42 embedded in the program as the hex `0x2a`!)
We call that exported `e()` on the WebAssembly Instance,
causing it to call `console.log` with the number `42`.

The mysterious hex is in `wasm` format.
I didn't write it myself;
instead, I compiled it from a program in WAST ("Web Abstract Syntax Tree") format.
You can see the exports, imports and call logic in the WAST program:

```
(module
  (func $i (import "imports" "log") (param i32))
  (func (export "e")
    i32.const 42
    call $i))
```

I compiled this with:

```
$ brew install wabt
$ wast2wasm program.wast -o program.wasm
```

More advanced usage of WebAssembly
would probably download an external `.wasm` file,
and compile it asynchronously.
The following also works, if you run it in the console:

```js
async function callWasm() {
  const response = await fetch('/assets/2017-10-13/program.wasm');
  const bytes = await response.arrayBuffer();
  const module = await WebAssembly.compile(bytes);
  const instance = new WebAssembly.Instance(module, { imports: { i: console.log } });
  instance.exports.e();
}
callWasm();
```
