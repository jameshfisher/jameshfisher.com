---
title: "Talks"
---

I've given some talks at conferences and meetups.
If you'd like me to talk at your event, [let me know](mailto:jameshfisher@gmail.com).

# 2017-??-??: _Don't say "simply"_, The Dev Shed, London

Forthcoming!

{% for post in site.posts %}
{% if post.tags contains "talk" %}
## [{{post.date | date: '%Y-%m-%d'}}: {{post.title}}]({{post.url}})

{{post.content}}

{% endif %}
{% endfor %}
