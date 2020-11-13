---
title: "Guest writers"
tags: ["blog"]
---

My friend Luís modified one of my blog posts on WebGL shaders,
[and we posted it here](/2017/10/28/guest-writer-program-webgl-both-diffuse-and-specular-shading/).
I didn't have this blog set up for guest posts, so here's what I've done.

I need to mark who wrote the post.
We do this with an `author` key in the metadata, like:

```yaml
---
title: "Cool WebGL shader"
author: luis
---
```

This should default to me.
I set this in my `_config.yml`:

```yaml
defaults:
  - values:
      author: jim
```

For info about those authors, I created `_data/people.yaml`:

```yaml
luis:
  name: "Luís Fonseca"
  url: "http://luisfonseca.xyz/"
```

We can look up this data in the post layout, like so:

```
{% raw %}{% if page.author != "jim" %}
  <h2>By
    <a href="{{site.data.people[page.author].url}}">
      {{site.data.people[page.author].name}}
    </a>
  </h2>
{% endif %}{% endraw %}
```
