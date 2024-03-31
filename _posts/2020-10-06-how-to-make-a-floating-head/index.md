---
title: How to make a floating head
tags:
  - programming
  - web
  - webgl
  - machine-learning
ogimage: ./result.jpg
summary: >-
  Creating a "floating head" effect using WebGL and the BodyPix
  machine learning model to segment the face from a webcam feed.
---

In [a previous post](/2020/09/24/using-bodypix-segmentation-in-a-webgl-shader/).
I showed how to run BodyPix on a video stream
and access the segmentation from your shader.
In this post,
I demo the `segmentPersonParts` method,
using it to make a floating head.
You can run it on your own webcam;
<button onclick="main(); this.onclick=null">click here to start the demo!</button>

A call to `net.segmentPerson` returns a `Uint8Array`
where each value is either `1` (part of a person)
or `0` (not part of a person).
But the API also provides `net.segmentPersonParts`,
which returns an `Int32Array`,
but where the values are between `-1` and `23`,
with `-1` being not part of a person,
and the other numbers being various parts.
Here I'm just interested in values `0` and `1`,
which represent parts "left side of face" and "right side of face".

To access this data in a WebGL shader,
we need to get it into a texture using [`gl.texImage2D`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D).
When you pass an array to `gl.texImage2D`,
you tell it which format to interpret it as.
We'll use `gl.ALPHA`, which has one unsigned byte per pixel.
To convert to this format, we can use `new Uint8Array(segmentation.data)`.
The `-1` values in signed `int`s get converted to `255` in unsigned ints.
This byte interpreted as the alpha channel when the texture is accessed by a shader.
Then in the pixel shader, these values between `0` and `255`
are squeezed into the `float` range from `0` to `1`.
So we can check for the original values `1` and `2` with
`alpha <= 2./255.`.

BodyPix seems to include "neck" as part of the face.
This is annoying for my purposes;
I wanted to crop the face at the chin.
I don't see an easy way to hack around this.

Finally, here's what I get when I run the demo against my own webcam feed:

<p><img src="./result.jpg"/></p>

<canvas id="display" style="position: fixed; bottom: 0; right: 0;"></canvas>

<script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@2.4"></script>

<script src="https://cdn.jsdelivr.net/npm/@tensorflow-models/body-pix@2.0"></script>

<script id="fragment-shader" type="glsl">
  precision mediump float;

  uniform sampler2D frame;
  uniform sampler2D mask;

  uniform float texWidth;
  uniform float texHeight;

  void main(void) {
    vec2 texCoord = vec2(gl_FragCoord.x/texWidth, 1.0 - (gl_FragCoord.y/texHeight));
    //gl_FragColor = texture2D(mask, texCoord);
    gl_FragColor = vec4(texture2D(frame, texCoord).rgb, texture2D(mask, texCoord).a <= 2./255. ? 1. : 0.);
  }
</script>
<video id="webcam" style="display: none;"></video>

<script>
  const webcamVideoEl = document.getElementById('webcam');
  const displayCanvasEl = document.getElementById("display");
  const gl = displayCanvasEl.getContext("webgl", { premultipliedAlpha: false });

  const vs = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vs, 'attribute vec2 c; void main(void) { gl_Position=vec4(c, 0.0, 1.0); }');
  gl.compileShader(vs);

  const fs = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fs, document.getElementById("fragment-shader").innerText);
  gl.compileShader(fs);
  if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(fs));
  }

  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  gl.useProgram(prog);

  const vb = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vb);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([ -1,1,  -1,-1,  1,-1,  1,1 ]), gl.STATIC_DRAW);

  const coordLoc = gl.getAttribLocation(prog, 'c');
  gl.vertexAttribPointer(coordLoc, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(coordLoc);

  gl.activeTexture(gl.TEXTURE0);
  const frame = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, frame);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  gl.activeTexture(gl.TEXTURE1);
  const background = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, background);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  const frameTexLoc = gl.getUniformLocation(prog, "frame");
  const maskTexLoc = gl.getUniformLocation(prog, "mask");
  const texWidthLoc = gl.getUniformLocation(prog, "texWidth");
  const texHeightLoc = gl.getUniformLocation(prog, "texHeight");

  async function main() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
    webcamVideoEl.srcObject = stream;
    webcamVideoEl.play();
    const net = await bodyPix.load({
      architecture: 'MobileNetV1',
      outputStride: 16,
      multiplier: 0.75,
      quantBytes: 2
    });

    function renderLoop(now, metadata) {
      displayCanvasEl.width = metadata.width;
      displayCanvasEl.height = metadata.height;
      gl.viewport(0, 0, metadata.width, metadata.height);
      gl.activeTexture(gl.TEXTURE0);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, webcamVideoEl);
      gl.uniform1i(frameTexLoc, 0);
      gl.uniform1i(maskTexLoc, 1);
      gl.uniform1f(texWidthLoc, metadata.width);
      gl.uniform1f(texHeightLoc, metadata.height);
      gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

      webcamVideoEl.requestVideoFrameCallback(renderLoop);
    }
    webcamVideoEl.requestVideoFrameCallback(renderLoop);

    async function segmentLoop(now, metadata) {
      // Work around this bug: https://github.com/tensorflow/tfjs-models/pull/523
      webcamVideoEl.width = metadata.width;
      webcamVideoEl.height = metadata.height;

      const segmentation = await net.segmentPersonParts(webcamVideoEl, {
        internalResolution: 'medium',  // does make a difference; TODO investigate what precisely this does
        maxDetections: 1,
        segmentationThreshold: 0.7,
        flipHorizontal: false,
        scoreThreshold: 0.2
      });

      const byteData = new Uint8Array(segmentation.data);

      gl.activeTexture(gl.TEXTURE1);
      gl.texImage2D(
        gl.TEXTURE_2D,        // target
        0,                    // level
        gl.ALPHA,             // internalformat
        segmentation.width,   // width
        segmentation.height,  // height
        0,                    // border, "Must be 0"
        gl.ALPHA,             // format, "must be the same as internalformat"
        gl.UNSIGNED_BYTE,     // type of data below
        byteData     // pixels
      );

      webcamVideoEl.requestVideoFrameCallback(segmentLoop);
    }
    webcamVideoEl.requestVideoFrameCallback(segmentLoop);
  };
</script>
