Xcode often creates a "SomeProject.xcworkspace" file. What is it?

Each `.xcworkspace` file corresponds to a "workspace" created in Xcode via `File > New > Workspace...`. You can open them in Xcode, just like you can open projects.

But it's not actually a file, it's a directory. Only Finder attempts to confuse you by displaying directories with this extension as files.

The important file is `SomeProject.xcworkspace/contents.xcworkspacedata`. This is an XML file, which looks like:

```
<?xml version="1.0" encoding="UTF-8"?>
<Workspace version="1.0">
   <FileRef ...></FileRef>
   <Group ...>
     <FileRef ...></FileRef>
     ...
   </Group>
   <FileRef ...></FileRef>
   ...
</Workspace>
```

That is, an arbitrary tree, where the root is a `<Workspace>` element, the leaves are `<FileRef>` elements, and everything in-between is a `<Group>`.

`<Groups>` are like directories; they are displayed as a directory tree in the "Project navigator" when you open the workspace in Xcode. An example of a `<Group>`:

```
<Group location="container:" name="foobar">
</Group>
```

The `name` property is the title in the Project navigator. (What is `container:`? Who knows?!)

The `<FileRef>` elements are like "files" in those "directories". An example of a `<FileRef>`:

```
<FileRef location="group:foo/bar/SomeProject.xcodeproj"></FileRef>
```

What is that `group:` protocol? It includes an XCode project as the sole member of a "group".

The path `foo/bar/SomeProject.xcodeproj` is relative to the directory containing the `.xcworkspace`. So if you have `$ROOT/SomeProject.xcworkspace/contents.xcworkspacedata` containing a `<FileRef location="group:foo/bar/SomeProject.xcodeproj"></FileRef>`, the relative path resolves to `$ROOT/foo/bar/SomeProject.xcodeproj`.
