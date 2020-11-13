---
title: "Running BodyPix on a video stream"
tags: ["programming", "web", "machinelearning"]
---

In [this previous post](/2020/08/16/bodypix-hello-world/),
I briefly showed the BodyPix API for segmenting a person in an image.
In this post, I show this applied to the video stream from your webcam.
<button onclick="helloWorld(); this.onclick=null">Click here to start the demo</button>:

<canvas id="canvas" width="100" height="100"></canvas>

Here's the performance of this on your machine:

* <span id="render_rate">Y</span> frames rendered per second
* <span id="segmentation_rate">X</span> frames segmented per second

This uses fairly low-quality settings for segmentation.
On my machine, I get around 7 frames segmented per second.
This is not good enough for realtime video.
To make the performance acceptable,
we must separate the render loop from the segmentation loop.
The segmentation loop samples from the stream less frequently than the render loop,
and the latest segmentation is used by multiple renders.
Here's the core program flow:

```js
const webcamEl = document.getElementById('webcam');
const canvasEl = document.getElementById('canvas');
const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
webcamEl.srcObject = stream; webcamEl.play();
const net = await bodyPix.load(...);

let mask = null;

function renderLoop(now, metadata) {
  canvasEl.width = metadata.width;
  canvasEl.height = metadata.height;
  if (mask) bodyPix.drawMask(canvasEl, webcamEl, mask, ...);
  webcamEl.requestVideoFrameCallback(renderLoop);
}
webcamEl.requestVideoFrameCallback(renderLoop);

async function segmentLoop(now, metadata) {
  webcamEl.width = metadata.width;
  webcamEl.height = metadata.height;
  const segmentation = await net.segmentPerson(webcamEl, ...);
  mask = bodyPix.toMask(segmentation);
  webcamEl.requestVideoFrameCallback(segmentLoop);
}
webcamEl.requestVideoFrameCallback(segmentLoop);
```

One oddity is that we must set the `width` and `height` properties of the `<video>` element explicitly,
otherwise TensorFlow complains.
In truth, I don't really know what the `width` and `height` properties of a `<video>` element mean, in general,
or how they interact with the size of each frame of the video (which can vary during the video stream!).
I'll cover this in a future post.

We shouldn't really use `bodyPix.drawMask` for rendering.
This is just an afterthought helper function from the library,
and doesn't provide what we need for background replacement,
or running any other effects.
In a future post, I'll show how to feed the segmentation mask into a custom WebGL renderer.

<script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@2.4"></script>

<script src="https://cdn.jsdelivr.net/npm/@tensorflow-models/body-pix@2.0"></script>
<video id="webcam" style="display: none;"></video>

<script>
  async function helloWorld() {
    const webcamEl = document.getElementById('webcam');
    const canvasEl = document.getElementById('canvas');
    const segmentationRateEl = document.getElementById('segmentation_rate');
    const renderRateEl = document.getElementById('render_rate');
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
    webcamEl.srcObject = stream;
    webcamEl.play();
    const net = await bodyPix.load({
      architecture: 'MobileNetV1',
      outputStride: 16,
      multiplier: 0.75,
      quantBytes: 2
    });

    let mask = null;

    let prevRenderTs = null;
    function renderLoop(now, metadata) {
      if (prevRenderTs) renderRateEl.innerText = (1000/(now-prevRenderTs)).toFixed(2);
      prevRenderTs = now;
      if (mask) {
        const opacity = 0.7;
        const flipHorizontal = false;
        const maskBlurAmount = 0;
        canvasEl.width = metadata.width;
        canvasEl.height = metadata.height;
        bodyPix.drawMask(canvasEl, webcamEl, mask, opacity, maskBlurAmount, flipHorizontal);
      }
      webcamEl.requestVideoFrameCallback(renderLoop);
    }
    webcamEl.requestVideoFrameCallback(renderLoop);

    let prevSegmentationTs = null;
    async function segmentLoop(now, metadata) {
      if (prevSegmentationTs) segmentationRateEl.innerText = (1000/(now-prevSegmentationTs)).toFixed(2);
      prevSegmentationTs = now;
      webcamEl.width = metadata.width;
      webcamEl.height = metadata.height;
      const segmentation = await net.segmentPerson(webcamEl, { internalResolution: 'medium', maxDetections: 1 });
      mask = bodyPix.toMask(segmentation);
      webcamEl.requestVideoFrameCallback(segmentLoop);
    }
    webcamEl.requestVideoFrameCallback(segmentLoop);
  };
</script>