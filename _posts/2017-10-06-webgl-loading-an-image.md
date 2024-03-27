---
title: How to load an image in WebGL
tags: []
summary: "Using WebGL to load an image and swap its RGB channels with a fragment shader."
---

<div><canvas id="jimmy" width="512" height="512" style="width: 256px; height: 256px;"></canvas></div>

<script id="fragment-shader" type="glsl">
  uniform sampler2D tex;
  void main(void) {
    mediump vec2 coord = vec2(gl_FragCoord.x/512.0, 1.0 - (gl_FragCoord.y/512.0));
    mediump vec4 sample = texture2D(tex, coord);
    gl_FragColor = vec4(sample.b, sample.r, sample.g, 1.0);
  }
</script>

<script>
  const jimmyEl = document.getElementById("jimmy");
  const gl = jimmyEl.getContext("webgl");

  gl.viewport(0,0,jimmyEl.width, jimmyEl.height);

  const vs = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vs, 'attribute vec2 c; void main(void) { gl_Position=vec4(c, 0.0, 1.0); }');
  gl.compileShader(vs);

  const fs = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fs, document.getElementById("fragment-shader").innerText);
  gl.compileShader(fs);
  if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(fs));
  }

  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  gl.useProgram(prog);

  const vb = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vb);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([ -1,1,  -1,-1,  1,-1,  1,1 ]), gl.STATIC_DRAW);

  const coordLoc = gl.getAttribLocation(prog, 'c');
  gl.vertexAttribPointer(coordLoc, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(coordLoc);

  gl.clearColor(1,1,1,1);
  gl.clear(gl.COLOR_BUFFER_BIT);

  const img = new Image();
  img.onload = function() {
    gl.activeTexture(gl.TEXTURE0);
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
    gl.generateMipmap(gl.TEXTURE_2D);

    const texLoc = gl.getUniformLocation(prog, "tex");
    gl.uniform1i(texLoc, 0);

    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
  };
  img.src = '/assets/jim_512.jpg';
</script>

Above you should see a picture of me.
It looks weird, not because I look weird but because the RGB channels are swapped.
This is done with a WebGL fragment shader, which looks like:

```glsl
uniform sampler2D tex;
void main(void) {
  mediump vec2 coord = vec2(gl_FragCoord.x/512.0, 1.0 - (gl_FragCoord.y/512.0));
  mediump vec4 sample = texture2D(tex, coord);
  gl_FragColor = vec4(sample.b, sample.r, sample.g, 1.0);
}
```

To load the image into the `uniform sampler2D tex`, I used:

```js
const img = new Image();
img.onload = function () {
  gl.activeTexture(gl.TEXTURE0);
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
  gl.generateMipmap(gl.TEXTURE_2D);

  const texLoc = gl.getUniformLocation(prog, "tex");
  gl.uniform1i(texLoc, 0);

  gl.drawArrays(gl.TRIANGLE_FAN, 0, 4); // draw over the entire viewport
};
img.src = "/assets/jim_512.jpg";
```
