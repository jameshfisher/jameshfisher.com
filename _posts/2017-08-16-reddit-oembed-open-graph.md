---
title: "How do Reddit thumbnails work?"
---

The other day [I submitted Vidrio to /r/MacApps](https://www.reddit.com/r/macapps/comments/6tgk8g/vidrio_a_macos_screencasting_app_i_made_feedback/). After submission I found that the thumbnail for the submission defaulted to a generic image, rather than being the Vidrio icon. Why?

[Reddit uses Embed.ly](http://embed.ly/stories/reddit) to retrieve a thumbnail for the submission. Embedly respects a standard called [oEmbed](http://oembed.com/) ("open embed"?). This means, when I submitted `https://vidr.io` to Reddit, Reddit made a request like

```
curl -X GET 'https://api.embedly.com/1/oembed?format=json&url=https%3A//vidr.io&key=REDDITS_EMBEDLY_API_KEY'
```

and Embedly responded with some info about https://vidr.io in a JSON format defined by oEmbed. Embedly is a paid service but it offers [a free HTML snippet generation service](http://embed.ly/code) which presumably uses the same logic. Here's the embed for Vidrio:

<blockquote class="embedly-card"><h4><a href="https://vidr.io">Vidrio for macOS</a></h4><p>Vidrio for macOS is a holographic screencast app. Present from the future™</p></blockquote>

<script async src="//cdn.embedly.com/widgets/platform.js" charset="UTF-8"></script>

No thumbnail! For contrast, here's the embed for a site which got a thumbnail on Reddit:

<blockquote class="embedly-card"><h4><a href="https://itunes.apple.com/us/app/speedtest-by-ookla/id1153157709?mt=12">Speedtest by Ookla on the Mac App Store</a></h4><p>Read reviews, compare customer ratings, see screenshots, and learn more about Speedtest by Ookla. Download Speedtest by Ookla for Mac OS X 10.10 or later and enjoy it on your Mac.</p></blockquote>

<script async src="//cdn.embedly.com/widgets/platform.js" charset="UTF-8"></script>

How does Embedly decide on the thumbnail for that URL? oEmbed doesn't specify this; it only defines the formats of requests and responses. However, [Embedly describes their process for choosing the image](http://support.embed.ly/hc/en-us/articles/204266025-Why-does-Embedly-choose-the-image-that-it-does-):

> Embedly looks at the following attributes of the page and then ranks and scores the images.
>
> * If the oEmbed type is photo the url of the oEmbed object
> * The `thumbnail_url` of the oEmbed object if the oEmbed type is not photo
> * The Open Graph `og:image` property
> * The meta `image_src` tag.
> * Any images found in the API response.
> * Images ranked and pulled from the body of the page.

The one to pay attention is "The Open Graph `og:image` property". Embedly follows [the Open Graph protocol](http://ogp.me/), which "enables any web page to become a rich object in a social graph. For instance, this is used on Facebook to allow any web page to have the same functionality as any other object on Facebook."

More concretely, Open Graph defines some `meta` tags, like `og:image`, which can be used to build an embedded representation of the page elsewhere.

So, here's my answer: `https://vidr.io` didn't get a thumbnail because the page doesn't include an `og:image`. I'll go about adding some Open Graph properties to the Vidrio site.
