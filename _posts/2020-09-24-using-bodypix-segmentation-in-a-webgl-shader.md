---
title: "Using BodyPix segmentation in a WebGL shader"
tags: ["programming", "web", "webgl", "ml"]
ogimage: "/assets/2020-09-22/result.jpg"
---

In [the previous post](/2020/09/23/running-bodypix-on-a-video-stream/)
I showed how to run BodyPix on a video stream,
displaying the segmentation using the library's convenience functions.
But if you want to use the segmentation as part of your WebGL rendering pipeline,
you need to access the segmentation from your shader.
In this post,
I demo a pixel shader
that sets the alpha channel of a canvas
based on a BodyPix segmentation.
The demo shows your webcam feed in the bottom-right corner of this page
with alpha-transparency taken from BodyPix.
<button onclick="main(); this.onclick=null">Click here to start the demo!</button>

A call to `net.segmentPerson` returns something like this:

```js
{
  allPoses: [...],
  data: Uint8Array(307200) [...],
  height: 480,
  width: 640,
}
```

There is one byte for each pixel: note `640*480 == 307200`.
These are in row-major order,
so pixel `(x,y)` is at `y*640 + x`,
where `(0,0)` is the top-left of the image.
For example, here's a silly debugging function that renders the segmentation in the console:

```js
function renderSegmentation(segmentation) {
  let s = "";
  const xStride = Math.max(1, Math.floor(segmentation.width/30));   // ~30 wide
  const yStride = xStride*2; // chars are ~twice as tall as they are wide
  for (let y = 0; y < segmentation.height; y += yStride) {
    for (let x = 0; x < segmentation.width; x += xStride) {
      s += segmentation.data[segmentation.width*y + x] == 1 ? "X" : " ";
    }
    s += "\n";
  }
  console.log(s);
}
```

It will give you output like this if you wave at the camera:

```
            XXXXX    XX
           XXXXXXX  XXXXX
           XXXXXXX  XXXXXX
           XXXXXXX   XXXXX
            XXXXX     XXXXX
           XXXXXX      XXXXX
       XXXXXXXXXXXXXXX   XXXX
   XXXXXXXXXXXXXXXXXXXXX XXXXX
  XXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

To access this data in a WebGL shader,
we need to get it into a texture using [`gl.texImage2D`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D).
When you pass an array to `gl.texImage2D`,
you tell it which format to interpret it as.
One possible format is `gl.ALPHA`,
which has one byte per pixel -- the same as the format given to us by BodyPix.
This byte interpreted as the alpha channel when the texture is accessed by a shader.
Here's how to load the segmentation data into a texture:

```
gl.texImage2D(
  gl.TEXTURE_2D,        // target
  0,                    // level
  gl.ALPHA,             // internalformat
  segmentation.width,   // width
  segmentation.height,  // height
  0,                    // border, "Must be 0"
  gl.ALPHA,             // format, "must be the same as internalformat"
  gl.UNSIGNED_BYTE,     // type of data below
  segmentation.data     // pixels
);
```

Unfortunately, the byte values given by BodyPix are `0` and `1`,
rather than the ideal `0` and `255`.
But we can correct for this in our fragment shader:

```glsl
precision mediump float;

uniform sampler2D frame;
uniform sampler2D mask;

uniform float texWidth;
uniform float texHeight;

void main(void) {
  vec2 texCoord = vec2(gl_FragCoord.x/texWidth, 1.0 - (gl_FragCoord.y/texHeight));
  gl_FragColor = vec4(texture2D(frame, texCoord).rgb, texture2D(mask, texCoord).a * 255.);
}
```

Here's what I get when I run the demo against my own webcam feed:

<p><img src="/assets/2020-09-22/result.jpg"/></p>

As you can see, BodyPix still has a number of quality issues.
In priority order:

1. BodyPix doesn't realize my body extends beyond the bottom of the image.
   It might be possible to improve this by fudging the input or output.
1. It's really bad at recognizing fingers.
   It might be possible to improve this by running [Handpose](https://github.com/tensorflow/tfjs-models/tree/master/handpose)
   on the detected palms.

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
    gl_FragColor = vec4(texture2D(frame, texCoord).rgb, texture2D(mask, texCoord).a * 255.);
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

      const segmentation = await net.segmentPerson(webcamVideoEl, {
        internalResolution: 'high',  // does make a difference; TODO investigate what precisely this does
        maxDetections: 1,
        segmentationThreshold: 0.7,
        flipHorizontal: false,
        scoreThreshold: 0.2
      });

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
        segmentation.data     // pixels
      );

      webcamVideoEl.requestVideoFrameCallback(segmentLoop);
    }
    webcamVideoEl.requestVideoFrameCallback(segmentLoop);
  };
</script>