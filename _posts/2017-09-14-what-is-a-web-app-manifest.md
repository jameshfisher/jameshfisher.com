---
title: "What is a Web App Manifest?"
---

We use "web app" to describe web pages which are more like programs.
This has always been pretty informal and ambiguous
(take a slideshow in a news story; is it a web app or a web page?).
The "Web App Manifest" attempts to formalize the distinction, and says that
a "web app" is any web page with a `<link rel="manifest" href="/manifest.json"/>`,
where `/manifest.json` is a JSON file with a bunch of information about the web app,
for example:

```json
{
  "name": "jameshfisher.com",
  "gcm_sender_id": "432193615425"
}
```

The manifest gives the web app things which make it more like "real applications", like:

* Ability to be added to a "homescreen"
* Icons for launching
* Configuration for advanced features, like web push
* Links to other applications in other "app stores"

It's not clear to me why all this stuff has to go in a separate JSON file.
It could all go directly in the `<meta>` tags for the page.
We already have a million different `<meta>` tags for other things.
