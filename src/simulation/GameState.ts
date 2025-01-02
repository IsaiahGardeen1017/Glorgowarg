import { Creature, CreatureTypes } from "./Creatures/Creature.ts";
import { SimMap } from "./Map.ts";
import { Grobber } from './Creatures/Grobber/Grobber.ts'
import { getRandomInt, getRandomIntRange } from "../utils/funcs.ts";
import { logTiming } from "../loggingFuncs.ts";
import { Vegetation } from "./Vegetations/Vegetation.ts";
import { Greeplant } from "./Vegetations/Greeplant/Greeplant.ts";

export type CreatureObj = {
    [key: string]: Creature[];
}

export type VegetationObj = {
    [key: string]: Vegetation[];
}

export class GameState {
    map: SimMap;
    ticks: number;

    xSize: number;
    ySize: number;

    creatures: CreatureObj;
    vegetations: VegetationObj;

    constructor(xSize: number, ySize: number) {
        this.ticks = 0;
        this.map = new SimMap(xSize, ySize);
        this.xSize = xSize;
        this.ySize = ySize;
        logTiming('Map generated');

        this.creatures = {'grobber': []};
        this.vegetations = {'greeplant': []};
        generateInitialCreatures(xSize, ySize, defCreVegOpts);
        generateInitialVegetations(this, xSize, ySize, defCreVegOpts);
        logTiming('Creatures generated');
    }

    process() {
        for (const arrKey in this.creatures) {
            let creatureArray = this.creatures[arrKey];
            for (let i = 0; i < creatureArray.length; i++) {
                creatureArray[i].process();
            }
        }
        for (const arrKey in this.vegetations) {
            let creatureArray = this.vegetations[arrKey];
            for (let i = 0; i < creatureArray.length; i++) {
                creatureArray[i].process();
            }
        }
        this.ticks++;
    }
}


const defCreVegOpts: InitialCreAndVegOptions = {
    numGrobbers: 10,
    numGreeplants: 10
}

type InitialCreAndVegOptions = {
    numGrobbers: number;
    numGreeplants: number;
}

function generateInitialCreatures(xSize: number, ySize: number, initOps: InitialCreAndVegOptions): CreatureObj {
    let grobberArr: Creature[] = [];

    //Create Grobbers
    const grobberRange = 0.25;
    for (let i = 0; i < initOps.numGrobbers; i++) {
        grobberArr.push(new Grobber(
            getRandomIntRange(Math.floor((1 - grobberRange) * xSize), Math.floor((grobberRange) * xSize)),
            getRandomIntRange(Math.floor((1 - grobberRange) * ySize), Math.floor((grobberRange) * ySize)),
        ));
    }

    return {
        'grobber': grobberArr
    }
}

function generateInitialVegetations(gameState:GameState, xSize: number, ySize: number, initOps: InitialCreAndVegOptions): VegetationObj {
    let greeplantArr: Vegetation[] = [];

    const greePlantRange = 0.25;
    for (let i = 0; i < initOps.numGreeplants; i++) {
        greeplantArr.push(new Greeplant(
            gameState,
            getRandomIntRange(Math.floor((1 - greePlantRange) * xSize), Math.floor((greePlantRange) * xSize)),
            getRandomIntRange(Math.floor((1 - greePlantRange) * ySize), Math.floor((greePlantRange) * ySize)),
        ));
    }

    return {
        'greeplant': greeplantArr
    }
}