import { Creature } from "../Creature.ts";

export class Grobber extends Creature{
    constructor(x: number, y: number){
        super(x, y, 'Grobber');
    }
}