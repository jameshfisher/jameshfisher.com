---
title: How can I add tags to a Jekyll blog?
tags:
  - programming
  - jekyll
summary: >-
  A plugin to create tag pages on a Jekyll blog, and a minimal layout for those tag pages.
---

Here I show you how to add tags to your Jekyll blog.
You'll be able to write posts like:

```
---
title: "How can I add tags to a Jekyll blog?"
tags: ["programming", "jekyll"]
---

Here is your post content ...
```

For each tag like `programming`,
you will have a page that lists all posts with that tag
at `/tag/programming`.
To create these dynamic pages, you need a [Jekyll "generator" plugin](https://jekyllrb.com/docs/plugins/generators/).
Put the following plugin at `_plugins/tags.rb`:

```rb
module Jekyll
  class TagPageGenerator < Generator
    safe true

    def generate(site)
      tags = site.posts.docs.flat_map { |post| post.data['tags'] || [] }.to_set
      tags.each do |tag|
        site.pages << TagPage.new(site, site.source, tag)
      end
    end
  end

  class TagPage < Page
    def initialize(site, base, tag)
      @site = site
      @base = base
      @dir  = File.join('tag', tag)
      @name = 'index.html'

      self.process(@name)
      self.read_yaml(File.join(base, '_layouts'), 'tag.html')
      self.data['tag'] = tag
      self.data['title'] = "Tag: #{tag}"
    end
  end
end
```

The above plugin uses a template at `_layouts/tag.html`.
Here's a minimal example of that layout:

```html{%raw%}
<!doctype html>
<html>
  <head>
    <title>Tag: #{{page.tag}}</title>
  </head>
  <body>
    <h1>Tag: #{{page.tag}}</h1>
    <ul>
      {% for post in site.posts %}
      {% if post.tags contains page.tag %}
      <li><a class="post" href="{{ post.url }}">{{ post.title }}</a></li>
      {% endif %}
      {% endfor %}
    </ul>
  </body>
</html>{%endraw%}
```

Finally, link to those tag pages from your blog posts.
If your posts use `_layouts/default.html`,
this could look like:

```html{%raw%}
<!doctype html>
<html lang="en">
  <head>
    <title>{{page.title}}</title>
  </head>
  <body>
    <h1>{{page.title}}</h1>
    {{content}}
    <p>
      Tagged
      {% for tag in page.tags %}
      <a class="post" href="/tag/{{tag}}">#{{tag}}</a>{% unless forloop.last %}, {% endunless %}
      {% endfor %}
    </p>
  </body>
</html>{%endraw%}
```
