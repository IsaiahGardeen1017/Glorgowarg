import { createWindow, mainloop } from "https://deno.land/x/dwm@0.3.7/mod.ts";
import { GameState } from "../simulation/GameState.ts";

export async function startWebGpuWindow(game: GameState) {
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

    const vertices = new Float32Array([
        //   X,    Y,
        -0.8, -0.8, // Triangle 1 (Blue)
        0.8, -0.8,
        1.0, 1.0,

        -0.8, -0.8, // Triangle 2 (Red)
        0.8, 0.8,
        -0.8, 0.8,
    ]);

    const vertexBuffer = device.createBuffer({
        label: "Cell vertices",
        size: vertices.byteLength,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });

    device.queue.writeBuffer(vertexBuffer, /*bufferOffset=*/0, vertices);

    const vertexBufferLayout: GPUVertexBufferLayout = {
        arrayStride: 8,
        attributes: [{
            format: "float32x2",
            offset: 0,
            shaderLocation: 0, // Position, see vertex shader
        }],
    };


    const cellShaderModule = device.createShaderModule({
        label: 'Cell shader',
        code: `


        @vertex
        fn vertexMain(@location(0) pos: vec2f) ->
            @builtin(position) vec4f {
            return vec4f(pos, 0, 1);
        }
      
        @fragment
        fn fragmentMain() -> @location(0) vec4f {
            return vec4f(0, 1, 0, 1);
        }
        `
    });

    const cellPipeline = device.createRenderPipeline({
        label: "Cell pipeline",
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




    mainloop(() => {
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

        passEncoder.setPipeline(cellPipeline);
        passEncoder.setVertexBuffer(0, vertexBuffer);
        passEncoder.draw(vertices.length / 2); // 6 vertices

        // before pass.end()

        passEncoder.end();
        device.queue.submit([commandEncoder.finish()]);
        surface.present();
    }, false);
}
