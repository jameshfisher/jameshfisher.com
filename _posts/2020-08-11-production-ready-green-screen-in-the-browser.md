---
title: Production-ready green screen in the browser
tags:
  - programming
  - web
  - webgl
ogimage: /assets/2020-08-11/result.jpg
summary: >-
  A green screen implementation in the browser using
  WebGL and chroma key. Includes a live demo.
---

In this post I show a high-quality green screen implementation directly in the browser.
It runs in realtime,
uses WebGL for efficiency,
and uses a high-quality green screen algorithm that beats your Zoom virtual background.
Here's a live demo, where you can adjust the parameters to place yourself in front of a virtual bookshelf:

<video id="webcamVideo" style="display: none;"></video>
<canvas id="display" style="background-image: url(/assets/2020-08-11/bookshelf.jpg); background-size: cover;  max-width: initial"></canvas>
<table>
  <tbody>
    <tr><th></th><td><button onclick="startWebcam(); this.parentElement.removeChild(this)">Start webcam</button></td></tr>
    <tr><th>Key color</th><td><input type="color" id="keyColor" value="#00ff00" /></td></tr>
    <tr><th>Similarity</th><td><input type="range" id="similarity" min="0" max="1" step="0.001" value="0.4" /></td></tr>
    <tr><th>Smoothness</th><td><input type="range" id="smoothness" min="0" max="1" step="0.001" value="0.08" /></td></tr>
    <tr><th>Spill</th><td><input type="range" id="spill" min="0" max="1" step="0.001" value="0.1" /></td></tr>
  </tbody>
</table>

<script id="fragment-shader" type="glsl">
  precision mediump float;

  uniform sampler2D tex;
  uniform float texWidth;
  uniform float texHeight;

  uniform vec3 keyColor;
  uniform float similarity;
  uniform float smoothness;
  uniform float spill;

  // From https://github.com/libretro/glsl-shaders/blob/master/nnedi3/shaders/rgb-to-yuv.glsl
  vec2 RGBtoUV(vec3 rgb) {
    return vec2(
      rgb.r * -0.169 + rgb.g * -0.331 + rgb.b *  0.5    + 0.5,
      rgb.r *  0.5   + rgb.g * -0.419 + rgb.b * -0.081  + 0.5
    );
  }

  vec4 ProcessChromaKey(vec2 texCoord) {
    vec4 rgba = texture2D(tex, texCoord);
    float chromaDist = distance(RGBtoUV(texture2D(tex, texCoord).rgb), RGBtoUV(keyColor));

    float baseMask = chromaDist - similarity;
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
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  const texLoc = gl.getUniformLocation(prog, "tex");
  const texWidthLoc = gl.getUniformLocation(prog, "texWidth");
  const texHeightLoc = gl.getUniformLocation(prog, "texHeight");
  const keyColorLoc = gl.getUniformLocation(prog, "keyColor");
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
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, webcamVideoEl);
        gl.uniform1i(texLoc, 0);
        gl.uniform1f(texWidthLoc, metadata.width);
        gl.uniform1f(texHeightLoc, metadata.height);
        const m = document.getElementById("keyColor").value.match(/^#([0-9a-f]{6})$/i)[1];
        gl.uniform3f(keyColorLoc, parseInt(m.substr(0,2),16)/255, parseInt(m.substr(2,2),16)/255, parseInt(m.substr(4,2),16)/255);
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
</script>

How does it work? Here's the basic "pipeline":

1. Get a `MediaStream` with `getUserMedia`
1. Decode the stream with an invisible `<video>` element
1. `requestVideoFrameCallback` tells us when a video frame is available
1. For each frame, copy it to a WebGL texture with `texImage2D`
1. For each frame, set the uniform parameters of a fragment shader from the new texture and the HTML form
1. For each frame, redraw a canvas, shaded by the fragment shader
1. In the fragment shader,
   adjust each pixel's opacity and color based on its closeness to the chroma of the chosen key color

After tweaking the parameters for your own green screen,
you should get a reasonable result like this:

<p><img src="/assets/2020-08-11/result.jpg" /></p>

This is similar to the green screen pipeline in [my previous post](/2020/08/10/how-to-implement-green-screen-in-webgl/),
but with a much better green screen algorithm.
In the previous post,
the green screen algorithm makes the pixel fully transparent
if `g > 0.4 && r < 0.4` (where color channels are measured between 0.0 and 1.0).
Otherwise, it makes it fully opaque.
But there are more sophisticated methods to decide _how_ transparent a pixel should be,
and to correct for "color spill" (that is, green light reflected from the subject).

The green screen algorithm above is derived from [the Chroma Key filter in OBS Studio](https://github.com/obsproject/obs-studio/blob/master/plugins/obs-filters/data/chroma_key_filter.effect).
The OBS shader is written in HLSL,
but WebGL shaders are written in GLSL.
[Microsoft have a GLSL-to-HLSL conversion reference](https://docs.microsoft.com/en-us/windows/uwp/gaming/glsl-to-hlsl-reference),
which I just read "backwards".
I also removed some extraneous features from the OBS shader that did not seem to improve quality.
This left me with:

```glsl
precision mediump float;

uniform sampler2D tex;
uniform float texWidth;
uniform float texHeight;

uniform vec3 keyColor;
uniform float similarity;
uniform float smoothness;
uniform float spill;

// From https://github.com/libretro/glsl-shaders/blob/master/nnedi3/shaders/rgb-to-yuv.glsl
vec2 RGBtoUV(vec3 rgb) {
  return vec2(
    rgb.r * -0.169 + rgb.g * -0.331 + rgb.b *  0.5    + 0.5,
    rgb.r *  0.5   + rgb.g * -0.419 + rgb.b * -0.081  + 0.5
  );
}

vec4 ProcessChromaKey(vec2 texCoord) {
  vec4 rgba = texture2D(tex, texCoord);
  float chromaDist = distance(RGBtoUV(texture2D(tex, texCoord).rgb), RGBtoUV(keyColor));

  float baseMask = chromaDist - similarity;
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
```

The shader works in [the YUV color space](https://en.wikipedia.org/wiki/YUV),
using the U and V components to measure how far a pixel is from the key color.
If the distance is below a threshold called `similarity`,
the pixel is fully transparent.
Beyond that, the transparency rises;
the `smoothness` parameter controls how quickly the transparency rises.
Similarly, the pixel is desaturated to the extent that its chrominance is close to the key color;
this attempts to account for light reflected from the subject.
The `spill` parameter controls how quickly this desaturation drops off.

Ultimately, this shader defines a pure function from an RGBA pixel to an RGBA pixel.
(The OBS shader is a bit more "sophisticated" in that it samples neighboring pixels.
However, I removed this, because I don't think it led to a better result.)
Potentially, the implementation could be more efficient by enumerating all possible inputs and outputs ahead of time.
This is the approach that [Apple encourages when implementing green screen as a CIFilter](https://developer.apple.com/library/archive/documentation/GraphicsImaging/Conceptual/CoreImaging/ci_filer_recipes/ci_filter_recipes.html#//apple_ref/doc/uid/TP30001185-CH4-SW2).

To get started adapting this demo,
just view source on this page - you should find the source pretty readable.
