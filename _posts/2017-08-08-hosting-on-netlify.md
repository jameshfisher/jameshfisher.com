---
title: "Hosting this blog on Netlify"
---

I bought `jameshfisher.com` to use for this blog.
I tried using GitHub's custom-domain support, but found that they _still_ don't support HTTPS.
Therefore I've moved the hosting to [Netlify](https://netlify.com).
Netlify is a free static site host.
I've used Netlify before to host [making.pusher.com](https://making.pusher.com), Pusher's engineering blog.
This was a smooth and friendly experience, so I decided to do the same for my personal blog.

The process was:

1. Create a new Netlify site.
1. Tell Netlify that this site will use the custom domain `jameshfisher.com`.
1. Create a DNS `A` record pointing to Netlify's load balancer's IP address.
   Namecheap's DNS doesn't support ANAME or ALIAS records, which are preferred for apex domains.
   CNAME records don't work well with apex domains like `jameshfisher.com`.
   I'll cover that in a future post.
   Also, Namecheap has some BS "URL redirect record" which I don't think is properly a DNS record at all.
   I deleted that.
   In the future I'd like to move the DNS away from Namecheap.
   Another future post.
1. Request a Let's Encrypt TLS certificate via the Netlify dashboard.
   Netlify requests the certificate,
   and proves control of the domain by hosting a challenge on that domain (I assume).
1. Wait around for the Let's Encrypt certificate.
   This should take a few seconds, but took ages.
   I think this is because of Namecheap's BS "URL redirect record",
   which added another A record,
   which then got cached for ages.
1. Enable "Force TLS connections" in the Netlify dashboard.
1. Add `<link rel="canonical" .../>` tags to point to the new domain (see tomorrow's post).
1. Clone the repo to a new GitHub repository, `github.com/jameshfisher/jameshfisher.com`.
   This will be the repository backing the new site,
   and the old repository will only be kept for redirects.
1. Point Netlify at the new repository.
1. Add `<meta http-equiv="refresh" content="0; ..."/>` tags to the old `jameshfisher.github.io` site.
1. I need to keep the GitHub hosting around to redirect to the new domain.
   Maybe I'll remove the site some day, but I'll keep it around for now.
