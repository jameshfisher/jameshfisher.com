---
title: WebGL fragment shader
tags: []
---

<div style="display: flex;">
  <canvas width="200" height="200" style="height: 200px; width: 200px;" id="fragmentCanvas"></canvas>
  <div style="display: flex; flex-direction: column; flex-grow: 1;">
    <textarea id="fragmentShader" cols="60" rows="6">void main(void){
      mediump float xd = gl_FragCoord.x-100.0;
      mediump float yd = gl_FragCoord.y-100.0;
      mediump float c = mod(sqrt(xd*xd + yd*yd), 20.0)/30.0;
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
  function draw() {
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
    const prog = gl.createProgram();
    gl.attachShader(prog, vertShader);
    gl.attachShader(prog, fragShader);
    gl.linkProgram(prog);
    gl.useProgram(prog);
    const coord = gl.getAttribLocation(prog, "c");
    gl.vertexAttribPointer(coord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(coord);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    errEl.innerText = '';
  }
  draw();
  fragEl.oninput = draw;
</script>

Above, you should see some concentric circles on the left,
and some code on the right.
The code is a "fragment shader",
and it generated the image on the left.
You can edit it yourself to change the image.

For each pixel in the image, the fragment shader is run to get an output color.
The shader has access to the current coordinate as `gl_FragCoord`.
It puts its desired color in `gl_FragColor`.

This is implemented using WebGL,
which gives this page access to your graphics card.
Whenever you change the text in that textarea,
the text is sent to your graphics driver,
which compiles it to a program sitting on your graphics card.
The webpage then tells the driver to draw a big square using this program.
