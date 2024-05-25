/// <reference types="@webgpu/types" />

export {};

const canvas = document.getElementById("example-canvas") as HTMLCanvasElement;

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
