---
title: "BlazeFace hello world"
tags: ["programming", "web", "tensorflow", "ml"]
ogimage: "/assets/2020-09-21/result.jpg"
---

[BlazeFace](https://github.com/tensorflow/tfjs-models/tree/master/blazeface)
is a neural network model that detects faces in images.
It's designed to be fast, to run at 30fps on mobile GPUs.
There is [a TensorFlow.js library for BlazeFace](https://github.com/tensorflow/tfjs-models/tree/master/blazeface),
which downloads the model,
runs it in WebGL using [TensorFlow.js](https://www.tensorflow.org/js),
and wraps the raw model input/output with a friendly, semantic API.
<button onclick="main(); this.onclick=null">Click here</button> to start a demo,
which captures and displays your webcam,
runs BlazeFace against frames as often as possible,
and draws the detected face landmarks on top of your webcam stream:

<div style="position: relative; width: 640px; height: 360px; background-color: black;">
  <video id="webcam" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: contain;"></video>
  <canvas id="overlay" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: contain;"></canvas>
</div>

Here's what I get when I run it against my own face:

<p><img src="/assets/2020-09-21/result.jpg"/></p>

Basic usage of this API is basically one function call;
a pure function from input image to predicted faces:

```html
<script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@2.4"></script>

<script src="https://cdn.jsdelivr.net/npm/@tensorflow-models/blazeface@0.0.5"></script>
```

```js
const model = await blazeface.load();
const predictions = await model.estimateFaces(webcamVideoEl, false);
console.log(predictions);
```

This will log an object looking something like:

```
[
  { // One detected face
    topLeft: [162.84341430664062,153.98446655273438],  // [x,y] coordinates
    bottomRight: [422.3966979980469,348.6485900878906],
    landmarks:[
      [238.96787643432617,204.8737621307373], // right eye
      [328.2145833969116,205.4714870452881],  // left eye
      [273.6716037988663,252.84512042999268], // nose
      [280.01041051000357,293.8540989160538], // mouth
      [206.6525173187256,226.03596210479736], // right ear
      [386.57989501953125,226.02698922157288] // left ear
    ],
    probability: [0.9997807145118713]  // Always a one-element array; a bit odd
  }
]
```

The `topLeft` and `bottomRight` coordinates define a "bounding box",
but I don't know exactly what it's supposed to bound.
Certainly, it seems to always contain the six detected landmarks,
but not precisely.
My eventual goal is to draw a boundary around the head;
the default bounding box is not necessarily helpful for this.

Under certain conditions, BlazeFace consistently recognized a face in my forehead,
and was extremely confident about it:

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">Probably one of my weirder debugging sessions <a href="https://t.co/AubMIkM1kI">pic.twitter.com/AubMIkM1kI</a></p>&mdash; Jim Fisher (@MrJamesFisher) <a href="https://twitter.com/MrJamesFisher/status/1307783574561550336?ref_src=twsrc%5Etfw">September 20, 2020</a></blockquote> 
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

The bug seems to only happen when I use my high-resolution webcam feed.
BlazeFace performs much more reliably with a lower-resolution webcam feed.
This is very strange, 
because I believe [the library resizes the input to 128×128 pixels](https://github.com/tensorflow/tfjs-models/blob/6d9566b1d659c1354ab82d701f16e56a710229d4/blazeface/src/face.ts#L236) before analyzing it.
I'll do a future post on the internals of this library,
and how to use TensorFlow.js.
This should help understand the weird forehead bug.

<script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@2.4"></script>

<script src="https://cdn.jsdelivr.net/npm/@tensorflow-models/blazeface@0.0.5"></script>

<script>
  const webcamVideoEl = document.getElementById("webcam");
  const overlayCanvasEl = document.getElementById("overlay");
  const overlayCtx = overlayCanvasEl.getContext('2d');

  function drawLine(p1, p2) {
    overlayCtx.strokeStyle = "red";
    overlayCtx.beginPath();     
    overlayCtx.moveTo(p1[0], p1[1]);  
    overlayCtx.lineTo(p2[0], p2[1]);
    overlayCtx.stroke();   
  }

  function drawPoint(p, char) {
    const LINE_RADIUS=40;
    const FONT_SIZE=40;
    drawLine([p[0], p[1]-LINE_RADIUS], [p[0], p[1]+LINE_RADIUS]);
    drawLine([p[0]-LINE_RADIUS, p[1]], [p[0]+LINE_RADIUS, p[1]]);
    overlayCtx.fillStyle = "black";
    overlayCtx.font = FONT_SIZE+'px serif';
    overlayCtx.fillText(char, p[0] - FONT_SIZE/2, p[1] + FONT_SIZE/2);
  }

  function drawPrediction(prediction) {
    overlayCtx.fillStyle = "rgba(255,0,0,0.3)";

    overlayCtx.fillRect(
      prediction.topLeft[0], 
      prediction.topLeft[1], 
      prediction.bottomRight[0]-prediction.topLeft[0], 
      prediction.bottomRight[1]-prediction.topLeft[1],
    );

    const rightEye = prediction.landmarks[0];
    const leftEye = prediction.landmarks[1];
    const nose = prediction.landmarks[2];
    const mouth = prediction.landmarks[3];
    const rightEar = prediction.landmarks[4];
    const leftEar = prediction.landmarks[5];

    drawPoint(rightEar, "👂");
    drawPoint(leftEar, "👂");
    drawPoint(rightEye, "👁");
    drawPoint(leftEye, "👁");
    drawPoint(mouth, "👄");
    drawPoint(nose, "👃");

    overlayCtx.font = '24px serif';
    overlayCtx.fillText("p="+prediction.probability[0].toFixed(2), prediction.topLeft[0], prediction.topLeft[1]);
  }

  async function main() {
    const [model, stream] = await Promise.all([
      blazeface.load(), 
      navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
    ]);

    webcamVideoEl.srcObject = stream;
    webcamVideoEl.play();

    async function onFrame(now, metadata) {
      const predictions = await model.estimateFaces(webcamVideoEl, false /* returnTensors */);
      overlayCanvasEl.width = metadata.width;
      overlayCanvasEl.height = metadata.height;
      for (const prediction of predictions) drawPrediction(prediction);
      webcamVideoEl.requestVideoFrameCallback(onFrame);
    }

    webcamVideoEl.requestVideoFrameCallback(onFrame);
  }
</script>