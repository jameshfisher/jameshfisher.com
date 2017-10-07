---
title: "WebGL matrix visualization"
---


<div style="display: flex;">
  <canvas id="matrix_viz" width="400" height="400" style="width: 200px; height: 200px;"></canvas>
  <style>
    input[type=range] {
      max-width: 100px;
    }
  </style>
  <table style="font-family: monospace; background: #eee;">
    <tr>
      <td colspan="4">mat4 transformation = mat4(</td>
    </tr>
    <tr>
      <td><input type="range" id="mat_0_0" min="-2" max="2" step="0.01" /><span id="show_0_0"></span>, </td>
      <td><input type="range" id="mat_0_1" min="-2" max="2" step="0.01" /><span id="show_0_1"></span>, </td>
      <td><input type="range" id="mat_0_2" min="-2" max="2" step="0.01" /><span id="show_0_2"></span>, </td>
      <td><input type="range" id="mat_0_3" min="-2" max="2" step="0.01" /><span id="show_0_3"></span>, </td>
    </tr>
    <tr>
      <td><input type="range" id="mat_1_0" min="-2" max="2" step="0.01" /><span id="show_1_0"></span>, </td>
      <td><input type="range" id="mat_1_1" min="-2" max="2" step="0.01" /><span id="show_1_1"></span>, </td>
      <td><input type="range" id="mat_1_2" min="-2" max="2" step="0.01" /><span id="show_1_2"></span>, </td>
      <td><input type="range" id="mat_1_3" min="-2" max="2" step="0.01" /><span id="show_1_3"></span>, </td>
    </tr>
    <tr>
      <td><input type="range" id="mat_2_0" min="-2" max="2" step="0.01" /><span id="show_2_0"></span>, </td>
      <td><input type="range" id="mat_2_1" min="-2" max="2" step="0.01" /><span id="show_2_1"></span>, </td>
      <td><input type="range" id="mat_2_2" min="-2" max="2" step="0.01" /><span id="show_2_2"></span>, </td>
      <td><input type="range" id="mat_2_3" min="-2" max="2" step="0.01" /><span id="show_2_3"></span>, </td>
    </tr>
    <tr>
      <td><input type="range" id="mat_3_0" min="-2" max="2" step="0.01" /><span id="show_3_0"></span>, </td>
      <td><input type="range" id="mat_3_1" min="-2" max="2" step="0.01" /><span id="show_3_1"></span>, </td>
      <td><input type="range" id="mat_3_2" min="-2" max="2" step="0.01" /><span id="show_3_2"></span>, </td>
      <td><input type="range" id="mat_3_3" min="-2" max="2" step="0.01" /><span id="show_3_3"></span>, </td>
    </tr>
    <tr>
      <td colspan="4">);</td>
    </tr>
  </table>
</div>
<script id="vertex-shader" type="x-shader/x-vertex">
  uniform mat4 transformation;
  attribute vec4 coord;
  void main(void) {
    gl_Position = transformation * coord;
  }
</script>
<script>
  const matrixVizEl = document.getElementById("matrix_viz");
  const gl = matrixVizEl.getContext("webgl");

  const vertBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    // back face
     0.5, 0.5, 0.5, 1,   0.5,-0.5, 0.5, 1,
     0.5,-0.5, 0.5, 1,  -0.5,-0.5, 0.5, 1,
    -0.5,-0.5, 0.5, 1,  -0.5, 0.5, 0.5, 1,
    -0.5, 0.5, 0.5, 1,   0.5, 0.5, 0.5, 1,

    // front face
     0.5, 0.5,-0.5, 1,   0.5,-0.5,-0.5, 1,
     0.5,-0.5,-0.5, 1,  -0.5,-0.5,-0.5, 1,
    -0.5,-0.5,-0.5, 1,  -0.5, 0.5,-0.5, 1,
    -0.5, 0.5,-0.5, 1,   0.5, 0.5,-0.5, 1,

    // joins
     0.5, 0.5, 0.5, 1,   0.5, 0.5,-0.5, 1,
     0.5,-0.5, 0.5, 1,   0.5,-0.5,-0.5, 1,
    -0.5,-0.5, 0.5, 1,  -0.5,-0.5,-0.5, 1,
    -0.5, 0.5, 0.5, 1,  -0.5, 0.5,-0.5, 1,
  ]), gl.STATIC_DRAW);

  const vertShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertShader, document.getElementById("vertex-shader").innerText);
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
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.error("Error linking program", gl.getProgramInfoLog(prog));
  }
  gl.useProgram(prog);

  const coordLoc = gl.getAttribLocation(prog, "coord");
  gl.vertexAttribPointer(coordLoc, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(coordLoc);

  const transformationLoc = gl.getUniformLocation(prog, "transformation");

  gl.clearColor(0.5,0,0.5,1);

  let mat = [
    1.0, 0.0, 0.0, 0.0,
    0.0, 1.0, 0.0, 0.0,
    0.3, 0.3, 1.0, 0.1,
    0.0, 0.0, 0.0, 1.0
  ];
  function redraw() {
    gl.uniformMatrix4fv(transformationLoc, false, new Float32Array(mat));
    
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.LINES, 0, 24);
  }
  redraw();
  [0,1,2,3].forEach(function(i) {
    [0,1,2,3].forEach(function(j) {
      const el = document.getElementById("mat_"+i+"_"+j);
      const showEl = document.getElementById("show_"+i+"_"+j);
      const ix = i*4 + j;
      el.value = mat[ix];
      showEl.innerText = mat[ix];
      el.addEventListener("input", function(ev) {
        mat[ix] = el.value;
        showEl.innerText = mat[ix];
        redraw();
      });
    });
  });
</script>

Above you see a square canvas, with a line drawing of a cube.
This is drawn with WebGL.
It draws the unit cube transformed by the matrix on the right.
You can edit the matrix to see how it affects the drawing of the cube.

By editing the numbers, you can translate, scale and rotate the cube,
and get some other pretty weird effects:

* Scale the entire cube by editing the bottom-right number.
  Alternatively, scale the cube by editing the diagonal from top-left to bottom-right,
  which lets you scale the dimensions independently.
* Translate the cube by editing the bottom row.
* Rotate the cube with ... well ... some complicated edits beyond the scope of this post.

