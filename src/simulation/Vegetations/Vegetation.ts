import { getRandomInt } from '../../utils/funcs.ts';
import { GameState } from '../GameState.ts';
import { TileType } from '../Tile.ts';

export type VegetationTypes = 'greeplant';

export abstract class Vegetation {
	static validTileTypes: TileType[] = [];

	gameStateRef: GameState;
	randInt: number;
	x: number;
	y: number;

	type: VegetationTypes;

	constructor(gameStateRef: GameState, x: number, y: number, type: VegetationTypes) {
		this.x = Math.floor(x);
		this.y = Math.floor(y);
		this.gameStateRef = gameStateRef;
		this.type = type;
		this.randInt = getRandomInt(1000);

		this.gameStateRef.vegetations[this.type].push(this);
		this.myTile().addVegetation(this);
	}

	abstract process(): void;
	abstract beMunched(munchPower: number): number;

	myTile() {
		return this.gameStateRef.map.tiles[this.x][this.y];
	}
}
