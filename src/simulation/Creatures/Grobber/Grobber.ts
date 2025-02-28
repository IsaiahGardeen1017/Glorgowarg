import { MAX_VARYING_VECTORS } from 'https://deno.land/x/gluten@0.1.3/api/gles23.2.ts';
import { getRandomInt, getRandomIntRange, sameSign } from '../../../utils/funcs.ts';
import { GameState } from '../../GameState.ts';
import { TileType } from '../../Tile.ts';
import { Creature } from '../Creature.ts';
import { normalize } from '../../../utils/vectorFuncs.ts';

const MOVE_DEF = 0.05;

const traversableTypes: TileType[] = ['dirt', 'steppe', 'spawn'];

export class Grobber extends Creature {
	targetX: number | undefined;
	targetY: number | undefined;
	velX: number;
	velY: number;

	constructor(gameState: GameState, x: number, y: number) {
		super(gameState, x, y, 'grobber');
		this.velX = 0;
		this.velY = 0;
	}

	process(): void {
		if (!this.targetX || !this.targetY) {
			//Decide a direction
			this.targetX = Math.floor(this.x + getRandomIntRange(-10, 10));
			this.targetY = Math.floor(this.y + getRandomIntRange(-10, 10));
			let xDir = this.targetX - this.x;
			let yDir = this.targetY - this.y;
			const velVec = normalize({ x: xDir, y: yDir });
			this.velX = velVec.x;
			this.velY = velVec.y;
		} else {
			//move
			const futX = this.x + (this.velX * MOVE_DEF);
			const futY = this.y + (this.velY * MOVE_DEF);
			const futureTile = this.gameStateRef.getTile(Math.floor(futX), Math.floor(futY));
			let xOvershoot = futX - this.targetX;
			let yOvershoot = futY - this.targetY;
			if (sameSign(xOvershoot, this.velX) || sameSign(yOvershoot, this.velY)) {
				console.log('overshot');
				//Overshot
				this.targetX = undefined;
				this.targetY = undefined;
				this.velX = 0;
				this.velY = 0;
				return; //Stop
			}
			//console.log(`fut: ${futX} | ${futY}`);
			//console.log(`cur: ${this.x} | ${this.y}`);
			//console.log(`targ: ${this.targetX} | ${this.targetY}`);
			//console.log(`over: ${xOvershoot} | ${yOvershoot}`);
			if (!traversableTypes.includes(futureTile.type)) {
				this.targetX = undefined;
				this.targetY = undefined;
				this.velX = 0;
				this.velY = 0;
				return; //Stop
			} else if (Math.floor(this.x) == Math.floor(this.targetX) && Math.floor(this.y) == Math.floor(this.targetY)) {
				this.targetX = undefined;
				this.targetY = undefined;
				this.velX = 0;
				this.velY = 0;
				return; //Stop
			} else {
				this.x = futX;
				this.y = futY;
			}
		}
	}
}
