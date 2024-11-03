import { HexToRGB } from "../Graphics/colorUtils.ts";
import { generateSquareCentered, Shape, shiftShape } from "../Graphics/shapeFunctions.ts";
import { SimMap } from "./Map.ts";


export type RenderContext = {
    zoom: number;
    xPan: number;
    yPan: number;
}


export class GameState {
    map: SimMap
    renderContext: RenderContext
    testCube: Shape
    ticks: number


    constructor(xSize: number, ySize: number){
        this.ticks = 0;
        this.map = new SimMap(xSize, ySize);
        this.renderContext = {
            zoom: 1.0,
            xPan: 0,
            yPan: 0,
        }
        const color = HexToRGB('#5f9c6d');
        this.testCube = generateSquareCentered(color, 0.25);
    }

    process(){
        this.ticks++;
    }

    getShapesToRender(): Shape[]{
        return [shiftShape(this.testCube, Math.sin(this.ticks/100)/2, Math.cos(this.ticks/100)/2)];
    }

}