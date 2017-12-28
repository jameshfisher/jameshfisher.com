---
title: "Drawing a cube in WebGL"
tags: ["programming", "graphics", "webgl"]
---

<canvas id="matrix_viz" width="400" height="400" style="width: 200px; height: 200px;"></canvas>
<script src="/assets/gl-matrix.js" type="text/javascript"></script>
<script id="vertex-shader" type="x-shader/x-vertex">
  uniform mat4 transformation;
  attribute vec4 coord;
  void main(void) {
    gl_Position = transformation * coord;
  }
</script>
<script id="fragment-shader" type="x-shader/x-fragment">
  precision mediump float;
  uniform vec4 faceColor;
  void main(void) {
    gl_FragColor = faceColor;
  }
</script>
<script>
  const matrixVizEl = document.getElementById("matrix_viz");
  const gl = matrixVizEl.getContext("webgl");
  gl.enable(gl.DEPTH_TEST);

  const vertBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
   -0.5, -0.5, 0.5, 1,
    0.5, -0.5, 0.5, 1,
    0.5,  0.5, 0.5, 1,
   -0.5,  0.5, 0.5, 1,
  ]), gl.STATIC_DRAW);

  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array([0,1,2,3]), gl.STATIC_DRAW);

  function createShader(ty, src) {
    const s = gl.createShader(ty);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error("Error compiling shader", ty, src, gl.getShaderInfoLog(s));
    }
    return s;
  }
  const vertShader = createShader(gl.VERTEX_SHADER, document.getElementById("vertex-shader").innerText);
  const fragShader = createShader(gl.FRAGMENT_SHADER, document.getElementById("fragment-shader").innerText);

  const prog = gl.createProgram();
  gl.attachShader(prog, vertShader);
  gl.attachShader(prog, fragShader);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.error("Error linking program", gl.getProgramInfoLog(prog));
  }
  gl.useProgram(prog);

  const coordLoc = gl.getAttribLocation(prog, "coord");
  gl.vertexAttribPointer(coordLoc, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(coordLoc);

  const transformationLoc = gl.getUniformLocation(prog, "transformation");
  const faceColorLoc = gl.getUniformLocation(prog, "faceColor");

  function rotateX(ang) { const mat = mat4.create(); return mat4.rotateX(mat, mat, ang); }
  function rotateY(ang) { const mat = mat4.create(); return mat4.rotateY(mat, mat, ang); }
  const faces = [
    { color: new Float32Array([0,0,0,1]), transformation: mat4.create() },
    { color: new Float32Array([0,0,1,1]), transformation: rotateX(Math.PI * 1/2) },
    { color: new Float32Array([0,1,0,1]), transformation: rotateX(Math.PI) },
    { color: new Float32Array([0,1,1,1]), transformation: rotateX(Math.PI * 3/2) },
    { color: new Float32Array([1,0,0,1]), transformation: rotateY(Math.PI * 1/2) },
    { color: new Float32Array([1,0,1,1]), transformation: rotateY(Math.PI * 3/2) },
  ];

  gl.clearColor(1,1,1,1);
  const startTime = new Date().getTime();
  function redraw() {
    const t = (new Date().getTime() - startTime) / 1000;
    const timeTrans = mat4.create();
    mat4.rotateX(timeTrans, timeTrans, t);
    mat4.rotateY(timeTrans, timeTrans, t/2);
    mat4.rotateZ(timeTrans, timeTrans, t*2);
    gl.clear(gl.COLOR_BUFFER_BIT);
    for (let face of faces) {
      const trans = mat4.create();
      mat4.multiply(trans, timeTrans, face.transformation);
      gl.uniformMatrix4fv(transformationLoc, false, trans);
      gl.uniform4fv(faceColorLoc, face.color);
      gl.drawElements(gl.TRIANGLE_FAN, 4, gl.UNSIGNED_BYTE, 0);
    }
    window.requestAnimationFrame(redraw);
  }
  window.requestAnimationFrame(redraw);
</script>

Above you see a spinning cube, with faces of different colors.
This is drawn with WebGL.
The vertex shader accepts one uniform parameter, a transformation matrix:

```glsl
uniform mat4 transformation;
attribute vec4 coord;
void main(void) {
  gl_Position = transformation * coord;
}
```

To draw the six faces of the cube,
I only define the vertices for the "front" face:

```js
const vertBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
 -0.5, -0.5, 0.5, 1,
  0.5, -0.5, 0.5, 1,
  0.5,  0.5, 0.5, 1,
 -0.5,  0.5, 0.5, 1,
]), gl.STATIC_DRAW);

const indexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array([0,1,2,3]), gl.STATIC_DRAW);
```

To draw the other five faces of the cube,
I rotate the "front" face into the desired position.
I do this in JavaScript using [a library called `glMatrix`](http://glmatrix.net/),
which provides functions `mat4.rotateX(out, in, angle)`.

```js
function rotateX(ang) { const mat = mat4.create(); return mat4.rotateX(mat, mat, ang); }
function rotateY(ang) { const mat = mat4.create(); return mat4.rotateY(mat, mat, ang); }
const faces = [
  { color: new Float32Array([0,0,0,1]), transformation: mat4.create() },
  { color: new Float32Array([0,0,1,1]), transformation: rotateX(Math.PI * 1/2) },
  { color: new Float32Array([0,1,0,1]), transformation: rotateX(Math.PI) },
  { color: new Float32Array([0,1,1,1]), transformation: rotateX(Math.PI * 3/2) },
  { color: new Float32Array([1,0,0,1]), transformation: rotateY(Math.PI * 1/2) },
  { color: new Float32Array([1,0,1,1]), transformation: rotateY(Math.PI * 3/2) },
];

const startTime = new Date().getTime();
function redraw() {
  const t = (new Date().getTime() - startTime) / 1000;
  const timeTrans = mat4.create();
  mat4.rotateX(timeTrans, timeTrans, t);
  mat4.rotateY(timeTrans, timeTrans, t/2);
  mat4.rotateZ(timeTrans, timeTrans, t*2);
  gl.clear(gl.COLOR_BUFFER_BIT);
  for (let face of faces) {
    const trans = mat4.create();
    mat4.multiply(trans, timeTrans, face.transformation);
    gl.uniformMatrix4fv(transformationLoc, false, trans);
    gl.uniform4fv(faceColorLoc, face.color);
    gl.drawElements(gl.TRIANGLE_FAN, 4, gl.UNSIGNED_BYTE, 0);
  }
  window.requestAnimationFrame(redraw);
}
```
