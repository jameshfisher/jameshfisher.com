---
title: "Drawing a clock face with WebGL"
---

<div><canvas id="clock" width="400" height="400" style="width: 200px; height: 200px;"></canvas></div>

<script id="vertex-shader" type="x-shader/x-vertex">
  attribute vec2 polar_coord;
  void main(void) {
    mediump float dist = polar_coord[0];
    mediump float ang = -polar_coord[1];
    mat2 rotate = mat2(cos(ang), sin(ang), -sin(ang), cos(ang));
    vec2 rotated = rotate * vec2(0.0, dist);
    gl_Position = vec4(rotated, 0.0, 1.0);
  }
</script>

<script>
  const clockEl = document.getElementById("clock");
  const gl = clockEl.getContext("webgl");

  const vs = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vs, document.getElementById("vertex-shader").innerText);
  gl.compileShader(vs);
  if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
    console.error("Vertex shader compile error", gl.getShaderInfoLog(vs));
  }

  const fs = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fs, 'void main(void) { gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); }');
  gl.compileShader(fs);
  if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
    console.error("Fragment shader compile error", gl.getShaderInfoLog(fs));
  }

  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  gl.useProgram(prog);

  const vb = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vb);

  const polarCoordLoc = gl.getAttribLocation(prog, "polar_coord");
  gl.vertexAttribPointer(polarCoordLoc, 2, gl.FLOAT, false, 0, 0);

  gl.enableVertexAttribArray(polarCoordLoc);

  gl.clearColor(1,1,1,1);

  function toAngle(x, p) { return (x%p) * (2*Math.PI/p); }
  window.setInterval(function(){
    const now = new Date();
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      0,0,  0.5,toAngle(now.getHours(),12),
      0,0,  0.7,toAngle(now.getMinutes(),60),
      0,0,  0.8,toAngle(now.getSeconds(),60),
    ]), gl.STATIC_DRAW);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.LINES, 0, 6);
  }, 1000);
</script>

Above you should see an analog clock face.
The three hands move according to the current time.
This is implemented with WebGL.

One piece of this is a vertex shader
which converts 2D polar coordinates (convenient for drawing clock faces)
into 3D cartesian coordinates in clip space (what OpenGL wants).
The vertex shader is:

```glsl
attribute vec2 polar_coord;
void main(void) {
  mediump float dist = polar_coord[0];
  mediump float ang = -polar_coord[1];
  mat2 rotate = mat2(cos(ang), sin(ang), -sin(ang), cos(ang));  // magic
  vec2 rotated = rotate * vec2(0.0, dist);
  gl_Position = vec4(rotated, 0.0, 1.0);
}
```

Once per second,
the current time is converted to polar coordinates for the hands,
which are passed to the vertex shader.
The hands are drawn with `gl.LINES`, which draws one-pixel-wide lines.
Here's the JavaScript loop:

```js
function toAngle(x, p) { return (x%p) * (2*Math.PI/p); }
window.setInterval(function(){
  const now = new Date();
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    0,0,  0.5,toAngle(now.getHours(),12),
    0,0,  0.7,toAngle(now.getMinutes(),60),
    0,0,  0.8,toAngle(now.getSeconds(),60),
  ]), gl.STATIC_DRAW);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.LINES, 0, 6);
}, 1000);
```
