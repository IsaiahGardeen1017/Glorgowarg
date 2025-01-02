import { ResumeTransformFeedback } from "https://deno.land/x/gluten@0.1.3/api/gles23.2.ts";

export function normalizeColor(colArr: number[]){
    for(let i = 0; i < colArr.length; i++){
        colArr[i] = colArr[i] / 255.0
    }
    return colArr;
}

export function GrassGreen(randInt?: number): number[] {
    const r = randInt ? randInt % 20 : 10;
    return [
        125,
        190 + r,
        125,
    ];
}

export function SteppeGreen(randInt?: number): number[] {
    const r = randInt ? randInt % 20 : 10;
    return [
        190,
        200 + r,
        150,
    ];
}

export function WaterBlue(randInt?: number): number[] {
    const r = randInt ? randInt % 10 : 5;
    return [
        50 + r,
        190 + r,
        255,
    ];
}

export function DeepBlue(randInt?: number): number[] {
    const r = randInt ? randInt % 10 : 5;
    return [
        15 + r,
        125 + r,
        175,
    ];
}

export function SpawnColor(): number[] {
    return [
        250,
        0,
        0,
    ];
}

export function DefaultColor(): number[] {
    return [
        50,
        50,
        50,
    ];
}

export function GrobberColor(): number[] {
    return [
        225,
        135,
        130,
    ];
}

export function GreeplantColor(): number[] {
    return [
        30,
        130,
        60
    ]
}