import { HexToRGB } from "../Graphics/colorUtils.ts";
import { generateSquareCentered, Shape, shiftShape } from "../Graphics/shapeFunctions.ts";
import { SimMap } from "./Map.ts";

export class GameState {
    map: SimMap
    ticks: number


    constructor(xSize: number, ySize: number){
        this.ticks = 0;
        this.map = new SimMap(xSize, ySize);
    }

    process(){
        this.map.process();
        this.ticks++;
    }

}