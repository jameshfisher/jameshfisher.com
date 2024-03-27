---
title: Giant Game of Life
tags:
  - programming
  - graphics
  - webgl
---

<div>
  <canvas id="canvas" height="1024" width="1024" style="image-rendering: pixelated; border: 1px solid black;"></canvas>
</div>

<script type="x-shader/x-fragment" id="fragment-shader-display">
  precision mediump float;
  uniform sampler2D state;
  void main(void) {
    vec2 coord = vec2(gl_FragCoord)/1024.0;
    gl_FragColor = texture2D(state, coord);
  }
</script>

<script type="x-shader/x-fragment" id="fragment-shader-stepper">
  precision mediump float;
  uniform sampler2D previousState;
  int wasAlive(vec2 coord) {
    if (coord.x < 0.0 || 1024.0 < coord.x || coord.y < 0.0 || 1024.0 < coord.y) return 0;
    vec4 px = texture2D(previousState, coord/1024.0);
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

  const startState = new Uint8Array(1024*1024*3);
  for (let i = 0; i < 1024*1024; i++) {
    const intensity = Math.random() < 0.5 ? 255 : 0;
    startState[i*3  ] = intensity;
    startState[i*3+1] = intensity;
    startState[i*3+2] = intensity;
  }

  const texture0 = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture0);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 1024, 1024, 0, gl.RGB, gl.UNSIGNED_BYTE, startState);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.generateMipmap(gl.TEXTURE_2D);

  const texture1 = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0+1);
  gl.bindTexture(gl.TEXTURE_2D, texture1);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 1024, 1024, 0, gl.RGB, gl.UNSIGNED_BYTE, startState);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.generateMipmap(gl.TEXTURE_2D);

  const framebuffers = [gl.createFramebuffer(), gl.createFramebuffer()];

  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffers[0]);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture0, 0);

  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffers[1]);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture1, 0);

  let nextStateIndex = 0;
  function draw() {
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

    requestAnimationFrame(draw);
  }
  draw();
</script>

In the previous post,
I showed a little game of life implemented as WebGL fragment shader.
To demonstrate the efficiency of this implementation,
here's a 1024x1024 grid running at high speed.
The world is initialized randomly with 50% alive cells.

After loading the page,
you see that most cells quickly die,
leaving dead trash in their wake.
Little bubbly pockets of activity continue for a couple of minutes.
Every time I've ran it,
the activity eventually dies
(with some small two-state things which flip between states very quickly).

I have yet to see any interesting "guns" or advanced structures appear.
I suppose they are quite rare,
or require different starting conditions
(e.g. interesting structures can't survive with this much litter in the environment).
