---
title: "Adding an RSS feed to a Jekyll blog"
---

I've added an RSS feed to this blog.
Here's what I did.
Add to your `Gemfile`:

```rb
gem 'jekyll-feed'
```

Run:

```sh
bundle install
```


Add to your `_config.yml`:

```yaml
gems:
  - jekyll-feed
```

Add to your HTML template:

```html
<!doctype html>
<html lang="en">
  <head>
    <link rel="alternate" type="application/rss+xml" href="https://jameshfisher.com/feed.xml" />
    <!-- ... -->
  </head>
  <body>
    <!-- ... -->
    <a href="https://jameshfisher.com/feed.xml">RSS feed.</a>
    <!-- ... -->
  </body>
</html>
```
