---
title: "Sentence wrap"
tags: ["writing", "programming"]
---

There are two common text-wrapping approaches for plaintext files like Markdown.
The first, _no-wrap_, uses one line per paragraph.
The second, _hard-wrap_, inserts newlines to keep lines below 80 characters.
I suggest a third approach, sentence-wrap.

In the _no wrap_ approach,
a single paragraph is written as a single line of text in the file.
Take this example:

```markdown
Open your project in Xcode. Do `Product > Archive`. This brings up the project organizer with a list of archives. So far, this is the same as releasing through the Mac App Store. But instead of clicking "Upload to App Store ...", click "Export...". Then simply select "Export a Developer ID-signed Application". (You want your package to be signed with your Developer ID when distributing outside the App Store. MacOS's "gatekeeper" policy can disallow unsigned applications.) Allow `codesign` access to your keychain. Select a location to export to.
```

No-wrap is produces awkward diffs.
If you edit this paragraph to remove the word "simply",
`git diff` only recognizes that the entire line has changed:

```
$ git diff
...
-Open your project in Xcode. Do `Product > Archive`. This brings up the project organizer with a list of archives. So far, this is the same as releasing through the Mac App Store. But instead of clicking "Upload to App Store ...", click "Export...". Then simply select "Export a Developer ID-signed Application". (You want your package to be signed with your Developer ID when distributing outside the App Store; MacOS's "gatekeeper" policy can disallow unsigned applications.) Allow `codesign` access to your keychain. Select a location to export to.
+Open your project in Xcode. Do `Product > Archive`. This brings up the project organizer with a list of archives. So far, this is the same as releasing through the Mac App Store. But instead of clicking "Upload to App Store ...", click "Export...". Then select "Export a Developer ID-signed Application". (You want your package to be signed with your Developer ID when distributing outside the App Store; MacOS's "gatekeeper" policy can disallow unsigned applications.) Allow `codesign` access to your keychain. Select a location to export to.
```

With some effort, you can get git to show you word-diffs,
but you can't rely on other people having this set up.

The second approach people take is _hard-wrap_,
which inserts newlines to ensure lines are less than 80 characters.
Hard-wrap relies on formats such as Markdown ignoring single newlines.
For example:

```markdown
Open your project in Xcode. Do `Product > Archive`. This brings up the project
organizer with a list of archives. So far, this is the same as releasing through
the Mac App Store. But instead of clicking "Upload to App Store ...", click
"Export...". Then simply select "Export a Developer ID-signed Application". (You
want your package to be signed with your Developer ID when distributing outside
the App Store; MacOS's "gatekeeper" policy can disallow unsigned applications.)
Allow `codesign` access to your keychain. Select a location to export to.
```

The hard-wrap approach produces even worse diffs.
Small edits cause newlines to fall in different places,
resulting in completely different lines.
For example:

```diff
$ git diff
diff --git a/test.md b/test.md
index b4f64ba..88a5019 100644
--- a/test.md
+++ b/test.md
@@ -8,9 +8,9 @@ To release a MacOS app through the Mac App Store, there is an integrated wizard
 Open your project in Xcode. Do `Product > Archive`. This brings up the project
 organizer with a list of archives. So far, this is the same as releasing through
 the Mac App Store. But instead of clicking "Upload to App Store ...", click
-"Export...". Then simply select "Export a Developer ID-signed Application". (You
-want your package to be signed with your Developer ID when distributing outside
-the App Store; MacOS's "gatekeeper" policy can disallow unsigned applications.)
+"Export...". Then select "Export a Developer ID-signed Application". (You want
+your package to be signed with your Developer ID when distributing outside the
+App Store; MacOS's "gatekeeper" policy can disallow unsigned applications.)
 Allow `codesign` access to your keychain. Select a location to export to.
```

My approach is _sentence-wrap_.
In sentence-wrap, you manually insert newlines between sentences.
This also relies on formats like Markdown ignoring single newlines.
For example:

```
Open your project in Xcode.
Do `Product > Archive`.
This brings up the project organizer with a list of archives.
So far, this is the same as releasing through the Mac App Store.
But instead of clicking "Upload to App Store ...", click "Export...".
Then simply select "Export a Developer ID-signed Application".
(You want your package to be signed with your Developer ID when distributing outside the App Store.
MacOS's "gatekeeper" policy can disallow unsigned applications.)
Allow `codesign` access to your keychain.
Select a location to export to.
```

Now the removal of the word "simply" results in a short single-line diff:

```diff
$ git diff
diff --git a/test.md b/test.md
index c2253ee..9703526 100644
--- a/test.md
+++ b/test.md
@@ -10,7 +10,7 @@ Do `Product > Archive`.
 This brings up the project organizer with a list of archives.
 So far, this is the same as releasing through the Mac App Store.
 But instead of clicking "Upload to App Store ...", click "Export...".
-Then simply select "Export a Developer ID-signed Application".
+Then select "Export a Developer ID-signed Application".
 (You want your package to be signed with your Developer ID when distributing outside the App Store.
 MacOS's "gatekeeper" policy can disallow unsigned applications.)
 Allow `codesign` access to your keychain.
```

In sentence-wrap, your long, complex sentences stand out as red flags.
Your long-line linter becomes a (more useful) long-sentence linter.

Once you adjust, I think sentence-wrap is easier to read, and easier to write.
Sentence wrap is reminiscent of poetry.
Shakespeare himself wrote in sentence wrap.
Here's his _Sonnet 18_:

```
Shall I compare thee to a summer's day? 
Thou art more lovely and more temperate:
Rough winds do shake the darling buds of May,
And summer's lease hath all too short a date: 
Sometime too hot the eye of heaven shines,
And often is his gold complexion dimm'd; 
And every fair from fair sometime declines,
By chance, or nature's changing course, untrimm'd;
But thy eternal summer shall not fade
Nor lose possession of that fair thou ow'st;
Nor shall Death brag thou wander'st in his shade,
When in eternal lines to time thou grow'st; 
So long as men can breathe or eyes can see,
So long lives this, and this gives life to thee. 
```


If you're not a literature buff but a programmer,
here's another analogy for you.
Compare sentences in English and statements in C.
All style guides insist on newlines between statements, like this:

```c
void * jim_malloc(size_t size) {
  int pagesize = getpagesize();
  size_t required = size + sizeof(size_t);
  int num_pages = div_roundup(required, pagesize);
  void * new_region = mmap(0, 4096, PROT_READ|PROT_WRITE, MAP_ANON|MAP_PRIVATE, 0, 0);
  if (new_region == MAP_FAILED) return NULL;
  *(size_t*)new_region = required; // We use this to free() the right number of bytes
  return new_region+sizeof(size_t);
}
```

The above style is sentence-wrap applied to C.
Here is what hard-wrap looks like applied to C:

```c
void * jim_malloc(size_t size) {
  int pagesize = getpagesize(); size_t required = size + sizeof(size_t); int
  num_pages = div_roundup(required, pagesize); void * new_region = mmap(0, 4096,
  PROT_READ|PROT_WRITE, MAP_ANON|MAP_PRIVATE, 0, 0); if (new_region ==
  MAP_FAILED) return NULL; *(size_t*)new_region = required; /* We use this to
  free() the right number of bytes */ return new_region+sizeof(size_t);
}
```
