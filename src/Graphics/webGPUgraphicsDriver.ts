import { createWindow, mainloop } from "https://deno.land/x/dwm@0.3.7/mod.ts";
import { GameState } from "../simulation/GameState.ts";
import { logTiming } from "../loggingFuncs.ts";

export async function startWebGpuWindow(game: GameState) {
    logTiming("Starting Web GPU Window");
    const adapter = await navigator.gpu.requestAdapter();
    const device = await adapter!.requestDevice();

    const window = createWindow({
        title: "Deno Window Manager",
        width: 750,
        height: 500,
        resizable: false,
    });

    const { width, height } = window.framebufferSize;
    const surface = window.windowSurface();
    const context = surface.getContext("webgpu");

    const swapChainFormat = "bgra8unorm";
    context.configure({
        device,
        format: swapChainFormat,
    });

    logTiming("Initial setup complete");
    // ************************** HANDLE INPUT **************************************
    //Handle input
    let zoomLevel = 10;
    let maxZoom = 100;
    let minZoom = 0.05;
    addEventListener("scroll", (evt) => {
        const scrollValue = evt.scrollY; // 1 or -1
        const zoomDelta = zoomLevel * 0.1 * scrollValue;
        zoomLevel += zoomDelta;

        if (zoomLevel >= maxZoom) {
            zoomLevel = maxZoom;
        } else if (zoomLevel <= minZoom) {
            zoomLevel = minZoom;
        }
    });

    addEventListener("keydown", (evt) => {
        console.log(evt.code);
        console.log("zoom:" + zoomLevel);
        const mem = Deno.memoryUsage();
        console.log("rss: " + mem.rss * 0.000001);
        console.log("heapTotal: " + mem.heapTotal * 0.000001);
        console.log("heapUsed: " + mem.heapUsed * 0.000001);
        console.log("external: " + mem.external * 0.000001);
    });

    let panX = game.map.xSize / -2.0;
    let panY = game.map.ySize / -2.0;
    logTiming("Input handling started");
    // ********************** ^^^ HANDLE INPUT ^^^ **************************************

    const uniformBufferSize = 2 * 4 // zoom is 2 32bit floats (4bytes each)
    const uniformBuffer = device.createBuffer({
        size: uniformBufferSize,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    const uniformValues = new Float32Array(uniformBufferSize / 4);

    // offsets to the various uniform values in float32 indices
    const uScalarOffset = 0;

    uniformValues.set([0.5, 0.5], uScalarOffset);  // set the scalar


    const vertices = new Float32Array([
        //   X,    Y,
        -0.8, -0.8, // Triangle 1 (Blue)
        0.0, 1.0, 1.0, 1.0,
        0.8, -0.8,
        0.0, 1.0, 1.0, 1.0,
        1.0, 1.0,
        0.0, 1.0, 1.0, 1.0,

        -0.8, -0.8, // Triangle 2 (Red)
        1.0, 0.0, 0.0, 1.0,
        0.8, 0.8,
        1.0, 0.0, 0.0, 1.0,
        -0.8, 0.8,
        1.0, 0.0, 0.0, 1.0,
    ]);

    logTiming('Vertices Set');

    const vertexBuffer = device.createBuffer({
        label: "Cell vertices",
        size: vertices.byteLength,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });


    device.queue.writeBuffer(vertexBuffer, /*bufferOffset=*/0, vertices);

    const vertexBufferLayout: GPUVertexBufferLayout = {
        arrayStride: 24,
        attributes: [{
            format: "float32x2",
            offset: 0,
            shaderLocation: 0, // Position, see vertex shader
        }, {
            format: "float32x2",
            offset: 8,
            shaderLocation: 1, // Position, see vertex shader
        }],
    };


    const cellShaderModule = device.createShaderModule({
        label: 'Cell shader',
        code: `

        struct UnfStruct {
            zoom: vec2f,
        };
 
        @group(0) @binding(0) var<uniform> unfStruct: UnfStruct;

        struct VertexInput {
            @location(0) pos: vec2f,
            @location(1) color: vec4f,
        };
            
        struct VertexOutput {
            @builtin(position) pos: vec4f,
            @location(0) color: vec4f,
        };

        @vertex
        fn vertexMain(input: VertexInput) -> VertexOutput {
            var output: VertexOutput;
            output.pos = vec4f(input.pos.x * unfStruct.zoom.x, input.pos.y * unfStruct.zoom.y, 0.0, 1.0);
            output.color = input.color;
            return output;
        }
      
        @fragment
        fn fragmentMain(input: VertexOutput) -> @location(0) vec4f {
            return vec4f(input.color);
        }
        `
    });

    const pipeline = device.createRenderPipeline({
        label: "Pipeline",
        layout: "auto",
        vertex: {
            module: cellShaderModule,
            entryPoint: "vertexMain",
            buffers: [vertexBufferLayout]
        },
        fragment: {
            module: cellShaderModule,
            entryPoint: "fragmentMain",
            targets: [{
                format: swapChainFormat
            }]
        }
    });

    const bindGroup = device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: { buffer: uniformBuffer }},
        ],
      });

    logTiming('Buffers/Pipeline Set');



    mainloop(() => {

        uniformValues.set([zoomLevel, zoomLevel], uScalarOffset); // set the scale
        // copy the values from JavaScript to the GPU
        device.queue.writeBuffer(uniformBuffer, 0, uniformValues);

        const commandEncoder = device.createCommandEncoder();
        const passEncoder = commandEncoder.beginRenderPass({
            colorAttachments: [
                {
                    view: context.getCurrentTexture().createView(),
                    loadOp: "clear",
                    storeOp: "store",
                    clearValue: { r: 0, g: 0.5, b: 0, a: 1 },
                },
            ],
        });

        // After encoder.beginRenderPass()

        passEncoder.setPipeline(pipeline);
        passEncoder.setVertexBuffer(0, vertexBuffer);
        passEncoder.setBindGroup(0, bindGroup)
        passEncoder.draw(vertices.length / 6); // 6 vertices

        // before pass.end()

        passEncoder.end();
        device.queue.submit([commandEncoder.finish()]);
        surface.present();
    }, false);
}
