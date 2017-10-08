---
title: "WebGL Lambertian shading"
draft: true
---

<div style="display: flex;">
  <canvas width="512" height="512" id="fragmentCanvas"></canvas>
  <div style="display: flex; flex-direction: column; flex-grow: 1;">
    <textarea id="fragmentShader" cols="60" rows="8">
      precision mediump float;
      uniform mediump vec2 mouse_pos;
      uniform sampler2D normal_map;
      void main(void) {
        float x = gl_FragCoord.x/512.0;
        float y = gl_FragCoord.y/512.0;
        vec4 light_pos = vec4(mouse_pos.x, mouse_pos.y, 0.5, 1.0);
        vec4 surface_pos = vec4(x, y, 0.0, 1.0);
        vec4 s = texture2D(normal_map, vec2(x, y));
        vec4 normal_direction = vec4(s.r, s.g, s.b, 0.0);
        vec4 light_direction = normalize(light_pos - surface_pos);  
        float intensity = dot(normal_direction, light_direction)/2.0;
        gl_FragColor = vec4(intensity, intensity, intensity, 1.0);
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
    -1,1,  -1,-1,  1,-1,  1, 1,
  ]), gl.STATIC_DRAW);
  gl.clearColor(0,0,0,1);
  const errEl = document.getElementById("compilationError");
  const fragEl = document.getElementById("fragmentShader");
  const normalMapImg = new Image();
  normalMapImg.onload = function() {
    gl.activeTexture(gl.TEXTURE0);
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, normalMapImg);
    gl.generateMipmap(gl.TEXTURE_2D);

    const texLoc = gl.getUniformLocation(prog, "tex");
    gl.uniform1i(texLoc, 0);

    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
  };
  normalMapImg.src = '/assets/crossnrm.jpg';
  let coord = null;
  let mousePosLoc = null;
  let prog = null;
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
    let newProg = gl.createProgram();
    gl.attachShader(newProg, vertShader);
    gl.attachShader(newProg, fragShader);
    gl.linkProgram(newProg);
    const coord = gl.getAttribLocation(newProg, "c");
    gl.vertexAttribPointer(coord, 2, gl.FLOAT, false, 0, 0);
    mousePosLoc = gl.getUniformLocation(newProg, "mouse_pos");
    gl.useProgram(newProg);
    // gl.deleteProgram(prog);
    prog = newProg;
    draw();
  }
  fragEl.oninput = newShaderFromTextarea;
  var mousePos = {x: 100, y: 100};
  function draw(ev) {
    console.log("drawing");
    gl.enableVertexAttribArray(coord);
    gl.uniform2fv(mousePosLoc, [mousePos.x, mousePos.y]);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    errEl.innerText = '';
  }
  canvas.onmousemove = function(ev) {
    mousePos = {x: ev.offsetX/512, y: (512-ev.offsetY)/512};
    draw();
  }
  newShaderFromTextarea();
</script>

Maybe you can fix the bug in the program above for me?