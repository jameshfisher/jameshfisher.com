/// <reference types="@webgpu/types" />

export {};

const GRID_SIZE = 128;

const WORKGROUP_SIZE = 8;

const NUMBER_OF_CELLS = GRID_SIZE * GRID_SIZE;

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

const uniformBuffer = (() => {
  const uniformArray = new Float32Array([GRID_SIZE, GRID_SIZE]);
  const buffer = device.createBuffer({
    label: "Grid Uniforms",
    size: uniformArray.byteLength,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });
  device.queue.writeBuffer(buffer, 0, uniformArray);
  return buffer;
})();

const vertexBuffer = (() => {
  const vertices = new Float32Array([
    // Triangle 1
    -0.8, -0.8, 0.8, -0.8, 0.8, 0.8,

    // Triangle 2
    -0.8, -0.8, 0.8, 0.8, -0.8, 0.8,
  ]);
  const buffer = device.createBuffer({
    label: "Cell vertices",
    size: vertices.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
  });
  device.queue.writeBuffer(buffer, 0, vertices);
  return buffer;
})();

function makeStateBuffer(name: string) {
  const cellStateArray = new Uint32Array(NUMBER_OF_CELLS);

  const buffer = device.createBuffer({
    label: `Cell State ${name}`,
    size: cellStateArray.byteLength,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  });
  for (let i = 0; i < cellStateArray.length; ++i) {
    cellStateArray[i] = Math.random() > 0.6 ? 1 : 0;
  }
  device.queue.writeBuffer(buffer, 0, cellStateArray);

  return buffer;
}

const stateBufferA = makeStateBuffer("A");
const stateBufferB = makeStateBuffer("B");

const BINDING_UNIFORM = 0;
const BINDING_CELL_STATE_INPUT = 1;
const BINDING_CELL_STATE_OUTPUT = 2;

const cellShaderModule = device.createShaderModule({
  label: "Cell shader",
  code: `
    struct VertexInput {
      @location(0) pos: vec2f,
      @builtin(instance_index) instance: u32,
    };

    struct VertexOutput {
      @builtin(position) pos: vec4f,
      @location(0) cell: vec2f,
    };

    @group(0) @binding(${BINDING_UNIFORM}) var<uniform> grid: vec2f;
    @group(0) @binding(${BINDING_CELL_STATE_INPUT}) var<storage> cellState: array<u32>;

    @vertex
    fn vertexMain(@location(0) pos: vec2f,
                  @builtin(instance_index) instance: u32) -> VertexOutput {
      let i = f32(instance);
      let cell = vec2f(i % grid.x, floor(i / grid.x));
      let state = f32(cellState[instance]);

      let cellOffset = cell / grid * 2;
      let gridPos = (pos*state+1) / grid - 1 + cellOffset;

      var output: VertexOutput;
      output.pos = vec4f(gridPos, 0, 1);
      output.cell = cell;
      return output;
    }

    struct FragInput {
      @location(0) cell: vec2f,
    };

    @fragment
    fn fragmentMain(input: FragInput) -> @location(0) vec4f {
      let c = input.cell / grid;
      return vec4f(c, 1-c.x, 1);
    }
  `,
});

const bindGroupLayout = device.createBindGroupLayout({
  label: "Bind Group Layout",
  entries: [
    {
      binding: BINDING_UNIFORM,
      visibility:
        GPUShaderStage.FRAGMENT |
        GPUShaderStage.VERTEX |
        GPUShaderStage.COMPUTE,
      buffer: { type: "uniform" },
    },
    {
      binding: BINDING_CELL_STATE_INPUT,
      visibility: GPUShaderStage.VERTEX | GPUShaderStage.COMPUTE,
      buffer: { type: "read-only-storage" },
    },
    {
      binding: BINDING_CELL_STATE_OUTPUT,
      visibility: GPUShaderStage.COMPUTE,
      buffer: { type: "storage" },
    },
  ],
});

const pipelineLayout = device.createPipelineLayout({
  label: "Cell Pipeline Layout",
  bindGroupLayouts: [bindGroupLayout],
});

