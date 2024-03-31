---
title: Adding blog tags
tags:
  - blog
summary: >-
  I start using tags to categorize blog posts, enabling audience-specific
  features like subreddit auto-posting, customizable RSS feeds, and push
  notifications.
---

Until now, my blog has been entirely uncategorized.
The subjects on this blog have several audiences,
and it's hard to reach each audience without categorization.
For example, I would like to auto-post to relevant subreddits
based on the post's category.
I would also like visitors to be able to subscribe to some categories and not others.
I could have category-specific RSS feeds (e.g. `/feeds/programming.xml`).
People could subscribe for web push notifications for my "favorite" posts.

I've started using Jekyll's "tags" feature.
To tag a post, add it to the front matter.
For example, this post is tagged as:

```yaml
---
title: "Adding blog tags"
tags: ["blog"]
---
```

I list these tags at the bottom of each post, using

```liquid
<p>
  Tags:
  {% raw %}{% for tag in page.tags %}{{tag}}{% if forloop.last == false %}, {% endif %}{% endfor %}{% endraw %}.
</p>
```

You could also use the tags in a `<meta name="keywords" content="..."/>` tag.
But the `keywords` tag is questionable.

Jekyll also provides a "category" feature.
I'm not sure what the value of "categories" is;
it seems like "tags" are strictly more versatile.
Is this blog post in category "blog" or should it have the tag "blog"?
I'm avoiding these philosophical questions and only using tags.

A future step is to make these tags interactive.
Click through to an index page for each tag.
Add an RSS feed for each tag.
Click to subscribe via web push.
