---
title: "Simulating epidemics in WebGPU"
tags: ["programming", "webgpu", "epidemiology"]
---

A few days ago, I [simulated an epidemic with WebGL]({% post_url 2020-02-23-simulating-epidemics-with-webgl %}),
using a texture for the state of a cellular automaton.
However, I got some pretty weird effects.
For example, the number of infected people never dropped to zero,
despite the math clearly demanding that it should drop to zero.

I concluded that these weird effects were due to my sin of a texture to keep the state of the cells.
The `texture2d` function lets you sample the color of a texture at a specific coordinate.
Not a pixel; a coordinate.
It does some clever stuff,
like mipmapping, "level of detail", and interpolation.
For a cellular automaton,
I need a lower-level API,
to just access the value at a specific pixel in the texture.

As an extreme solution,
I've rewritten the epidemic simulation in WebGPU.
Earlier, [I implemented Game of Life in WebGPU]({% post_url 2020-03-03-game-of-life-in-webgpu %}),
and I modified that for my epidemic simulation.
The API is much more pleasant:
instead of the voodoo `texture2d` function to access pixels of a texture,
I can instead directly index into an array of cells.

Gladly, the weird effects are not present in the WebGPU implementation!

Below you should see the simulation --
but probably only if you're running Google Chrome Canary, 
and you've enabled the "Unsafe WebGPU" experiment.

<div>
  <canvas id="example-canvas" width="1024" height="1024" style="width: 1024px; image-rendering: pixelated; display: inline-block;"></canvas>
</div>

