---
title: "How to replace GIF with HTML video in 2021"
tags: ["programming", "web"]
---

You want to add a video to your webpage that acts like an animated GIF.
All other online guides are out-of-date in 2021!
Here's the attribute soup you need nowadays:

```html
<video autoplay loop muted playsinline disableRemotePlayback x-webkit-airplay="deny" disablePictureInPicture>
  <source src="/assets/yourVideo.webm" type="video/webm" />
  <!-- ... more sources ... -->
</video>
```

Here's what the attributes do to mimic an animated GIF:

* `autoplay`: start playing the video ASAP, just like an animated GIF plays as it loads.
* `loop`: restart the video when reaching the end. Optional in GIF but usually on.
* `muted`: important even if your video has no audio! Browsers will often refuse to `autoplay` unless the video is `muted`.
* `playsinline`: disable playing the video in "fullscreen".
* `disableRemotePlayback`: disable Google Cast or AirPlay buttons.
* `x-webkit-airplay="deny"`: same as `disableRemotePlayback`, but respected by Safari.
* `disablePictureInPicture`: disable any Picture-in-Picture prompts.

Annoyingly, `<video>` features are generally opt-out,
so as browsers keep inventing new features,
we have to add more attributes to opt out of them.
I'll try to keep this page up-to-date!

(Also, I note in passing how this attribute soup uses every possible naming convention:
`camelCase`, `alllowercase`, and `kebab-case`.
You just know each of them was decided on
in 5 minutes by a developer at Google or Apple,
with no discussion.)