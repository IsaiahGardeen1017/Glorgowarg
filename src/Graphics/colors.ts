import { RGB } from "./colorUtils.ts";



export function GrassGreen(randInt?: number): RGB{
    const r = randInt ? randInt % 20 : 10;
    return {
        r: 125,
        g: 190 + r,
        b: 125
    }
}

export function WaterBlue(randInt?: number): RGB{
    const r = randInt ? randInt % 10 : 5;
    return {
        r: 50 + r,
        g: 190 + r,
        b: 255
    }
}

export function SpawnColor(): RGB{
    return {
        r: 250,
        g: 0,
        b: 0
    }
}

export function DefaultColor(): RGB{
    return {
        r: 50,
        g: 50,
        b: 50
    }
}