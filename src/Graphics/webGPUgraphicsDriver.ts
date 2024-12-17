import { createWindow, mainloop } from "https://deno.land/x/dwm@0.3.7/mod.ts";
import { GameState } from "../simulation/GameState.ts";
import { logTiming } from "../loggingFuncs.ts";
import { DeepBlue, normalizeColor } from "./colors.ts";
import { normalize } from "https://deno.land/std@0.97.0/path/win32.ts";
import { RGB } from "./colorUtils.ts";
import { getMapVertData } from "./shapeFunctions.ts";
import { mapKeyToInputAction } from "./KeyMapping.ts";

const simpleShader = await Deno.readTextFile("./src/Graphics/shaders/simple.wgsl");


const spriteVertices = new Float32Array([
    // Positions    // Color (optional)
    -0.5,  0.5, 1.5,    1.0, 1.0, 1.0, 1.0, 
    -0.5, -0.5, 1.5,    1.0, 1.0, 1.0, 1.0,
    0.5, -0.5, 1.5,     1.0, 1.0, 1.0, 1.0,
    0.5,  0.5, 1.5,     1.0, 1.0, 1.0, 1.0,
]);

const instanceData = new Float32Array([
    0.0, 0.0,
    2.0, 2.0,
    10.0, 0.0
]);


export async function startWebGpuWindow(game: GameState) {
    logTiming("Starting Web GPU Window");
    const adapter = await navigator.gpu.requestAdapter();
    const device = await adapter!.requestDevice();

    const window = createWindow({
        title: "Deno Window Manager",
        width: 1920,
        height: 1080,
        resizable: true,
    });

    const { width, height } = window.framebufferSize;

    const aspectRatio = width / height; //Usually less than 1
    const maxZoom = 1.5;
    const minZoom = 0.0005;

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

    const ZOOM_SPEED = 0.1;
    let panx = 0 - Math.floor(game.map.xSize / 2);
    let pany = 0 - Math.floor(game.map.ySize / 2);
    let zoomLevel = 1.4;
    addEventListener("scroll", (evt) => {
        const scrollValue = evt.scrollY; // 1 or -1
        const zoomDelta = zoomLevel * ZOOM_SPEED * scrollValue;
        zoomLevel += zoomDelta;

        if (zoomLevel >= maxZoom) {
            zoomLevel = maxZoom;
        } else if (zoomLevel <= minZoom) {
            zoomLevel = minZoom;
        }
    });

    const PAN_SPEED = 0.01;
    let panningRight = false;
    let panningLeft = false;
    let panningUp = false;
    let panningDown = false;

    addEventListener("keydown", (evt) => {
        const action = mapKeyToInputAction(evt.code);
        if (action === "print-debug") {
            console.log(evt.code);
            console.log("zoom:" + zoomLevel);
            console.log("pan:" + panx + "," + pany);
            const mem = Deno.memoryUsage();
            console.log("rss: " + mem.rss * 0.000001);
            console.log("heapTotal: " + mem.heapTotal * 0.000001);
            console.log("heapUsed: " + mem.heapUsed * 0.000001);
            console.log("external: " + mem.external * 0.000001);
        } else if (action === "pan-left") {
            panningLeft = true;
        } else if (action === "pan-right") {
            panningRight = true;
        } else if (action === "pan-up") {
            panningUp = true;
        } else if (action === "pan-down") {
            panningDown = true;
        }
    });

    addEventListener("keyup", (evt) => {
        const action = mapKeyToInputAction(evt.code);
        if (action === "pan-left") {
            panningLeft = false;
        } else if (action === "pan-right") {
            panningRight = false;
        } else if (action === "pan-up") {
            panningUp = false;
        } else if (action === "pan-down") {
            panningDown = false;
        }
    });

    logTiming("Input handling started");
    // ********************** ^^^ HANDLE INPUT ^^^ **************************************


    const numFloatsInUniform = 4;
    const uniformBufferSize = numFloatsInUniform * 4; // zoom is 2 32bit floats (4bytes each)
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


    const vertices = getMapVertData(game);
    const vertexBuffer = device.createBuffer({
        label: "Map Vertices",
        size: vertices.byteLength,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });
    device.queue.writeBuffer(vertexBuffer, 0, vertices);

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

    const instanceBuffer = device.createBuffer({
        label: "Instance Buffer",
        size: instanceData.byteLength,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });
    device.queue.writeBuffer(instanceBuffer, 0, instanceData);

    const instanceBufferLayout: GPUVertexBufferLayout = {
        arrayStride: 8, // 2 floats per instance (x, y, sx, sy, rotation)
        stepMode: "instance", // Step per instance, not per vertex
        attributes: [
            { format: "float32x2", offset: 0, shaderLocation: 2 },  // Position (x, y) // 2 floats
        ],
    };

    const simpleShaderModule = device.createShaderModule({
        label: "Normal shader",
        code: simpleShader,
    });

    const pipeline = device.createRenderPipeline({
        label: "Pipeline",
        layout: "auto",
        vertex: {
            module: simpleShaderModule,
            entryPoint: "vertexMain",
            buffers: [vertexBufferLayout],
        },
        fragment: {
            module: simpleShaderModule,
            entryPoint: "fragmentMain",
            targets: [{
                format: swapChainFormat,
            }],
        },
    });

    const bindGroup = device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
        entries: [
            { binding: 0, resource: { buffer: uniformBuffer } },
        ],
    });

    logTiming("Buffers/Pipeline Set");

    mainloop(() => {
        let clearColor = normalizeColor(DeepBlue());


        if (panningDown) pany += (PAN_SPEED / zoomLevel);
        if (panningUp) pany -= (PAN_SPEED / zoomLevel);
        if (panningLeft) panx += (PAN_SPEED / zoomLevel);
        if (panningRight) panx -= (PAN_SPEED / zoomLevel);

        uniformValues.set([zoomLevel, zoomLevel * aspectRatio], uScalarOffset);
        uniformValues.set([panx, pany], uPanOffset);
        device.queue.writeBuffer(uniformBuffer, 0, uniformValues);

        const commandEncoder = device.createCommandEncoder();
        const passEncoder = commandEncoder.beginRenderPass({
            colorAttachments: [
                {
                    view: context.getCurrentTexture().createView(),
                    loadOp: "clear",
                    storeOp: "store",
                    clearValue: { r: clearColor.r, g: clearColor.g, b: clearColor.b, a: 1 },
                },
            ],
        });
        passEncoder.setPipeline(pipeline);
        passEncoder.setVertexBuffer(0, vertexBuffer);
        passEncoder.setBindGroup(0, bindGroup);
        passEncoder.draw(vertices.length / 7);
        passEncoder.end();
        device.queue.submit([commandEncoder.finish()]);
        surface.present();
    }, false);
}
