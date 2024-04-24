---
title: How to run a pre-trained model in TensorFlow.js
summary: >-
  Load the model, convert the input to a tensor, preprocess the tensor to match
  the model's expected format, run inference with `.predict()`, and decode the
  prediction tensor.
tags:
  - tensorflow-js
  - tensorflow
  - programming
  - web
  - machine-learning
  - image-processing
  - javascript
taggedAt: '2024-04-12'
---

[The tfjs-models repository](https://github.com/tensorflow/tfjs-models)
has several JavaScript libraries that expose a pre-trained model as a friendly JavaScript API.
Here I show what's going on internally in those libraries.

[BlazeFace](https://github.com/tensorflow/tfjs-models/tree/master/blazeface) will be my example,
as it is perhaps the smallest of those libraries.
It's "a lightweight model that detects faces in images".
It has a single method, `estimateFaces`,
that takes an image and returns a promise of an array of "face landmarks".

The BlazeFace library is a thin wrapper around [TensorFlow.js](https://github.com/tensorflow/tfjs).
Here I show the essence of the BlazeFace wrapper using just the TensorFlow.js API:

```js
// 1: Load the model
const blazefaceGraphModel = await tf.loadGraphModel(
  'https://tfhub.dev/tensorflow/tfjs-model/blazeface/1/default/1', { fromTFHub: true });

async function estimateFaces(inputImage) {
  // 2: Convert input to a tensor with `fromPixels`
  const inputImageTensor = tf.expandDims(tf.cast(tf.browser.fromPixels(inputImage), 'float32'), 0);

  // 3: Convert image tensor to size and format expected by pre-trained model
  const resizedImage = tf.image.resizeBilinear(inputImageTensor, [WIDTH, HEIGHT]);
  const normalizedImage = tf.mul(tf.sub(tf.div(resizedImage, 255), 0.5), 2);

  // 4: Run inference with .predict()
  const prediction = tf.squeeze(blazefaceGraphModel.predict(normalizedImage));

  // 5: Decode the prediction tensor into friendly JavaScript objects
  // ... omitted for brevity ...
  return faces;
}

// Now to use it:
const imgEl = document.getElementById("someImage");
const faces = await estimateFaces(imgEl);
console.log(faces);
```

This shows the basic pattern of nearly all model wrapper libraries:

1. **Load the pre-trained model.**
   In this case, the Blazeface model is in [the undocumented TensorFlow.js "web-friendly format"](https://github.com/tensorflow/tfjs/tree/master/tfjs-converter#web-friendly-format),
   so we use `tf.loadGraphModel`.
2. **Convert the input to a tensor.**
   Most models work on images, so we use `tf.browser.fromPixels`.
   It returns a 3D tensor with shape `[height, width, numChannels]`,
   with RGB values in the range `[0, 255]`.
   (Note the surprising shape: height is the first dimension!)
3. **Convert the input tensor to the format expected by the model.**
   The Blazeface model only works on 128×128 square images,
   but input images (e.g. from a webcam) can be any size and shape.
   The Blazeface library chooses to squish the whole input image
   into a 128×128 square.
   This destroys the aspect ratio, but appears to not affect accuracy
   (presumably, the model has been trained on various squished images).
   The Blazeface model also expects RGB channels in the range `[-1, 1]`,
   so we have to convert from the range `[0, 255]`.
4. **Run the model on the input tensor with `.predict`.**
   We get back a prediction tensor.
5. **Decode the prediction into friendly JavaScript objects.**
   This at least requires running `.array()` on tensors to get back JavaScript values.
   For Blazeface, the decoding is a bit involved,
   because the model architecture is a "Single Shot Multibox Detector".
   To see how this works, read the next post.
