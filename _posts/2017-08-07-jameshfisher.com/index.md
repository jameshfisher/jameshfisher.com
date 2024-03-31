---
title: This site is now on jameshfisher.com
tags: []
summary: >-
  Moved blog from `jameshfisher.github.io` to `jameshfisher.com`, with CNAME
  setup and GitHub custom domain settings. Switching to Netlify for HTTPS
  hosting.
---

This blog has been hosted at `jameshfisher.github.io` since I started it in November last year.
Last month I bought the domain `jameshfisher.com`, which I'm going to use for this blog.
Here's the process:

* Set up a CNAME from `www.jameshfisher.com` to `jameshfisher.github.io`
* In the settings for `github.com/jameshfisher/jameshfisher.github.io`,
  inform GitHub of your custom domain

Unfortunately, GitHub can't host your custom domain with HTTPS.
They don't accept TLS certificate uploads.
(This is another case where it would be simpler if HTTPS was configured with DNS;
I could just set my public key in DNS to that of GitHub.)
To get HTTPS,
I'm planning to move the blog hosting to [Netlify](https://netlify.com) instead.
