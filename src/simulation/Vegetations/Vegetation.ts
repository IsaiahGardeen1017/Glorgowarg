import { GameState } from "../GameState.ts";

export type VegetationTypes = 'greeplant'



export abstract class Vegetation{
    gameStateRef: GameState,
    x: number;
    y: number;

    type: VegetationTypes;

    constructor(gameStateRef: GameState, x: number, y: number){
        this.x = x;
        this.y = y;
        this.gameStateRef = gameStateRef;
        this.type = 'greeplant';
    }

    abstract process(): void;
}