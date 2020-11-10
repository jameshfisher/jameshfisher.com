---
title: "Edge detection with Sobel filters"
tags: ["programming", "web", "webgl"]
ogimage: "/assets/2020-08-31/example.png"
---

Image processing often requires detecting edges.
In this blog post I show a fragment shader that implements a "Sobel filter",
which is one method to detect edges.
For a live demo,
click "Start webcam" below
to see edges detected in your webcam video:

<canvas id="display" style="max-width: initial; display: none;"></canvas>
<div style="text-align: center">
  <button onclick="startWebcam(); this.parentElement.removeChild(this)">Start webcam</button>
</div>
<video id="webcamVideo" style="display: none;"></video>

<script id="vertex-shader" type="glsl">
    attribute vec2 c;
    void main(void) { 
      gl_Position=vec4(c, 0.0, 1.0); 
    }
</script>

<script id="fragment-shader" type="glsl">
    precision mediump float;
    uniform sampler2D tex;
    uniform vec2 texSize;
    vec3 texRGB(vec2 coord) {
      return texture2D(tex, coord).rgb;
    }
    vec3 sobel(vec2 coord, vec2 v, vec2 h) {
      vec3 total = vec3(0.);
      total += texRGB(coord + h - v);
      total += texRGB(coord - h - v) * -1.;
      total += texRGB(coord + h)     *  2.;
      total += texRGB(coord - h)     * -2.;
      total += texRGB(coord + h + v);
      total += texRGB(coord - h + v) * -1.;

      return total;
    }
    void main(void) {
      vec2 coord = gl_FragCoord.xy / texSize;

      vec2 pxSize = 1./texSize;

      vec2 v = vec2(0., pxSize.y);
      vec2 h = vec2(pxSize.x, 0.);

      vec3 vertical = sobel(coord, v, h);
      vec3 horizontal = sobel(coord, h, v);

      gl_FragColor = vec4(sqrt(vertical*vertical + horizontal*horizontal), 1.);
    }
</script>

<script type="text/javascript">
    const webcamVideoEl = document.getElementById("webcamVideo");
    const displayCanvasEl = document.getElementById("display");
    const gl = displayCanvasEl.getContext("webgl");
  
    const vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vs, document.getElementById("vertex-shader").innerText);
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
  
    gl.activeTexture(gl.TEXTURE0);
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    
    const texLoc = gl.getUniformLocation(prog, "tex");
    const texSizeLoc = gl.getUniformLocation(prog, "texSize");

    function startWebcam() {
      navigator.mediaDevices.getUserMedia({ video: { 
            facingMode: "user",
            width: { ideal: 320 },
            height: { ideal: 240 } } }).then(stream => {
        displayCanvasEl.style.display = "block";
        webcamVideoEl.srcObject = stream;
        webcamVideoEl.play();
        function processFrame(now, metadata) {
          displayCanvasEl.width = metadata.width;
          displayCanvasEl.height = metadata.height;
          gl.viewport(0, 0, metadata.width, metadata.height);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, webcamVideoEl);
          gl.uniform1i(texLoc, 0);
          gl.uniform2f(texSizeLoc, metadata.width, metadata.height);
          gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
          webcamVideoEl.requestVideoFrameCallback(processFrame);
        }
        webcamVideoEl.requestVideoFrameCallback(processFrame);
      }).catch(error => {
        console.error(error);
      });
    }
</script>

What is an edge, anyway?
One definition is "a steep enough gradient".
Generally, an edge detection filter differentiates a grayscale input image,
and produces a grayscale output image
where a pixel's brightness in the output image
corresponds to the gradient's steepness in the input image.
Take a look at what the demo does with my webcam,
and consider whether "a steep gradient" really matches your intuition of what an "edge" is:

<p><img src="{% link assets/2020-08-31/example.png %}"/></p>

In my opinion, there are some oddities.
Notice the lampshade in the corner does not get a full outline.
Or notice that the neckline of my T-shirt is forgotten.
It doesn't look exactly like a line drawing by a human.
Nevertheless, let's run with this definition of an edge as "a steep gradient in the image".

