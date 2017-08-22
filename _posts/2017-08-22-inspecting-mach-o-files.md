---
title: "Inspecting Mach-O files"
---

`clang main.c` produces an `a.out`,
which on macOS is a binary in the Mach-O ("Mach object") format:

```
$ clang main.c
$ file a.out
a.out: Mach-O 64-bit executable x86_64
```

`clang` produces Mach-O files when run on macOS
because the executable format in macOS is Mach-O.
By contrast, on Linux, `clang` produces ELF files ("Executable and Linkable Format"),
because Linux's executable format is ELF.
This is documented in man pages.
On macOS, the page for the `execve` system call says:

> `execve()` transforms the calling process into a new process.
> The new process is constructed from an ordinary file ...
> This file is either an executable object file, or a file of data for an interpreter.
> An executable object file consists of ... see a.out(5).

The page for `a.out` says

> The object files produced by the assembler and link editor are in Mach-O (Mach object) file format.

Since Mach-O files are just ordinary files, we can dig into the bits-and-bytes.
But we can also inspect Mach-O files with a tool called `otool` ("object tool").
For example, we can see what dynamic libraries our `a.out` requires:

```
$ otool -L a.out
a.out:
	/usr/lib/libSystem.B.dylib (compatibility version 1.0.0, current version 1238.60.2)
```


A `.dylib` is a Mach-O dynamic module/library.
Our `clang` decided that our program should depend on a dynamic library at `/usr/lib/libSystem.B.dylib`.
This provides the implementations of many things used by C programs, such as stdio functions.

Dynamic libraries can themselves require dynamic libraries.
The big dylib at `/usr/lib/libSystem.B.dylib` requires a bunch more dylibs:

```
$ otool -L /usr/lib/libSystem.B.dylib
/usr/lib/libSystem.B.dylib:
...
	/usr/lib/system/libsystem_asl.dylib (compatibility version 1.0.0, current version 349.50.5)
	/usr/lib/system/libsystem_blocks.dylib (compatibility version 1.0.0, current version 67.0.0)
	/usr/lib/system/libsystem_c.dylib (compatibility version 1.0.0, current version 1158.50.2)
	/usr/lib/system/libsystem_configuration.dylib (compatibility version 1.0.0, current version 888.60.2)
	/usr/lib/system/libsystem_coreservices.dylib (compatibility version 1.0.0, current version 41.4.0)
...
```

An important dylib in here is `/usr/lib/system/libsystem_c.dylib`.
It defines a bunch of functions used by C programs.
For example, this dylib defines the function `fprintf`.
We can see this using a tool `nm` ("name"), which shows the name/symbol table of a Mach-O file.

```
$ nm -g /usr/lib/system/libsystem_c.dylib | grep fprintf
000000000003ed45 T _fprintf
000000000003ee18 T _fprintf_l
0000000000046355 T _vfprintf
0000000000046308 T _vfprintf_l
```

Notice that the symbol is not `fprintf`, but `_fprintf`. This is because "The name of a symbol representing a function that conforms to standard C calling conventions is the name of the function with an underscore prefix", [according to Apple](https://developer.apple.com/library/content/documentation/DeveloperTools/Conceptual/MachOTopics/1-Articles/executing_files.html).
