---
title: "Linking to external posts from Jekyll"
tags: ["jekyll", "blog"]
---

I'd like this site to list all my public activity.
Unfortunately, the web is a mess.
To find my posts before late 2016,
you have to scour Google.
And in future I will surely write new posts on other platforms,
such as professional blogs.
I don't want you and I to have to hunt for these posts.

Instead, I've set up an "external post" system here.
This site uses Jekyll,
and I can write post files like this:

```yaml
---
title: "Low latency, large working set, and GHC’s garbage collector: pick two of three"
external_url: "https://making.pusher.com/latency-working-set-ghc-gc-pick-two/"
---
```

When [my homepage](/) layout sees this post,
it will link to the external site instead.
Now you and I have a searchable list of all my posts,
whether they're published on this site or not.

In the coming weeks,
I'll be copying over links to posts from olden days.
