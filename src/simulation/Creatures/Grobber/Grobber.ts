import { getRandomInt } from "../../../utils/funcs.ts";
import { Creature } from "../Creature.ts";

const MOVE_DEF = 0.01;

export class Grobber extends Creature {
    constructor(x: number, y: number) {
        super(x, y, "Grobber");
    }

    process(): void {
        const r = getRandomInt(4);
        switch (r) {
            case 0:
                this.x += MOVE_DEF;
                break;
            case 1:
                this.x -= MOVE_DEF;
                break;
            case 2:
                this.y += MOVE_DEF;
                break;
            case 3:
                this.y -= MOVE_DEF;
                break;
        }
    }
}
