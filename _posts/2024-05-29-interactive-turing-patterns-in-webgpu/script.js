/// <reference types="@webgpu/types" />
const GRID_SIZE = 600;
const WORKGROUP_SIZE = 8;
const NUMBER_OF_CELLS = GRID_SIZE * GRID_SIZE;
let D_p = 1.0;
let D_s = 0.5;
let FEED_RATE = 0.055;
let KILL_RATE = 0.062;
function getConstantsArray() {
    return new Float32Array([
        GRID_SIZE,
        GRID_SIZE,
        D_p,
        D_s,
        FEED_RATE,
        KILL_RATE,
    ]);
}
const canvas = document.getElementById("example-canvas");
const feedRateSlider = document.getElementById("feed-rate");
const killRateSlider = document.getElementById("kill-rate");
const feedRateValue = document.getElementById("feed-rate-value");
const killRateValue = document.getElementById("kill-rate-value");
feedRateSlider.addEventListener("input", (event) => {
    const value = event.target.value;
    feedRateValue.textContent = value;
    FEED_RATE = parseFloat(value);
});
killRateSlider.addEventListener("input", (event) => {
    const value = event.target.value;
    killRateValue.textContent = value;
    KILL_RATE = parseFloat(value);
});
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
const constantsBuffer = (() => {
    const constantsArray = getConstantsArray();
    const buffer = device.createBuffer({
        label: "Grid Size",
        size: constantsArray.byteLength,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    });
    device.queue.writeBuffer(buffer, 0, constantsArray);
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
function makeStateBuffer(name) {
    const cellStateArray = new Float32Array(NUMBER_OF_CELLS * 2);
    for (let i = 0; i < NUMBER_OF_CELLS; ++i) {
        cellStateArray[i * 2] = 1.0;
        cellStateArray[i * 2 + 1] = 0.0;
    }
    // Seed a few cells with S
    for (let i = 0; i < NUMBER_OF_CELLS; ++i) {
        if (Math.random() < 0.01) {
            cellStateArray[i * 2 + 1] = 1.0;
        }
    }
    const buffer = device.createBuffer({
        label: `Cell State ${name}`,
        size: cellStateArray.byteLength,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    });
    device.queue.writeBuffer(buffer, 0, cellStateArray);
    return buffer;
}
const stateBufferA = makeStateBuffer("A");
const stateBufferB = makeStateBuffer("B");
const BINDING_CONSTANTS = 0;
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

    @group(0) @binding(${BINDING_CONSTANTS}) var<storage> constants: array<f32>;

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
      let GRID_WIDTH = constants[0];

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
      return vec4f(amount.y, amount.x, 0, 1);
    }
  `,
});
const bindGroupLayout = device.createBindGroupLayout({
    label: "Bind Group Layout",
    entries: [
        {
            binding: BINDING_CONSTANTS,
            visibility: GPUShaderStage.FRAGMENT |
                GPUShaderStage.VERTEX |
                GPUShaderStage.COMPUTE,
            buffer: { type: "read-only-storage" },
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
    @group(0) @binding(${BINDING_CONSTANTS}) var<storage> constants: array<f32>;

    // a flat array of cell states
    // the size of the array is NUMBER_OF_CELLS
    // the possible values are 0.0+, the amount of chemical in the cell
    @group(0) @binding(${BINDING_CELL_STATE_INPUT}) var<storage> cellStateIn: array<vec2f>;

    // a flat array of cell states
    // the size of the array is NUMBER_OF_CELLS
    // the possible values are 0.0+, the amount of chemical in the cell
    @group(0) @binding(${BINDING_CELL_STATE_OUTPUT}) var<storage, read_write> cellStateOut: array<vec2f>;

    // given a cell's x and y coordinates, return the index of the cell in the flat array
    fn cellIndex(cell: vec2u) -> u32 {
      let GRID_WIDTH = constants[0];
      return (cell.y % u32(GRID_WIDTH)) * u32(GRID_WIDTH) +
             (cell.x % u32(GRID_WIDTH));
    }

    @compute @workgroup_size(${WORKGROUP_SIZE}, ${WORKGROUP_SIZE})
    fn computeMain(
      // executed with [x,y,z] where x in [0, GRID_SIZE) and y in [0, GRID_SIZE)
      @builtin(global_invocation_id) cell: vec3u
    ) {
      let D_p = constants[2];
      let D_s = constants[3];
      let FEED_RATE = constants[4];
      let KILL_RATE = constants[5];

      let ixHere = cell.xy;

      let ixAbove = vec2u(ixHere.x, ixHere.y-1);
      let ixBelow = vec2u(ixHere.x, ixHere.y+1);
      let ixLeft = vec2u(ixHere.x-1, ixHere.y);
      let ixRight = vec2u(ixHere.x+1, ixHere.y);
      let ixAboveLeft = vec2u(ixHere.x-1, ixHere.y-1);
      let ixAboveRight = vec2u(ixHere.x+1, ixHere.y-1);
      let ixBelowLeft = vec2u(ixHere.x-1, ixHere.y+1);
      let ixBelowRight = vec2u(ixHere.x+1, ixHere.y+1);

      let vHere = cellStateIn[cellIndex(ixHere)];
      let vAbove = cellStateIn[cellIndex(ixAbove)];
      let vBelow = cellStateIn[cellIndex(ixBelow)];
      let vLeft = cellStateIn[cellIndex(ixLeft)];
      let vRight = cellStateIn[cellIndex(ixRight)];
      let vAboveLeft = cellStateIn[cellIndex(ixAboveLeft)];
      let vAboveRight = cellStateIn[cellIndex(ixAboveRight)];
      let vBelowLeft = cellStateIn[cellIndex(ixBelowLeft)];
      let vBelowRight = cellStateIn[cellIndex(ixBelowRight)];

      let p = vHere.x;
      let s = vHere.y;

      // DIFFUSE

      let avg_neighbor_p = (vAbove.x + vBelow.x + vLeft.x + vRight.x + vAboveLeft.x + vAboveRight.x + vBelowLeft.x + vBelowRight.x) / 8;
      let avg_neighbor_s = (vAbove.y + vBelow.y + vLeft.y + vRight.y + vAboveLeft.y + vAboveRight.y + vBelowLeft.y + vBelowRight.y) / 8;

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
                binding: BINDING_CONSTANTS,
                resource: { buffer: constantsBuffer },
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
                binding: BINDING_CONSTANTS,
                resource: { buffer: constantsBuffer },
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
    // Write constants array
    device.queue.writeBuffer(constantsBuffer, 0, getConstantsArray());
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
export {};
