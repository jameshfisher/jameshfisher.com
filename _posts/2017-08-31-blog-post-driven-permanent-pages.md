---
title: Post-driven permanent blog pages
tags: []
---

I have a few "permanent" pages on this blog.
An example is [the `/speaking` page](/speaking).
I used to maintain this page as a separate static HTML page:
every time I did a talk, I would edit the page.

I've changed tactic.
Now, the talks page is _generated_ from all blog posts tagged with `talk`.
Those posts are embedded in the page, resulting in a list of videos.
The advantages are clear:

* The page is updated using my normal work flow: create another post file.
* There is a separate URL for each talk, if people wish to link to them separately.
* They're naturally in date order.

I think this principle can be extended to other "permanent" pages.
For example, I'd like to maintain a `/projects` page,
giving a short description of each project
(such as Vidrio, The Realtime Guild, Strip Casino, ...).
Each description could be taken as
the content of the latest post with
`{ "project": "vidrio", "tags": ["project_description", ...] }`.
This would encourage re-writing the description each time I want to update it.
I think this is a good thing!
