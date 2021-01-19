---
title: "Resizable boxes in pure CSS!"
tags: ["programming", "web", "css"]
---

This morning I stumbled upon the CSS `resize` property.
You have probably seen the default `<textarea>` element:

<p>
  <textarea>Notice you can resize me!</textarea>
</p>

But you might not know that you can make any element resizable
by using the CSS `resize` property!
For example, here's a resizable video,
with a little handle in the bottom-right corner:

<p>
    <div style="resize: both; overflow: hidden; width: 500px; height: 300px;">
      <video loop muted autoplay playsinline disableRemotePlayback x-webkit-airplay="deny" disablePictureInPicture style="width: 100%; height: 100%; object-fit: cover; position: relative; z-index: -1">
        <source src="/assets/vidrio/webcam_320.mp4" type="video/mp4">
      </video>
    </div>
</p>

Here's the CSS for that:

```html
<div style="resize: both; overflow: hidden; width: 500px; height: 300px;">
  <video loop muted autoplay playsinline disableRemotePlayback x-webkit-airplay="deny" disablePictureInPicture style="width: 100%; height: 100%; object-fit: cover; position: relative; z-index: -1">
    <source src="/assets/vidrio/webcam_320.mp4" type="video/mp4">
  </video>
</div>
```

There seem to be a few gotchas.
It doesn't work on `display: inline` elements.
It doesn't work on `overflow: visible` elements.
It apparently doesn't work directly on `img` or `video` elements;
you have to put them in wrapper `div`s
(this seems to be undocumented).

Also, in Chrome, the `<video>` gets drawn over the resize handle,
which I believe is caused by [this Chromium bug](https://bugs.chromium.org/p/chromium/issues/detail?id=370604).
You can work around it with `position: relative; z-index: -1` on the `<video>`.
