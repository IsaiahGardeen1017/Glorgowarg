import { Creature, CreatureTypes } from './Creatures/Creature.ts';
import { SimMap } from './Map.ts';
import { Grobber } from './Creatures/Grobber/Grobber.ts';
import { getRandomInt, getRandomIntRange } from '../utils/funcs.ts';
import { logTiming } from '../loggingFuncs.ts';
import { Vegetation } from './Vegetations/Vegetation.ts';
import { Greeplant } from './Vegetations/Greeplant/Greeplant.ts';
import { Tile } from './Tile.ts';

export type CreatureObj = {
	[key: string]: Creature[];
};

export type VegetationObj = {
	[key: string]: Vegetation[];
};

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

		this.creatures = { 'grobber': [] };
		this.vegetations = { 'greeplant': [] };
		generateInitialCreatures(this, xSize, ySize, defCreVegOpts);
		generateInitialVegetations(this, xSize, ySize, defCreVegOpts);
		logTiming('Creatures generated');
	}

	getTile(x: number, y: number): Tile {
		return this.map.tiles[x][y];
	}

	process() {
		for (const arrKey in this.creatures) {
			const creatureArray = this.creatures[arrKey];
			for (let i = 0; i < creatureArray.length; i++) {
				creatureArray[i].process();
				console.log(creatureArray[i].getStatus());
			}
		}
		for (const arrKey in this.vegetations) {
			const vegArray = this.vegetations[arrKey];
			for (let i = 0; i < vegArray.length; i++) {
				vegArray[i].process();
			}
		}
		this.ticks++;
	}
}

const defCreVegOpts: InitialCreAndVegOptions = {
	numGrobbers: 10,
	numGreeplants: 75,
};

type InitialCreAndVegOptions = {
	numGrobbers: number;
	numGreeplants: number;
};

function generateInitialCreatures(gameState: GameState, xSize: number, ySize: number, initOps: InitialCreAndVegOptions): CreatureObj {
	let grobberArr: Creature[] = [];

	//Create Grobbers
	const grobberRange = 0.15; //This doesn't work as expected, 0.1 is large, 0.4 is small
	for (let i = 0; i < initOps.numGrobbers; i++) {
		const x = getRandomIntRange(Math.floor((1 - grobberRange) * xSize), Math.floor(grobberRange * xSize));
		const y = getRandomIntRange(Math.floor((1 - grobberRange) * ySize), Math.floor(grobberRange * ySize));
		if (Grobber.validTileTypes.includes(gameState.getTile(x, y).type)) {
			new Grobber(gameState, x, y);
		}
	}
	return {
		'grobber': grobberArr,
	};
}

function generateInitialVegetations(
	gameState: GameState,
	xSize: number,
	ySize: number,
	initOps: InitialCreAndVegOptions,
): VegetationObj {
	let greeplantArr: Vegetation[] = [];

	const greePlantRange = 0.1; //This doesn't work as expected, 0.1 is large, 0.4 is small
	for (let i = 0; i < initOps.numGreeplants; i++) {
		const x = getRandomIntRange(Math.floor((1 - greePlantRange) * xSize), Math.floor(greePlantRange * xSize));
		const y = getRandomIntRange(Math.floor((1 - greePlantRange) * ySize), Math.floor(greePlantRange * ySize));
		if (Greeplant.validTileTypes.includes(gameState.getTile(x, y).type)) {
			greeplantArr.push(
				new Greeplant(gameState, x, y),
			);
		}
	}
	return {
		'greeplant': greeplantArr,
	};
}
