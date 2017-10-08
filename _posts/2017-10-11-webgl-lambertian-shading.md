---
title: "WebGL Lambertian shading"
---

<div style="display: flex;">
  <canvas width="512" height="512" style="width: 256px; height: 256px;" id="fragmentCanvas"></canvas>
  <div style="display: flex; flex-direction: column; flex-grow: 1;">
    <textarea id="fragmentShader" cols="60" rows="15">
      precision mediump float;
      uniform mediump vec2 mouse_pos;
      uniform sampler2D normal_map;
      void main(void) {
        vec2 frag = vec2(gl_FragCoord)/512.0;
        vec4 light_pos = vec4(mouse_pos, 0.5, 1.0);
        vec4 surface_pos = vec4(frag, 0.0, 1.0);
        vec4 normal_direction = vec4(vec3(texture2D(normal_map, frag))*2.0-1.0, 0.0);
        vec4 light_direction = normalize(light_pos-surface_pos);  
        float intensity = dot(normal_direction, light_direction);
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
    mousePos = {x: ev.offsetX/256, y: (256-ev.offsetY)/256};
    draw();
  }
  newShaderFromTextarea();
</script>

Move your cursor around the square above.
Your cursor moves a light which illuminates a decorative relief.
This is implemented with WebGL, using the fragment shader to the right.
The fragment shader illuminates each pixel by consulting the following "normal map" image:

<div>
  <img src="/assets/crossnrm.jpg" style="width: 256px; height: 256px;" />
</div>

The normal map tells us, for each pixel, the "normal" at that point on the surface.
The normal is a vector which points perpendicular to the surface.
This vector has XYZ components which are encoded as RGB values.
The X component is encoded by the amount of red, and so on.
The red is in the range `[0, 1]`,
and we convert this to the X component in the range `[-1, 1]`.

The surface of the tile is completely matte.
It's like wood, not like metal.
This is because the shader uses "Lambertian shading",
which is a model of matte objects.
In Lambertian shading,
the intensity is proportional to `dot(normal_direction, light_direction)`.
We can interpret this formula as answering the question,
"is the surface facing the light?".
Note in particular that this formula does not depend on `camera_direction`.
The illumination of shiny objects depends on `camera_direction`
because light is reflected towards the camera.
The illumination of matte objects does not depend on `camera_direction`
because the matte surface scatters light equally in all directions.

_Thanks to Sophie Lantreibecq, Ben Ellison, Andy Jones, Andreas Frisch, Luís Fonseca, and Callum Oakley
for helping me debug this over many beers._