---
title: "Game of Life implemented with a fragment shader"
tags: ["programming", "graphics", "webgl"]
---

<canvas id="canvas" height="64" width="64" style="width: 256px; height: 256px; image-rendering: pixelated;"></canvas>
<script type="x-shader/x-fragment" id="fragment-shader-display">
  precision mediump float;
  uniform sampler2D state;
  void main(void) {
    vec2 coord = vec2(gl_FragCoord)/64.0;
    gl_FragColor = texture2D(state, coord);
  }
</script>
<script type="x-shader/x-fragment" id="fragment-shader-stepper">
  precision mediump float;
  uniform sampler2D previousState;
  int wasAlive(vec2 coord) {
    if (coord.x < 0.0 || 64.0 < coord.x || coord.y < 0.0 || 64.0 < coord.y) return 0;
    vec4 px = texture2D(previousState, coord/64.0);
    return px.r < 0.1 ? 1 : 0;
  }
  void main(void) {
    vec2 coord = vec2(gl_FragCoord);
    int aliveNeighbors =
      wasAlive(coord+vec2(-1.,-1.)) +
      wasAlive(coord+vec2(-1.,0.)) +
      wasAlive(coord+vec2(-1.,1.)) +
      wasAlive(coord+vec2(0.,-1.)) +
      wasAlive(coord+vec2(0.,1.)) +
      wasAlive(coord+vec2(1.,-1.)) +
      wasAlive(coord+vec2(1.,0.)) +
      wasAlive(coord+vec2(1.,1.));
    bool nowAlive = wasAlive(coord) == 1 ? 2 <= aliveNeighbors && aliveNeighbors <= 3 : 3 == aliveNeighbors;
    gl_FragColor = nowAlive ? vec4(0.,0.,0.,1.) : vec4(1.,1.,1.,1.);
  }
</script>
<script>
  const startStateImg = new Image();
  startStateImg.onload = function() {
    const canvasEl = document.getElementById("canvas");
    const gl = canvasEl.getContext("webgl");

    function createShader(ty, src) {
      const s = gl.createShader(ty);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error("Could not compile shader", ty, src, gl.getShaderInfoLog(s));
      }
      return s;
    }
    const vertexShader = createShader(gl.VERTEX_SHADER, "attribute vec2 coord; void main(void) { gl_Position = vec4(coord, 0.0, 1.0); }");
    const fragShaderDisplay = createShader(gl.FRAGMENT_SHADER, document.getElementById("fragment-shader-display").innerText);
    const fragShaderStepper = createShader(gl.FRAGMENT_SHADER, document.getElementById("fragment-shader-stepper").innerText);

    function createProgram(vs, fs) {
      const p = gl.createProgram();
      gl.attachShader(p, vs);
      gl.attachShader(p, fs);
      gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
        console.error("Error linking program", gl.getProgramInfoLog(p));
      }
      return p;
    }
    const displayProg = createProgram(vertexShader, fragShaderDisplay);
    const stepperProg = createProgram(vertexShader, fragShaderStepper);

    gl.useProgram(stepperProg);

    const stepperProgCoordLoc = gl.getAttribLocation(stepperProg, "coord");
    const stepperProgPreviousStateLoc = gl.getUniformLocation(stepperProg, "previousState");

    const displayProgCoordLoc = gl.getAttribLocation(displayProg, "coord");
    const displayProgStateLoc = gl.getUniformLocation(displayProg, "state");

    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1,-1,  1,-1,  1,1,  -1,1,
    ]), gl.STATIC_DRAW);

    // Note we must bind ARRAY_BUFFER before running vertexAttribPointer!
    // This is confusing and deserves a blog post
    // https://stackoverflow.com/questions/7617668/glvertexattribpointer-needed-everytime-glbindbuffer-is-called
    gl.vertexAttribPointer(stepperProgCoordLoc, 2, gl.FLOAT, false, 0, 0);

    const elementBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elementBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array([0,1,2,3]), gl.STATIC_DRAW);

    const texture0 = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture0);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, startStateImg);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);

    const texture1 = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0+1);
    gl.bindTexture(gl.TEXTURE_2D, texture1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, startStateImg);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);

    const framebuffers = [gl.createFramebuffer(), gl.createFramebuffer()];

    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffers[0]);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture0, 0);

    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffers[1]);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture1, 0);

    let nextStateIndex = 0;
    window.setInterval(function() {
      const previousStateIndex = 1 - nextStateIndex;

      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffers[nextStateIndex]);
      gl.useProgram(stepperProg);
      gl.enableVertexAttribArray(stepperProgCoordLoc);
      gl.uniform1i(stepperProgPreviousStateLoc, previousStateIndex);
      gl.drawElements(gl.TRIANGLE_FAN, 4, gl.UNSIGNED_BYTE, 0);

      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.useProgram(displayProg);
      gl.uniform1i(displayProgStateLoc, nextStateIndex);
      gl.drawElements(gl.TRIANGLE_FAN, 4, gl.UNSIGNED_BYTE, 0);

      nextStateIndex = previousStateIndex;
    }, 100);
  };
  startStateImg.src = "/assets/2017-10-22/game-of-life.png";
