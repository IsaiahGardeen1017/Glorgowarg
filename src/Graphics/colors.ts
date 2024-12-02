import { RGB } from "./colorUtils.ts";



export function GrassGreen(randInt?: number): RGB{
    const r = randInt ? randInt % 20 : 10;
    return {
        r: 125,
        g: 190 + r,
        b: 125
    }
}

export function SteppeGreen(randInt?: number): RGB{
    const r = randInt ? randInt % 20 : 10;
    return {
        r: 190,
        g: 200 + r,
        b: 150
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

export function DeepBlue(randInt?: number): RGB{
    const r = randInt ? randInt % 10 : 5;
    return {
        r: 15 + r,
        g: 125 + r,
        b: 175
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

export function GrobberColor(): RGB{
    return {
        r: 200,
        g: 150,
        b: 200
    }
}


export function normalizeColor(color: RGB): RGB{
    color.r =  color.r / 255.0;
    color.g = color.g / 255.0;
    color.b = color.b / 255.0;
    return color;
}
