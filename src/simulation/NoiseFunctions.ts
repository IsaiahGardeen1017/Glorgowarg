import { getRandomInt } from "../utils/funcs.ts";

function sin(num: number) {
    return Math.sin(num);
}



export class NoiseMaker {
    baseLayer: number[][];
    sampleWidth: number;
    constructor(xSize: number, ySize:number, passes = 3, sampleWidth = 5) {
        this.baseLayer = [];
        this.sampleWidth = sampleWidth;
        for(let x = 0; x < xSize; x++){
            this.baseLayer.push([]);
            for(let y = 0; y < ySize; y++){
                this.baseLayer[x].push(Math.random());
            }
        }
    }



    get2Dnoise(x: number, y: number): number {
        return getAverageFromLayer(this.baseLayer, x, y, this.sampleWidth);
    }
}

export function getAverageFromLayer(layer: number[][], x: number, y: number, sampleWidth: number){
    const values = [];
    for(let i = x - sampleWidth; i < x + sampleWidth + 1; i++){
        for(let j = y - sampleWidth; j < y + sampleWidth + 1; j++){
            if(layer[i] && layer[i][j]){
                values.push(layer[i][j]);
            }
        }
    }

    let sum = 0;
    //Average values
    for(let i = 0; i < values.length; i++){
        sum += values[i];
    }
    return sum/values.length;
}
