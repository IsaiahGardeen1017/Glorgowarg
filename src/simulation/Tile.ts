import { getRandomInt } from "../utils/funcs.ts";

export type TileType = 'dirt' | 'water' | 'spawn'



export class Tile {
    x: number;
    y: number;

    type?: TileType;

    randInt: number;

    constructor(x: number, y: number, type: TileType){
        this.x = x;
        this.y = y;
        this.type = type;
        this.randInt = getRandomInt(1000);
    }
}



