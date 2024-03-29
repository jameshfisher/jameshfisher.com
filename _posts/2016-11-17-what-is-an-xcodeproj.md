---
title: What is an `.xcodeproj` file?
tags:
  - xcode
  - programming
taggedAt: '2024-03-26'
summary: >-
  The `.xcodeproj` "file" is actually a directory that contains a `project.pbxproj` file, which is a text file that stores the settings of an Xcode project, including information about the files, build configurations, targets, and dependencies.
---

Xcode tracks "projects" with a file called `SomeProject.xcodeproj`.

Actually, like workspaces, it's not a file at all - it's a directory.

The important file in it is `project.pbxproj` ("Project Builder XCode Project").

The rough syntax looks like:

```
// !$*UTF8*$!
{
  foo = {
    isa = blah;
    jtzht = (
      qux /* jyrjhetz */,
      barf /* grhtz */,
    );
    bam = 0;
  };
	bar = blah /* some comment */;
}
```

So you have:

* comments with `//` or with `/* ... */`
* key-value things with `{ key1 = value1; key2 = value2; ... }`
* lists with `( element1, element2, ... )`
* booleans (`YES` and `NO`)
* atoms (e.g. `blah`) representing themselves
* numbers (e.g. `0`)

It's roughly JSON in its expressiveness.

The first is special and mandatory: it indicates the encoding of the rest of the file.

A `project.pbxproj` file is pretty big; it contains boatloads of settings about your project. It mainly says:

* What files the project contains
* What build configurations it has, e.g. compiler flags

The overall schema is pretty simple:

```
// !$*UTF8*$!
{
	archiveVersion = 1;
	classes = {
	};
	objectVersion = 46;
	objects = {
    FD9C41C61DDE16AB001EC7D1 = ...;
    FD9C41D31DDE16AB001EC7D1 = ...;
    ...
  };
  rootObject = FD9C41C61DDE16AB001EC7D1;
}
```

The `objects` dictionary is the important bit. It defines a GRAPH. The keys of the dictionary are the vertices, and each object definition can reference other objects. Xcode creates odd IDs for objects, e.g. `FD9C41C61DDE16AB001EC7D1`.

A distinguished object is the `rootObject`. This defines the project.

There are a few different kinds of "object". Each is a dictionary with an `isa` property. There are many types: PBXBuildFile, PBXFileReference, PBXFrameworksBuildPhase, PBXGroup, PBXNativeTarget, PBXProject, PBXHeadersBuildPhase, PBXResourcesBuildPhase, PBXSourcesBuildPhase, PBXVariantGroup, XCBuildConfiguration, XCConfigurationList, PBXContainerItemProxy, XCConfigurationList, PBXTargetDependency.

The object dictionary is grouped by this type, with each section delimited by a comment, e.g.:

```
objects = {
/* Begin PBXBuildFile section */
		FD9C41D41DDE16AB001EC7D1 = ...;
		FD9C41DD1DDE1FD0001EC7D1 = ...;
/* End PBXBuildFile section */

/* Begin PBXFileReference section */
		FD9C41CF1DDE16AB001EC7D1 = ...;
		FD9C41D21DDE16AB001EC7D1 = ...;
		FD9C41D31DDE16AB001EC7D1 = ...;
		FD9C41DC1DDE1FD0001EC7D1 = ...;
/* End PBXFileReference section */

...

/* Begin XCConfigurationList section */
		FD9C41C91DDE16AB001EC7D1 = ...;
		FD9C41D71DDE16AB001EC7D1 = ...;
/* End XCConfigurationList section */
};
```

Examples of objects:

* `{isa = PBXBuildFile; fileRef = FD9C41D21DDE16AB001EC7D1; settings = { ... }; };`
* `{isa = PBXFileReference; lastKnownFileType = sourcecode.c.h; path = foo.h; sourceTree = "<group>"; };`
* ...
