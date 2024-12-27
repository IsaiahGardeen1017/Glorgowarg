import { maybeDo } from "../../../utils/funcs.ts";
import { GameState } from "../../GameState.ts";
import { Vegetation } from "../Vegetation.ts";


export class Greeplant extends Vegetation {

    growChance = 10;
    growthStage: number;


    constructor(gameStateRef: GameState, x: number, y: number) {
        super(gameStateRef, x, y);
        this.type = 'greeplant';
        this.growthStage = 1;
    }


    process(): void {
        if (this.growthStage <= 10) {
            if (maybeDo(this.growChance)) {
                this.growthStage++;
            }
        }

    };
}