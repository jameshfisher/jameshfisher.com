---
title: "How to implement green screen in WebGL"
tags: ["programming", "web", "webgl"]
---

In [the last post](/2020/08/09/how-to-implement-green-screen-in-the-browser/), 
I showed how to implement green screen in the browser.
However, the per-pixel logic was implemented in JavaScript on the CPU,
which is awful for performance.
Here, I show how to do the same with a WebGL shader.
As a result, it runs much more efficiently,
and so we can run it at full resolution.
Here's a live demo, in which
"sufficiently green" pixels are replaced with with magenta:

<canvas id="display" style="background-color: magenta; max-width: initial"></canvas>
<div style="text-align: center">
  <button onclick="startWebcam(); this.parentElement.removeChild(this)">Start webcam</button>
</div>
<video id="webcamVideo" style="display: none;"></video>

<script id="fragment-shader" type="glsl">
    precision mediump float;
    uniform sampler2D tex;
    uniform float texWidth;
    uniform float texHeight;
    void main(void) {
      mediump vec2 coord = vec2(gl_FragCoord.x/texWidth, 1.0 - (gl_FragCoord.y/texHeight));
      mediump vec4 sample = texture2D(tex, coord);
      gl_FragColor = vec4(sample.r, sample.g, sample.b, sample.g > 0.4 && sample.r < 0.4 ? 0.0 : 1.0);
    }
</script>

<script type="text/javascript">
    const webcamVideoEl = document.getElementById("webcamVideo");
    const displayCanvasEl = document.getElementById("display");
    const gl = displayCanvasEl.getContext("webgl");
  
    const vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vs, 'attribute vec2 c; void main(void) { gl_Position=vec4(c, 0.0, 1.0); }');
    gl.compileShader(vs);
  
    const fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fs, document.getElementById("fragment-shader").innerText);
    gl.compileShader(fs);
  
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
          gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
          webcamVideoEl.requestVideoFrameCallback(processFrame);
        }
        webcamVideoEl.requestVideoFrameCallback(processFrame);
      }).catch(error => {
        console.error(error);
      });
    }
</script>

As before,
this implementation has a big deficiency:
the green screen algorithm is extremely naive.
It makes the pixel fully transparent
if `g > 0.4 && r < 0.4` (where color channels are measured between 0.0 and 1.0).
Otherwise, it's fully opaque.
There exist more sophisticated methods to decide whether a pixel should be transparent,
or how transparent it should be.
There are also algorithms for "color spill reduction", 
removing green light reflected from the subject.
I'll also show these in a future post.

Here's the "pipeline" for this demo:

* `getUserMedia` gives us a `MediaStream`
* Decode the video with an invisible `<video>` element
* `requestVideoFrameCallback` tells us when a video frame is available
* Copy each frame to a WebGL texture using `texImage2D`
* For each frame, draw a square that covers the entire WebGL viewport,
  shaded by a fragment shader that accesses the WebGL texture.
* In the fragment shader,
  set the pixel's opacity to zero if `g > 0.4 && r < 0.4`

Finally, here's the full HTML sample:

```html
<!doctype html>
<html>
  <body>
    <canvas id="display" style="background-color: magenta;"></canvas>
    <button onclick="startWebcam(); this.parentElement.removeChild(this)">Start webcam</button>
    <video id="webcamVideo" style="display: none;"></video>
    <script id="fragment-shader" type="glsl">
      precision mediump float;
      uniform sampler2D tex;
      uniform float texWidth;
      uniform float texHeight;
      void main(void) {
        mediump vec2 coord = vec2(gl_FragCoord.x/texWidth, 1.0 - (gl_FragCoord.y/texHeight));
        mediump vec4 sample = texture2D(tex, coord);
        gl_FragColor = vec4(sample.r, sample.g, sample.b, sample.g > 0.4 && sample.r < 0.4 ? 0.0 : 1.0);
      }
    </script>
    <script type="text/javascript">
      const webcamVideoEl = document.getElementById("webcamVideo");
      const displayCanvasEl = document.getElementById("display");
      const gl = displayCanvasEl.getContext("webgl");
    
      const vs = gl.createShader(gl.VERTEX_SHADER);
      gl.shaderSource(vs, 'attribute vec2 c; void main(void) { gl_Position=vec4(c, 0.0, 1.0); }');
      gl.compileShader(vs);
    
      const fs = gl.createShader(gl.FRAGMENT_SHADER);
      gl.shaderSource(fs, document.getElementById("fragment-shader").innerText);
      gl.compileShader(fs);
    
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
            gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
            webcamVideoEl.requestVideoFrameCallback(processFrame);
          }
          webcamVideoEl.requestVideoFrameCallback(processFrame);
        }).catch(error => {
          console.error(error);
        });
      }
    </script>
  </body>
</html>
```