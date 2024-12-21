import { Creature, CreatureTypes } from "./Creatures/Creature.ts";
import { SimMap } from "./Map.ts";
import { Grobber } from './Creatures/Grobber/Grobber.ts'
import { getRandomInt, getRandomIntRange } from "../utils/funcs.ts";
import { logTiming } from "../loggingFuncs.ts";


export class GameState {
    map: SimMap
    ticks: number

    xSize: number;
    ySize: number;

    creatures: Creature[];

    constructor(xSize: number, ySize: number){
        this.ticks = 0;
        this.map = new SimMap(xSize, ySize);
        this.xSize = xSize;
        this.ySize = ySize;
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
    numGrobbers: 100
}

type InitialCreatureOptions = {
    numGrobbers: number;
}

function generateInitialCreatures(xSize: number, ySize:number, initOps: InitialCreatureOptions): Creature[]{
    let creArr: Creature[] = [];

    //Create Grobbers
    const grobberRange = 0.25;
    for(let i = 0; i < initOps.numGrobbers; i++){
        creArr.push(new Grobber(
            getRandomIntRange(Math.floor((1 - grobberRange) * xSize), Math.floor((grobberRange) * xSize)),
            getRandomIntRange(Math.floor((1 - grobberRange) * ySize), Math.floor((grobberRange) * ySize)),
        ));
    }

    return creArr;
}