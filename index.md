---
layout: default
title: Jim Fisher
---

Topics include C, UNIX, and networking.

{% for post in site.posts %}
* [{{ post.date | date: '%Y-%m-%d' }}: {{ post.title }}]({{ post.url }})
{% endfor %}
