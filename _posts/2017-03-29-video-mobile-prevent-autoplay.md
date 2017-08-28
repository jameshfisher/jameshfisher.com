---
title: "How to prevent autoplay on mobile"
justification: "The vidr.io promo video autoplays when loading the page, but this is inapprops on mobile"
---

Look at [framer.com](https://framer.com/) on desktop: the promo video autoplays. Look at it on mobile: it embeds as an ordinary YouTube video, with a manual play button. The behavior is different because video autoplay on mobile is much more annoying: video takes a big bite into your mobile data usage.

How does framer.com achieve this? By switching on whether the user-agent suggests that the device is a mobile. Here's some equivalent code:

```js
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}
```
