---
title: Orphaned file detection
external_url: 'https://medium.com/@MrJamesFisher/orphaned-file-detection-de307d96d5e1'
tags:
  - garbage-collection
  - version-control
  - programming
taggedAt: '2024-03-26'
---

How many old files in your repository could be removed without breaking anything?
A significant number, if your repository is non-trivial.
Humans are terrible at garbage collection,
because orphaning doesn’t break test suites and doesn’t show up in code review.
But how about if your CI process was able to tell you:
"This commit might have orphaned these files: `/src/server/baz.py`, `/src/client/baz.js`"?