</script>

[The Game of Life](https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life)
is a two-dimensional pixelated world.
Each pixel of the world is either alive or dead (displayed as black or white).
The world steps from one state to the next.
Living pixels continue to live if they have two or three living neighbors.
Dead pixels come alive if they previously had exactly three living neighbors.
This style of simulation is called a "cellular automaton".

Above, I've implemented this simulation as a WebGL fragment shader.
The key feature used is "rendering to texture".
Normally, when you use functions like `drawArrays` and `drawElements`,
it draws straight to the screen.
But we can tell WebGL to instead render to a texture.
With this feature, textures can be read and written by fragment shaders,
meaning that we can use textures to store state!

Above, the entire state is stored as a 64x64 texture.
I have one "stepper" fragment shader which reads this texture, and generates the next state:

```glsl
precision mediump float;
uniform sampler2D previousState;
int wasAlive(vec2 coord) {
  if (coord.x < 0.0 || 64.0 < coord.x || coord.y < 0.0 || 64.0 < coord.y) return 0;
  vec4 px = texture2D(previousState, coord/64.0);
  return px.r < 0.1 ? 1 : 0;
}
void main(void) {
  vec2 coord = vec2(gl_FragCoord);
  int aliveNeighbors =
    wasAlive(coord+vec2(-1.,-1.)) +
    wasAlive(coord+vec2(-1.,0.)) +
    wasAlive(coord+vec2(-1.,1.)) +
    wasAlive(coord+vec2(0.,-1.)) +
    wasAlive(coord+vec2(0.,1.)) +
    wasAlive(coord+vec2(1.,-1.)) +
    wasAlive(coord+vec2(1.,0.)) +
    wasAlive(coord+vec2(1.,1.));
  bool nowAlive = wasAlive(coord) == 1 ? 2 <= aliveNeighbors && aliveNeighbors <= 3 : 3 == aliveNeighbors;
  gl_FragColor = nowAlive ? vec4(0.,0.,0.,1.) : vec4(1.,1.,1.,1.);
}
```

I have a second, simpler fragment shader which I use to display the texture:

```glsl
precision mediump float;
uniform sampler2D state;
void main(void) {
  vec2 coord = vec2(gl_FragCoord)/64.0;
  gl_FragColor = texture2D(state, coord);
}
```

WebGL does not allow you to render to the same texture you're reading.
Instead, I maintain two textures, and swap between them:
step from texture 0 from texture 1, then
step from texture 1 from texture 0,
then repeat.

To tell WebGL to render to a texture, instead of to the screen,
we bind a framebuffer object to `gl.FRAMEBUFFER`.
To tell WebGL to render to screen,
we unbind the framebuffer.
Here's the core simulation loop:

```js
const framebuffers = [gl.createFramebuffer(), gl.createFramebuffer()];

gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffers[0]);
gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture0, 0);

gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffers[1]);
gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture1, 0);

let nextStateIndex = 0;
window.setInterval(function() {
  const previousStateIndex = 1 - nextStateIndex;

  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffers[nextStateIndex]);
  gl.useProgram(stepperProg);
  gl.enableVertexAttribArray(stepperProgCoordLoc);
  gl.uniform1i(stepperProgPreviousStateLoc, previousStateIndex);
  gl.drawElements(gl.TRIANGLE_FAN, 4, gl.UNSIGNED_BYTE, 0);

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.useProgram(displayProg);
  gl.uniform1i(displayProgStateLoc, nextStateIndex);
  gl.drawElements(gl.TRIANGLE_FAN, 4, gl.UNSIGNED_BYTE, 0);

  nextStateIndex = previousStateIndex;
}, 100);
```

The initial process is bootstrapped with this tiny 64x64 image,
which is a ["Gosper Glider Gun"](https://en.wikipedia.org/wiki/Gun_(cellular_automaton)):

<img src="/assets/2017-10-22/game-of-life.png" style="width: 256px; height: 256px; image-rendering: pixelated; border: 1px solid black;"/>

In future posts,
I'll use texture rendering for more simulations.
I was thinking of making a simulation of water erosion.
The state would represent a height-mapped landscape.
I would bootstrap it with some Perlin noise.
Each step of the simulation
would put some water on the landscape,
then flows the water at each pixel, dragging some land along with it.
I can imagine it producing lakes, rivers, and ravines.
