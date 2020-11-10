---
title: "WebGL shader uniforms"
---

<div style="display: flex;">
  <canvas width="200" height="200" style="height: 200px; width: 200px;" id="fragmentCanvas"></canvas>
  <div style="display: flex; flex-direction: column; flex-grow: 1;">
    <textarea id="fragmentShader" cols="60" rows="8">
    uniform mediump vec2 mouse_pos;
    void main(void){
      mediump float xd = gl_FragCoord.x-mouse_pos.x;
      mediump float yd = gl_FragCoord.y-mouse_pos.y;
      mediump float c = mod(sqrt(xd*xd + yd*yd), mouse_pos.y/2.0) / mouse_pos.x;
      gl_FragColor=vec4(c,c,c,1);
    }</textarea>
    <div id="compilationError"></div>
  </div>
</div>

<script>
  const canvas = document.getElementById('fragmentCanvas');
  const gl = canvas.getContext('webgl');
  gl.viewport(0,0,canvas.width,canvas.height);
  const vertexBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1,1,  -1,-1,  1,-1,
    -1,1,   1,-1,  1, 1,
  ]), gl.STATIC_DRAW);
  gl.clearColor(0,0,0,1);
  const errEl = document.getElementById("compilationError");
  const fragEl = document.getElementById("fragmentShader");
  function newShaderFromTextarea() {
    const vertShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertShader, 'attribute vec2 c;void main(void){gl_Position=vec4(c, 0.0, 1.0);}');
    gl.compileShader(vertShader);
    const fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragShader, fragEl.value);
    gl.compileShader(fragShader);
    if (!gl.getShaderParameter(fragShader, gl.COMPILE_STATUS)) {
      errEl.innerText = gl.getShaderInfoLog(fragShader);
      return;
    }
    prog = gl.createProgram();
    gl.attachShader(prog, vertShader);
    gl.attachShader(prog, fragShader);
    gl.linkProgram(prog);
    gl.useProgram(prog);
    draw();
  }
  fragEl.oninput = newShaderFromTextarea;
  var mousePos = {x: 100, y: 100};
  function draw(ev) {
    console.log("drawing");
    const coord = gl.getAttribLocation(prog, "c");
    gl.vertexAttribPointer(coord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(coord);

    const mousePosLoc = gl.getUniformLocation(prog, "mouse_pos");
    gl.uniform2fv(mousePosLoc, [mousePos.x, mousePos.y]);

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    errEl.innerText = '';
  }
  canvas.onmousemove = function(ev) {
    mousePos = {x: ev.offsetX, y: 200-ev.offsetY};
    draw();
  }
  newShaderFromTextarea();
</script>

Above you should see a square with some concentric circles.
When you mouseover the square, the image changes depending on your mouse position!
The code that generates this is in the textarea on the right.

WebGL shaders are pure functions.
Every time the shader is run,
the shader is given some inputs,
and eventually the shader produces some output.
This is its entire job; it has no side-effects.

There are a few kinds of shader input.
Yesterday I showed a fragment shader
which has access to the coordinate it's rendering as `gl_FragCoord`.
Another kind of input is a _uniform_.
A uniform is a variable which is global to a GL "program".
A uniform is declared in the shader code with a name;
the above shader declares the uniform called `mouse_pos`.
The uniform only changes its value when explicitly changed through the WebGL API:

```js
const mousePosLoc = gl.getUniformLocation(prog, "mouse_pos");   // get pointer to variable
gl.uniform2fv(mousePosLoc, [mousePos.x, mousePos.y]);           // set new value
```
