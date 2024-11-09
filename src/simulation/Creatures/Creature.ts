export type CreatureTypes = 'Grobber'



export abstract class Creature{
    x: number;
    y: number;

    type: CreatureTypes;

    constructor(x: number, y: number, type: CreatureTypes){
        this.x = x;
        this.y = y;
        this.type = type;
    }

    process(){}
}