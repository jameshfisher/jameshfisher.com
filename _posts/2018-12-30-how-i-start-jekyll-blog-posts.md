---
title: "How I start Jekyll blog posts"
tags: ["programming", "blog", "jekyll"]
---

I start every blog post by running a command which creates a new blog post file, like this:

```console
$ blogpost 'How I start Jekyll blog posts'
$ cat _posts/2018-12-30-how-i-start-jekyll-blog-posts.md
---
title: "How I start Jekyll blog posts"
tags: []
---

```

I find this very useful to jot down blog post ideas!
Instead of keeping blog post ideas in some separate checklist,
I keep the ideas directly in the posts directory.
If they turn out fruitful,
I'll commit the file and publish it.
Otherwise,
the file sits around for a few months,
and maybe gets deleted eventually.
I can see all of my blog post ideas with `git status`.

The `blogpost` command takes the post title `'How I start Jekyll blog posts'`
and the current date 2018-12-30,
and creates the file `_posts/2018-12-30-how-i-start-jekyll-blog-posts.md`.
Jekyll will take this file name
and host it at the URL `https://jameshfisher.com/2018/12/30/how-i-start-jekyll-blog-posts`.
The `blogpost` command also lays out the Jekyll 'front matter'.
`blogpost` is an command in my `.bashrc` which looks like:

```bash
function blogpost {
  printf -- "---\ntitle: \"$1\"\ntags: []\n---\n\n" > "/Users/jim/dev/jameshfisher/jameshfisher.com/_posts/$(date '+%Y-%m-%d')-$(echo $1 | tr '[:upper:] ' '[:lower:]-' | tr -cd "[:alnum:]-").md"
}
```
