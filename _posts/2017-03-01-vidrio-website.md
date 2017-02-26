---
title: "Vidrio website"
justification: "I'm building Vidrio this month. I need a super simple site for it, to give it an existence independent of the App Store."
---

I bought the domain `vidr.io` for my app called Vidrio. The app will be on the Mac App Store; the main purpose of the `vidr.io` domain is to provide an independent existence for the app. It defines the Bundle ID of the app, provides a privacy policy, and briefly describes the app.

Here are some examples of websites for similar apps:

* [Squash](https://www.realmacsoftware.com/squash/). Logo, title, subtitle, "download"/"buy" buttons, intro video (YouTube), feature list.
* [Deliveries](http://junecloud.com/software/mac/deliveries.html). Logo, title, screenshot, description, "download on Mac App Store button".
* [MonoSnap](https://monosnap.com/welcome). Logo, subtitle, screenshot, "download" button, feature list.

They're all static content. The Vidrio site will just have:

* A logo
* A title
* A subtitle
* An intro video
* Download/buy buttons

Since I've used it before (for [lantreibecq.com](https://nativite.lantreibecq.com/)), I'll use [Firebase](https://firebase.google.com/). My Firebase app is `vidrio-a1248`. The site is hosted at [vidrio-a1248.firebaseapp.com](https://vidrio-a1248.firebaseapp.com/). The content for the site is in my monorepo, under `website/`. Firebase hosting doesn't deploy via git; I have to deploy it separately. This isn't a big deal.

Adding my domain was painless. I verified domain ownership via a `TXT` record. Next I added two `A` records. I waited 30 minutes for the TTL to expire, then [https://vidr.io/](https://vidr.io/) was live. Excellently, Firebase handles everything TLS: I didn't have to generate a CSR, copy-paste anything, or even know about the process.

Here's the site:

<iframe src="https://vidr.io/" width="100%" height="600px"></iframe>

Next, I'll recreate that App Record on iTunes Connect.
