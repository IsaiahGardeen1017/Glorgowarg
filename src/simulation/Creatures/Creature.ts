import { GameState } from '../GameState.ts';

export type CreatureTypes = 'grobber';

export abstract class Creature {
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

	abstract process(): void;
}
