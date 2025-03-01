import { MAX_VARYING_VECTORS } from 'https://deno.land/x/gluten@0.1.3/api/gles23.2.ts';
import { getRandomInt, getRandomIntRange, maybeDo, sameSign } from '../../../utils/funcs.ts';
import { GameState } from '../../GameState.ts';
import { Tile, TileType } from '../../Tile.ts';
import { Creature } from '../Creature.ts';
import { normalize } from '../../../utils/vectorFuncs.ts';
import { Vec2Type } from 'npm:wgpu-matrix';

const MOVE_DEF = 0.05;
const MUNCH_STRENGTH = 5;

const BASE_STOMACH_SIZE = 10;
const REPRODUCTION_COST = 20;
const GROWTH_COST = 10;
const MAX_SIZE = 4;
const STOMACH_PER_SIZE = 5;
const USE_FOOBAR_CHANCE = 0.2;

export class Grobber extends Creature {
	static override validTileTypes: TileType[] = ['dirt', 'steppe', 'spawn'];

	targetX: number | undefined;
	targetY: number | undefined;
	velX: number;
	velY: number;

	lastMunchCandidate: Tile | undefined;

	foodbar: number;
	growth: number;

	constructor(gameState: GameState, x: number, y: number) {
		super(gameState, x, y, 'grobber');
		this.velX = 0;
		this.velY = 0;

		this.foodbar = BASE_STOMACH_SIZE;
		this.growth = 1;
	}

	maybeMove(): void {
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
				//We overshot
				this.targetX = undefined;
				this.targetY = undefined;
				this.velX = 0;
				this.velY = 0;
				return; //Stop
			}
			if (!Grobber.validTileTypes.includes(futureTile.type)) {
				//Cannot traverse to tile
				this.targetX = undefined;
				this.targetY = undefined;
				this.velX = 0;
				this.velY = 0;
				return; //Stop
			} else if (Math.floor(this.x) == Math.floor(this.targetX) && Math.floor(this.y) == Math.floor(this.targetY)) {
				//At our destination
				this.targetX = undefined;
				this.targetY = undefined;
				this.velX = 0;
				this.velY = 0;
				return; //Stop
			} else {
				//Move without issue
				this.x = futX;
				this.y = futY;
			}
		}
	}

	maybeMunch(): void {
		//Munch
		const tile = this.gameStateRef.getTile(Math.floor(this.x), Math.floor(this.y));
		if (this.lastMunchCandidate !== tile) {
			const vegs = tile.vegetations;
			if (vegs.length > 0) {
				const veg = vegs[getRandomInt(vegs.length)];
				veg.beMunched(MUNCH_STRENGTH);
			}
		}
		this.lastMunchCandidate = tile;
	}

	maybeReproduce(): void {
		const stomachSize = BASE_STOMACH_SIZE + (this.growth * STOMACH_PER_SIZE);
		if (this.foodbar > stomachSize) {
			this.foodbar = stomachSize;
			if (this.growth < MAX_SIZE) {
				this.growth++;
				this.foodbar--;
			}
		}

		if (this.growth + 5 > stomachSize && this.growth > REPRODUCTION_COST) {
			new Grobber(this.gameStateRef, this.x, this.y);
			this.foodbar - GROWTH_COST;
		}
	}

	maybeDie(): void {
		if (maybeDo(USE_FOOBAR_CHANCE)) {
			this.foodbar--;
		}
		if (this.foodbar <= 0) {
			this.die();
		}
	}

	process(): void {
		this.maybeMove();
		this.maybeMunch();
		this.maybeReproduce();
		this.maybeDie();
	}
}
