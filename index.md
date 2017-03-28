---
layout: default
title: Jim Fisher
---

Developer of <a href="https://vidr.io">Vidrio</a>, the future of presentation. Other topics include C, UNIX, and networking.

{% for post in site.posts %}
* [{{ post.date | date: '%Y-%m-%d' }}: {{ post.title }}]({{ post.url }})
{% endfor %}
