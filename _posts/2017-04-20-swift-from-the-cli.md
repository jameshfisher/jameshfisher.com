---
title: How to run Swift from the CLI
tags: []
summary: >-
  Run Swift scripts from the command line using `swift hello.swift`, or compile
  them to an executable with `swiftc hello.swift`.
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
