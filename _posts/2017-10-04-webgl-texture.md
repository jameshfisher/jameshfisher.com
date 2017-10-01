---
title: "Textures in WebGL shaders"
---

<canvas width="200" height="200" style="height: 200px; width: 200px;" id="fragmentCanvas"></canvas>
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
  gl.activeTexture(gl.TEXTURE0);
  var tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,                // level
    gl.RGBA,          // internal format
    2,                // width
    2,                // height
    0,                // border
    gl.RGBA,          // format
    gl.UNSIGNED_BYTE, // type
    new Uint8Array([
      255, 0, 0, 255,
      0, 255, 0, 255,
      0, 255, 0, 255,
      255, 0, 0, 255,
    ])
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  const vertShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertShader, 'attribute vec2 c;void main(void){gl_Position=vec4(c, 0.0, 1.0);}');
  gl.compileShader(vertShader);
  const fragShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragShader,
    'uniform sampler2D smplr;\n'+
    'void main(void) {\n'+
    '  gl_FragColor = texture2D(smplr, vec2(gl_FragCoord.x/200.0, gl_FragCoord.y/200.0));\n'+
    '}');
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
  const samplerLoc = gl.getUniformLocation(prog, "smplr");
  gl.uniform1i(samplerLoc, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES, 0, 6);
</script>

Above, you should see a square displaying red and green in a checkerboard pattern.
It is heavily blurred, because it shows a 2x2 checkerboard scaled up to 200x200 pixels.
This image is created using WebGL.
The 2x2 checkerboard is a tiny WebGL "texture",
created in JavaScript, then uploaded to the graphics driver.
The fragment shader then accesses the texture,
indexing into it with the position of the fragment.
The texture is configured with its magnification filter set to `gl.LINEAR`,
which causes the blurring.

Here is our fragment shader.
The function `texture2D` samples from a texture.
That is, it takes a texture and a coordinate,
and gives you the color of the texture at that coordinate.
Note its second parameter treats the texture as entirely within the unit square!
We therefore map our 200x200 clip space down to the unit square.

```glsl
uniform sampler2D smplr;
void main(void) {
  gl_FragColor = texture2D(smplr, vec2(gl_FragCoord.x/200.0, gl_FragCoord.y/200.0));
}
```

In JavaScript, we create the texture from a `Uint8Array` of RGBA pixels:

```js
gl.activeTexture(gl.TEXTURE0);        // We only have one texture in this program
var tex = gl.createTexture();         
gl.bindTexture(gl.TEXTURE_2D, tex);   // TEXTURE0 is now `tex`
gl.texImage2D(                        // upload a checkerboard pattern to `tex`
  gl.TEXTURE_2D,
  0,                // level
  gl.RGBA,          // internal format
  2,                // width
  2,                // height
  0,                // border
  gl.RGBA,          // format
  gl.UNSIGNED_BYTE, // type
  new Uint8Array([
    255, 0, 0, 255,
    0, 255, 0, 255,
    0, 255, 0, 255,
    255, 0, 0, 255,
  ])
);
```

If you try to use this texture, WebGL will complain that the texture is unrenderable!
It's badly documented, but you need to set some parameters for the texture:

```js
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
```

Before we draw something with our shader program `prog`,
we need to set its `smplr` uniform variable to refer to this uploaded texture:

```
const samplerLoc = gl.getUniformLocation(prog, "smplr");
gl.uniform1i(samplerLoc, 0); // Note 0, not gl.TEXTURE0
```

Then, when we draw stuff,
the fragment shader will consult our texture,
and draw its checkerboard pattern.
