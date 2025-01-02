import { getRandomInt, maybeDo } from "../../../utils/funcs.ts";
import { GameState } from "../../GameState.ts";
import { TileType } from "../../Tile.ts";
import { Vegetation, VegetationTypes } from "../Vegetation.ts";

const GROW_RANGE = 7;
const GROW_CHANCE = 10;
const PLANT_CHANCE = 3;

const SIZE_VARIETY = 5;
const GROWTH_MAX = 10;

const MAX_PLANT_ATTEMPTS = 3;
const DIE_CHANCE = 5;

const ACCEPTABLE_TYPES: TileType[] = ['dirt', 'steppe'];
export class Greeplant extends Vegetation {

    growthStage: number;
    plantAttempts: number;

    constructor(gameStateRef: GameState, x: number, y: number) {
        super(gameStateRef, x, y);
        this.type = 'greeplant';
        this.growthStage = 1;
        this.plantAttempts = 0;
    }


    process(): void {
        const maxGrowth = this.randInt % SIZE_VARIETY + GROWTH_MAX;
        if (this.growthStage <= maxGrowth) {
            if (maybeDo(GROW_CHANCE)) {
                this.growthStage++;
            }
        } else if (maybeDo(PLANT_CHANCE)) {

            if (this.plantAttempts >= MAX_PLANT_ATTEMPTS) {
                this.die();
            } else {
                this.plantAttempts++;

                let xCoord = maybeDo(50) ? getRandomInt(GROW_RANGE) : -getRandomInt(GROW_RANGE);
                let yCoord = maybeDo(50) ? getRandomInt(GROW_RANGE) : -getRandomInt(GROW_RANGE);

                xCoord = xCoord + this.x;
                yCoord = yCoord + this.y;

                const targetTile = this.gameStateRef.map.tiles[xCoord] ? this.gameStateRef.map.tiles[xCoord][yCoord] : undefined;
                if (targetTile) {
                    if (ACCEPTABLE_TYPES.includes(targetTile.type)) {
                        if (targetTile.vegetations.length === 0) {
                            new Greeplant(this.gameStateRef, xCoord, yCoord);
                        }
                    }
                }
            }
        }
    };

    die(): void{
        //Remove from tile memory
        const tileArr = this.myTile().vegetations;
        const indexToRemove = tileArr.indexOf(this);
        tileArr.splice(indexToRemove, 1);

        //Remove from GameState Memory
        const greeplantArr = this.gameStateRef.vegetations[this.type];
        const idx2rm = greeplantArr.indexOf(this);
        greeplantArr.splice(idx2rm, 1);
    }
}