/// <reference types="@webgpu/types" />

// Follows the model at https://www.karlsims.com/rd.html:
//
// Chemical P (prey) is added at a given "feed" rate.
// Chemical S (predator) is removed at a given "kill" rate.
// Reaction: two Ss convert an P into S, as if S reproduces using P as food.
// Both chemicals diffuse so uneven concentrations spread out across the grid, but P diffuses faster than S.
//
// Typical values DA=1.0, DB=.5, f=.055, k=.062

export {};

const GRID_SIZE = 600;

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

const gridSizeBuffer = (() => {
  const gridSizeArray = new Float32Array([GRID_SIZE, GRID_SIZE]);
  const buffer = device.createBuffer({
    label: "Grid Size",
    size: gridSizeArray.byteLength,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });
  device.queue.writeBuffer(buffer, 0, gridSizeArray);
  return buffer;
})();

const vertexBuffer = (() => {
  const s = 1.0;
  const vertices = new Float32Array([
    // Triangle 1
    -s,
    -s,
    s,
    -s,
    s,
    s,

    // Triangle 2
    -s,
    -s,
    s,
    s,
    -s,
    s,
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
  const cellStateArray = new Float32Array(NUMBER_OF_CELLS * 2);

  const buffer = device.createBuffer({
    label: `Cell State ${name}`,
    size: cellStateArray.byteLength,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  });
  for (let i = 0; i < cellStateArray.length; ++i) {
    cellStateArray[i] = Math.random() * 0.5;
  }
  device.queue.writeBuffer(buffer, 0, cellStateArray);

  return buffer;
}

const stateBufferA = makeStateBuffer("A");
const stateBufferB = makeStateBuffer("B");

const BINDING_GRID_SIZE = 0;
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
      @location(0) amount: vec2f,
    };

    // The value is [GRID_SIZE, GRID_SIZE]
    @group(0) @binding(${BINDING_GRID_SIZE}) var<uniform> gridSize: vec2f;

    // a flat array of cell states
    // the size of the array is NUMBER_OF_CELLS
    // there are two chemicals P and S
    // each cell has a concentration of each chemical
    @group(0) @binding(${BINDING_CELL_STATE_INPUT}) var<storage> cellState: array<vec2f>;

    @vertex
    fn vertexMain(
      // pos comes from the vertex buffer
      @location(0) pos: vec2f,
      // instance ranges from 0 to NUMBER_OF_CELLS
      @builtin(instance_index) instance: u32
    ) -> VertexOutput {
      let GRID_WIDTH = gridSize.x;

      let i = f32(instance);
      let cell = vec2f(i % GRID_WIDTH, floor(i / GRID_WIDTH));
      let amount = cellState[instance];

      let cellOffset = cell / GRID_WIDTH * 2;
      let gridPos = (pos+1) / GRID_WIDTH - 1 + cellOffset;

      var output: VertexOutput;
      output.pos = vec4f(gridPos, 0, 1);
      output.amount = amount;
      return output;
    }

    struct FragInput {
      @location(0) amount: vec2f,
    };

    @fragment
    fn fragmentMain(input: FragInput) -> @location(0) vec4f {
      let amount = input.amount;
      return vec4f(amount.x, amount.y, 0, 1);
    }
  `,
});

const bindGroupLayout = device.createBindGroupLayout({
  label: "Bind Group Layout",
  entries: [
    {
      binding: BINDING_GRID_SIZE,
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
    @group(0) @binding(${BINDING_GRID_SIZE}) var<uniform> grid: vec2f;

    // a flat array of cell states
    // the size of the array is NUMBER_OF_CELLS
    // the possible values are 0.0+, the amount of chemical in the cell
    @group(0) @binding(${BINDING_CELL_STATE_INPUT}) var<storage> cellStateIn: array<vec2f>;

    // a flat array of cell states
    // the size of the array is NUMBER_OF_CELLS
    // the possible values are 0.0+, the amount of chemical in the cell
    @group(0) @binding(${BINDING_CELL_STATE_OUTPUT}) var<storage, read_write> cellStateOut: array<vec2f>;

    const D_p = 1.0;
    const D_s = 0.5;
    const FEED_RATE = 0.055;
    const KILL_RATE = 0.062;

    // given a cell's x and y coordinates, return the index of the cell in the flat array
    fn cellIndex(cell: vec2u) -> u32 {
      return (cell.y % u32(grid.y)) * u32(grid.x) +
             (cell.x % u32(grid.x));
    }

    @compute @workgroup_size(${WORKGROUP_SIZE}, ${WORKGROUP_SIZE})
    fn computeMain(
      // executed with [x,y,z] where x in [0, GRID_SIZE) and y in [0, GRID_SIZE)
      @builtin(global_invocation_id) cell: vec3u
    ) {
      let ixHere = cell.xy;

      let ixAbove = vec2u(ixHere.x, ixHere.y-1);
      let ixBelow = vec2u(ixHere.x, ixHere.y+1);
      let ixLeft = vec2u(ixHere.x-1, ixHere.y);
      let ixRight = vec2u(ixHere.x+1, ixHere.y);

      let vHere = cellStateIn[cellIndex(ixHere)];
      let vAbove = cellStateIn[cellIndex(ixAbove)];
      let vBelow = cellStateIn[cellIndex(ixBelow)];
      let vLeft = cellStateIn[cellIndex(ixLeft)];
      let vRight = cellStateIn[cellIndex(ixRight)];

      let p = vHere.x;
      let s = vHere.y;

      // DIFFUSE

      let avg_neighbor_p = (vAbove.x + vBelow.x + vLeft.x + vRight.x) / 4;
      let avg_neighbor_s = (vAbove.y + vBelow.y + vLeft.y + vRight.y) / 4;

      let diff_p = avg_neighbor_p - p;
      let diff_s = avg_neighbor_s - s;

      let new_p_from_diffusion = D_p * diff_p;
      let new_s_from_diffusion = D_s * diff_s;

      // FEED

      let new_p_from_feed = FEED_RATE * (1 - p);

      // REACTION

      let reactions = p * s * s;
      let new_p_from_reactions = -reactions;
      let new_s_from_reactions = reactions;

      // KILL

      let new_s_from_kill = -(KILL_RATE + FEED_RATE) * s;

      cellStateOut[cellIndex(ixHere)] = vec2f(
        p + new_p_from_diffusion + new_p_from_reactions + new_p_from_feed,
        s + new_s_from_diffusion + new_s_from_reactions + new_s_from_kill,
      );
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
        binding: BINDING_GRID_SIZE,
        resource: { buffer: gridSizeBuffer },
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
        binding: BINDING_GRID_SIZE,
        resource: { buffer: gridSizeBuffer },
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

const UPDATE_INTERVAL_MS = 30;
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
