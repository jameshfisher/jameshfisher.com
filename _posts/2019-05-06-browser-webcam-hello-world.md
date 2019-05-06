---
title: "Browser webcam hello world"
tags: ["programming"]
---

Just below this paragraph, you can see yourself!
In this post I show how webpages can access the webcam,
then stream it to a `<video>` element.

<video id="webcam" width="400"></video>

Here's the code that achieves this:

```html
<!-- First, a video element to stream the webcam to ... -->
<video id="webcam" width="400"></video>
```

```js
// ... then some JavaScript to access the webcam stream 
// and attach it to the video element.
const vidEl = document.getElementById("webcam");
navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
  .then(stream => {
    vidEl.srcObject = stream;
    vidEl.play();
  })
  .catch((err) => console.log("error getting webcam", err));
```

When this page loaded,
it prompted you for permission to access your webcam.
This happened when the page called `navigator.mediaDevices.getUserMedia(...)`,
which returns a `Promise<MediaStream>`.
When you respond to the permission request,
the promise resolves
(or rejects, if you deny permission).

The `<video>` element,
[as an HTMLMediaElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement),
has a `srcObject` property which can be any `MediaStream`.
By assigning the webcam stream to the `<video>` element's input,
we display the webcam.

Finally,
to start using the source,
you must call `.play()` on the `<video>` element.

<script>
  const vidEl = document.getElementById("webcam");
  navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
    .then(stream => {
      vidEl.srcObject = stream;
      vidEl.play();
    })
    .catch((err) => console.log("error getting webcam", err));
</script>