const cellPipeline = device.createRenderPipeline({
  label: "Cell pipeline",
  layout: pipelineLayout,
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

const simulationShaderModule = device.createShaderModule({
  label: "Game of Life simulation shader",
  code: `
    @group(0) @binding(${BINDING_UNIFORM}) var<uniform> grid: vec2f;
    @group(0) @binding(${BINDING_CELL_STATE_INPUT}) var<storage> cellStateIn: array<u32>;
    @group(0) @binding(${BINDING_CELL_STATE_OUTPUT}) var<storage, read_write> cellStateOut: array<u32>;

    fn cellIndex(cell: vec2u) -> u32 {
      return (cell.y % u32(grid.y)) * u32(grid.x) +
             (cell.x % u32(grid.x));
    }

    fn cellActive(x: u32, y: u32) -> u32 {
      return cellStateIn[cellIndex(vec2(x, y))];
    }

    @compute @workgroup_size(${WORKGROUP_SIZE}, ${WORKGROUP_SIZE})
    fn computeMain(@builtin(global_invocation_id) cell: vec3u) {
      let activeNeighbors =
        cellActive(cell.x+1, cell.y+1) +
        cellActive(cell.x+1, cell.y) +
        cellActive(cell.x+1, cell.y-1) +
        cellActive(cell.x, cell.y-1) +
        cellActive(cell.x-1, cell.y-1) +
        cellActive(cell.x-1, cell.y) +
        cellActive(cell.x-1, cell.y+1) +
        cellActive(cell.x, cell.y+1);

      let i = cellIndex(cell.xy);

      switch activeNeighbors {
        case 2: {
          cellStateOut[i] = cellStateIn[i];
        }
        case 3: {
          cellStateOut[i] = 1;
        }
        default: {
          cellStateOut[i] = 0;
        }
      }
    }`,
});

const simulationPipeline = device.createComputePipeline({
  label: "Simulation pipeline",
  layout: pipelineLayout,
  compute: {
    module: simulationShaderModule,
    entryPoint: "computeMain",
  },
});

const bindGroups = [
  device.createBindGroup({
    label: "Cell renderer bind group A",
    layout: bindGroupLayout,
    entries: [
      {
        binding: BINDING_UNIFORM,
        resource: { buffer: uniformBuffer },
      },
      {
        binding: BINDING_CELL_STATE_INPUT,
        resource: { buffer: stateBufferA },
      },
      {
        binding: BINDING_CELL_STATE_OUTPUT,
        resource: { buffer: stateBufferB },
      },
    ],
  }),
  device.createBindGroup({
    label: "Cell renderer bind group B",
    layout: bindGroupLayout,

    entries: [
      {
        binding: BINDING_UNIFORM,
        resource: { buffer: uniformBuffer },
      },
      {
        binding: BINDING_CELL_STATE_INPUT,
        resource: { buffer: stateBufferB },
      },
      {
        binding: BINDING_CELL_STATE_OUTPUT,
        resource: { buffer: stateBufferA },
      },
    ],
  }),
];

const UPDATE_INTERVAL_MS = 500;
let step = 0;

function updateGrid() {
  step++;

  const encoder = device.createCommandEncoder();

  const computePass = encoder.beginComputePass();
  computePass.setPipeline(simulationPipeline);
  computePass.setBindGroup(0, bindGroups[step % 2]);
  const workgroupCount = Math.ceil(GRID_SIZE / WORKGROUP_SIZE);
  computePass.dispatchWorkgroups(workgroupCount, workgroupCount);
  computePass.end();

  const renderPass = encoder.beginRenderPass({
    colorAttachments: [
      {
        view: context.getCurrentTexture().createView(),
        loadOp: "clear",
        clearValue: { r: 0, g: 0, b: 0, a: 1.0 },
        storeOp: "store",
      },
    ],
  });

  // Draw the grid.
  renderPass.setPipeline(cellPipeline);
  renderPass.setBindGroup(0, bindGroups[step % 2]);
  renderPass.setVertexBuffer(0, vertexBuffer);
  renderPass.draw(vertexBuffer.size / 8, NUMBER_OF_CELLS);

  renderPass.end();
  device.queue.submit([encoder.finish()]);
}

function animate() {
  updateGrid();
  setTimeout(animate, UPDATE_INTERVAL_MS);
}
setTimeout(animate, UPDATE_INTERVAL_MS);
