---
title: Step-away background removal
tags:
  - programming
  - web
  - webgl
ogimage: /assets/2020-09-20/result.jpg
---

In [this previous post](/2020/08/11/production-ready-green-screen-in-the-browser/) 
I showed how to remove a background from a webcam feed
using a "green screen" algorithm implemented in WebGL.
In this post, 
I show how to remove a background from a webcam feed
given advance knowledge of what the background looks like.
Below is a demo &mdash;
click "Start webcam",
then hit "Background snapshot".
Three seconds later (enough time for you to get out of the shot!),
it takes a snapshot,
and starts applying the background removal algorithm.

<video id="webcamVideo" style="display: none;"></video>
<canvas id="display" style="background-image: url(/assets/2020-08-11/bookshelf.jpg); background-size: cover;  max-width: initial"></canvas>
<table>
  <tbody>
    <tr><th></th><td><button onclick="startWebcam(); this.parentElement.removeChild(this)">Start webcam</button></td></tr>
    <tr><th></th><td><button onclick="backgroundSnapshot()">Background snapshot</button></td></tr>
    <tr><th>Similarity</th><td><input type="range" id="similarity" min="0" max="0.3" step="0.001" value="0.05" /></td></tr>
    <tr><th>Smoothness</th><td><input type="range" id="smoothness" min="0" max="1" step="0.001" value="0.03" /></td></tr>
    <tr><th>Spill</th><td><input type="range" id="spill" min="0" max="10" step="0.001" value="0.1" /></td></tr>
  </tbody>
</table>

Depending on your background,
you'll probably get very different results.
With a smooth, colorful background (approximating a green screen!),
the algorithm works great.
With a busy background,
it's much more hit-and-miss.
Here's an example of this algorithm used against a fairly simple background.
The snapshotted background is the first image; the output is the second:

<div>
  <img style="width: 49%;" src="/assets/2020-09-20/background.jpg" />
  <img style="width: 49%;" src="/assets/2020-09-20/result.jpg" />
</div>

I found that the standard chroma key algorithm does not work well with real backgrounds.
The standard chroma key algorithm works by looking at difference in chrominance (color),
and throws away luminance information.
This works well when using a green screen.
But real backgrounds have areas that are very light or very dark,
where chrominance is irrelevant.
In the extreme, the standard chroma key algorithm believes that black is equivalent to white.
For example, it removes my dark hair when set against a nearly white background!

Clearly, a better algorithm should compare luminance, too.
The algorithm used above does so.
It mostly measures distance in chrominance,
but where the background is very light or dark,
it transitions to measuring distance in luminance.

The output image shows several artifacts.
The most annoying artifacts are false transparency in reflections and highlights on my skin,
which are nearly identical in color to the cream wall paint behind me.

Another form of artifact is long lines of non-transparency,
caused by slight shifting in the background.
These artifacts could be reduced by something like a [median filter](https://en.wikipedia.org/wiki/Median_filter),
or some more sophisticated background tracking.

<script id="fragment-shader" type="glsl">
  precision mediump float;
  
  uniform sampler2D frame;
  uniform sampler2D background;

  uniform float texWidth;
  uniform float texHeight;

  uniform float similarity;
  uniform float smoothness;
  uniform float spill;

  // From https://github.com/libretro/glsl-shaders/blob/master/nnedi3/shaders/rgb-to-yuv.glsl
  vec3 RGBtoYUV(vec3 rgb) {
    return vec3(
      rgb.r * 0.299  + rgb.g * 0.587  + rgb.b * 0.114,
      rgb.r * -0.169 + rgb.g * -0.331 + rgb.b *  0.5    + 0.5,
      rgb.r *  0.5   + rgb.g * -0.419 + rgb.b * -0.081  + 0.5
    );
  }

  // Where the background is very light or very dark, 
  // chroma difference stops being a useful measure,
  // and luma difference becomes more useful.
  float LightnessDistProportion(float l) {
    return pow(l, 10.) + pow((1. - l), 10.);
  }

  vec4 ProcessChromaKey(vec2 texCoord) {
    vec4 rgba = texture2D(frame, texCoord);
    vec4 background_rgba = texture2D(background, texCoord);

    vec3 yuv = RGBtoYUV(rgba.rgb);
    vec3 background_yuv = RGBtoYUV(background_rgba.rgb);

    float chromaDist = distance(yuv.yz, background_yuv.yz);
    float lightnessDist = distance(yuv.x, background_yuv.x) * spill;

    float dist = mix(chromaDist, lightnessDist, LightnessDistProportion(background_yuv.x));

    float baseMask = dist - similarity;
    float fullMask = pow(clamp(baseMask / smoothness, 0., 1.), 1.5);
    rgba.a = fullMask;

    float spillVal = pow(clamp(baseMask / spill, 0., 1.), 1.5);
    float desat = clamp(rgba.r * 0.2126 + rgba.g * 0.7152 + rgba.b * 0.0722, 0., 1.);
    rgba.rgb = mix(vec3(desat, desat, desat), rgba.rgb, spillVal);

    return rgba;
  }

  void main(void) {
    vec2 texCoord = vec2(gl_FragCoord.x/texWidth, 1.0 - (gl_FragCoord.y/texHeight));
    gl_FragColor = ProcessChromaKey(texCoord);
  }
</script>

<script type="text/javascript">
  const webcamVideoEl = document.getElementById("webcamVideo");
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
  const backgroundTexLoc = gl.getUniformLocation(prog, "background");
  const texWidthLoc = gl.getUniformLocation(prog, "texWidth");
  const texHeightLoc = gl.getUniformLocation(prog, "texHeight");
  const similarityLoc = gl.getUniformLocation(prog, "similarity");
  const smoothnessLoc = gl.getUniformLocation(prog, "smoothness");
  const spillLoc = gl.getUniformLocation(prog, "spill");

  function startWebcam() {
    navigator.mediaDevices.getUserMedia({ video: { 
        facingMode: "user",
        width: { ideal: 1280 },
        height: { ideal: 720 } } }).then(stream => {
      webcamVideoEl.srcObject = stream;
      webcamVideoEl.play();
      function processFrame(now, metadata) {
        displayCanvasEl.width = metadata.width;
        displayCanvasEl.height = metadata.height;
        gl.viewport(0, 0, metadata.width, metadata.height);
        gl.activeTexture(gl.TEXTURE0);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, webcamVideoEl);
        gl.uniform1i(frameTexLoc, 0);
        gl.uniform1i(backgroundTexLoc, 1);
        gl.uniform1f(texWidthLoc, metadata.width);
        gl.uniform1f(texHeightLoc, metadata.height);
        gl.uniform1f(similarityLoc, parseFloat(document.getElementById("similarity").value));
        gl.uniform1f(smoothnessLoc, parseFloat(document.getElementById("smoothness").value));
        gl.uniform1f(spillLoc, parseFloat(document.getElementById("spill").value));
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
        webcamVideoEl.requestVideoFrameCallback(processFrame);
      }
      webcamVideoEl.requestVideoFrameCallback(processFrame);
    }).catch(error => {
      console.error(error);
    });
  }

  function backgroundSnapshot() {
    setTimeout(() => {
      gl.activeTexture(gl.TEXTURE1);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, webcamVideoEl);
    }, 3000);
  }
</script>
