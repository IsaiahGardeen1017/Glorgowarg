import { createWindow, mainloop } from "https://deno.land/x/dwm@0.3.7/mod.ts";
import { GameState } from "../simulation/GameState.ts";

export async function startWebGpuWindow(game: GameState) {
    const adapter = await navigator.gpu.requestAdapter();
    const device = await adapter!.requestDevice();

    const window = createWindow({
        title: "Deno Window Manager",
        width: 1920,
        height: 1080,
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

    const vertexData = new Float32Array([
        // Positions     // Colors
        0.0,
        0.5,
        //0.0,
        1.0,
        0.0,
        0.0, // Top vertex (Red)
        -0.5,
        -0.5,
        //0.0,
        0.0,
        1.0,
        0.0, // Bottom-left vertex (Green)
        0.5,
        -0.5,
        //0.0,
        0.0,
        0.0,
        1.0, // Bottom-right vertex (Blue)
    ]);

    const vertexBuffer = device.createBuffer({
        size: vertexData.byteLength,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        mappedAtCreation: true,
    });

    new Float32Array(vertexBuffer.getMappedRange()).set(vertexData);
    vertexBuffer.unmap();

    const shaderSource = `

   // This vertex shader program gets the vertex color from JavaScript as
   // an attribute. It must pass along that value to the fragment shader,
   // so  color must be one of the outputs of the vertex shader.  But
   // all vertex shaders are required to include @builtin(position)
   // among its outputs, even if the position is not explicitly used
   // by the fragment shader.  In order for the vertex shader output
   // to include two values, position and color, the two values must
   // be bundled into a struct.  Here, a new data type, VertexOutput,
   // is created to specify the data type of the output.

   struct VertexOutput {
      @builtin(position) position: vec4f,
      @location(0) color : vec3f  // @location(0) specifies the ID or position
   }                              // of this value among outputs of the vertex
                                  // shader.  It corresponds to @location(0)
                                  // among inputs to the fragment shader.  Note
                                  // that the correspondence between vertex shader
                                  // outputs and fragment shader inputs is purely
                                  // by location number, not name.  In fact,
                                  // different names ("color" and "fragColor") are used.
    
   
   @vertex
   fn vertexMain(
            @location(0) coords : vec2f,  // @location(0) corresponds to shaderLocation 0 in JavaScript
            @location(1) color : vec3f    // @location(1) corresponds to shaderLocation 1 in JavaScript
         ) -> VertexOutput {  // Note return value of this function is of type VertexOutput
      var output: VertexOutput;   // declares a variable of type VertexOutput
      output.position = vec4f( coords, 0, 1 );
      output.color = color; // passes (interpolated) color to fragment shader 
      return output;
   }
   
   @fragment
   fn fragmentMain(@location(0) fragColor : vec3f) -> @location(0) vec4f{
         // When this shader is called for a vertex in the triangle, the fragColor input
         // corresponds to the color output from the vertex shader.  The correspondence
         // is set up by the @location(0) attribute on the "color" and "fragColor"
         // variables.  Color values from the three vertices of the triangle are
         // interpolated to get the value for the fragColor.
      return vec4f(fragColor,1);
   }
`;


    const vertexCode = `
    @vertex
    fn vs_main(@location(0) position : vec3<f32>, @location(1) color : vec3<f32>) -> @builtin(position) vec4<f32> {
        return vec4<f32>(position, 1.0);
    }
    
    @vertex
    fn vertexMain( @location(0) coords : vec2f ) -> @builtin(position) vec4f {
        return vec4f( coords, 0, 1 );
    }
    `;
    
    const fragmentCode = `
    @fragment
    fn fs_main(@location(1) color : vec4<f32>) -> @location(0) vec4<f32> {
        return vec4<f32>(color);
    }
    `;

    const pipelineLayout = device.createPipelineLayout({
        bindGroupLayouts: [],
    });

    const renderPipeline = device.createRenderPipeline({
        layout: pipelineLayout,
        vertex: {
            module: device.createShaderModule({code: shaderSource}),
            entryPoint: "vertexMain",
            buffers: [
                {
                    arrayStride: 6 * 4, // 6 floats per vertex
                    attributes: [
                        {
                            format: "float32x3", // Position
                            offset: 0,
                            shaderLocation: 0,
                        },
                        {
                            format: "float32x3", // Color
                            offset: 3 * 4, // Offset to the color data
                            shaderLocation: 1,
                        },
                    ],
                },
            ],
        },
        fragment: {
            module: device.createShaderModule({code: shaderSource}),
            entryPoint: "fragmentMain",
            targets: [
                {
                    format: swapChainFormat,
                },
            ],
        },
        primitive: {
            topology: "triangle-list",
        },
    });

    mainloop(() => {
        const commandEncoder = device.createCommandEncoder();
        const passEncoder = commandEncoder.beginRenderPass({
            colorAttachments: [
                {
                    view: context.getCurrentTexture().createView(),
                    loadOp: "clear",
                    storeOp: "store",
                    clearValue: { r: 0, g: 0, b: 0.1, a: 1 },
                },
            ],
        });

        passEncoder.setPipeline(renderPipeline);
        passEncoder.setVertexBuffer(0, vertexBuffer);
        passEncoder.draw(3, 1); // Drawing 3 vertices (triangle)

        passEncoder.end();
        device.queue.submit([commandEncoder.finish()]);
        surface.present();
    }, false);
}
