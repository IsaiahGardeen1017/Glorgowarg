import { INT_2_10_10_10_REV } from "https://deno.land/x/gluten@0.1.3/api/gles23.2.ts";
import { NoiseMaker } from "./NoiseFunctions.ts";
import { Tile } from "./Tile.ts";
import { perlinNoise2D } from "https://deno.land/x/noise/mod.ts";

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

    process(): void{
        this.forEachTile((tile: Tile) => {this.processTile(tile)})
    }

    processTile(tile: Tile): void{

    }
}

//Keep between 0 and 1
function generateAltitude(map: SimMap, x: number, y: number){
    if(!map.noiseMaker){
        return 0;
    }
    let randVal = map.noiseMaker.get2Dnoise(x, y);
    
    const xMidPoint = map.xSize/2;
    const yMidPoint = map.ySize/2;

    const cScale = 1.0;

    const xDistance = (cScale / (map.xSize/2)) * Math.abs(xMidPoint - x);
    const yDistance = (cScale / (map.ySize/2)) * Math.abs(yMidPoint - y);


    //a^2 + b^2 = c^2
    // c = ^/()
    const centralDistanceVal = (1.0 - Math.sqrt(xDistance*xDistance + yDistance*yDistance));

    //return randVal;
    return centralDistanceVal + randVal;
}

