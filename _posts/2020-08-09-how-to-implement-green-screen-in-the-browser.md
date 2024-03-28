---
title: How to implement green screen in the browser
tags:
  - webgl
  - greenscreen
  - video
  - graphics-programming
  - javascript
  - web
  - programming
taggedAt: '2024-03-26'
summary: >-
  A green screen implementation in the browser using WebGL and chroma key.
  Includes a live demo.
---

You're making a web app that captures a user's webcam,
your user has a green screen behind them,
and you want to "remove the background" from the webcam video in realtime.
This post shows one way to do so.
First, here's the live demo,
which replaces green pixels with magenta:

<div>
  <video id="webcamVideo" style="display: none;"></video>
  <canvas id="displayCanvas" style="background-color: magenta;"></canvas>
  <button onclick="startWebcam(); this.parentElement.removeChild(this)">Start webcam</button>
</div>

<script type="text/javascript">
    function startWebcam() {
      const webcamVideoEl = document.getElementById("webcamVideo");
      const blitCanvas = new OffscreenCanvas(0, 0);  // size dynamically assigned per frame
      const blitCtx = blitCanvas.getContext("2d");
      const displayCanvasEl = document.getElementById("displayCanvas");
      const displayCtx = displayCanvasEl.getContext("2d");
      navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } }).then(stream => {
          webcamVideoEl.srcObject = stream;
          webcamVideoEl.play();
          function processFrame(now, metadata) {
            // downsample to this width (more sophisticated could dynamically choose size)
            const canvasWidth = 320;

            // use aspect ratio of latest frame
            const height = canvasWidth * metadata.height/metadata.width;

            // note this clears the canvases (at least in Chrome)
            blitCanvas.width = canvasWidth;
            blitCanvas.height = height;
            displayCanvasEl.width = canvasWidth;
            displayCanvasEl.height = height;

            // Downsamples video to canvas size
            blitCtx.drawImage(webcamVideoEl, 0, 0, canvasWidth, height);
            const imageData = blitCtx.getImageData(0, 0, canvasWidth, height);

            const numPixels = imageData.data.length / 4;
            for (let i = 0; i < numPixels; i++) {
              const r = imageData.data[i * 4 + 0];
              const g = imageData.data[i * 4 + 1];
              const b = imageData.data[i * 4 + 2];
              if (g > 100 && r < 100) imageData.data[i * 4 + 3] = 0;  // crude green screen
            }
            displayCtx.putImageData(imageData, 0, 0);
            webcamVideoEl.requestVideoFrameCallback(processFrame);
          }
          webcamVideoEl.requestVideoFrameCallback(processFrame);
      }).catch(error => {
        console.error(error);
      });
    }
</script>

The "pipeline" for this demo is:

* `getUserMedia` gives us a `MediaStream`
* Decode the video with an invisible `<video>` element
* `requestVideoFrameCallback` tells us when a video frame is available
* Draw each frame to an offscreen canvas
* `getImageData` gets the video frame as a (mutable) `ImageData` in JavaScript
* Iterate over each pixel of the `ImageData` in JavaScript,
  and set the pixel's opacity to zero if `g > 100 && r < 100`
* `putImageData` draws the `ImageData` to a visible canvas

There are two big deficiencies in this demo,
as a result of the naivety of the approach.
First, it's pretty inefficient.
For efficiency, everything should happen on the GPU,
but this demo does most processing on the CPU.
It uses `getImageData` and `putImageData` to process frames in JavaScript as `ImageData` objects.
[In the next post, I show how to avoid this inefficiency by using a WebGL shader.](/2020/08/10/how-to-implement-green-screen-in-webgl/).

The second deficiency here is the naivety of the green screen algorithm.
The demo sets a pixel transparent if `g > 100 && r < 100`.
There exist more sophisticated methods to decide whether a pixel should be transparent,
or how transparent it should be.
There are also algorithms for "color spill reduction", removing green light reflected from the subject.
I'll also show these in a future post.

Finally, here's the complete HTML for this example.

```html
<!DOCTYPE html>
<html>
  <body>
    <video id="webcamVideo" style="display: none;"></video>
    <canvas id="displayCanvas" style="background-color: magenta;"></canvas>
    <button onclick="startWebcam(); this.parentElement.removeChild(this)">Start webcam</button>
    <script type="text/javascript">
      function startWebcam() {
        const webcamVideoEl = document.getElementById("webcamVideo");
        const blitCanvas = new OffscreenCanvas(0, 0);  // size dynamically assigned per frame
        const blitCtx = blitCanvas.getContext("2d");
        const displayCanvasEl = document.getElementById("displayCanvas");
        const displayCtx = displayCanvasEl.getContext("2d");
        navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } }).then(stream => {
            webcamVideoEl.srcObject = stream;
            webcamVideoEl.play();
            function processFrame(now, metadata) {
              // downsample to this width (more sophisticated could dynamically choose size)
              const canvasWidth = 320;

              // use aspect ratio of latest frame
              const height = canvasWidth * metadata.height/metadata.width;

              // note this clears the canvases (at least in Chrome)
              blitCanvas.width = canvasWidth;
              blitCanvas.height = height;
              displayCanvasEl.width = canvasWidth;
              displayCanvasEl.height = height;

              // Downsamples video to canvas size
              blitCtx.drawImage(webcamVideoEl, 0, 0, canvasWidth, height);
              const imageData = blitCtx.getImageData(0, 0, canvasWidth, height);

              const numPixels = imageData.data.length / 4;
              for (let i = 0; i < numPixels; i++) {
                const r = imageData.data[i * 4 + 0];
                const g = imageData.data[i * 4 + 1];
                const b = imageData.data[i * 4 + 2];
                if (g > 100 && r < 100) imageData.data[i * 4 + 3] = 0;  // crude green screen
              }
              displayCtx.putImageData(imageData, 0, 0);
              webcamVideoEl.requestVideoFrameCallback(processFrame);
            }
            webcamVideoEl.requestVideoFrameCallback(processFrame);
        }).catch(error => {
          console.error(error);
        });
      }
    </script>
  </body>
</html>
```
