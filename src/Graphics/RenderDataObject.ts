import { GameState } from "../simulation/GameState.ts";
import { GrobberColor } from "./colors.ts";
import { generateCircleCentered } from "./shapeFunctions.ts";


export class RenderDataObject {
    gameState: GameState;
    xSize: number;
    ySize: number;

    constructor(gameState: GameState) {
        this.gameState = gameState;
        this.xSize = gameState.xSize;
        this.ySize = this.gameState.ySize;
    }

    getGrobberInstanceData(): Float32Array{
        return new Float32Array([32]);
    }

    getGrobberSpriteVertices(): Float32Array{
        return generateCircleCentered(
            GrobberColor(),0.5,6,0,0,1.5,
        );
    }

}