import init from "https://deno.land/std@0.97.0/hash/_wasm/wasm.js";
import { GameState, VegetationObj } from "../simulation/GameState.ts";
import { GrobberColor } from "./colors.ts";
import { generateCircleCentered } from "./shapeFunctions.ts";

export interface PipelineBundle {
  instanceBindGroup: GPUBindGroup;
  instanceBuffer: GPUBuffer;
  spriteVertexBuffer: GPUBuffer;
  instancePipeline: GPURenderPipeline;

}
export abstract class RenderDataObject {

    descriptor = 'Abstract RDO';
    maxInstances = 1;

    gameState: GameState;

    pipes: PipelineBundle;

    _device: GPUDevice;
    _spriteVertices: Float32Array;
    _instanceBuffer: GPUBuffer;
    _vertexBuffer: GPUBuffer;
    _instancesData: Float32Array;
    instancesData: any;

    constructor(gameState: GameState, device: GPUDevice, pipelines: PipelineBundle) {
        this._device = device;
        this._spriteVertices = this.initSpriteVertices();
        this.gameState = gameState;

        this._vertexBuffer = device.createBuffer({
            label: `${this.descriptor} Vertex Buffer`,
            size: this._spriteVertices.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        });
        device.queue.writeBuffer(this._vertexBuffer, 0, this._spriteVertices);
        this._instanceBuffer = device.createBuffer({
            label: `${this.descriptor} Instance Buffer`,
            size: this.maxInstances * 8,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        });


        this._instancesData = new Float32Array();
        this.pipes = pipelines;
    }


    abstract initSpriteVertices(): Float32Array;
    
    setPipelines(){

    }

    writeBuffers(){
        const instancesData = this.compileInstanceData();
        this._device.queue.writeBuffer(this._instanceBuffer, 0, instancesData);
    }

    draw(passEncoder: GPURenderPassEncoder){
        passEncoder.setPipeline(this.pipes.instancePipeline);
        passEncoder.setVertexBuffer(0, this.pipes.spriteVertexBuffer); // Sprite vertices
        passEncoder.setVertexBuffer(1, this.pipes.instanceBuffer); // Instance data
        passEncoder.setBindGroup(0, this.pipes.instanceBindGroup);
        passEncoder.draw(this._spriteVertices.length / 7, this.instancesData.length / 2); // Number of instances

    }

    abstract compileInstanceData(): Float32Array;
}