import { getRandomInt } from "../utils/funcs.ts";

function sin(num: number) {
    return Math.sin(num);
}

type intMap = {
    ints: number[][];
}

export class NoiseMaker {
    layers: intMap[];
    constructor(xSize: number, ySize:number, passes = 3, averageWidth = 5) {
        this.layers = [];

        //Set first layer
        this.layers.push({ints: []});
        for (let i = 0; i < xSize; i++) {
            this.layers[0].ints.push([]);
            for(let j = 0; j < ySize; j++){
                this.layers[0].ints[i].push(Math.random()); 
            }
        }

        //passes
        for(let l = 0; l < passes; l++){
            for (let i = 0; i < xSize; i++) {
                this.layers[0].ints.push([]);
                for(let j = 0; j < ySize; j++){
                    //i j is x y
                    //Here we sample previous layer to get average
                    
                    this.layers[0].ints[i].push(Math.random()); 
                }
            }
        }
    }



    get2Dnoise(x: number, y: number): number {
        return Math.random() - 0.5;
    }
}
