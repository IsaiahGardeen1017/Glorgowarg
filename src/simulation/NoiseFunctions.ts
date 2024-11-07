import { getRandomInt } from "../utils/funcs.ts";

function sin(num: number) {
    return Math.sin(num);
}



export class NoiseMaker {
    baseLayer: number[][];
    current: number[][];
    previous: number[][];
    sampleWidth: number;
    constructor(xSize: number, ySize:number, passes = 5, sampleWidth = 7, resolution = 25, iterationalRandomness = 0.05) {
        this.sampleWidth = sampleWidth;

        const ir = iterationalRandomness > 0 && iterationalRandomness <= 1.0 ? iterationalRandomness : 0.0;
        
        //Set Base Layer
        this.baseLayer = [];
        for(let x = 0; x < Math.ceil(xSize/resolution); x++){
            this.baseLayer.push([]);
            for(let y = 0; y < Math.ceil(ySize/resolution); y++){
                this.baseLayer[x].push(Math.random());
            }
        }
        
        //Set Previous
        this.previous = [];
        for(let x = 0; x < xSize; x++){
            this.previous.push([]);
            for(let y = 0; y < ySize; y++){
                const val = this.baseLayer[Math.floor(x/resolution)][Math.floor(y/resolution)];
                this.previous[x].push(val);
            }
        }
        this.current = [];

        //For each pass set calculate current and then set previous to current
        for(let p = 0; p < passes; p++){
            this.current = [];
            for(let x = 0; x < xSize; x++){
                this.current.push([]);
                for(let y = 0; y < ySize; y++){
                    const randDelta = ir > 0 ? (Math.random() * ir) - (ir/2) : 0;
                    this.current[x].push(randDelta + getAverageFromLayer(this.previous, x, y, this.sampleWidth));
                }
            }
            this.previous = this.current;
        }
    }



    get2Dnoise(x: number, y: number): number {
        const val1x = this.current[x][y];
        return val1x;
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
