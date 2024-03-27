---
title: OpenCL essential calls
draft: true
tags: []
---

Yesterday I distilled a "hello world" C program which uses the OpenCL framework. 
Let's see the essential calls that that program makes.

Everything is in `<OpenCL/opencl.h>`. 
We make this available by compiling with `-framework OpenCL`.

First our program finds our GPU, 
using [`clGetDeviceIDs`](https://www.khronos.org/registry/OpenCL/sdk/1.0/docs/man/xhtml/clGetDeviceIDs.html).
(The Khronos site seems to be the canonical reference for OpenCL.) 
The `clGetDeviceIDs` call can find any and all available OpenCL devices, 
but we ask it for just one GPU device. 
We get back a `cl_device_id`, 
which is an opaque identifier type.

Next we create a _context_ with `clCreateContext`. 
A context associates multiple devices, but we just give it one device: our GPU. 
We get back a `cl_context`. 
We pass this context in to many future calls.

Next we create a _command queue_ with `clCreateCommandQueue`. 
We pass in our GPU's device ID: 
all commands that we queue here will be processed by our GPU.

Next comes a set of three calls to compile our OpenCL kernel. 
First we do `clCreateProgramWithSource`, passing in the source code to our context. 
Our OpenCL source looks like:

```c
__kernel void square(__global float* input, __global float* output, const unsigned int count) {
   int i = get_global_id(0);
   if(i < count) { output[i] = input[i] * input[i]; }
}
```

This gives us a `cl_program`. 
Our program is not yet built; 
to do that, we call `clBuildProgram`. 
Finally we extract a _kernel_ from the program using `clCreateKernel`, 
passing the string `"square"`. 
A kernel is a function in a program. 
We get the kernel for the function `square`, as type `cl_kernel`. 
We don't refer to the `cl_program` again; 
we only use it to get the `cl_kernel`.

Next, we create two _buffers_ - contiguous memory regions - with `clCreateBuffer`. 
One is an input buffer, the other an output buffer. 
We'll use these to communicate with the kernel function: 
the buffers correspond to the `input` and `output` arguments to the kernel function. 
These buffers are managed by OpenCL. 
We specify the size of these buffers. 
Both are set to 1024 `float`s.

Next we write to the input buffer, 
in preparation for calling the kernel. 
We write to the input buffer with `clEnqueueWriteBuffer`. 
This command queues a command on the command queue we created earlier. 
The `clEnqueueWriteBuffer` command takes a buffer (our input buffer) 
and a pointer to some data which we want to copy to the buffer. 
We've pre-filled this buffer with the numbers 0..1023.

We specify that the `clEnqueueWriteBuffer` call should be _blocking_. 
This means the call will not return until the job has completed on the command queue.

Next we set the arguments to the kernel using `clSetKernelArg`. 
The kernel has three arguments, `input`, `output` and `count`. 
We refer to the arguments numerically: 0, 1, and 2. 
We set `input` to our input buffer (which we just filled), 
and we set `output` to the output buffer (which the kernel will fill when we call it).
