import { getRandomInt, getRandomIntRange, maybeDo } from '../../../utils/funcs.ts';
import { GameState } from '../../GameState.ts';
import { TileType } from '../../Tile.ts';
import { Vegetation, VegetationTypes } from '../Vegetation.ts';

const GROW_RANGE = 5;
const GROW_CHANCE = 5;
const PLANT_CHANCE = 2;

//8 to 12
const GROWTH_MAX = 8;
const SIZE_VARIETY = 4;

const PLANT_MIN_SIZE = 5;
const MAX_PLANT_ATTEMPTS = 3;

export class Greeplant extends Vegetation {
	static override validTileTypes: TileType[] = ['dirt', 'steppe'];

	growthStage: number;

	constructor(gameStateRef: GameState, x: number, y: number) {
		super(gameStateRef, x, y, 'greeplant');
		this.type = 'greeplant';
		this.growthStage = 1;
	}

	process(): void {
		const maxGrowth = this.randInt % SIZE_VARIETY + GROWTH_MAX;
		if (this.growthStage <= maxGrowth) {
			if (maybeDo(GROW_CHANCE)) {
				this.growthStage++;
			}
		}
		if (this.growthStage > PLANT_MIN_SIZE && maybeDo(PLANT_CHANCE)) {
			let xCoord = getRandomIntRange(-GROW_RANGE, GROW_RANGE) + this.x;
			let yCoord = getRandomIntRange(-GROW_RANGE, GROW_RANGE) + this.y;

			const targetTile = this.gameStateRef.map.tiles[xCoord] ? this.gameStateRef.map.tiles[xCoord][yCoord] : undefined;
			if (targetTile) {
				if (Greeplant.validTileTypes.includes(targetTile.type)) {
					if (targetTile.vegetations.length === 0) {
						new Greeplant(this.gameStateRef, xCoord, yCoord);
						this.growthStage -= 2;
					}
				}
			}
		}
	}

	die(): void {
		//Remove from tile memory
		const tileArr = this.myTile().vegetations;
		const indexToRemove = tileArr.indexOf(this);
		tileArr.splice(indexToRemove, 1);

		//Remove from GameState Memory
		const greeplantArr = this.gameStateRef.vegetations[this.type];
		const idx2rm = greeplantArr.indexOf(this);
		greeplantArr.splice(idx2rm, 1);
	}

	beMunched(munchPower: number): number {
		if (this.growthStage <= munchPower) {
			this.die();
			return this.growthStage;
		} else {
			this.growthStage = this.growthStage - munchPower;
			return munchPower;
		}
	}
}
