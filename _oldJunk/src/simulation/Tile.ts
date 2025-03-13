import { getRandomInt } from "../utils/funcs.ts";
import { Vegetation } from "./Vegetations/Vegetation.ts";

export type TileType = 'dirt' | 'water' | 'spawn' | 'steppe' | 'deep'



export class Tile {
    x: number;
    y: number;

    type: TileType;

    randInt: number;

    vegetations: Vegetation[];

    constructor(x: number, y: number, type: TileType){
        this.x = x;
        this.y = y;
        this.type = type;
        this.randInt = getRandomInt(1000);
        this.vegetations = [];
    }

    addVegetation(v: Vegetation){
        this.vegetations.push(v);
    }
}





