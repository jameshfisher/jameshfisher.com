---
title: "Adding Open Graph meta tags to vidr.io"
justification: "I want to improve Vidrio's sharing before widely publicizing it."
---

[vidr.io](https://vidr.io) doesn't have any [Open Graph](http://ogp.me/) tags. I didn't know what Open Graph was until yesterday. It's a standard which defines some `<meta>` tags describing a webpage. Those tags are intended to be used when embedding the page elsewhere, such as when the URL is shared in social media.

Open Graph meta tags all take the form: `<meta property="og:KEY" content="VALUE"/>`. Open Graph has four "required" keys: `title`, `type`, `image` and `url`. The `type` is one of a set of strings like `website`, `video`, `music`, `profile`, etc., and depending on the `type`, there are more properties you can define.

The other required properties seem to have equivalents in pre-existing tags:

* `<meta property="og:title" content="FOO"/>` is roughly the same as `<title>FOO</title>`
* `<meta property="og:image" content="FOO"/>` is roughly the same as `<link rel="icon" href="FOO"/>`
* `<meta property="og:url" content="FOO"/>` is roughly the same as `<link rel="canonical" href="FOO"/>`
