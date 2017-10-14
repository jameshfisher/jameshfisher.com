---
title: "Multiple textures in WebGL"
---

<canvas width="200" height="200" style="height: 200px; width: 200px;" id="fragmentCanvas"></canvas>
<script id="fragment-shader" type="x-shader/x-fragment">
  precision mediump float;
  uniform sampler2D checkerboardTexture;
  uniform sampler2D jimTexture;
  void main(void) {
    vec2 texCoord = vec2(gl_FragCoord.x/200.0, gl_FragCoord.y/200.0);
    gl_FragColor = (texture2D(checkerboardTexture, texCoord) + texture2D(jimTexture, texCoord)) * 0.5;
    gl_FragColor.a = 1.0;
  }
</script>
<script>
  const canvas = document.getElementById('fragmentCanvas');
  const gl = canvas.getContext('webgl');
  const vertexBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1,1,  -1,-1,  1,-1, 1, 1,
  ]), gl.STATIC_DRAW);

  gl.clearColor(0,0,0,1);

  const checkerboardTexture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, checkerboardTexture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 2, 2, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([
      255, 0, 0, 255,
      0, 255, 0, 255,
      0, 255, 0, 255,
      255, 0, 0, 255,
    ])
  );
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  const jimImg = new Image();
  jimImg.onload = function() {
    const jimTexture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0+1);
    gl.bindTexture(gl.TEXTURE_2D, jimTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, jimImg);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
  };
  jimImg.src = '/assets/jim_512.jpg';

  const vertShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertShader, 'attribute vec2 c;void main(void){gl_Position=vec4(c, 0.0, 1.0);}');
  gl.compileShader(vertShader);
  const fragShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragShader, document.getElementById('fragment-shader').innerText);
  gl.compileShader(fragShader);
  if (!gl.getShaderParameter(fragShader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(fragShader));
  }
  const prog = gl.createProgram();
  gl.attachShader(prog, vertShader);
  gl.attachShader(prog, fragShader);
  gl.linkProgram(prog);
  gl.useProgram(prog);
  const coord = gl.getAttribLocation(prog, "c");
  gl.vertexAttribPointer(coord, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(coord);
  const checkerboardTextureLoc = gl.getUniformLocation(prog, "checkerboardTexture");
  gl.uniform1i(checkerboardTextureLoc, 0);
  const jimTextureLoc = gl.getUniformLocation(prog, "jimTexture");
  gl.uniform1i(jimTextureLoc, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
</script>

The above image is the combination of two images:
a red-green checkerboard,
and an image of me.
This is made with WebGL,
where the fragment shader combines two textures:

```glsl
precision mediump float;
uniform sampler2D checkerboardTexture;
uniform sampler2D jimTexture;
void main(void) {
  vec2 texCoord = vec2(gl_FragCoord.x/200.0, gl_FragCoord.y/200.0);
  gl_FragColor = (texture2D(checkerboardTexture, texCoord) + texture2D(jimTexture, texCoord)) * 0.5;
  gl_FragColor.a = 1.0;
}
```

To use this fragment shader,
we must tell it which textures to use for each `sampler2D`.
The `sampler2D` is actually an `int` which indexes into a "texture units" array.
We use texture units 0 and 1:

```js
const checkerboardTextureLoc = gl.getUniformLocation(prog, "checkerboardTexture");
gl.uniform1i(checkerboardTextureLoc, 0);
const jimTextureLoc = gl.getUniformLocation(prog, "jimTexture");
gl.uniform1i(jimTextureLoc, 1);
```

To use these texture units `0` and `1`,
we must create new textures and bind them to these indices:

```js
const checkerboardTexture = gl.createTexture();
gl.activeTexture(gl.TEXTURE0);
gl.bindTexture(gl.TEXTURE_2D, checkerboardTexture);

const jimTexture = gl.createTexture();
gl.activeTexture(gl.TEXTURE0+1);
gl.bindTexture(gl.TEXTURE_2D, jimTexture);
```

The objects `checkerboardTexture` and `jimTexture` are `WebGLTexture` objects.
We created them, but they don't have any image data associated with them yet.
For that, we use `texImage2D`:

```js
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, jimImg);
```

The object `jimImg` is an `Image`,
which is loaded from a URL:

```js
const jimImg = new Image();
jimImg.onload = function() {
  const jimTexture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0+1);
  gl.bindTexture(gl.TEXTURE_2D, jimTexture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, jimImg);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
};
jimImg.src = '/assets/jim_512.jpg';
```

There are many levels of indirection here!
We have an image at `/assets/jim_512.jpg`,
which is loaded into a JS `Image`,
which is copied to a `WebGLTexture`,
which is bound to the texture unit `1`,
the index of which is copied to the fragment shader's `sampler2D`,
which is accessed by the shader with `texture2D`.

Note the oddity in these lines:

```js
gl.activeTexture(gl.TEXTURE0+1);
```

What is `gl.TEXTURE0`?
On my machine, it's `33984`.
These identifiers go up to `gl.TEXTURE31`,
which is `34015`.
We use these identifiers in `gl.activeTexture`,
but we do _not_ use them in the shader uniforms!

```
gl.activeTexture(0);            // WRONG!
gl.activeTexture(gl.TEXTURE0);  // right!

gl.uniform1i(checkerboardTextureLoc, gl.TEXTURE0);  // WRONG!
gl.uniform1i(checkerboardTextureLoc, 0);            // right!
```
