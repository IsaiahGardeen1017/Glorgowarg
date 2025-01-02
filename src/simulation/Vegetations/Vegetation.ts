import { getRandomInt } from "../../utils/funcs.ts";
import { GameState } from "../GameState.ts";

export type VegetationTypes = 'greeplant'



export abstract class Vegetation{
    gameStateRef: GameState;
    randInt: number;
    x: number;
    y: number;

    type: VegetationTypes;

    constructor(gameStateRef: GameState, x: number, y: number){
        this.x = Math.floor(x);
        this.y = Math.floor(y);
        this.gameStateRef = gameStateRef;
        this.type = 'greeplant';
        this.randInt = getRandomInt(1000);

        this.gameStateRef.vegetations[this.type].push(this);
        this.myTile().addVegetation(this);
    }

    abstract process(): void;

    myTile(){
        return this.gameStateRef.map.tiles[this.x][this.y];
    }
}