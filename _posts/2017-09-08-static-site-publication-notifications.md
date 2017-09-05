---
title: "Publication notifications for static sites"
---

I have a new mini-project for this site:
notifications about new pages.
Here's how it will work:

1. This site will ask users for permission to display notifications.
1. This site will install a service worker.
1. The service worker will periodically check
   [the `/sitemap.xml` for this site](/sitemap.xml).
   It will store the last seen state.
   (This could also work with an RSS feed but I haven't set one up.)
1. When the service worker detects a new page in the sitemap,
   it will download it and extract some OpenGraph tags for it.
1. The service worker will display a notification with the page title, image, etc.

I don't even know if this is possible.
But if I can make a purely static notifications system,
it would be pretty cool.
