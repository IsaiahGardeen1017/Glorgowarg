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
                    if(isWater(this.noiseMaker, i, j)){
                        col.push(new Tile(i, j, 'water'));
                    }else{
                        col.push(new Tile(i, j, 'dirt'));
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


function isWater(noiseMaker: NoiseMaker, x: number, y: number){
    let val = noiseMaker.get2Dnoise(x, y);
    if(val > 0.5){
        return true;
    }
    return false;
}