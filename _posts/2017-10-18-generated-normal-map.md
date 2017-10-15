---
title: "Generating a normal map in WebGL"
---

<div>
  <canvas width="512" height="512" style="width: 256px; height: 256px;" id="canv"></canvas>
</div>
<script id="fragment-shader" type="x-shader/x-fragment">
  precision mediump float;
  mat4 rotateZ(float ang) {
      return mat4(
          cos(ang),sin(ang),0.,0,
          -sin(ang),cos(ang),0.,0.,
          0.,0.,1.,0.,
          0.,0.,0.,1.);
  }
  void main(void) {
    vec2 coord = vec2(gl_FragCoord) - vec2(256., 256.);
    float ang = atan(coord.y, coord.x);
    vec4 normal = rotateZ(ang) * normalize(vec4(3.0, 0.0, 1.0, 0.0));
    gl_FragColor = vec4(vec3((normal+1.) * 0.5), 1.0);
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
  gl.vertexAttribPointer(coord, 2, gl.FLOAT, false, 0, 0);
  gl.useProgram(prog);
  gl.enableVertexAttribArray(coord);
  gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
</script>

Previously I've shown some examples of normal maps loaded from a static file.
Here, I'm generating the normal map dynamically.
The normal map is of a cone seen from the top.
Here's the fragment shader:

```glsl
precision mediump float;
mat4 rotateZ(float ang) {
    return mat4(
        cos(ang),sin(ang),0.,0,
        -sin(ang),cos(ang),0.,0.,
        0.,0.,1.,0.,
        0.,0.,0.,1.);
}
void main(void) {
  vec2 coord = vec2(gl_FragCoord) - vec2(256., 256.);
  float ang = atan(coord.y, coord.x);
  vec4 normal = rotateZ(ang) * normalize(vec4(3.0, 0.0, 1.0, 0.0));
  gl_FragColor = vec4(vec3((normal+1.) * 0.5), 1.0);
}
```

One use of dynamically generated normal maps
is to simulate water.
I would generate a normal map to simulate the ripples on the water surface.
I can then use this normal map to refract light.
These simulated ripples would change every frame.
It's prohibitive to upload a new texture for every frame,
so we really want to calculate those ripples in the fragment shader.
I'll show a generated ripply normal map in future.

The fragment shader makes use of a `rotateZ` function.
I'll publish a blog post containing all these standard transformation functions;
it's pretty silly that they're not in the GLSL standard library.

The fragment shader also makes use of
some functions to convert between normals and colors.
I'll also post those in future.
