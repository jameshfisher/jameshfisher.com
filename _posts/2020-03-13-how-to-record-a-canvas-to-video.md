---
title: "How to record a canvas to video"
tags: ["programming", "web"]
---

You can use HTML `canvas` to produce videos!
The following function,
given a canvas and a video length in milliseconds,
serves a `video.webm` to the viewer for download:

```js
function recordCanvas(canvas, videoLength) {
  const recordedChunks = [];
  const mediaRecorder = new MediaRecorder(
    canvas.captureStream(25), {mimeType: 'video/webm; codecs=vp9'});
  mediaRecorder.ondataavailable = 
    event => recordedChunks.push(event.data);
  mediaRecorder.onstop = () => {
    const url = URL.createObjectURL(
      new Blob(recordedChunks, {type: "video/webm"}));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "video.webm";
    anchor.click();
    window.URL.revokeObjectURL(url);
  }
  mediaRecorder.start();
  window.setTimeout(() => {mediaRecorder.stop();}, 3000);
}
```

Here's an example of usage.
I've set up the following canvas to show
a silly animation of a square wandering around the canvas at random.
To record a 3-second snippet of the canvas and download it as a video,
click here: <button id="download-snippet">Give me a video!</button>.

<div>
  <canvas id="example-canvas" width="200" height="200" style="width: 400px; image-rendering: pixelated; display: inline-block;"></canvas>
</div>

<script>
    const canvas = document.getElementById("example-canvas");
    const ctx = canvas.getContext('2d');
    let x = 90;
    let y = 90;
    function draw() {
        ctx.fillStyle = "red";
        ctx.fillRect(0, 0, 200, 200);
        ctx.fillStyle = "black";
        ctx.fillRect(x, y, 20, 20);
        x += (Math.random()*6) - 3;
        y += (Math.random()*6) - 3;
        requestAnimationFrame(draw);
    }
    draw();

    function recordCanvas(canvas, videoLength) {
      const recordedChunks = [];
      const mediaRecorder = new MediaRecorder(canvas.captureStream(25), {mimeType: 'video/webm; codecs=vp9'});
      mediaRecorder.ondataavailable = event => recordedChunks.push(event.data);
      mediaRecorder.onstop = () => {
        const url = URL.createObjectURL(new Blob(recordedChunks, {type: "video/webm"}));
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = "video.webm";
        anchor.click();
        window.URL.revokeObjectURL(url);
      }
      mediaRecorder.start();
      window.setTimeout(() => {mediaRecorder.stop();}, 3000);
    }
    document.getElementById("download-snippet").onclick = () => {
      recordCanvas(canvas, 3000);
    };
</script>