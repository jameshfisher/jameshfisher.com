---
title: Hello world in Rust
tags: []
summary: >-
  I install Rust, create a "Hello World" program, and compare it to the
  equivalent C program. The Rust binary has additional dependencies beyond the
  standard C library.
---

I'm tinkering with [Rust](https://www.rust-lang.org/).
Here's how I started.

Rust has a classic "pipe curl to shell" installer: `curl https://sh.rustup.rs -sSf | sh`.
The installer works out what platform I'm on.
It downloads some stuff and puts it in `/Users/jim/.cargo`.
"Cargo" is Rust's package manager.
It added `export PATH="$HOME/.cargo/bin:$PATH"` to my `~/.bash_profile`,
so now I have access to some binaries there,
including `cargo` (the package manager),
`rustup` (a Rust version manager, so you don't have to run that curl-to-shell installer every time)
and `rustc`, the Rust compiler.

To test `rustc`, I created `hello.rs`:

```rust
fn main() {
    println!("Hello World!");
}
```

```
$ rustc hello.rs
$ ./hello
Hello World!
```

We can compare this file to the equivalent in C:

```c
#include <stdio.h>
int main() {
  printf("Hello world!\n");
  return 0;
}
```

The Rust binary has an overhead of around 420K.
I don't know what's in there!

Both binaries depend on `/usr/lib/libSystem.B.dylib`,
the macOS system library.
This provides, amongst other things, the C standard library.
The Rust binary has one other dependency, `/usr/lib/libresolv.9.dylib`.
This provides a DNS client,
includable in C with `resolv.h`,
linkable in C with `-lresolv`,
and documented in `man 3 resolver`.
It's not clear why the Rust binary depends on this.