<script type="module">
    function imageDataFromImage(img) {
        const offscreenCanvas = new OffscreenCanvas(1024, 1024);
        const ctx = offscreenCanvas.getContext('2d');
        ctx.drawImage(img, 0, 0, img.width, img.height);
        return ctx.getImageData(0, 0, img.width, img.height);
    }

    const canvas = document.getElementById("example-canvas");
    const ctx = canvas.getContext('2d');

    import glslangModule from "https://unpkg.com/@webgpu/glslang@0.0.8/dist/web-devel/glslang.js";

    const startStateImg = new Image();
    startStateImg.src = "/assets/2020-02-23/start-state-2.png";
    startStateImg.onload = function() {
        (async () => {
            const glslang = await glslangModule();

            const adapter = await navigator.gpu.requestAdapter();
            const device = await adapter.requestDevice();

            const WIDTH_CELLS = 1024;

            const stepStateBindGroupLayout = device.createBindGroupLayout({
                bindings: [
                    { binding: 0, visibility: GPUShaderStage.COMPUTE, type: "storage-buffer" },
                    { binding: 1, visibility: GPUShaderStage.COMPUTE, type: "storage-buffer" }
                ]
            });
            const stepStateComputePipeline = device.createComputePipeline({
                layout: device.createPipelineLayout({
                    bindGroupLayouts: [stepStateBindGroupLayout]
                }),
                computeStage: {
                    module: device.createShaderModule({
                        code: glslang.compileGLSL(`#version 450
                            const uint WIDTH_CELLS = ${WIDTH_CELLS};

                            const float MEET_PERSON_IN_REGION_TODAY_PROBABILITY = 0.001;
                            const float INFECTED_MEETING_TRANSMISSION_PROBABILITY = 0.4;
                            const float INFECTION_DURATION_DAYS = 60.0;

                            struct Cell { float susceptible; float infected; float recovered; };
                            layout(std430, set = 0, binding = 0) buffer StateInMatrix  { Cell cells[]; } state;
                            layout(std430, set = 0, binding = 1) buffer StateOutMatrix { Cell cells[]; } stateOut;

                            uint coordIndex(uvec2 coord) {
                                return WIDTH_CELLS*coord.y + coord.x;
                            }

                            Cell getCell(uvec2 coord) {
                                if (coord.x >= WIDTH_CELLS) return Cell(0.0, 0.0, 0.0);
                                if (coord.y >= WIDTH_CELLS) return Cell(0.0, 0.0, 0.0);
                                return state.cells[coordIndex(coord)];
                            }

                            void main() {
                                uint x = gl_GlobalInvocationID.x;
                                uint y = gl_GlobalInvocationID.y;
                                uvec2 coord = uvec2(x,y);

                                Cell prevCell = getCell(coord);
                                float susceptible = prevCell.susceptible;
                                float infected    = prevCell.infected;
                                float recovered   = prevCell.recovered;

                                float infectedInRegion = prevCell.infected;
                                infectedInRegion +=
                                    getCell(coord+uvec2( 1, 0)).infected +
                                    getCell(coord+uvec2(-1, 0)).infected +
                                    getCell(coord+uvec2( 0, 1)).infected +
                                    getCell(coord+uvec2( 0,-1)).infected;

                                float infectedMeetingsPerPerson = infectedInRegion * MEET_PERSON_IN_REGION_TODAY_PROBABILITY;
                                float transmissionProbability = 1.0 - 
                                    pow(1.0 - INFECTED_MEETING_TRANSMISSION_PROBABILITY, infectedMeetingsPerPerson);
                                float newlyInfected = susceptible * transmissionProbability;
                                float newlyRecovered = infected / INFECTION_DURATION_DAYS;

                                stateOut.cells[coordIndex(coord)] = state.cells[coordIndex(coord)];

                                stateOut.cells[coordIndex(coord)].infected += newlyInfected;
                                stateOut.cells[coordIndex(coord)].susceptible -= newlyInfected;

                                stateOut.cells[coordIndex(coord)].infected -= newlyRecovered;
                                stateOut.cells[coordIndex(coord)].recovered += newlyRecovered;
                            }`, "compute")
                    }),
                    entryPoint: "main"
                }
            });

            const renderBindGroupLayout = device.createBindGroupLayout({
                bindings: [
                    { binding: 0, visibility: GPUShaderStage.COMPUTE, type: "storage-buffer" },
                    { binding: 1, visibility: GPUShaderStage.COMPUTE, type: "storage-buffer" }
                ]
            });
            const renderComputePipeline = device.createComputePipeline({
                layout: device.createPipelineLayout({
                    bindGroupLayouts: [renderBindGroupLayout]
                }),
                computeStage: {
                    module: device.createShaderModule({
                        code: glslang.compileGLSL(`#version 450
                            const uint WIDTH_CELLS = ${WIDTH_CELLS};
                            struct Cell { float susceptible; float infected; float recovered; };
                            layout(std430, set = 0, binding = 0) buffer StateMatrix  { Cell cells[]; } state;
                            layout(std430, set = 0, binding = 1) buffer ScreenMatrix { uint pixels[]; } screen;
                            uint rgba(uint r, uint g, uint b, uint a) {
                                return a<<24 | b<<16 | g<<8 | r;
                            }
                            uint coordIndex(uvec2 coord) {
                            return WIDTH_CELLS*coord.y + coord.x;
                            }
                            Cell getCell(uvec2 coord) {
                                if (coord.x >= WIDTH_CELLS) return Cell(0.0, 0.0, 0.0);
                                if (coord.y >= WIDTH_CELLS) return Cell(0.0, 0.0, 0.0);
                                return state.cells[coordIndex(coord)];
                            }
                            void setScreen(uvec2 coord, uint pixel) {
                                if (coord.x >= WIDTH_CELLS) return;
                                if (coord.y >= WIDTH_CELLS) return;
                                screen.pixels[(WIDTH_CELLS*coord.y) + coord.x] = pixel;
                            }
                            void main() {
                                uint x = gl_GlobalInvocationID.x;
                                uint y = gl_GlobalInvocationID.y;
                                uvec2 coord = uvec2(x,y);
                                Cell cell = getCell(coord);
                                setScreen(coord, rgba(
                                uint(cell.infected),
                                uint(cell.recovered),
                                uint(cell.susceptible),
                                255
                                ));
                            }`, "compute")
                    }),
                    entryPoint: "main"
                }
            });

            const TOTAL_CELLS = WIDTH_CELLS*WIDTH_CELLS;
            const CELL_SIZE_FLOATS = 3;
            const CELL_SIZE_BYTES = Float32Array.BYTES_PER_ELEMENT * CELL_SIZE_FLOATS;
            const STATE_BUFFER_SIZE_BYTES = CELL_SIZE_BYTES * TOTAL_CELLS;
            const stateBuffers = [
                (() => {
                    const startStateImgData = imageDataFromImage(startStateImg);

                    const [gpuBuf, arrayBuf] = device.createBufferMapped({ 
                    size: STATE_BUFFER_SIZE_BYTES, usage: GPUBufferUsage.STORAGE });
                    const float32Array = new Float32Array(arrayBuf);
                    for (let y = 0; y < WIDTH_CELLS; y++) {
                        for (let x = 0; x < WIDTH_CELLS; x++) {
                            const i = (y*WIDTH_CELLS) + x;
                            const susceptibleIndex = CELL_SIZE_FLOATS*i;
                            const infectedIndex = susceptibleIndex+1;
                            const recoveredIndex = susceptibleIndex+2;
                            float32Array[susceptibleIndex] = startStateImgData.data[i*4 + 2];
                            float32Array[infectedIndex] = Math.random() < 0.00001 ? 1 : 0;
                            float32Array[recoveredIndex] = 0;
                        }
                    }
                    console.log(float32Array);
                    gpuBuf.unmap();
                    return gpuBuf;
                })(),
                (() => {
                    const [gpuBuf, arrayBuf] = device.createBufferMapped({
                    size: STATE_BUFFER_SIZE_BYTES, usage: GPUBufferUsage.STORAGE });
                    gpuBuf.unmap();
                    return gpuBuf;
                })()
            ];

            const PIXEL_BUFFER_SIZE_BYTES = Uint32Array.BYTES_PER_ELEMENT * TOTAL_CELLS;
            const pixelBuffer = device.createBuffer({ 
            size: PIXEL_BUFFER_SIZE_BYTES, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC });

            const stepStateBindGroups = [
                device.createBindGroup({
                    layout: stepStateBindGroupLayout,
                    bindings: [
                        { binding: 0, resource: { buffer: stateBuffers[0] } },
                        { binding: 1, resource: { buffer: stateBuffers[1] } }
                    ]
                }),
                device.createBindGroup({
                    layout: stepStateBindGroupLayout,
                    bindings: [
                        { binding: 0, resource: { buffer: stateBuffers[1] } },
                        { binding: 1, resource: { buffer: stateBuffers[0] } }
                    ]
                })
            ];

            const renderBindGroups = [
                device.createBindGroup({
                    layout: renderBindGroupLayout,
                    bindings: [
                        { binding: 0, resource: { buffer: stateBuffers[1] } },
                        { binding: 1, resource: { buffer: pixelBuffer } }
                    ]
                }),
                device.createBindGroup({
                    layout: renderBindGroupLayout,
                    bindings: [
                        { binding: 0, resource: { buffer: stateBuffers[0] } },
                        { binding: 1, resource: { buffer: pixelBuffer } }
                    ]
                }),
            ];

            const gpuReadBuffer = device.createBuffer({
                size: PIXEL_BUFFER_SIZE_BYTES,
                usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
            });

            let arrayBuffer;

            let dir = 0;
            async function stepState() {
                gpuReadBuffer.unmap();

                const commandEncoder = device.createCommandEncoder();

                const stepStateComputePassEncoder = commandEncoder.beginComputePass();
                stepStateComputePassEncoder.setPipeline(stepStateComputePipeline);
                stepStateComputePassEncoder.setBindGroup(0, stepStateBindGroups[dir]);
                stepStateComputePassEncoder.dispatch(WIDTH_CELLS, WIDTH_CELLS);
                stepStateComputePassEncoder.endPass();
        
                const renderComputePassEncoder = commandEncoder.beginComputePass();
                renderComputePassEncoder.setPipeline(renderComputePipeline);
                renderComputePassEncoder.setBindGroup(0, renderBindGroups[dir]);
                renderComputePassEncoder.dispatch(WIDTH_CELLS, WIDTH_CELLS);
                renderComputePassEncoder.endPass();

                commandEncoder.copyBufferToBuffer(
                    pixelBuffer, 0,
                    gpuReadBuffer, 0,
                    PIXEL_BUFFER_SIZE_BYTES
                );
                const gpuCommands = commandEncoder.finish();
                device.defaultQueue.submit([gpuCommands]);
                arrayBuffer = await gpuReadBuffer.mapReadAsync();

                dir = 1-dir;
            }

            async function draw() {
                await stepState();
                const cells = new Uint8ClampedArray(arrayBuffer);
                const imageData = new ImageData(cells, WIDTH_CELLS, WIDTH_CELLS);
                ctx.putImageData(imageData, 0, 0);

            requestAnimationFrame(draw);
            }
            draw();
        })();
    };
</script>