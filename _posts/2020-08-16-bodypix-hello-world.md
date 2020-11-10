---
title: "BodyPix hello world"
tags: ["programming", "web", "machinelearning"]
ogimage: "/assets/2020-08-16/result.jpg"
---

BodyPix is a TensorFlow model for "person segmentation".
Given an image, it estimates, 
for each point in the image, 
what body part is at that point.
For example, it might estimate that point `x=50,y=100` is part of a `right_hand`, with confidence `0.8`.
To test it out, here's an input image:

<p><img id="jimage" src="{% link assets/2020-08-16/jim.jpg %}"/></p>

And here's a person segmentation generated from this image,
using [the getting started code from the BodyPix README](https://github.com/tensorflow/tfjs-models/tree/master/body-pix):

<p><img src="{% link assets/2020-08-16/result.jpg %}"/></p>

In many ways, BodyPix does a great job,
but there are some clear flaws.
First: where did my finger go?!
Even though I turned up all the "quality" config parameters,
BodyPix does not detect my fingers reliably.
The smaller, faster `MobileNetV1` architecture only seems to detect palms, never fingers.
The slower, more accurate `ResNet50` architecture detects fingers occasionally,
but doesn't seem to have a good understanding of hands.
I don't think it knows that hands have five fingers.

By contrast, [another TensorFlow model called Handpose](https://github.com/tensorflow/tfjs-models/tree/master/handpose)
understands the structure of hands very well,
and much more reliably detects all my fingers.
It could help to run Handpose where BodyPix detects a hand,
then add the detected fingers to the mask.

A second problem: BodyPix does not identify boundaries very precisely.
For example,
in the source image, 
there is a very clear boundary between my shirt and the background,
but BodyPix places the boundary outside of this.
It could help to run an [active contour model](https://en.wikipedia.org/wiki/Active_contour_model)
on the rough outline provided by BodyPix.

Finally, to generate the above segmentation image,
<button onclick="helloWorld()">click here</button>,
and the image will appear below.
You might have to wait a while for the model to load and run.

<canvas id="canvas" width="900" height="507"></canvas>

<script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@1.2"></script>

<script src="https://cdn.jsdelivr.net/npm/@tensorflow-models/body-pix@2.0"></script>

<script>
  async function helloWorld() {
    const imageElement = document.getElementById('jimage');
    const net = await bodyPix.load({
      architecture: 'ResNet50',
      outputStride: 16,
      quantBytes: 4
    });
    const segmentation = await net.segmentPerson(imageElement, {
      internalResolution: "full",
      segmentationThreshold: 0.2,
      nmsRadius: 1
    });
    const coloredPartImage = bodyPix.toMask(segmentation);
    const opacity = 0.7;
    const flipHorizontal = false;
    const maskBlurAmount = 0;
    const canvas = document.getElementById('canvas');
    bodyPix.drawMask(
        canvas, imageElement, coloredPartImage, opacity, maskBlurAmount,
        flipHorizontal
    );
  };
</script>

And here's the code that this page uses to generate this image:

```html
<p><img id="jimage" src="{% link assets/2020-08-16/jim.jpg %}"/></p>
<canvas id="canvas" width="900" height="507"></canvas>

<script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@1.2"></script>

<script src="https://cdn.jsdelivr.net/npm/@tensorflow-models/body-pix@2.0"></script>

<script>
  async function helloWorld() {
    const imageElement = document.getElementById('jimage');
    const net = await bodyPix.load({
      architecture: 'ResNet50',
      outputStride: 16,
      quantBytes: 4
    });
    const segmentation = await net.segmentPerson(imageElement, {
      internalResolution: "full",
      segmentationThreshold: 0.2,
      nmsRadius: 1
    });
    const coloredPartImage = bodyPix.toMask(segmentation);
    const opacity = 0.7;
    const flipHorizontal = false;
    const maskBlurAmount = 0;
    const canvas = document.getElementById('canvas');
    bodyPix.drawMask(
        canvas, imageElement, coloredPartImage, opacity, maskBlurAmount,
        flipHorizontal
    );
  };
</script>
```