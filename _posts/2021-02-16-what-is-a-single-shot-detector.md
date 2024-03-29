---
title: What is a Single-Shot Multibox Detector?
tags:
  - programming
  - web
  - machine-learning
summary: >-
  A neural network architecture that can output bounding boxes. It uses a fixed set of "anchor points" and predicts offsets and sizes for each anchor.
---

[The pre-trained Blazeface model](https://github.com/tensorflow/tfjs-models/tree/master/blazeface),
given an input image,
outputs an set of bounding boxes
that predicts where the faces are in the image.
But how is a neural network able to output a set of bounding boxes?
I usually think of a neural network outputting a "point",
but "sets" and "bounding boxes" seem like more sophisticated data structures.
In this post, I show how the "Single-Shot Detector" architecture achieves this.
To see a visualization,
<button onclick="main(); this.onclick=null">click here</button> to start a demo
that shows all the bounding boxes detected in your webcam feed!

<div style="position: relative;">
  <video id="webcam" autoplay muted></video>
  <canvas id="overlay" style="position: absolute; top: 0; left: 0;"></canvas>
</div>

Here's how to run the Blazeface model with TensorFlow.js,
getting back a `prediction` tensor that encodes a set of bounding boxes:

```js
const blazefaceGraphModel = await tf.loadGraphModel(
  'https://tfhub.dev/tensorflow/tfjs-model/blazeface/1/default/1', { fromTFHub: true });

async function estimateFaces(inputImage) {
  const inputImageTensor = tf.expandDims(tf.cast(tf.browser.fromPixels(inputImage), 'float32'), 0);
  const resizedImage = tf.image.resizeBilinear(inputImageTensor, [WIDTH, HEIGHT]);
  const normalizedImage = tf.mul(tf.sub(tf.div(resizedImage, 255), 0.5), 2);
  const prediction = tf.squeeze(blazefaceGraphModel.predict(normalizedImage));

  // Now we need to decode this `prediction` into a set of faces ...
  // but what does this `prediction` tensor look like?
}
```

The shape of this `prediction` tensor is 896×17.
This is a fixed-sized array of 896 faces, each with 17 features.
One of those features is a "confidence" - how confident is the network that this is actually a face?
So rather than returning a variable-sized set,
the network always returns a fixed-size array,
and the true size is given by the confidence values.
In Blazeface, the confidence is feature `0` of 17.
It's expressed in "logits",
which are range `[-Inf,Inf]`.
We squish into the conventional probability range `[0,1]` using `tf.sigmoid`:

```js
const logits = tf.slice(prediction, [0, 0], [-1, 1]);
const scores = tf.squeeze(tf.sigmoid(logits));
const scoresArray = await scores.array();
```

Each slot in the length-896 array corresponds to a particular "anchor point" in the image.
These anchor points are scattered regularly through the image.
I've drawn these points in the visualization as small squares,
and the opacity of the square represents the confidence value of there being face at that anchor point.
Here's how to build the set of anchor points that Blazeface uses:

```js
const WIDTH = 128;
const HEIGHT = 128;
const ANCHORS_DATA = [];
for (const [stride, anchorsNum] of [[8, 2], [16, 6]]) {
    const gridRows = Math.floor((HEIGHT + stride - 1) / stride);
    const gridCols = Math.floor((WIDTH + stride - 1) / stride);
    for (let gridY = 0; gridY < gridRows; gridY++) {
        const anchorY = stride * (gridY + 0.5);
        for (let gridX = 0; gridX < gridCols; gridX++) {
            const anchorX = stride * (gridX + 0.5);
            for (let n = 0; n < anchorsNum; n++) {
                ANCHORS_DATA.push([anchorX, anchorY]);
            }
        }
    }
}
const ANCHORS = tf.tensor2d(ANCHORS_DATA);
```

Each slot is sensitive to faces nearby its anchor point.
The idea is to parallelize the search for faces
by giving each slot its own area of the image to focus on.
I believe each slot is only made sensitive to nearby faces
by the training data.
When generating training data,
a ground truth bounding box is put in the slot
whose anchor point most closely matches that box.

The other important features of each slot are an "offset" and "size".
For each anchor point *p*,
the network can say,
"My best guess at a face around anchor point *p*
is offset by (10,15) pixels from the anchor point, and with the size (200,300)".
I have drawn these boxes in the overlay.

You might wonder, since each box can express an _offset_ from its anchor point,
why we have different anchor points at all.
Couldn't we just have 896 slots,
and the network could return the absolute coordinates of the box,
instead of an offset relative to an anchor point?
I think the answer is: _yes_, the network could return absolute coordinates,
but each slot must still be mainly sensitive to a specific area of the image.

To extract the bounding boxes from the prediction tensor,
we get the offset features (at indexes `1` and `2`)
and size features (at indexes `3` and `4`).
We then combine these with the pre-built anchor point set
to get boxes in the 128×128 image size used by Blazeface.
Then we scale these from the 128×128 image size to the original image size:

```js
const boxOffsets = tf.slice(prediction, [0, 1], [-1, 2]);
const boxSizes = tf.slice(prediction, [0, 3], [-1, 2]);
const centers /* shape=[896,2] */ = tf.add(boxOffsets, ANCHORS);
const halfBoxSizes /* shape=[896,2] */ = tf.div(boxSizes, 2);
const scaleInputSizeToOrigRect = [inputImageTensor.shape[2] / WIDTH, inputImageTensor.shape[1] / HEIGHT];
const topLefts = tf.mul(tf.sub(centers, halfBoxSizes), scaleInputSizeToOrigRect);
const bottomRights = tf.mul(tf.add(centers, halfBoxSizes), scaleInputSizeToOrigRect);
const boxes = tf.concat2d([topLefts, bottomRights], 1);
const boxesArray = await boxes.array();
```

This gives us 896 bounding boxes.
But we typically don't want 896 bounding boxes.
And we typically don't want heavily overlapping bounding boxes.
Instead, we want a small number of bounding boxes that are sufficiently confident and distinct.
For this, we use `tf.image.nonMaxSuppressionAsync`.
This implements [non-max suppression](https://towardsdatascience.com/non-maximum-suppression-nms-93ce178e177c),
which reduces the number of bounding boxes,
prioritizing those that are highly confident and highly distinct (non-overlapping).

```js
const boxIndices = await (await tf.image.nonMaxSuppressionAsync(boxes, scores, 10, 0.3, 0.75)).array();
const faces = await Promise.all(boxIndices.map(async (boxIndex) => {
    const selectedBox = tf.squeeze(tf.slice(boxes, [boxIndex, 0], [1, -1]));
    const [left, top, right, bottom] = await selectedBox.array();
    return { topLeft: [left, top], bottomRight: [right, bottom] };
}));
```

<script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs"></script>

<script>
  const WIDTH = 128;
  const HEIGHT = 128;
  const ANCHORS_DATA = [];
  for (const [stride, anchorsNum] of [[8, 2], [16, 6]]) {
      const gridRows = Math.floor((HEIGHT + stride - 1) / stride);
      const gridCols = Math.floor((WIDTH + stride - 1) / stride);
      for (let gridY = 0; gridY < gridRows; gridY++) {
          const anchorY = stride * (gridY + 0.5);
          for (let gridX = 0; gridX < gridCols; gridX++) {
              const anchorX = stride * (gridX + 0.5);
              for (let n = 0; n < anchorsNum; n++) {
                  ANCHORS_DATA.push([anchorX, anchorY]);
              }
          }
      }
  }
  const ANCHORS = tf.tensor2d(ANCHORS_DATA);
  async function main() {
      const blazefaceGraphModel = await tf.loadGraphModel('https://tfhub.dev/tensorflow/tfjs-model/blazeface/1/default/1', { fromTFHub: true });
      async function estimateFaces(inputImage) {
          tf.engine().startScope();
          const inputImageTensor = tf.expandDims(tf.cast(tf.browser.fromPixels(inputImage), 'float32'), 0);
          const resizedImage = tf.image.resizeBilinear(inputImageTensor, [WIDTH, HEIGHT]);
          const normalizedImage = tf.mul(tf.sub(tf.div(resizedImage, 255), 0.5), 2);
          const prediction = tf.squeeze(blazefaceGraphModel.predict(normalizedImage));
          const boxOffsets = tf.slice(prediction, [0, 1], [-1, 2]);
          const boxSizes = tf.slice(prediction, [0, 3], [-1, 2]);
          const logits = tf.slice(prediction, [0, 0], [-1, 1]);
          const centers /* shape=[896,2] */ = tf.add(boxOffsets, ANCHORS);
          const halfBoxSizes /* shape=[896,2] */ = tf.div(boxSizes, 2);
          const scaleInputSizeToOrigRect = [inputImageTensor.shape[2] / WIDTH, inputImageTensor.shape[1] / HEIGHT];
          const topLefts = tf.mul(tf.sub(centers, halfBoxSizes), scaleInputSizeToOrigRect);
          const bottomRights = tf.mul(tf.add(centers, halfBoxSizes), scaleInputSizeToOrigRect);
          const boxes = tf.concat2d([topLefts, bottomRights], 1);
          const scores = tf.squeeze(tf.sigmoid(logits));
          const boxesArray = await boxes.array();
          const scoresArray = await scores.array();
          tf.engine().endScope();
          return [boxesArray, scoresArray];
      }
      const videoEl = document.getElementById("webcam");
      const overlayCanvasEl = document.getElementById("overlay");
      const ctx = overlayCanvasEl.getContext('2d');
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoEl.srcObject = stream;
      async function loop(metadata) {
          const [boxesArray, scoresArray] = await estimateFaces(videoEl);
          overlayCanvasEl.width = videoEl.videoWidth;
          overlayCanvasEl.height = videoEl.videoHeight;
          for (let i = 0; i < boxesArray.length; i++) {
              const [left, top, right, bottom] = boxesArray[i];
              const score = scoresArray[i];
              const anchor = ANCHORS_DATA[i];
              ctx.fillStyle = `rgba(${anchor[0] * 255 / 128},${anchor[1] * 255 / 128}, 0, ${score})`;
              ctx.fillRect(anchor[0] * (videoEl.videoWidth / 128) - 2, anchor[1] * (videoEl.videoHeight / 128) - 2, 4, 4);
              ctx.strokeStyle = `rgba(${anchor[0] * 255 / 128},${anchor[1] * 255 / 128}, 0, ${score})`;
              ctx.strokeRect(left, top, right - left, bottom - top);
          }
          // @ts-ignore
          videoEl.requestVideoFrameCallback(loop);
      }
      // @ts-ignore
      videoEl.requestVideoFrameCallback(loop);
  }
</script>
