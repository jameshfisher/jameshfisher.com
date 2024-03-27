---
title: WebGL clipspace point visualization
tags: []
---

<div style="display: flex;">
  <canvas id="point_viz" width="400" height="400" style="width: 200px; height: 200px;"></canvas>
  <div>
    <div>
      <label>X</label>
      <input type="range" id="xpos" value="0" min="-2" max="2" step="0.01"/>
      <span id="xpos_show"></span>
    </div>
    <div>
      <label>Y</label>
      <input type="range" id="ypos" value="0" min="-2" max="2" step="0.01"/>
      <span id="ypos_show"></span>
    </div>
    <div>
      <label>Z</label>
      <input type="range" id="zpos" value="0" min="-2" max="2" step="0.01"/>
      <span id="zpos_show"></span>
    </div>
    <div>
      <label>W</label>
      <input type="range" id="wpos" value="1" min="-2" max="2" step="0.01"/>
      <span id="wpos_show"></span>
    </div>
  </div>
</div>

<script>
  const CROSSHAIR_SIZE = 0.04;

  const pointVizEl = document.getElementById("point_viz");
  const gl = pointVizEl.getContext("webgl");

  const vertBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer);

  const vertShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertShader, "attribute vec4 coord; void main(void) { gl_Position = coord; }");
  gl.compileShader(vertShader);
  if (!gl.getShaderParameter(vertShader, gl.COMPILE_STATUS)) {
    console.error("Error compiling vertex shader", gl.getShaderInfoLog(vertShader));
  }

  const fragShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragShader, "void main(void) { gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0); }");
  gl.compileShader(fragShader);
  if (!gl.getShaderParameter(fragShader, gl.COMPILE_STATUS)) {
    console.error("Error compiling fragment shader", gl.getShaderInfoLog(fragShader));
  }

  const prog = gl.createProgram();
  gl.attachShader(prog, vertShader);
  gl.attachShader(prog, fragShader);
  gl.linkProgram(prog);
  gl.useProgram(prog);

  const coordLoc = gl.getAttribLocation(prog, "coord");
  gl.vertexAttribPointer(coordLoc, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(coordLoc);

  gl.clearColor(0,0,0,1);

  let pos = {x: 0, y: 0, z: 0, w: 1};
  function redraw() {
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      pos.x-CROSSHAIR_SIZE,  pos.y,                 pos.z,                pos.w,
      pos.x+CROSSHAIR_SIZE,  pos.y,                 pos.z,                pos.w,
      pos.x,                 pos.y-CROSSHAIR_SIZE,  pos.z,                pos.w,
      pos.x,                 pos.y+CROSSHAIR_SIZE,  pos.z,                pos.w,
      pos.x,                 pos.y,                 pos.z-CROSSHAIR_SIZE, pos.w,
      pos.x,                 pos.y,                 pos.z+CROSSHAIR_SIZE, pos.w,
    ]), gl.STATIC_DRAW);
    
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.LINES, 0, 6);
  }
  redraw();

  ["x", "y", "z", "w"].forEach(function(id) {
    const el = document.getElementById(id+"pos");
    document.getElementById(id+"pos_show").innerText = el.valueAsNumber;
    el.addEventListener("input", function(ev) {
      const val = ev.target.valueAsNumber;
      pos[id] = val;
      document.getElementById(id+"pos_show").innerText = val;
      redraw();
    });
  });
</script>

Above you should see a black square with a little crosshair.
The crosshair marks a point in space.
This is drawn with WebGL.
You can change the position of the point using the sliders to the right,
representing four components of the point called X, Y, Z, and W.

By playing around with these sliders, you can discover many things about WebGL!

* The X component moves the point left/right,
  and the Y component moves the point up/down.
  So far, so expected.
* Increasing Y moves the point _up_, not down!
  WebGL's Y is opposite to CSS's Y.
* The mysterious W component acts as an inverse scale.
  As W increases, the point shrinks towards the origin.
  As W decreases towards zero, the point moves out to infinity.
  When W is negative, the point doesn't show (what could negative mean here?).
* The Z component doesn't make any difference.
  Z represents the axis perpendicular to the screen.
  But this distance does not affect the point's "size" or distance to the origin,
  as might happen in a perspective view.
  (The W component is more like a perspective transformation than the Z component!)
* When Z goes out of the `[-1, 1]` range,
  the point disappears entirely!
  It is "clipped" because it's no longer in "clip space",
  the two-unit cube.
  This clipping happens _after_ W-scaling:
  a point with Z=2 and W=2 still displays,
  because the final Z = Z/W = 1.

I implemented the above with a passthrough vertex shader,
which passes on the vertex attributes as the vertex position:

```glsl
attribute vec4 coord;
void main(void) { 
  gl_Position = coord; 
}
```

Then, whenever the sliders change,
I pass in the six vertices of a 3D crosshair:

```js
function redraw() {
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    pos.x-CROSSHAIR_SIZE,  pos.y,                 pos.z,                pos.w,
    pos.x+CROSSHAIR_SIZE,  pos.y,                 pos.z,                pos.w,
    pos.x,                 pos.y-CROSSHAIR_SIZE,  pos.z,                pos.w,
    pos.x,                 pos.y+CROSSHAIR_SIZE,  pos.z,                pos.w,
    pos.x,                 pos.y,                 pos.z-CROSSHAIR_SIZE, pos.w,
    pos.x,                 pos.y,                 pos.z+CROSSHAIR_SIZE, pos.w,
  ]), gl.STATIC_DRAW);
  
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.LINES, 0, 6);
}
```
