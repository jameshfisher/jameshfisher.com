---
title: "Perlin noise octaves"
draft: true
---

<canvas id="perlin" height="400" width="1200" style="height: 200px; width: 600px;"></canvas>
<script>
  function samplePerlin(slopeAt, x) {
    const lo = Math.floor(x);
    const hi = lo+1;
    const dist = x-lo;
    loSlope = slopeAt[lo];
    hiSlope = slopeAt[hi];
    loPos = loSlope * dist;
    hiPos = -hiSlope * (1-dist);
    const u = dist * dist * (3.0 - 2.0 * dist);  // cubic curve
    const ret = (loPos*(1-u)) + (hiPos*u);  // interpolate
    return ret;
  }

  const canvasEl = document.getElementById("perlin");
  const gl = canvasEl.getContext("webgl");

  const vbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);

  function createShader(ty, src) {
    const s = gl.createShader(ty);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw gl.getShaderInfoLog(s);
    return s;
  }

  const vs = createShader(gl.VERTEX_SHADER, 'attribute vec2 coord; void main(void) { gl_Position = vec4((coord.x/5.0)-1.0, coord.y, 0.0, 1.0); }');
  const fs = createShader(gl.FRAGMENT_SHADER, 'precision mediump float; uniform vec4 color; void main(void) { gl_FragColor = color; }');

  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(prog));
  }
  gl.useProgram(prog);

  const coordLoc = gl.getAttribLocation(prog, "coord");
  gl.vertexAttribPointer(coordLoc, 2, gl.FLOAT, false, 0, 0);

  const colorLoc = gl.getUniformLocation(prog, "color");

  gl.enableVertexAttribArray(coordLoc);

  gl.clearColor(0,0,0,1);
  gl.clear(gl.COLOR_BUFFER_BIT);

  const multiPerlinCoords = {};
  for (let i = 0; i < 10; i+=0.01) {
    multiPerlinCoords[i] = 0;
  }

  gl.uniform4fv(colorLoc, [0.3, 0.3, 0.3, 1.0]);

  for (let octave = 1; octave < 6; octave++) {
    const slopeAt = [];
    const numInts = Math.pow(2, octave) + 2; // +1 due to floating point disgrace
    for (let i = 0; i <= numInts; i++) {
      slopeAt[i] = (Math.random()*2)-1;
    }

    const coords = [];
    for (let i = 0; i < 10; i+=0.01) {
      const height = samplePerlin(slopeAt, i/octave) / octave;
      coords.push(i);
      coords.push(height);
      multiPerlinCoords[i] += height;
    }
    const coordsArray = new Float32Array(coords);
    gl.bufferData(gl.ARRAY_BUFFER, coordsArray, gl.STATIC_DRAW);
    gl.drawArrays(gl.LINE_STRIP, 0, coords.length/2);
  }

  console.log(multiPerlinCoords);

  gl.uniform4fv(colorLoc, [1.0, 1.0, 1.0, 1.0]);
  const multiPerlinCoordsList = [];
  for (k in multiPerlinCoords) {
    multiPerlinCoordsList.push(k);
    multiPerlinCoordsList.push(multiPerlinCoords[k]);
  }
  const multiPerlinCoordsArray = new Float32Array(multiPerlinCoordsList);
  gl.bufferData(gl.ARRAY_BUFFER, multiPerlinCoordsArray, gl.STATIC_DRAW);
  gl.drawArrays(gl.LINE_STRIP, 0, multiPerlinCoordsList.length/2);
</script>

Above you see a wiggly white line.
