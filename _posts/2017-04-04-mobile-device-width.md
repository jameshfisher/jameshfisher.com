---
title: What is the `viewport` meta tag? How can I display my website on mobile?
justification: I'm making the Vidrio website. It should display well on mobile.
tags: []
---

Look at [vidr.io](https://vidr.io) on mobile. The page looks like a scaled-down version of the site designed for desktop. Compare this to [framer.com](https://framer.com/) on mobile, which displays a significantly different page on mobile.

A key difference is [the `viewport` meta tag](https://developer.mozilla.org/en/docs/Mozilla/Mobile/Viewport_meta_tag). On framer.com, this looks like:

```html
<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no"/>
```

The viewport tag controls how the browser displays the page. It can set multiple properties (such as `width`, `initial-scale`, and `user-scalable`, above).

The `width` property sets the size of a CSS pixel in physical pixels. A CSS pixel is a different concept to a physical pixel. A CSS pixel is an arbitrary unit, which is somehow resolved to a certain number of physical pixels (e.g., one CSS pixel = 2.5 physical pixels).

By setting `width` to `device-width`, we access the physical resolution of the device, and set one CSS pixel to equal one device pixel.

After doing so on vidr.io, the experience is arguably worse. This is because the site was not designed for small-width screens. Let's fix some of those problems next.
