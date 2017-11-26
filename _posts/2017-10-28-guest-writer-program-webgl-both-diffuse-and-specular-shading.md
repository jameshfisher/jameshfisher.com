---
title: "WebGL shading: both diffuse and specular"
author: luis
tags: ["programming", "graphics", "webgl"]
---

<div>
  <canvas width="1024" height="1024" style="width: 512px; height: 512px;" id="both-canvas"></canvas>
</div>
<script id="both-fragment-shader" type="x-shader/x-fragment">
  precision mediump float;
  uniform mediump vec2 mouse_pos;
  uniform sampler2D normal_map;
  uniform mediump vec2 diffuse_specular_percs;

  void main(void) {
    vec2 frag = vec2(gl_FragCoord)/1024.0;
    vec4 light_pos = vec4(mouse_pos, 0.5, 1.0);
    vec4 surface_pos = vec4(frag, 0.0, 1.0);
    vec4 normal = vec4(vec3(texture2D(normal_map, frag))*2.0-1.0, 0.0);
    vec4 from_light_dir = normalize(surface_pos-light_pos);
    vec4 reflection_dir = reflect(from_light_dir, normal);
    vec4 camera_dir = normalize(vec4(0.0, 0.0, 1.0, 0.0));
    vec4 normal_direction = vec4(vec3(texture2D(normal_map, frag))*2.0-1.0, 0.0);
    vec4 light_direction = normalize(light_pos-surface_pos);
    float intensity = dot(normal_direction, light_direction) * diffuse_specular_percs.x + dot(reflection_dir, camera_dir) * diffuse_specular_percs.y;
    gl_FragColor = vec4(intensity, intensity, intensity, 1.0);
  }
</script>
<script>
  var specularPercentage = 0.2;
  var diffusePercentage = 0.8;
  function setupCanvas(shaderTy) {
    const canvas = document.getElementById(shaderTy+"-canvas");
    const gl = canvas.getContext('webgl');
    gl.viewport(0,0,canvas.width,canvas.height);
    const vertexBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1,1,  -1,-1,  1,-1,  1, 1,
    ]), gl.STATIC_DRAW);
    gl.clearColor(0,0,0,1);
    function createShader(ty, src) {
      const s = gl.createShader(ty);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw gl.getShaderInfoLog(s);
      return s;
    }
    const vertShader = createShader(gl.VERTEX_SHADER, 'attribute vec2 c;void main(void){gl_Position=vec4(c, 0.0, 1.0);}');
    const fragShader = createShader(gl.FRAGMENT_SHADER, document.getElementById(shaderTy+"-fragment-shader").innerText);
    const prog = gl.createProgram();
    gl.attachShader(prog, vertShader);
    gl.attachShader(prog, fragShader);
    gl.linkProgram(prog);
    const coord = gl.getAttribLocation(prog, "c");
    gl.vertexAttribPointer(coord, 2, gl.FLOAT, false, 0, 0);
    const mousePosLoc = gl.getUniformLocation(prog, "mouse_pos");
    const diffuseSpecularPercs = gl.getUniformLocation(prog, "diffuse_specular_percs");
    gl.useProgram(prog);
    const normalMapImg = new Image();
    normalMapImg.onload = function() {
      gl.activeTexture(gl.TEXTURE0);
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, normalMapImg);
      gl.generateMipmap(gl.TEXTURE_2D);

      const texLoc = gl.getUniformLocation(prog, "tex");
      gl.uniform1i(texLoc, 0);

      gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    };
    normalMapImg.src = '/assets/crossnrm.jpg';
    var mousePos = {x: 0.1, y: 0.1};
    function draw(ev) {
      gl.enableVertexAttribArray(coord);
      gl.uniform2fv(mousePosLoc, [mousePos.x, mousePos.y]);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    }
    canvas.onmousemove = function(ev) {
      mousePos = {x: ev.offsetX/512, y: (512-ev.offsetY)/512};
      draw();
    }
    if (diffuseSpecularPercs !== null) {
      document.onkeypress = function (e) {
        e = e || window.event;

        let letterPressed = String.fromCharCode(e.keyCode);
        if (letterPressed === 's') {
          specularPercentage = Math.min(1.0, specularPercentage + 0.04);
        } else {
          specularPercentage = Math.max(0.0, specularPercentage - 0.04);
        }
        diffusePercentage = 1.0 - specularPercentage;
        gl.uniform2fv(diffuseSpecularPercs, [diffusePercentage, specularPercentage]);
        console.log("[diffusePercentage, specularPercentage]", [diffusePercentage, specularPercentage]);
        draw();
      };
      gl.uniform2fv(diffuseSpecularPercs, [diffusePercentage, specularPercentage]);
    }
    draw();
  }

  setupCanvas('both');
</script>

Hi, I'm [Luís](http://luisfonseca.xyz).
Just doing a quick variation on [Jims' previous post about specular and
diffuse lighting]({% post_url 2017-10-12-webgl-specular-diffuse-shading %}).

You don't need to decide on going for one of those types.
You can mix both to try to get a better effect.

As you move your cursor around the image above, press the `s` or `d` keys
continuously for more specular or diffuse lighting, respectively.
