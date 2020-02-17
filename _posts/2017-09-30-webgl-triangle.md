---
title: "Drawing a triangle with WebGL"
---

<div><canvas width="200" height="200" id="triangleCanvas"></canvas></div>
<script>
  const canvas = document.getElementById('triangleCanvas');
  const gl = canvas.getContext('webgl');
  gl.viewport(0,0,canvas.width,canvas.height);

  const vertShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertShader, 'attribute vec3 c;void main(void){gl_Position=vec4(c, 1.0);}');
  gl.compileShader(vertShader);
  const fragShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragShader, 'void main(void){gl_FragColor=vec4(0,1,1,1);}');
  gl.compileShader(fragShader);
  const prog = gl.createProgram();
  gl.attachShader(prog, vertShader);
  gl.attachShader(prog, fragShader);
  gl.linkProgram(prog);
  gl.useProgram(prog);

  gl.clearColor(1, 0, 1, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);

  const vertexBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([ -0.5,0.5,0.0,  -0.5,-0.5,0.0,  0.5,-0.5,0.0 ]), gl.STATIC_DRAW);

  const coord = gl.getAttribLocation(prog, "c");
  gl.vertexAttribPointer(coord, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(coord);

  gl.drawArrays(gl.TRIANGLES, 0, 3);
</script>

You should see a pink canvas above with a cyan triangle in it.
It's drawn with WebGL.
This "hello world" takes around 25 lines,
and involves lots of concepts like buffers and shaders.

```js
const canvas = document.getElementById('triangleCanvas');
const gl = canvas.getContext('webgl');
gl.viewport(0,0,canvas.width,canvas.height);

const vertShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertShader, 'attribute vec3 c;void main(void){gl_Position=vec4(c, 1.0);}');
gl.compileShader(vertShader);
const fragShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragShader, 'void main(void){gl_FragColor=vec4(0,1,1,1);}');
gl.compileShader(fragShader);
const prog = gl.createProgram();
gl.attachShader(prog, vertShader);
gl.attachShader(prog, fragShader);
gl.linkProgram(prog);
gl.useProgram(prog);

gl.clearColor(1, 0, 1, 1);
gl.clear(gl.COLOR_BUFFER_BIT);

const vertexBuf = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuf);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([ -0.5,0.5,0.0,  -0.5,-0.5,0.0,  0.5,-0.5,0.0 ]), gl.STATIC_DRAW);

const coord = gl.getAttribLocation(prog, "c");
gl.vertexAttribPointer(coord, 3, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(coord);

gl.drawArrays(gl.TRIANGLES, 0, 3);
```
