---
title: "GLSL varying variables"
tags: ["programming", "graphics", "webgl"]
---

<div><canvas id="canv" width="200" height="200"></canvas></div>
<script id="vertex-shader" type="x-shader/x-vertex">
  attribute vec2 a_coord;
  attribute vec4 a_color;
  varying vec4 v_color;
  void main(void) {
    gl_Position = vec4(a_coord, 0.0, 1.0);
    v_color = a_color;
  }
</script>
<script id="fragment-shader" type="x-shader/x-fragment">
  precision mediump float;
  varying vec4 v_color;
  void main(void) {
    gl_FragColor = v_color;
  }
</script>
<script>
  const canvas = document.getElementById("canv");
  const gl = canvas.getContext('webgl');

  function createShader(ty, src) {
    const s = gl.createShader(ty);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw gl.getShaderInfoLog(s);
    return s;
  }
  const vertShader = createShader(gl.VERTEX_SHADER, document.getElementById("vertex-shader").innerText);
  const fragShader = createShader(gl.FRAGMENT_SHADER, document.getElementById("fragment-shader").innerText);
  const prog = gl.createProgram();
  gl.attachShader(prog, vertShader);
  gl.attachShader(prog, fragShader);
  gl.linkProgram(prog);

  const coordLoc = gl.getAttribLocation(prog, "a_coord");
  const colorLoc = gl.getAttribLocation(prog, "a_color");

  const vertexBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1,1,  -1,-1,  1,-1,  1, 1,
  ]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(coordLoc);
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuf);
  gl.vertexAttribPointer(coordLoc, 2, gl.FLOAT, false, 0, 0);

  const colorBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    1,0,0,1, 0,1,0,1, 0,0,1,1, 1,1,0,1,
  ]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(colorLoc);
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuf);
  gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);

  gl.useProgram(prog);
  gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
</script>

Above you see a square where each corner has a color
and the rest of the square gets its color by interpolating between these corners.
The square is drawn using WebGL.
There is one draw call, with four vertices: the four corners.
Each vertex is assigned a color `attribute`,
and WebGL interpolates between these colors using a `varying` variable.

```glsl
// Vertex shader
attribute vec2 a_coord;
attribute vec4 a_color;
varying vec4 v_color;
void main(void) {
  gl_Position = vec4(a_coord, 0.0, 1.0);
  v_color = a_color;
}
```

```glsl
// Fragment shader
precision mediump float;
varying vec4 v_color;
void main(void) {
  gl_FragColor = v_color;
}
```

Notice the declaration of `varying vec4 v_color` in both shaders.
Each call to the vertex shader can assign to `v_color`.
This passes information to the fragment shader.
In each call to the fragment shader,
the value of `v_color` comes from prior vertex shader calls.
The precise value for a fragment is an interpolation of the value from nearby vertices.

To pass in the initial color,
I use another `attribute` in the vertex shader, `a_color`.
Here's how we pass in the two attributes, `a_coord` and `a_color`:

```js
const coordLoc = gl.getAttribLocation(prog, "a_coord");
const colorLoc = gl.getAttribLocation(prog, "a_color");

const vertexBuf = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuf);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
  -1,1,  -1,-1,  1,-1,  1, 1,
]), gl.STATIC_DRAW);
gl.enableVertexAttribArray(coordLoc);
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuf);
gl.vertexAttribPointer(coordLoc, 2, gl.FLOAT, false, 0, 0);

const colorBuf = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuf);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
  1,0,0,1, 0,1,0,1, 0,0,1,1, 1,1,0,1,
]), gl.STATIC_DRAW);
gl.enableVertexAttribArray(colorLoc);
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuf);
gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);
```

It's not clear to me exactly what the interpolation algorithm is.
It seems to be linear.

Notice that OpenGL has no hardcoded concepts of "vertex color" or "interpolating colors".
Instead, OpenGL has hardcoded "vertex attributes" and "interpolated attributes" (varyings).
We can use `varying` for more things than color, e.g. normals.
