---
title: "Game of Life in WebGPU"
tags: ["programming", "webgpu"]
---

Following on from [implementing Rule 110 in WebGPU](/2020/03/02/rule-110-in-webgpu/),
I've gone into the second dimension, and implemented the Game of Life.
This is essentially the same as my earlier [Game of Life in WebGL](/2017/10/23/webgl-big-game-of-life/),
but using WebGPU rather than WebGL.
Below you should see the simulation,
if you're running Google Chrome Canary, 
and you've enabled the "Unsafe WebGPU" experiment.

<div>
  <canvas id="example-canvas" width="200" height="200" style="width: 800px; image-rendering: pixelated; display: inline-block;"></canvas>
</div>

<script type="module">
    const canvas = document.getElementById("example-canvas");
    const ctx = canvas.getContext('2d');

    import glslangModule from "https://unpkg.com/@webgpu/glslang@0.0.8/dist/web-devel/glslang.js";
    (async () => {
        const glslang = await glslangModule();

        const adapter = await navigator.gpu.requestAdapter();
        const device = await adapter.requestDevice();

        const WIDTH_CELLS = 200;

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
                        layout(std430, set = 0, binding = 0) buffer StateInMatrix  { uint size; uint cells[]; } stateIn;
                        layout(std430, set = 0, binding = 1) buffer StateOutMatrix { uint size; uint cells[]; } stateOut;
                        uint get(uvec2 coord) {
                            if (coord.x >= stateIn.size) return 0;
                            if (coord.y >= stateIn.size) return 0;
                            return stateIn.cells[stateIn.size*coord.y + coord.x];
                        }
                        void main() {
                            uint x = gl_GlobalInvocationID.x;
                            uint y = gl_GlobalInvocationID.y;
                            uvec2 coord = uvec2(x,y);

                            uint neighbors =
                              get(coord+uvec2(-1, -1)) +
                              get(coord+uvec2(-1,  0)) +
                              get(coord+uvec2(-1,  1)) +
                              get(coord+uvec2( 0, -1)) +
                              get(coord+uvec2( 0,  1)) +
                              get(coord+uvec2( 1, -1)) +
                              get(coord+uvec2( 1,  0)) +
                              get(coord+uvec2( 1,  1));

                            bool alive = get(coord) == 1 ? (2 <= neighbors && neighbors <= 3) : 3 == neighbors;

                            stateOut.cells[gl_GlobalInvocationID.y*stateIn.size + gl_GlobalInvocationID.x] = alive ? 1 : 0;
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
                        layout(std430, set = 0, binding = 0) buffer StateMatrix  { uint size; uint cells[]; } state;
                        layout(std430, set = 0, binding = 1) buffer ScreenMatrix { uint pixels[]; } screen;
                        uint rgba(uint r, uint g, uint b, uint a) {
                            return a<<24 | b<<16 | g<<8 | r;
                        }
                        uint get(uvec2 coord) {
                            if (coord.x >= state.size) return 0;
                            if (coord.y >= state.size) return 0;
                            return state.cells[state.size*coord.y + coord.x];
                        }
                        void setScreen(uvec2 coord, uint pixel) {
                            if (coord.x >= state.size) return;
                            if (coord.y >= state.size) return;
                            screen.pixels[state.size*coord.y + coord.x] = pixel;
                        }
                        void main() {
                            uint x = gl_GlobalInvocationID.x;
                            uint y = gl_GlobalInvocationID.y;
                            uvec2 coord = uvec2(x,y);
                            setScreen(coord, get(coord) == 0 ? rgba(255,255,255,255) : rgba(0,0,0,255));
                        }`, "compute")
                }),
                entryPoint: "main"
            }
        });

        const STATE_BUFFER_SIZE_BYTES = Uint32Array.BYTES_PER_ELEMENT * ((WIDTH_CELLS*WIDTH_CELLS) + 1);
        const stateBuffers = [
            (() => {
                const [gpuBuf, arrayBuf] = device.createBufferMapped({ size: STATE_BUFFER_SIZE_BYTES, usage: GPUBufferUsage.STORAGE });
                const uint32Array = new Uint32Array(arrayBuf);
                uint32Array[0] = WIDTH_CELLS;
                for (let i = 0; i < WIDTH_CELLS*WIDTH_CELLS; i++) uint32Array[i+1] = Math.random() < 0.5 ? 0 : 1;
                gpuBuf.unmap();
                return gpuBuf;
            })(),
            (() => {
                const [gpuBuf, arrayBuf] = device.createBufferMapped({ size: STATE_BUFFER_SIZE_BYTES, usage: GPUBufferUsage.STORAGE });
                const uint32Array = new Uint32Array(arrayBuf);
                uint32Array[0] = WIDTH_CELLS;
                gpuBuf.unmap();
                return gpuBuf;
            })()
        ];

        const PIXEL_BUFFER_SIZE_BYTES = Uint32Array.BYTES_PER_ELEMENT * WIDTH_CELLS*WIDTH_CELLS;
        const pixelBuffer = device.createBuffer({ size: PIXEL_BUFFER_SIZE_BYTES, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC });

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
</script>