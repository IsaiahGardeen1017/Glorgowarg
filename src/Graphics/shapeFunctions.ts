import { SHADER_TYPE } from "https://deno.land/x/gluten@0.1.3/api/gles23.2.ts";
import { HexToRGB, normalizeColor, RGB, rgb, RGBToGLRGB } from "./colorUtils.ts";
import { GameState } from "../simulation/GameState.ts";
import { Tile } from "../simulation/Tile.ts";
import {
    DeepBlue,
    DefaultColor,
    GrassGreen,
    GrobberColor,
    SpawnColor,
    SteppeGreen,
    WaterBlue,
} from "./colors.ts";
import { Creature } from "../simulation/Creatures/Creature.ts";

//Gets array of Shapes from GameState
export function getMapVertData(gameState: GameState): Float32Array {
    const tileCount = gameState.map.xSize * gameState.map.ySize;
    const trianglesPerTile = 2;
    const floatsPerVertex = 7;
    const floatsPerTriangle = 3 * floatsPerVertex;
    const triangleCount = tileCount * trianglesPerTile;
    const arrSize = triangleCount * floatsPerTriangle;
    let retArr = new Float32Array(arrSize);

    let i = 0;
    gameState.map.forEachTile((tile) => {
        let tileArr = getVertDataFromTile(tile);
        tileArr.forEach((t) => {
            retArr[i] = t;
            i++;
        });
    });

    return retArr;
}

function getVertDataFromTile(tile: Tile) {
    let color;
    switch (tile.type) {
        case "dirt":
            color = GrassGreen(tile.randInt);
            break;
        case "spawn":
            color = SpawnColor();
            break;
        case "water":
            color = WaterBlue(tile.randInt);
            break;
        case "deep":
            color = DeepBlue(tile.randInt);
            break;
        case "steppe":
            color = SteppeGreen(tile.randInt);
            break;
        default:
            color = DefaultColor();
    }
    return generateSquareCentered(color, 0.5, tile.x, tile.y, 1.0);
}

export function generateSquareCentered(
    color: RGB,
    radius: number,
    x: number = 0.0,
    y: number = 0.0,
    z: number = 0.0,
): number[] {
    const arr: number[] = [];

    normalizeColor(color);

    arr.push(x + radius, y + radius, z);
    pushColorToArr(color, arr);
    arr.push(1.0);
    arr.push(x + radius, y - radius, z);
    pushColorToArr(color, arr);
    arr.push(1.0);
    arr.push(x - radius, y - radius, z);
    pushColorToArr(color, arr);
    arr.push(1.0);

    arr.push(x + radius, y + radius, z);
    pushColorToArr(color, arr);
    arr.push(1.0);
    arr.push(x - radius, y - radius, z);
    pushColorToArr(color, arr);
    arr.push(1.0);
    arr.push(x - radius, y + radius, z);
    pushColorToArr(color, arr);
    arr.push(1.0);

    return arr;
}

export function generateCircleCentered(
    color: RGB,
    radius: number,
    slices: number,
    x: number = 0.0,
    y: number = 0.0,
    z: number = 0.0,
): number[] {
    let arr = [];
    arr.push(1);
    
    const sliceSizeInRadians = 2 / slices;
    for(let i = 0; i < slices; i++){
        arr.push(x, y, z);
        const x1 = Math.sin((sliceSizeInRadians * i));
        const y1 = Math.cos((sliceSizeInRadians * i));
        const x2 = Math.sin((sliceSizeInRadians * (i + 1)));
        const y2 = Math.cos((sliceSizeInRadians * (i + 1)));
        arr.push(x1, y1);
        pushColorToArr(color, arr);
        arr.push(x2, y2);
        pushColorToArr(color, arr);
    }
    return arr;
}

function pushColorToArr(c: RGB, arr: number[]) {
    arr.push(c.r);
    arr.push(c.g);
    arr.push(c.b);
}
