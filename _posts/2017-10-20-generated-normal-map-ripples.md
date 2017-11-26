---
title: "Generated normal-mapped ripples"
tags: ["programming", "graphics", "webgl"]
---

<div>
  <canvas width="512" height="512" style="width: 256px; height: 256px;" id="canv"></canvas>
</div>
<script id="fragment-shader" type="x-shader/x-fragment">
  precision mediump float;
  const float PI_2 = 1.57079632679489661923;
  uniform mediump vec2 mouse_pos;
  uniform mediump float shift;
  mat4 rotateZ(float ang) {
      return mat4(
          cos(ang),sin(ang),0.,0,
          -sin(ang),cos(ang),0.,0.,
          0.,0.,1.,0.,
          0.,0.,0.,1.);
  }
  mat4 rotateY(float ang) {
    return mat4(
      cos(ang), 0.0, -sin(ang), 0.0,
      0.0,      1.0, 0.0,       0.0,
      sin(ang), 0.0, cos(ang),  0.0,
      0.0,      0.0, 0.0,       1.0
    );
  }
  void main(void) {
    vec4 surface_pos_cs = vec4(vec2(gl_FragCoord)/256.0 - 1.0, 0.0, 1.0);
    vec4 light_pos_cs = vec4(mouse_pos*2.0 - 1.0, 0.5, 1.0);
    float ang = atan(surface_pos_cs.y, surface_pos_cs.x);
    float dist = length(vec2(surface_pos_cs));
    vec4 normal_direction = rotateZ(ang) * rotateY(-PI_2) * normalize(vec4(1.0, 0.0, sin((dist-shift)*20.0)/4.0, 0.0));
    vec4 from_light_dir = normalize(surface_pos_cs-light_pos_cs);  
    vec4 reflection_dir = reflect(from_light_dir, normal_direction);
    vec4 camera_dir = normalize(vec4(0.0, 0.0, 1.0, 0.0));
    float intensity = dot(reflection_dir, camera_dir);
    gl_FragColor = vec4(intensity, intensity, intensity, 1.0);
  }
</script>
<script>
  const canvas = document.getElementById("canv");
  const gl = canvas.getContext('webgl');
  const vertexBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1,1,  -1,-1,  1,-1,  1, 1,
  ]), gl.STATIC_DRAW);
  function createShader(ty, src) {
    const s = gl.createShader(ty);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw gl.getShaderInfoLog(s);
    return s;
  }
  const vertShader = createShader(gl.VERTEX_SHADER, 'attribute vec2 c;void main(void){gl_Position=vec4(c, 0.0, 1.0);}');
  const fragShader = createShader(gl.FRAGMENT_SHADER, document.getElementById("fragment-shader").innerText);
  const prog = gl.createProgram();
  gl.attachShader(prog, vertShader);
  gl.attachShader(prog, fragShader);
  gl.linkProgram(prog);
  const coord = gl.getAttribLocation(prog, "c");
  const mousePosLoc = gl.getUniformLocation(prog, "mouse_pos");
  const shiftLoc = gl.getUniformLocation(prog, "shift");
  gl.useProgram(prog);
  gl.vertexAttribPointer(coord, 2, gl.FLOAT, false, 0, 0);
  var mousePos = {x: 0.1, y: 0.1};
  canvas.onmousemove = function(ev) {
    mousePos.x = ev.offsetX/256;
    mousePos.y = (256-ev.offsetY)/256;
  }
  function draw(ev) {
    gl.enableVertexAttribArray(coord);
    gl.uniform2fv(mousePosLoc, [mousePos.x, mousePos.y]);
    gl.uniform1f(shiftLoc, ((new Date().getTime())/1000)% (2*Math.PI));
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    window.setTimeout(function(){window.requestAnimationFrame(draw);}, 33);
  }
  window.requestAnimationFrame(draw);
</script>

Above you see a ripply surface.
There's something bobbing in the middle, making waves.
As you move the cursor around,
you illuminate these waves.
With the light in the middle, it's quite hypnotic!
This is another WebGL fragment shader:

```glsl
precision mediump float;
const float PI_2 = 1.57079632679489661923;
uniform mediump vec2 mouse_pos;
uniform mediump float shift;
mat4 rotateZ(float ang) {
    return mat4(
        cos(ang),sin(ang),0.,0,
        -sin(ang),cos(ang),0.,0.,
        0.,0.,1.,0.,
        0.,0.,0.,1.);
}
mat4 rotateY(float ang) {
  return mat4(
    cos(ang), 0.0, -sin(ang), 0.0,
    0.0,      1.0, 0.0,       0.0,
    sin(ang), 0.0, cos(ang),  0.0,
    0.0,      0.0, 0.0,       1.0
  );
}
void main(void) {
  vec4 surface_pos_cs = vec4(vec2(gl_FragCoord)/256.0 - 1.0, 0.0, 1.0);
  vec4 light_pos_cs = vec4(mouse_pos*2.0 - 1.0, 0.5, 1.0);
  float ang = atan(surface_pos_cs.y, surface_pos_cs.x);
  float dist = length(vec2(surface_pos_cs));
  vec4 normal_direction = rotateZ(ang) * rotateY(-PI_2) * normalize(vec4(1.0, 0.0, sin((dist-shift)*20.0)/4.0, 0.0));
  vec4 from_light_dir = normalize(surface_pos_cs-light_pos_cs);  
  vec4 reflection_dir = reflect(from_light_dir, normal_direction);
  vec4 camera_dir = normalize(vec4(0.0, 0.0, 1.0, 0.0));
  float intensity = dot(reflection_dir, camera_dir);
  gl_FragColor = vec4(intensity, intensity, intensity, 1.0);
}
```

Next, I want to simulate _refraction_.
This ripply surface will be the surface of a pool,
refracting the image of the pool bottom.
