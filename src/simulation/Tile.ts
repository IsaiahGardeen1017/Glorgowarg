import { getRandomInt } from "../utils/funcs.ts";

export type TileType = 'dirt' | 'water'



export class Tile {
    x: number;
    y: number;

    type?: TileType;

    above?: Tile;
    below?: Tile;
    right?: Tile;
    left?: Tile;

    randInt: number;

    constructor(x: number, y: number){
        this.x = x;
        this.y = y;
        this.randInt = getRandomInt(100000);
    }

    process(){

    }

    allAdjacent(): Tile[] {
        const possibilities: Tile[] = [];
        if (this.above) {
            possibilities.push(this.above);
        }
        if (this.below) {
            possibilities.push(this.below);
        }
        if (this.right) {
            possibilities.push(this.right);
        }
        if (this.left) {
            possibilities.push(this.left);
        }
        return (possibilities);
    }
    
    randomAdjacent(): Tile {
        const possible = this.allAdjacent();
        const selected = possible[getRandomInt(possible.length)];
        return selected;
    }

    getColorOffset(): number {
        return this.randInt % 40;
    }
}



