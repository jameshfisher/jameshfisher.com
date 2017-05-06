---
title: "Running Swift from the CLI"
---

So far I've only had experience of running Swift from Xcode as part of a project. But you can also run and compile Swift independently of Xcode. Example:

```
$ echo 'print("hello")' > hello.swift
$ swift hello.swift
hello
$ swiftc hello.swift
$ ./hello
hello
```
