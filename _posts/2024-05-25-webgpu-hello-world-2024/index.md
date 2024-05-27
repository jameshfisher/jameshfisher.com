---
title: "WebGPU hello world in 2024"
tags:
  - programming
  - webgpu
---

Below is a grid of squares.
It's rendered by WebGPU.

<div>
  <canvas id="example-canvas" width="600" height="600"></canvas>
</div>

Here's the essential JavaScript:

```js
const canvas = document.getElementById("example-canvas");
if (!navigator.gpu) {
  throw new Error("WebGPU not supported on this browser.");
}
const adapter = await navigator.gpu.requestAdapter();
if (!adapter) {
  throw new Error("No appropriate GPUAdapter found.");
}
const device = await adapter.requestDevice();
const context = canvas.getContext("webgpu");
if (!context) {
  throw new Error("Canvas context not found");
}
context.configure({
  device: device,
  format: navigator.gpu.getPreferredCanvasFormat(),
});
const encoder = device.createCommandEncoder();
const pass = encoder.beginRenderPass({
  colorAttachments: [
    {
      view: context.getCurrentTexture().createView(),
      loadOp: "clear",
      clearValue: { r: 1, g: 0, b: 1, a: 1 },
      storeOp: "store",
    },
  ],
});
pass.end();
device.queue.submit([encoder.finish()]);
```

This is derived from [this tutorial](https://codelabs.developers.google.com/your-first-webgpu-app).

<script type="module" src="script.js"></script>
