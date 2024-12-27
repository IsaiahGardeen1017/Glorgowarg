import { INT_2_10_10_10_REV, MinSampleShading } from "https://deno.land/x/gluten@0.1.3/api/gles23.2.ts";
import { NoiseMaker } from "./NoiseFunctions.ts";
import { Tile } from "./Tile.ts";
import { perlinNoise2D } from "https://deno.land/x/noise/mod.ts";
import { CHAR_0 } from "https://deno.land/std@0.97.0/path/_constants.ts";

type inputFunc = (tile: Tile) => void;

export class SimMap{
    xSize: number;
    ySize: number;
    tiles: Tile[][];

    noiseMaker?: NoiseMaker;

    constructor(xSize: number, ySize: number){
        this.xSize = xSize;
        this.ySize = ySize;

        this.tiles = [];

        
        this.generateMap();
    }
    
    generateMap(){
        this.noiseMaker = new NoiseMaker(this.xSize, this.ySize);
        
        //Create Tiles
        for (let i = 0; i < this.xSize; i++) {
            const col = [];
            for (let j = 0; j < this.ySize; j++) {
                if(i === Math.floor(this.xSize/2) && j === Math.floor(this.ySize/2)){
                    col.push(new Tile(i, j, 'spawn'));
                }else{
                    const alt = generateAltitude(this, i, j);
                    if(alt > 0.75){
                        col.push(new Tile(i, j, 'steppe'));
                    }else if(alt > 0.50){
                        col.push(new Tile(i, j, 'dirt'));
                    }else if(alt > 0.25){
                        col.push(new Tile(i, j, 'water'));
                    }else{
                        col.push(new Tile(i, j, 'deep'));
                    }
                }
            }
            this.tiles.push(col);
        }
    }

    
    forEachTile(func: inputFunc): void{
        for (let i = 0; i < this.xSize; i++) {
            for (let j = 0; j < this.ySize; j++) {
                func(this.tiles[i][j]);
            }
        }
    }
}

//Keep between 0 and 1
function generateAltitude(map: SimMap, x: number, y: number){
    if(!map.noiseMaker){
        return 0;
    }
    let randVal = map.noiseMaker.get2Dnoise(x, y);
    let ret: number;


    const xMax = map.xSize;
    const yMax = map.ySize;
    const sMax = Math.min(xMax, yMax);

    const xEdgDist = Math.min(x, xMax - x);
    const yEdgDist = Math.min(y, yMax - y);
    const sEdgDist = Math.min(xEdgDist, yEdgDist);

    const percent = Math.min(1.0, sEdgDist / sMax);

    const ADDER = 0.25;

    if(percent < 0.25) {
        ret = (randVal + ADDER) * reScale(percent, 0.25, 1.0);
    }else{
        ret = (randVal + ADDER);
    }

    //a^2 + b^2 = c^2
    // c = ^/()

    //return randVal;

    if(ret > 1.0){
        return 1.0;
    }else if(ret < 0.0){
        return 0.0;
    }else{
        return ret;
    }
}


function reScale(valToScale: number, maxPossible: number, newMax: number): number {
    return (valToScale / maxPossible) * newMax;
}