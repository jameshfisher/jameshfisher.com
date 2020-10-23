---
title: "Use varyings for texture2D coordinates!"
tags: ["programming", "webgl"]
---

I'm using WebGL fragment shaders 
to apply per-pixel processing to a video stream.
This post shows an inefficiency in my implementation
due to calculating texture coordinates in the fragment shader.
Then I how to improve on it by using a `varying`.

Consider a "hello world" identity shader, applied to your camera.
<button onclick="startWebcam()">Click here</button>
to start a demo that captures your webcam stream,
then draws each frame to a canvas:

<canvas id="display" style="max-width: initial; display: none;"></canvas>

The start of this pipeline looks like:

1. Get a `MediaStream` from `navigator.mediaDevices.getUserMedia(...)`
1. Set it as the `srcObject` of a `<video>` element
1. Get a callback for each frame of the video,
   using `.requestVideoFrameCallback` or `.requestAnimationFrame`
1. Copy each frame into a WebGL texture with `gl.texImage2D`
1. Draw each texture to the canvas using a `WebGLProgram`,
   possibly applying some per-pixel transformation.

In that last step,
here was my naive implementation of an "identity" shader:

```glsl
// Vertex shader
attribute vec2 clipspaceCoord;
void main(void) {
  gl_Position=vec4(clipspaceCoord, 0.0, 1.0);
}

// Fragment shader
precision mediump float;
uniform sampler2D tex;
uniform vec2 texSize;
varying vec2 v_texCoord;
void main(void) {
  vec2 texCoord = gl_FragCoord / texSize;
  gl_FragColor = texture2D(tex, texCoord);
}
```

The fragment shader
converts the fragment coordinate to a texture coordinate
by dividing by the pixel size of the texture.
This works, but
it means the fragment shader performs many division operations,
and means that we have to pass the size of the texture to the fragment shader.

Here's a better implementation,
which uses a `varying` variable for the texture coordinate:

```glsl
// Vertex shader
attribute vec2 clipspaceCoord;
attribute vec2 a_texCoord;
varying vec2 v_texCoord;
void main(void) {
  v_texCoord = a_texCoord;
  gl_Position = vec4(clipspaceCoord, 0.0, 1.0); 
}

// Fragment shader
uniform sampler2D tex;
varying vec2 v_texCoord;
void main(void) {
  gl_FragColor = texture2D(tex, v_texCoord);
}
```

The fragment shader no longer does any division,
and our WebGL program never needs to know the pixel size of our texture.
The texture coordinate `v_texCoord` is instead assigned once for each vertex,
then linearly interpolated for each fragment.
The vertex shader just copies the texture coordinate from an attribute `a_texCoord`,
which ultimately comes from a buffer that we populate from our application,
like this:

```js
const texCoordBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
  0, 1,  // texture coordinate for top left
  0, 0,  // texture coordinate for bottom left
  1, 0,  // texture coordinate for bottom right
  1, 1,  // texture coordinate for top right
]), gl.STATIC_DRAW);
const texCoordLoc = gl.getAttribLocation(prog, 'a_texCoord');
gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(texCoordLoc);
```

This may all seem obvious,
but I overlooked it for a long time,
because what I was doing _worked_.
As a rule of thumb:
if you're using `texture2D` in your fragment shader,
you probably want to pass in a `varying`.
If you're not passing in a `varying`,
consider how you could do so.

<video id="webcamVideo" style="display: none;"></video>
<div>
  <script id="vertex-shader" type="glsl">
    attribute vec2 clipspaceCoord;
    attribute vec2 a_texCoord;
    varying vec2 v_texCoord;
    void main(void) {
      v_texCoord = a_texCoord;
      gl_Position = vec4(clipspaceCoord, 0.0, 1.0); 
    }
  </script>
  <script id="fragment-shader" type="glsl">
    precision mediump float;
    uniform sampler2D tex;
    varying vec2 v_texCoord;
    void main(void) {
      gl_FragColor = texture2D(tex, v_texCoord);
    }
  </script>
  <script type="text/javascript">
    const webcamVideoEl = document.getElementById("webcamVideo");
    const displayCanvasEl = document.getElementById("display");
    const gl = displayCanvasEl.getContext("webgl");

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  
    const vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vs, document.getElementById("vertex-shader").innerText);
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
  
    const clipspaceCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, clipspaceCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([ 
      -1,  1,  
      -1, -1,  
       1, -1,  
       1,  1 
      ]), gl.STATIC_DRAW);
    const clipspaceCoordLoc = gl.getAttribLocation(prog, 'clipspaceCoord');
    gl.vertexAttribPointer(clipspaceCoordLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(clipspaceCoordLoc);
  
    const texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      0, 1,  // texture coordinate for top left
      0, 0,  // texture coordinate for bottom left
      1, 0,  // texture coordinate for bottom right
      1, 1,  // texture coordinate for top right
    ]), gl.STATIC_DRAW);
    const texCoordLoc = gl.getAttribLocation(prog, 'a_texCoord');
    gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(texCoordLoc);

    gl.activeTexture(gl.TEXTURE0);
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    
    const texLoc = gl.getUniformLocation(prog, "tex");

    function startWebcam() {
      navigator.mediaDevices.getUserMedia({ video: { 
            facingMode: "user",
            width: { ideal: 320 },
            height: { ideal: 240 } } }).then(stream => {
        displayCanvasEl.style.display = "block";
        webcamVideoEl.srcObject = stream;
        webcamVideoEl.play();
        function processFrame(now, metadata) {
          displayCanvasEl.width = webcamVideoEl.videoWidth;
          displayCanvasEl.height = webcamVideoEl.videoHeight;
          gl.viewport(0, 0, webcamVideoEl.videoWidth, webcamVideoEl.videoHeight);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, webcamVideoEl);
          gl.uniform1i(texLoc, 0);
          gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
          webcamVideoEl.requestVideoFrameCallback(processFrame);
        }
        webcamVideoEl.requestVideoFrameCallback(processFrame);
      }).catch(error => {
        console.error(error);
      });
    }
  </script>
</div>
