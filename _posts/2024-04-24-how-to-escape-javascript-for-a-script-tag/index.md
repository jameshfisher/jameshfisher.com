---
title: "How to escape JavaScript for a script tag"
tags:
  - string-escaping
  - script-tag
  - javascript
  - html
  - security
  - web
  - programming
---

To add JavaScript to a web page,
we use a `<script>` tag like this:

```html
<script>console.log("Hello!");</script>
```

But what if we need to add arbitrary JavaScript to our web page?
Say, a valid script like this?:

```js
if (x<!--y) { ... }
```

We can't just write that in a `<script>` tag,
because the browser will interpret the `<!--` as the start of an HTML comment!

"But that's fine," you think.
"We can just escape the string.
This is how we serialize strings everywhere else in programming."

You might reach for HTML entities,
replacing `<` with `&lt;`.
After all, isn't the JavaScript just ordinary text content?
No, it's not!
Once the browser sees a `<script>` tag,
it goes into a **special JavaScript parsing mode**,
where HTML entities are not interpreted!

In this JavaScript parsing mode,
the browser is looking for one of two strings:

- `</script` to end the script tag
- `<!--` to start an HTML comment

To "escape" arbitrary JavaScript,
we need to avoid those two substrings.

If we find `<!--` in our JavaScript,
we can't just replace it,
because its meaning is context-dependent:

```js
// This is a comment containing <!--
let foo = x <!--y; // That's valid JS operators
const s = "This is a string containing <!--";
```

To "escape" the above JavaScript,
we'd have to write something like:

```js
// This is a comment containing
let foo = x < !--y; // That's valid JS operators
const s = "This is a string containing <" + "!--";
```

This is not a simple string replacement.
To do those replacements,
we need to parse the JavaScript,
and handle every possible context where `<!--` might appear.

[Here's the HTML spec.](https://html.spec.whatwg.org/multipage/scripting.html#restrictions-for-contents-of-script-elements)
It's all rather horrifying.
