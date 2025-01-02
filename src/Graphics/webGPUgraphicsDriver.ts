import { createWindow, mainloop } from "https://deno.land/x/dwm@0.3.7/mod.ts";
import { GameState } from "../simulation/GameState.ts";
import { logTiming } from "../loggingFuncs.ts";
import { DeepBlue, GreeplantColor, GrobberColor, normalizeColor } from "./colors.ts";
import { normalize } from "https://deno.land/std@0.97.0/path/win32.ts";
import { generateCircleCentered, generateStarCentered, getMapVertData } from "./shapeFunctions.ts";
import { mapKeyToInputAction } from "./KeyMapping.ts";
import { getGreeplantInstanceData, getGrobberInstanceData } from "./creatureSpecific/grobber.ts";
import { play } from "https://deno.land/x/audio@0.2.0/mod.ts";
import { existsSync } from "https://deno.land/std@0.157.0/fs/mod.ts";

const simpleShader = await Deno.readTextFile(
    "./src/Graphics/shaders/simple.wgsl",
);
const instanceShader = await Deno.readTextFile(
    "./src/Graphics/shaders/instance.wgsl",
);




export async function startWebGpuWindow(gameState:GameState) {
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

    //Grobber
    const spriteVertices = generateStarCentered(
        normalizeColor(GreeplantColor()),
        0.5,
        0.25,
        8,
        0,0,1.1,
    );

    const swapChainFormat = "bgra8unorm";
    context.configure({
        device,
        format: swapChainFormat,
    });

    logTiming("Initial setup complete");
    // ************************** HANDLE INPUT **************************************
    //Handle input

    const ZOOM_SPEED = 0.1;
    let panx = 0 - Math.floor(gameState.xSize / 2);
    let pany = 0 - Math.floor(gameState.ySize / 2);
    let zoomLevel = 0.014;
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

    const vertices = getMapVertData(gameState);
    const mapVertexBuffer = device.createBuffer({
        label: "Map Vertices",
        size: vertices.byteLength,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });
    device.queue.writeBuffer(mapVertexBuffer, 0, vertices);

    const spriteVertexBuffer = device.createBuffer({
        label: "Instance Vertices",
        size: spriteVertices.byteLength,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });
    device.queue.writeBuffer(spriteVertexBuffer, 0, spriteVertices);

    const maxCreatures = 1000000;
    const instanceBuffer = device.createBuffer({
        label: "Instance Buffer",
        size: maxCreatures * 8,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });
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
    const simpleShaderModule = device.createShaderModule({
        label: "Simple shader",
        code: simpleShader,
    });
    const simplePipeline = device.createRenderPipeline({
        label: "Pipeline for static shapes",
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

    const instanceBufferLayout: GPUVertexBufferLayout = {
        arrayStride: 16, // 4 floats per instance 
        stepMode: "instance", // Step per instance, not per vertex
        attributes: [
            { format: "float32x2", offset: 0, shaderLocation: 2 }, // Position (x, y) // 2 floats
            { format: "float32x2", offset: 8, shaderLocation: 3 }, // Scale (x, y) // 2 floats
        ],
    };
    const instanceShaderModule = device.createShaderModule({
        label: "Instance shader",
        code: instanceShader,
    });
    const instancePipeline = device.createRenderPipeline({
        label: "Sprite Pipeline",
        layout: "auto",
        vertex: {
            module: instanceShaderModule, // Different shader for sprites
            entryPoint: "vertexMain",
            buffers: [vertexBufferLayout, instanceBufferLayout], // Includes instance data
        },
        fragment: {
            module: instanceShaderModule,
            entryPoint: "fragmentMain",
            targets: [{
                format: swapChainFormat,
            }],
        },
    });

    const simpleBindGroup = device.createBindGroup({
        layout: simplePipeline.getBindGroupLayout(0),
        entries: [
            { binding: 0, resource: { buffer: uniformBuffer } },
        ],
    });

    const instanceBindGroup = device.createBindGroup({
        layout: instancePipeline.getBindGroupLayout(0),
        entries: [
            { binding: 0, resource: { buffer: uniformBuffer } },
        ],
    });

    logTiming("Buffers/Pipeline Set");

    let frameCount = 0;
    let fpsCounterTotal = 0;
    let lastFtime = 0;
    const FPS_SMAPLE_RATE = 200;

    const simTimeGap = 1000 / 20;
    let lastSimTime = Date.now();
    mainloop(() => {
        frameCount++;
        let fTime = Date.now();
        let frameLength = fTime - lastFtime;
        fpsCounterTotal += frameLength;
        if (frameCount % FPS_SMAPLE_RATE === 0) {
            const fps = FPS_SMAPLE_RATE / (fpsCounterTotal / 1000);
            console.log(fps);
            fpsCounterTotal = 0;
        }
        lastFtime = fTime;

        if(fTime - lastSimTime >= simTimeGap){
            lastSimTime = fTime;
            gameState.process();
        }
      
        if (panningDown) pany += PAN_SPEED / zoomLevel;
        if (panningUp) pany -= PAN_SPEED / zoomLevel;
        if (panningLeft) panx += PAN_SPEED / zoomLevel;
        if (panningRight) panx -= PAN_SPEED / zoomLevel;

        uniformValues.set([zoomLevel, zoomLevel * aspectRatio], uScalarOffset);
        uniformValues.set([panx, pany], uPanOffset);
        device.queue.writeBuffer(uniformBuffer, 0, uniformValues);


//        const instancesData = getGrobberInstanceData(gameState);
        const instancesData = getGreeplantInstanceData(gameState);
        device.queue.writeBuffer(instanceBuffer, 0, instancesData);

        const commandEncoder = device.createCommandEncoder();
        let clearColor = normalizeColor(DeepBlue());
        const passEncoder = commandEncoder.beginRenderPass({
            colorAttachments: [
                {
                    view: context.getCurrentTexture().createView(),
                    loadOp: "clear",
                    storeOp: "store",
                    clearValue: {
                        r: clearColor[0],
                        g: clearColor[1],
                        b: clearColor[2],
                        a: 1,
                    },
                },
            ],
        });
        passEncoder.setPipeline(simplePipeline);
        passEncoder.setVertexBuffer(0, mapVertexBuffer);
        passEncoder.setBindGroup(0, simpleBindGroup);
        passEncoder.draw(vertices.length / 7);

        passEncoder.setPipeline(instancePipeline);
        passEncoder.setVertexBuffer(0, spriteVertexBuffer); // Sprite vertices
        passEncoder.setVertexBuffer(1, instanceBuffer); // Instance data
        passEncoder.setBindGroup(0, instanceBindGroup);
        passEncoder.draw(spriteVertices.length / 7, instancesData.length / 2); // Number of instances

        passEncoder.end();
        device.queue.submit([commandEncoder.finish()]);
        surface.present();
    }, false);
}
