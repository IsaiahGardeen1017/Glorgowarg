import { SHADER_TYPE } from "https://deno.land/x/gluten@0.1.3/api/gles23.2.ts";
import { GameState } from "../simulation/GameState.ts";
import { Tile } from "../simulation/Tile.ts";
import {
    DeepBlue,
    DefaultColor,
    GrassGreen,
    GrobberColor,
    normalizeColor,
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
    color: number[],
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
    color: number[],
    radius: number,
    slices: number,
    x: number = 0.0,
    y: number = 0.0,
    z: number = 0.0,
): Float32Array {

    const arrSize = slices * 3 * 7;
    const retArr = new Float32Array(arrSize);
    let arrIndex = 0;

    const fpush = (value: number) => {
        retArr[arrIndex] = value;
        arrIndex++;
    };
    const cpush = () => {
        fpush(color[0]);
        fpush(color[1]);
        fpush(color[2]);
        fpush(1.0);
    }

    const sliceSizeInRadians = (Math.PI * 2)  / slices;
    for (let i = 0; i < slices; i++) {
        fpush(x);
        fpush(y);
        fpush(z);
        cpush();
        const x1 = Math.sin(sliceSizeInRadians * i) * radius;
        const y1 = Math.cos(sliceSizeInRadians * i) * radius;
        fpush(x1);
        fpush(y1);
        fpush(z);
        cpush();
        const x2 = Math.sin(sliceSizeInRadians * (i + 1)) * radius;
        const y2 = Math.cos(sliceSizeInRadians * (i + 1)) * radius;
        fpush(x2);
        fpush(y2);
        fpush(z);
        cpush();
    }
    return retArr;
}

function pushColorToArr(c: number[], arr: number[]) {
    arr.push(c[0]);
    arr.push(c[1]);
    arr.push(c[2]);
}
