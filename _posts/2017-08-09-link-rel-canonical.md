---
title: "What is the `rel=canonical` tag?"
---

This blog is hosted in a bunch of places:

* `https://jameshfisher.com`
* `http://jameshfisher.com`
* `https://jameshfisher-com.netlify.com`
* `http://jameshfisher-com.netlify.com`
* `https://jameshfisher.github.io`
* `http://jameshfisher.github.io`

I prefer `https://jameshfisher.com`.
The others are old, or insecure, or implementation details.
To tell Google and everyone else which version you prefer, you can use the `<meta rel="canonical"` tag.
On every page you serve, you put a `<link rel="canonical" href="..."/>` element,
and this tells the client where the canonical location of that page is.
Like so for the page `/foo/bar`:

```html
<!doctype html>
<html>
  <head>
    <link rel="canonical" href="https://jameshfisher.com/foo/bar"/>
  </head>
  <!-- ... -->
</html>
```
