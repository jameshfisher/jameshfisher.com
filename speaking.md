---
layout: "layouts/default"
author: "jim"
title: "Talks"
---

I've given some talks at conferences and meetups.
If you'd like me to talk at your event, [let me know](mailto:jameshfisher@gmail.com).
I've also made a few screencasts, some of which were preparations for talks and conferences.

{% for post in collections.talk %}
## [{{post.date | date: '%Y-%m-%d'}}: {{post.data.title}}]({{post.url}})

{{ post.templateContent }}

{% endfor %}
