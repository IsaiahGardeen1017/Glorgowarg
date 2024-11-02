import { SimMap } from "./Map.ts";

export class GameState {
    map: SimMap

    constructor(xSize: number, ySize: number){
        this.map = new SimMap(xSize, ySize);
    }

    process(){
        this.map.process();
    }
}