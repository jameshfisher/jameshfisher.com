---
title: "A head in a box with BlazeFace"
tags: ["programming", "web", "ml"]
---

[Yesterday I showed how to track a head using BlazeFace.]({% post_url 2020-10-11-head-tracking-with-blazeface %})
Today, I show how to display the head in a square canvas.
You can run it on your own head:
<button onclick="main(); this.onclick=null">click here</button> to start a demo!

<video id="webcam" style="display: none;"></video>
<canvas id="display" style="border-radius: 10px; box-shadow: none; background-color: #234;"></canvas>

This display style doesn't require any WebGL.
I'm just using a 2D context and [`.drawImage`](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage).

The output from BlazeFace tends to "jitter".
The predicted face will move around with noticeable noise.
To account for this, I smooth the values using [exponential smoothing](https://en.wikipedia.org/wiki/Exponential_smoothing)
(the simplest smoothing function I'm aware of).
This smoothing is a tradeoff; 
it increases smoothness but also increases latency.

What should we do when the head is partially outside the image?
I choose to make the unknown region transparent.
Another valid choice would be to shift the bounding box to always be inside the image,
even if it doesn't cover the head properly.

<script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@2.4"></script>
<script src="https://cdn.jsdelivr.net/npm/@tensorflow-models/blazeface@0.0.5"></script>
<script>
  const webcamVideoEl = document.getElementById("webcam");
  const displayCanvasEl = document.getElementById("display");
  const ctx = displayCanvasEl.getContext('2d');

  const MODEL_HEAD_EAR_COORD_X = 0.7;
  const MODEL_HEAD_RIGHT_EYE_COORD = [ 0.3, 0.3, 0.7 ];
  const MODEL_HEAD_BOUNDING_SPHERE_CENTER_COORD = [ 0, 0.3, 0.3 ];
  const MODEL_HEAD_BOUNDING_SPHERE_RADIUS = 1.35;

  const THROW = 0.3;

  const DISPLAY_CANVAS_WIDTH = 200;

  displayCanvasEl.width = DISPLAY_CANVAS_WIDTH;
  displayCanvasEl.height = DISPLAY_CANVAS_WIDTH;
  
  function avg(x, y) {
    return (x+y)/2;
  }

  function vec2_avg(v1, v2) {
    return [
      avg(v1[0], v2[0]),
      avg(v1[1], v2[1])
    ];
  }

  function vec2_sub(v1, v2) {
    return [
      v1[0]-v2[0],
      v1[1]-v2[1],
    ];
  }

  function vec2_add(...args) {
    const out = [0,0];
    for (v of args) {
      out[0] += v[0];
      out[1] += v[1];
    }
    return out;
  }

  function vec2_mul(v, m) {
    return [
      v[0] * m, 
      v[1] * m
    ];
  }

  const xzUnitCirclePoints = [];
  for (let theta = 0; theta <  2*Math.PI; theta += 0.1) {
    xzUnitCirclePoints.push([
      Math.sin(theta),
      0,
      Math.cos(theta)
    ]);
  }

  function vecLength(v) {
    const [x,y] = v;
    return Math.sqrt(x*x + y*y);
  }

  function mix(p, a, b) {
    return p*b + (1-p)*a;
  }

  function boundingCircleOf(prediction) {
    const rightEye = prediction.landmarks[0];
    const leftEye = prediction.landmarks[1];
    const nose = prediction.landmarks[2];
    const rightEar = prediction.landmarks[4];
    const leftEar = prediction.landmarks[5];

    const origin = vec2_avg(leftEar, rightEar);
    const unitZ = vec2_sub(nose, origin);
    const unitX = vec2_mul(vec2_sub(rightEar, origin), 1/MODEL_HEAD_EAR_COORD_X);
    const eyesZ = vec2_mul(unitZ, MODEL_HEAD_RIGHT_EYE_COORD[2]);

    const leftEyeOnXZPlane =  vec2_add(origin, vec2_mul(unitX, -MODEL_HEAD_RIGHT_EYE_COORD[0]), eyesZ);
    const rightEyeOnXZPlane = vec2_add(origin, vec2_mul(unitX,  MODEL_HEAD_RIGHT_EYE_COORD[0]), eyesZ);

    const eyesY = vec2_avg(
      vec2_sub(leftEye, leftEyeOnXZPlane),
      vec2_sub(rightEye, rightEyeOnXZPlane)
    );

    const unitY = vec2_mul(eyesY, 1/MODEL_HEAD_RIGHT_EYE_COORD[1]);

    function project(worldCoord) {
      return vec2_add(
        origin,
        vec2_mul(unitX, worldCoord[0]),
        vec2_mul(unitY, worldCoord[1]),
        vec2_mul(unitZ, worldCoord[2])
      );
    }

    const boundingCircleCenter = project(MODEL_HEAD_BOUNDING_SPHERE_CENTER_COORD);

    let unitLength = 0;
    for (const p of xzUnitCirclePoints) {
      const projectedUnitCirclePoint = vec2_add(
        vec2_mul(unitX, p[0]),
        vec2_mul(unitY, p[1]),
        vec2_mul(unitZ, p[2])
      );
      unitLength = Math.max(unitLength, vecLength(projectedUnitCirclePoint));
    }

    const boundingCircleRadius = unitLength * MODEL_HEAD_BOUNDING_SPHERE_RADIUS;

    return [boundingCircleCenter, boundingCircleRadius];
  }

  async function main() {
    const [model, stream] = await Promise.all([
      blazeface.load({ maxFaces: 1 }), 
      navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 320 } } })
    ]);

    webcamVideoEl.srcObject = stream;
    webcamVideoEl.play();

    let avgBoundingBoxCenter = [ 0, 0 ];
    let avgBoundingBoxRadius = 50;

    let latestBoundingBox = [0, 0, 50, 50];

    async function onFrame(now, metadata) {
      const predictions = await model.estimateFaces(webcamVideoEl, false /* returnTensors */);
      if (predictions.length > 0) {
        [center, radius] = boundingCircleOf(predictions[0]);

        avgBoundingBoxCenter[0] = mix(THROW, avgBoundingBoxCenter[0], center[0]);
        avgBoundingBoxCenter[1] = mix(THROW, avgBoundingBoxCenter[1], center[1]);
        avgBoundingBoxRadius    = mix(THROW, avgBoundingBoxRadius, radius);

        console.log(avgBoundingBoxRadius);

        latestBoundingBox = [
          avgBoundingBoxCenter[0]-avgBoundingBoxRadius, 
          avgBoundingBoxCenter[1]-avgBoundingBoxRadius, 
          avgBoundingBoxRadius*2, 
          avgBoundingBoxRadius*2
        ];
      }

      displayCanvasEl.width = DISPLAY_CANVAS_WIDTH;
      ctx.drawImage(
        webcamVideoEl, 
        latestBoundingBox[0], latestBoundingBox[1], 
        latestBoundingBox[2], latestBoundingBox[3], 
        0, 0, 
        DISPLAY_CANVAS_WIDTH, DISPLAY_CANVAS_WIDTH
      );

      webcamVideoEl.requestVideoFrameCallback(onFrame);
    }

    webcamVideoEl.requestVideoFrameCallback(onFrame);
  }
</script>