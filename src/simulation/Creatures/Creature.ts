import { GameState } from '../GameState.ts';
import { TileType } from '../Tile.ts';

export type CreatureTypes = 'grobber';

export abstract class Creature {
	static validTileTypes: TileType[] = [];

	gameStateRef: GameState;
	x: number;
	y: number;

	type: CreatureTypes;

	constructor(gameStateRef: GameState, x: number, y: number, type: CreatureTypes) {
		this.x = x;
		this.y = y;
		this.type = type;

		this.gameStateRef = gameStateRef;
		this.type = type;

		this.gameStateRef.creatures[this.type].push(this);
	}
    
	die(): void {
        //Remove from GameState Memory
		const greeplantArr = this.gameStateRef.creatures[this.type];
		const idx2rm = greeplantArr.indexOf(this);
		greeplantArr.splice(idx2rm, 1);
	}
    
	myTile() {
        return this.gameStateRef.map.tiles[this.x][this.y];
	}
    
    
    abstract getStatus(): string;
	abstract process(): void;
}
