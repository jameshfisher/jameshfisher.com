---
layout: default
title: jameshfisher.github.io
---

{% for post in site.posts %}
* [{{ post.date | date: '%Y-%m-%d' }}: {{ post.title }}]({{ post.url }})
{% endfor %}
