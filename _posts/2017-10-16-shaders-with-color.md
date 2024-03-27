---
title: WebGL shaders with color
tags: []
summary: >-
  WebGL shaders that respond to mouse movement, using normal maps and color maps
  to simulate diffuse and specular lighting on a rockface texture.
---

<div>
  <canvas width="512" height="512" style="width: 256px; height: 256px;" id="diffuse-canvas"></canvas>
  <canvas width="512" height="512" style="width: 256px; height: 256px;" id="specular-canvas"></canvas>
</div>

<script id="diffuse-fragment-shader" type="x-shader/x-fragment">
  precision mediump float;
  uniform mediump vec2 mouse_pos;
  uniform sampler2D normal_map;
  uniform sampler2D color_map;
  void main(void) {
    vec2 frag = vec2(gl_FragCoord)/512.0;
    vec4 light_pos = vec4(mouse_pos, 0.5, 1.0);
    vec4 surface_pos = vec4(frag, 0.0, 1.0);
    vec4 normal_direction = vec4(vec3(texture2D(normal_map, frag))*2.0-1.0, 0.0);
    vec4 light_direction = normalize(light_pos-surface_pos);  
    float intensity = dot(normal_direction, light_direction);
    gl_FragColor = vec4(vec3(texture2D(color_map, frag))*intensity, 1.0);
  }
</script>

<script id="specular-fragment-shader" type="x-shader/x-fragment">
  precision mediump float;
  uniform mediump vec2 mouse_pos;
  uniform sampler2D normal_map;
  uniform sampler2D color_map;
  void main(void) {
    vec2 frag = vec2(gl_FragCoord)/512.0;
    vec4 light_pos = vec4(mouse_pos, 0.5, 1.0);
    vec4 surface_pos = vec4(frag, 0.0, 1.0);
    vec4 normal = vec4(vec3(texture2D(normal_map, frag))*2.0-1.0, 0.0);
    vec4 from_light_dir = normalize(surface_pos-light_pos);  
    vec4 reflection_dir = reflect(from_light_dir, normal);
    vec4 camera_dir = normalize(vec4(0.0, 0.0, 1.0, 0.0));
    float intensity = dot(reflection_dir, camera_dir);
    gl_FragColor = vec4(vec3(texture2D(color_map, frag))*intensity, 1.0);
  }
</script>

<script>
  function setupCanvas(shaderTy) {
    const canvas = document.getElementById(shaderTy+"-canvas");
    const gl = canvas.getContext('webgl');
    gl.viewport(0,0,canvas.width,canvas.height);
    const vertexBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1,1,  -1,-1,  1,-1,  1, 1,
    ]), gl.STATIC_DRAW);
    gl.clearColor(0,0,0,1);
    function createShader(ty, src) {
      const s = gl.createShader(ty);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw gl.getShaderInfoLog(s);
      return s;
    }
    const vertShader = createShader(gl.VERTEX_SHADER, 'attribute vec2 c;void main(void){gl_Position=vec4(c, 0.0, 1.0);}');
    const fragShader = createShader(gl.FRAGMENT_SHADER, document.getElementById(shaderTy+"-fragment-shader").innerText);
    const prog = gl.createProgram();
    gl.attachShader(prog, vertShader);
    gl.attachShader(prog, fragShader);
    gl.linkProgram(prog);
    const coord = gl.getAttribLocation(prog, "c");
    gl.vertexAttribPointer(coord, 2, gl.FLOAT, false, 0, 0);
    const mousePosLoc = gl.getUniformLocation(prog, "mouse_pos");
    gl.useProgram(prog);

    const normalMapImg = new Image();
    normalMapImg.onload = function() {
      gl.activeTexture(gl.TEXTURE0);
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, normalMapImg);
      gl.generateMipmap(gl.TEXTURE_2D);
      const normalMapLoc = gl.getUniformLocation(prog, "normal_map");
      gl.uniform1i(normalMapLoc, 0);
      gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    };
    normalMapImg.src = '/assets/2017-10-16/norm.jpg';
    const colorMapImg = new Image();
    colorMapImg.onload = function() {
      gl.activeTexture(gl.TEXTURE1);
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, colorMapImg);
      gl.generateMipmap(gl.TEXTURE_2D);
      const colorMapLoc = gl.getUniformLocation(prog, "color_map");
      gl.uniform1i(colorMapLoc, 1);
      gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    };
    colorMapImg.src = '/assets/2017-10-16/color.jpg';
    var mousePos = {x: 0.1, y: 0.1};
    function draw(ev) {
      gl.enableVertexAttribArray(coord);
      gl.uniform2fv(mousePosLoc, [mousePos.x, mousePos.y]);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    }
    canvas.onmousemove = function(ev) {
      mousePos = {x: ev.offsetX/256, y: (256-ev.offsetY)/256};
      draw();
    }
    draw();
  }
  setupCanvas('diffuse');
  setupCanvas('specular');
</script>

Above you should see a rockface.
There's a matte rockface, and a shiny one.
As you move the mouse around, a light illuminates the rockface.
This is achieved with a WebGL fragment shader,
which consults a normal map and a color map:

```glsl
precision mediump float;
uniform mediump vec2 mouse_pos;
uniform sampler2D normal_map;
uniform sampler2D color_map;
void main(void) {
  float intensity = /* consult normal_map */;
  gl_FragColor = vec4(vec3(texture2D(color_map, frag))*intensity, 1.0);
}
```

By multiplying the color by an intensity,
we are simulating a perfectly white light.
Soon I'll look at simulating other light colors more accurately.

To me, the effect of the shader looks weird.
The rockface warps strangely when I move the mouse.
I can't quite explain it.
Can you?
