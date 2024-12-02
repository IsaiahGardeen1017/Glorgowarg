import { createWindow, mainloop } from "https://deno.land/x/dwm@0.3.7/mod.ts";
import { GameState } from "../simulation/GameState.ts";
import { logItemToFile, logTiming, logVertexArray } from "../loggingFuncs.ts";
import { getMapVertData } from "./shapeFunctions.ts";
import { DeepBlue, normalizeColor } from "./colors.ts";
import { normalize } from "https://deno.land/std@0.97.0/path/win32.ts";
import { RGB } from "./colorUtils.ts";


export async function startWebGpuWindow(game: GameState) {
    logTiming("Starting Web GPU Window");
    const adapter = await navigator.gpu.requestAdapter();
    const device = await adapter!.requestDevice();

    const window = createWindow({
        title: "Deno Window Manager",
        width: 1000,
        height: 1000,
        resizable: true,
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
    let panx = 0 - Math.floor(game.map.xSize / 2);
    let pany = 0 - Math.floor(game.map.ySize / 2);
    let zoomLevel = 1.4;
    let maxZoom = 1.5;
    let minZoom = 0.005;
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
        console.log("pan:" + panx + ',' + pany);
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

    const numFloatsInUniform = 4;
    const uniformBufferSize = numFloatsInUniform * 4 // zoom is 2 32bit floats (4bytes each)
    const uniformBuffer = device.createBuffer({
        size: uniformBufferSize,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    const uniformValues = new Float32Array(uniformBufferSize / 4);

    // offsets to the various uniform values in float32 indices
    const uScalarOffset = 0;
    const uPanOffset = 2;

    uniformValues.set([zoomLevel, zoomLevel], uScalarOffset); // can probably delete
    uniformValues.set([panx, pany], uPanOffset); // can probably delete

    //let tileShapes = getTileShapes(game);

    const vertices = getMapVertData(game);

    //logVertexArray(vertices);

    const vertices2 = new Float32Array([
        //   X,    Y,
        -0.8, -0.8, 1.0,// Triangle 1 (Blue)
        0.0, 1.0, 1.0, 1.0,
        0.8, -0.8, 1.0,
        0.0, 1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,
        0.0, 1.0, 1.0, 1.0,

        -0.8, -0.8, 1.0, // Triangle 2 (Red)
        1.0, 0.0, 0.0, 1.0,
        0.8, 0.8, 1.0,
        1.0, 0.0, 0.0, 1.0,
        -0.8, 0.8, 1.0,
        1.0, 0.0, 0.0, 1.0,
    ]);

    logTiming('Vertices Set');

    const vertexBuffer = device.createBuffer({
        label: "Map Vertices",
        size: vertices.byteLength,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });


    device.queue.writeBuffer(vertexBuffer, /*bufferOffset=*/0, vertices);

    const vertexBufferLayout: GPUVertexBufferLayout = {
        arrayStride: 28, //floats per stride * 4
        attributes: [{
            format: "float32x2",
            offset: 0,
            shaderLocation: 0, // Position, see vertex shader
        }, {
            format: "float32x4",
            offset: 12,
            shaderLocation: 1, // Position, see vertex shader
        }],
    };


    const cellShaderModule = device.createShaderModule({
        label: 'Cell shader',
        code: `

        struct UnfStruct {
            zoom: vec2<f32>,
            pan: vec2<f32>
        };
 
        @group(0) @binding(0) var<uniform> unfStruct: UnfStruct;

        struct VertexInput {
            @location(0) pos: vec3<f32>,
            @location(1) color: vec4<f32>,
        };
            
        struct VertexOutput {
            @builtin(position) pos: vec4<f32>,
            @location(0) color: vec4<f32>,
        };

        @vertex
        fn vertexMain(input: VertexInput) -> VertexOutput {
            var output: VertexOutput;
            output.pos = vec4f((unfStruct.pan.x + input.pos.x) * unfStruct.zoom.x, (unfStruct.pan.x + input.pos.y) * unfStruct.zoom.y, input.pos.z, 1.0);
            output.color = input.color;
            return output;
        }
      
        @fragment
        fn fragmentMain(input: VertexOutput) -> @location(0) vec4<f32> {
            return input.color;
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
        uniformValues.set([panx, pany], uPanOffset); // set the scale
        // copy the values from JavaScript to the GPU
        device.queue.writeBuffer(uniformBuffer, 0, uniformValues);


        let cC = normalizeColor(DeepBlue());
        

        const commandEncoder = device.createCommandEncoder();
        const passEncoder = commandEncoder.beginRenderPass({
            colorAttachments: [
                {
                    view: context.getCurrentTexture().createView(),
                    loadOp: "clear",
                    storeOp: "store",
                    clearValue: { r: cC.r, g: cC.g, b: cC.b, a: 1 },
                },
            ],
        });

        // After encoder.beginRenderPass()

        passEncoder.setPipeline(pipeline);
        passEncoder.setVertexBuffer(0, vertexBuffer);
        passEncoder.setBindGroup(0, bindGroup)
        passEncoder.draw(vertices.length / 7);
        // before pass.end()

        passEncoder.end();
        device.queue.submit([commandEncoder.finish()]);
        surface.present();
    }, false);
}