Notice that the output of an edge detection filter is another grid of pixels.
You may have been expecting the output to be more like a set of vectors, like an SVG.
This is sometimes called "contouring" or "border following".
The demo above does not attempt to find such vectors.

Notice also that edge detection is typically defined on a "grayscale" input image.
However, your webcam provides a color image.
One approach is to convert the image to grayscale before detecting edges,
although this throws away information (and thus edges).
Another approach is to run edge detection separately on each color channel.
That is what the demo above does.
For example, if a line is mostly red, 
it means there is a steep gradient in the red color channel.
Notice the strong orange line in the image above:
there is little blue in it,
because my blue-ish T-shirt meets the blue-ish sky in the window.

[A Sobel filter](https://en.wikipedia.org/wiki/Sobel_operator) is one edge detection method.
It detects a gradient by performing "convolutions" on the grayscale input image.
A "convolution" is a fancy name for a weighted sum of neighboring pixels.
The specific weights in the sum are called a "kernel" in the jargon.
Here is an example 3x3 kernel that can detect horizontal gradients
(or equivalently, vertical edges):

```
1  0 -1
2  0 -2
1  0 -1
```

For each pixel of the output,
this 3x3 grid of weights is centered on the equivalent pixel in the input and its neighboring eight pixels.
Each pixel is multiplied by its weight,
then they're added together to get the output.

In essence, the above kernel subtracts the brightness on the right from the brightness on the left.
If all pixels are similar,
the positive weights cancel with the negative weights,
and the total sum is near zero.
If given a horizontal gradient,
from white on the left to black on the right,
the kernel outputs a positive value.
For example, consider a horizontal gradient 
that decreases by 1 for every pixel towards the right:

```
3  2  1
3  2  1
3  2  1
```

Our Sobel filter applied to the middle pixel here gives `6`:

```
3*1  + 2*0 + 1*-1 +
3*2  + 2*0 + 1*-2 +  ==  6
3*1  + 2*0 + 1*-1
```

If given a horizontal gradient in the other direction,
from black on the left to white on the right,
the kernel outputs the equivalent negative value, `-6`.

This kernel does not detect vertical gradients (or horizontal edges);
it will output `0` for these.
To detect vertical gradients,
you can rotate the kernel to get:

```
 1  2  1
 0  0  0
-1 -2 -1
```

But what about gradients/edges in other directions?
Perhaps you can imagine designing more kernels
to detect diagonal gradients.
However, this is not what a Sobel filter does.
Instead, a Sobel filter combines the `horizontal` and `vertical` gradients with
the Euclidean distance function,
`sqrt(horizontal^2 + vertical^2)`.

This is not actually equivalent to detecting a diagonal gradient!
Our Sobel filter assigned a strength of `6` to horizontal and vertical gradients,
but it turns out to assign a strength of `8` to an equivalent diagonal gradient.
If you want to see why,
consider a 45-degree gradient,
from white in the top left to black in the bottom right,
decreasing at the same rate of 1 per pixel.
The pixel values would look like this:

```
[ 2.0*sqrt(2), 1.5*sqrt(2), 1.0*sqrt(2),
  1.5*sqrt(2), 1.0*sqrt(2), 0.5*sqrt(2),
  1.0*sqrt(2), 0.5*sqrt(2), 0.0*sqrt(2) ]
```

Try applying our horizontal Sobel filter to this image;
you'll get `4*sqrt(2)`, or `5.65`,
as the strength of the horizontal component of the gradient in the image.
The vertical gradient would work out the same.
Combining these with our distance function gives
`sqrt(64)`, or `8`.

So, not perfect:
a diagonal gradient is reported as 33% stronger than an orthogonal gradient.
But we can get more consistent results with a different kernel.
The following kernel
detects a strength of 32 for both orthogonal and diagonal gradients.

```
3   0  -3
10  0  -10
3   0  -3
```

Honestly, I don't understand why the Sobel filter uses a 3x3 kernel.
The 1x3 kernel `1 0 -1` also detects a horizontal gradient,
is cheaper,
works out nicely with diagonal gradients,
and its output looks extremely similar, or better.
If anyone knows, get in touch.