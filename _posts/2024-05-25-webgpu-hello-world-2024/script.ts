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
const canvasFormat = navigator.gpu.getPreferredCanvasFormat();

context.configure({
  device: device,
  format: canvasFormat,
});

const vertices = new Float32Array([
  // Triangle 1
  -0.8, -0.8, 0.8, -0.8, 0.8, 0.8,

  // Triangle 2
  -0.8, -0.8, 0.8, 0.8, -0.8, 0.8,
]);

const vertexBuffer = device.createBuffer({
  label: "Cell vertices",
  size: vertices.byteLength,
  usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
});

device.queue.writeBuffer(vertexBuffer, /*bufferOffset=*/ 0, vertices);

const cellShaderModule = device.createShaderModule({
  label: "Cell shader",
  code: `
    @vertex
    fn vertexMain(@location(0) pos: vec2f) ->
      @builtin(position) vec4f {
      return vec4f(pos, 0, 1);
    }

    @fragment
    fn fragmentMain() -> @location(0) vec4f {
      return vec4f(1, 0, 1, 1);
    }
  `,
});

const cellPipeline = device.createRenderPipeline({
  label: "Cell pipeline",
  layout: "auto",
  vertex: {
    module: cellShaderModule,
    entryPoint: "vertexMain",
    buffers: [
      {
        arrayStride: 8,
        attributes: [{ format: "float32x2", offset: 0, shaderLocation: 0 }],
      },
    ],
  },
  fragment: {
    module: cellShaderModule,
    entryPoint: "fragmentMain",
    targets: [{ format: canvasFormat }],
  },
});

const encoder = device.createCommandEncoder();

const pass = encoder.beginRenderPass({
  colorAttachments: [
    {
      view: context.getCurrentTexture().createView(),
      loadOp: "clear",
      clearValue: { r: 1, g: 1, b: 0, a: 1 },
      storeOp: "store",
    },
  ],
});

pass.setPipeline(cellPipeline);
pass.setVertexBuffer(0, vertexBuffer);
pass.draw(vertices.length / 2);

pass.end();

device.queue.submit([encoder.finish()]);
