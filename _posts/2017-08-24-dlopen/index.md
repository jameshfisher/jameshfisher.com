---
title: How to make plugins with `dlopen`
tags: []
summary: >-
  Dynamically load and unload shared libraries using `dlopen`, `dlsym`, and
  `dlclose`.
---

Dynamic libraries, like `/usr/lib/system/libsystem_c.dylib`, are usually loaded before the program runs.
MacOS's `execve` system call knows how to extract references to dynamic libraries from Mach-O files,
and load these into memory before continuing.
But dynamic libraries can also be explicitly loaded at runtime.
To explicitly load dynamic libraries, we use the `dlfcn.h` ("dynamic loading functions"?) API.
This is how "plugins" work: a plugin is a dynamic library!

The three functions provided by `dlfcn.h` are `dlopen`, `dlclose`, and `dlsym`.
The `dlopen` function loads a dynamic library from a file into memory.
The `dlclose` unloads it from memory.
In between, we use `dlsym` to extract references to _symbols_ in the library.
These symbols give us access to functions and other things in the library.

Here's an example. We have `main.c`, our main program, and `plugin.c`, our plugin. The main program expects the plugin to define `plugin_func`, which is a function taking no arguments and returning an `int`. The main program loads the plugin, calls that function, then exits.

```c
// main.c
#include <dlfcn.h>
#include <stdio.h>
typedef int plugin_func();
int main() {
  void* handle = dlopen("plugin.so", RTLD_LAZY);
  if (handle == NULL) {
    fprintf(stderr, "Could not open plugin: %s\n", dlerror());
    return 1;
  }
  plugin_func* f = dlsym(handle, "plugin_func");
  if (f == NULL) {
    fprintf(stderr, "Could not find plugin_func: %s\n", dlerror());
    return 1;
  }
  printf("Calling plugin\n");
  int ret = f();
  printf("Plugin returned %d\n", ret);
  if (dlclose(handle) != 0) {
    fprintf(stderr, "Could not close plugin: %s\n", dlerror());
    return 1;
  }
  return 0;
}
```

```c
// plugin.c
#include <stdio.h>
int plugin_func(void) {
  printf("Hello from the plugin!\n");
  return 42;
}
```

We compile the plugin with `-shared`, and put the compiled object at `plugin.so` ("shared library").

```
$ clang -shared -o plugin.so plugin.c
$ clang main.c
$ ./a.out
Calling plugin
Hello from the plugin!
Plugin returned 42
```
