export type VegetationTypes = 'grass'



export class Vegetation{
    x: number;
    y: number;

    skin: VegetationTypes;

    constructor(x: number, y: number){
        this.x = x;
        this.y = y;
        this.skin = 'grass';
    }
}