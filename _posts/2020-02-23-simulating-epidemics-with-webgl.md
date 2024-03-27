---
title: Simulating epidemics with WebGL
tags:
  - programming
  - graphics
  - webgl
  - epidemiology
summary: >-
  A spatial SIR model for simulating epidemics, implemented using WebGL fragment
  shaders. Tracks susceptible, infected, and recovered populations in a 2D grid.
---

In a recent post, I looked at [the SIR model for simulating epidemics](/2020/02/15/simulating-epidemics/).
The SIR model only tracks three numbers:
the number of "Susceptible", "Infected", and "Recovered" people.
This doesn't account for _location_:
all simulated meetings are between two random members of the global population.
This is clearly unrealistic,
so let's fix that.
Below is a _spatial_ SIR model,
simulated with WebGL:

<div><canvas id="canvas" height="1024" width="1024" style="width: 50em; height: 50em;"></canvas></div>

<script type="x-shader/x-fragment" id="fragment-shader-display">
  precision mediump float;
  uniform sampler2D state;
  void main(void) {
    vec2 coord = vec2(gl_FragCoord)/1024.0;
    gl_FragColor = texture2D(state, coord);
    gl_FragColor.g = 0.0; // hide bug
    gl_FragColor.r *= 5.0; // make red bug clearer
  }
</script>

<script type="x-shader/x-fragment" id="fragment-shader-stepper">
  precision mediump float;
  uniform sampler2D previousState;

  const float MEET_PERSON_IN_REGION_TODAY_PROBABILITY = 1.0;
  const float INFECTED_MEETING_TRANSMISSION_PROBABILITY = 0.1;
  const float INFECTION_DURATION_DAYS = 30.0;

  vec4 sample(vec2 coord) {
    return texture2D(previousState, coord/1024.0);
  }
  void main(void) {
    vec2 coord = vec2(gl_FragCoord);

    vec4 prevPx = sample(coord);
    float susceptible = prevPx.b;
    float infected    = prevPx.r;
    float recovered   = prevPx.g;

    vec4 region =
      prevPx +
      sample(coord+vec2( 1., 0.)) +
      sample(coord+vec2(-1., 0.)) +
      sample(coord+vec2( 0., 1.)) +
      sample(coord+vec2( 0.,-1.));
    float infectedInRegion = region.r;

    float infectedMeetingsPerPerson = infectedInRegion * MEET_PERSON_IN_REGION_TODAY_PROBABILITY;
    float infectionProbability = 1.0 - pow(1.0 - INFECTED_MEETING_TRANSMISSION_PROBABILITY, infectedMeetingsPerPerson);
    float newlyInfected = susceptible * infectionProbability;
    float newlyRecovered = infected / INFECTION_DURATION_DAYS;

    infected += newlyInfected;
    susceptible -= newlyInfected;

    infected -= newlyRecovered;
    recovered += newlyRecovered;

    gl_FragColor = vec4(infected, recovered, susceptible, 1.0);
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
    }, 10);
  };
  startStateImg.src = "/assets/2020-02-23/start-state-2.png";
</script>

The world is modelled as a 2D grid.
Each cell tracks the number of Susceptible, Infected and Recovered people.
We visualize the state of the world with Blue and Red:
Blue is the number of Susceptible people,
and Red is the number of Infected people.
(I've omitted the green Recovered people.
See below.)

Each day, there are meetings between people.
Two people meet if they are in the same or adjacent cells.
Each meeting has a 10% chance of transmissing the infection.
The infection lasts for an average of 30 days before "recovery".
As in the non-spatial SIR model,
death is modelled as a form of recovery.
Make what you will of this.

This model is certainly more realistic than the non-spatial SIR model.
The infection dies out where the population density is too low to sustain the spread.
It reminds me of [a mould spreading](https://www.youtube.com/watch?v=GY_uMH8Xpy0).
But this model is also still unrealistic in many ways.
Real meetings don't just happen between "adjacent" people:
infections can jump from one city to another via airplanes.

To make this simulation efficient,
I've implemented it as a WebGL fragment shader.
This draws on [a previous simulation of the Game of Life that I wrote in 2017](/2017/10/22/webgl-game-of-life/).
The entire state is stored as a 1024x1024 texture.
I have one "stepper" fragment shader which reads this texture,
and generates the next state.
The initial process is bootstrapped with this 1024x1024 image,
which I screenshotted from a population density map of Shanghai.

My simulation has a significant bug.
You'll notice that the number of red Infected people
decreases after the height of the infection,
But it never reaches zero.
I don't know why this is!

In future posts,
I intend to fix this bug.
I might also try modelling flights.
I might also add some sliders,
so you the reader can adjust the parameters of the model.
