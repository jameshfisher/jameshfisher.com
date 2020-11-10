---
title: "WebGL fragment shader animation"
---

<div><canvas id="clock" width="400" height="400" style="width: 200px; height: 200px;"></canvas></div>

<script id="vertex-shader" type="glsl">
  attribute vec2 coord;
  void main(void) {
    gl_Position = vec4(coord, 0.0, 1.0);
  }
</script>

<script id="fragment-shader" type="glsl">
  uniform mediump float millisecs;
  void main(void) {
    mediump float osc = (sin(millisecs/1000.0) + 1.0) / 2.0;
    gl_FragColor = vec4(osc, osc, osc, 1.0);
  }
</script>

<script>
  const clockEl = document.getElementById("clock");
  const gl = clockEl.getContext("webgl");
  gl.viewport(0,0,clockEl.width, clockEl.height);
  const vertShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertShader, document.getElementById('vertex-shader').innerText);
  gl.compileShader(vertShader);
  const fragShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragShader, document.getElementById('fragment-shader').innerText);
  gl.compileShader(fragShader);
  if (!gl.getShaderParameter(fragShader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(fragShader));
  }
  const prog = gl.createProgram();
  gl.attachShader(prog, vertShader);
  gl.attachShader(prog, fragShader);
  gl.linkProgram(prog);
  gl.useProgram(prog);
  const vertBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertBuf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,1,  -1,-1,  1,-1, 1,1]), gl.STATIC_DRAW);
  const coordPtr = gl.getAttribLocation(prog, 'coord');
  gl.vertexAttribPointer(coordPtr, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(coordPtr);
  gl.clearColor(1,0,0,1);
  const millisecsPtr = gl.getUniformLocation(prog, 'millisecs');
  const start = new Date().getTime();
  window.setInterval(function() {
    gl.uniform1f(millisecsPtr, (new Date().getTime())-start);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
  }, 50);
</script>

Above you should see a pulsating colored square.
It's implemented as a WebGL fragment shader.
The pulses are a pure function of time.
The shader has one uniform parameter, `millisecs`:

```glsl
uniform mediump float millisecs;
void main(void) {
  mediump float osc = (sin(millisecs/1000.0) + 1.0) / 2.0;
  gl_FragColor = vec4(osc, osc, osc, 1.0);
}
```

The uniform is updated every frame with the new time, then we redraw.
So the loop body is only two lines:

```js
const start = new Date().getTime();
window.setInterval(function() {
  gl.uniform1f(millisecsPtr, (new Date().getTime())-start);
  gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);  // draw over the entire viewport
}, 50);
```

This may not look very exciting, but it's the core of lots of shader animations.
For example, [this shader animation](https://www.shadertoy.com/view/XtV3W3)
renders the current time as a clock.
