---
title: Rule 110 in WebGPU
tags:
  - programming
  - webgpu
---

If you're running the latest Google Chrome Canary,
and you've enabled the "Unsafe WebGPU" experiment,
then you should two funny triangles below.
The first is just an image;
the second is calculated with [WebGPU](https://github.com/gpuweb/gpuweb),
a bleeding-edge, partially implemented web browser feature.
Most of you reading this won't have this feature enabled,
so you'll just see the image.

<div>
  <img src="/assets/2020-03-02/rule110.png" style="width: 400px; image-rendering: pixelated; border: none; display: inline-block;" />
  <canvas id="example-canvas" width="200" height="200" style="width: 400px; image-rendering: pixelated; display: inline-block;"></canvas>
</div>

The image is [Rule 110](https://en.wikipedia.org/wiki/Rule_110),
a cellular automaton.
It's calculated using this GLSL:

```glsl
#version 450
layout(std430, set = 0, binding = 0) buffer StateInMatrix  { uint size; uint cells[]; } stateIn;
layout(std430, set = 0, binding = 1) buffer StateOutMatrix { uint size; uint cells[]; } stateOut;
uint s(uint i) {
    return i < stateIn.size ? stateIn.cells[i] : 0;
}
void main() {
    uint x = gl_GlobalInvocationID.x;
    uint n = (s(x-1) << 2) | (s(x) << 1) | s(x+1);
    uint newState = (n == 6 || n == 5 || n == 3 || n == 2 || n == 1) ? 1 : 0;
    stateOut.cells[gl_GlobalInvocationID.x] = newState;
}
```

This GLSL runs one step of a simulated world,
from `stateIn` to `stateOut`.
The `main` function runs once for every `cell` in the world.

At the time of writing, 
Google Chrome hasn't implemented any way to draw GPU buffers to the screen.
But it does let you extract a buffer as an `ArrayBuffer`.
So instead,
[I use a `2d` canvas context, and call `ctx.putImageData` with that `ArrayBuffer`](/2020/03/01/how-to-write-an-arraybuffer-to-a-canvas/).
I use some more GLSL to render the state to a pixel buffer,
in a format that can be written to a canvas:

```glsl
#version 450
layout(std430, set = 0, binding = 0) buffer StateMatrix  { uint size; uint cells[]; } state;
layout(std430, set = 0, binding = 1) buffer ScreenMatrix { uint pixels[]; } screen;
uint rgba(uint r, uint g, uint b, uint a) {
    // Note "little-endian" order of uints!
    return a<<24 | b<<16 | g<<8 | r;
}
void main() {
    uint x = gl_GlobalInvocationID.x;
    screen.pixels[x] = state.cells[x] == 0 ? rgba(255,255,255,255) : rgba(0,0,0,255);
}
```

For some reason, the simulation is _really_ slow.
It takes around a second to render this 400px canvas.
Maybe I'm doing something wrong,
or this WebGPU implementation is very inefficient.
I'm sure it would be faster in vanilla JavaScript.

The WebGPU API is pretty low-level.
I needed ~150 lines of JavaScript to run this simulation.
I won't explain it all here -
not least because I don't understand it all.
I recommend reading ["Get started with GPU Compute on the Web"](https://developers.google.com/web/updates/2019/08/get-started-with-gpu-compute-on-the-web#one_last_trick),
which is where I started.

<script type="module">
    const canvas = document.getElementById("example-canvas");
    const ctx = canvas.getContext('2d');

    import glslangModule from "https://unpkg.com/@webgpu/glslang@0.0.8/dist/web-devel/glslang.js";
    (async () => {
        const glslang = await glslangModule();

        const adapter = await navigator.gpu.requestAdapter();
        const device = await adapter.requestDevice();

        const ELEMS = 200;

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
                        uint s(uint i) {
                            return i < stateIn.size ? stateIn.cells[i] : 0;
                        }
                        void main() {
                            uint x = gl_GlobalInvocationID.x;
                            uint n = (s(x-1) << 2) | (s(x) << 1) | s(x+1);
                            uint newState = (n == 6 || n == 5 || n == 3 || n == 2 || n == 1) ? 1 : 0;
                            stateOut.cells[gl_GlobalInvocationID.x] = newState;
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
                        void main() {
                            uint x = gl_GlobalInvocationID.x;
                            screen.pixels[x] = state.cells[x] == 0 ? rgba(255,255,255,255) : rgba(0,0,0,255);
                        }`, "compute")
                }),
                entryPoint: "main"
            }
        });

        const STATE_BUFFER_SIZE_BYTES = Uint32Array.BYTES_PER_ELEMENT * (ELEMS + 1);
        const stateBuffers = [
            (() => {
                const [gpuBuf, arrayBuf] = device.createBufferMapped({ size: STATE_BUFFER_SIZE_BYTES, usage: GPUBufferUsage.STORAGE });
                const uint32Array = new Uint32Array(arrayBuf);
                uint32Array[0] = ELEMS;
                for (let i = 0; i < ELEMS; i++) uint32Array[i+1] = 0;
                uint32Array[199] = 1;  // init state
                gpuBuf.unmap();
                return gpuBuf;
            })(),
            (() => {
                const [gpuBuf, arrayBuf] = device.createBufferMapped({ size: STATE_BUFFER_SIZE_BYTES, usage: GPUBufferUsage.STORAGE });
                const uint32Array = new Uint32Array(arrayBuf);
                uint32Array[0] = ELEMS;
                gpuBuf.unmap();
                return gpuBuf;
            })()
        ];

        const PIXEL_BUFFER_SIZE_BYTES = Uint32Array.BYTES_PER_ELEMENT * ELEMS;
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
            stepStateComputePassEncoder.dispatch(ELEMS);
            stepStateComputePassEncoder.endPass();
    
            const renderComputePassEncoder = commandEncoder.beginComputePass();
            renderComputePassEncoder.setPipeline(renderComputePipeline);
            renderComputePassEncoder.setBindGroup(0, renderBindGroups[dir]);
            renderComputePassEncoder.dispatch(ELEMS);
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

        for (let i = 0; i < 200; i++) {
            await stepState();

            const cells = new Uint8ClampedArray(arrayBuffer);
            const imageData = new ImageData(cells, ELEMS, 1);
            ctx.putImageData(imageData, 0, i);
        }
    })();
</script>
