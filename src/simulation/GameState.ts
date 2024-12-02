import { HexToRGB } from "../Graphics/colorUtils.ts";import { Creature, CreatureTypes } from "./Creatures/Creature.ts";
import { SimMap } from "./Map.ts";
import { Grobber } from './Creatures/Grobber/Grobber.ts'
import { getRandomInt } from "../utils/funcs.ts";
import { logTiming } from "../loggingFuncs.ts";


export class GameState {
    map: SimMap
    ticks: number

    creatures: Creature[];

    constructor(xSize: number, ySize: number){
        this.ticks = 0;
        this.map = new SimMap(xSize, ySize);
        logTiming('Map generated');
        
        this.creatures = generateInitialCreatures(xSize, ySize, defCreOpts);
        logTiming('Creatures generated');
    }

    process(){
        for(let i = 0; i < this.creatures.length; i++){
            this.creatures[i].process();
        }
        this.map.process();
        this.ticks++;
    }
}


const defCreOpts: InitialCreatureOptions = {
    numGrobbers: 10
}

type InitialCreatureOptions = {
    numGrobbers: number;
}

function generateInitialCreatures(xSize: number, ySize:number, initOps: InitialCreatureOptions): Creature[]{
    let creArr: Creature[] = [];

    //Create Grobbers
    for(let i = 0; i < initOps.numGrobbers; i++){
        creArr.push(new Grobber(
            getRandomInt(Math.floor(xSize/4)),
            getRandomInt(Math.floor(ySize/4))
        ));
    }

    return creArr;
}