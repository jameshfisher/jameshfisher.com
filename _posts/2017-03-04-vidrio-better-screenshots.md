---
title: "Vidrio: better screenshots on the App Store"
justification: "I'm making Vidrio. I think I would be better served by better screenshots."
---

I assume people are finding Vidrio via the App Store. I suspect there are people hitting that page and not quite understanding what the tool is for. The current two "screenshots" don't do Vidrio much justice. Let's improve them to make Vidrio look more professional, to explain what Vidrio is, and how to use it.

First, let's look at some other apps' screenshots. They aren't literal screenshots! They use the space to explain the app in whatever visual way they see fit. They're slides, not screenshots. This is great for Vidrio, because screenshots are pretty difficult.

* Slack uses 4/5 slots. They're screenshots embedded in a larger poster-style explanation of features.
* Magnet uses 5/5 slots. Wireframes, not screenshots. It's similar to Vidrio in that it can't be seen as a single window, only as an effect on other windows. It has a particularly nice wireframe of its menu bar list.

![magnet example](http://a1.mzstatic.com/eu/r30/Purple122/v4/c9/88/9a/c9889ac0-8853-f506-fd6f-9e551d9f0adb/screen800x500.jpeg)

I'm going for the Magnet approach: wireframes. Here's the breakdown of slides:

1. **Vidrio is Tony Stark's presentation app.** Show a laptop screen with some windows. Show me overlaid, pointing to something on the screen.
1. **Vidrio works with _your_ screen-sharing app.** Explanation of steps: (1) Launch Vidrio. (2) Present using some screen-sharing tool (give specific examples).
1. Vidrio menu bar features.

In the Mac App Store, these screenshots are 800px wide by 500px tall. In the web preview, they are 657px wide. Weird. Let's design for the 800px size.

On submission, here's the spec:

> * 72 dpi, RGB, flattened, no transparency
> * High-quality JPEG or PNG image file format in the RGB color space
> * 16:10 aspect ratio
> * One of the following sizes:
>   * 1280 x 800 pixels
>   * 1440 x 900 pixels
>   * 2560 x 1600 pixels
>   * 2880 x 1800 pixels

These are all at 1.6 aspect ratio, like 800 * 500.

I'm using Inkscape, because I know Inkscape. The macOS support is crap, but I'll suck it up.

Let's create at 800*500, and upload at max raster resolution.

I'll use SF Pro throughout, for that Mac look. Justified on the basis that these are mockups.

Examples of screen sharing apps:

- Skype
- Google Hangouts
- Citrix
- Apple Messages
