import { SHADER_TYPE } from "https://deno.land/x/gluten@0.1.3/api/gles23.2.ts";
import { HexToRGB, RGB, rgb, RGBToGLRGB } from "./colorUtils.ts";
import { GameState } from "../simulation/GameState.ts";
import { Tile } from "../simulation/Tile.ts";
import { DeepBlue, DefaultColor, GrassGreen, SpawnColor, SteppeGreen, WaterBlue } from "./colors.ts";

export type Shape = {
    vertices: number[];
    color: RGB;
};

export type RenderBufferGroup = {
    vertices: Float32Array;
    colors: Float32Array;
    numTriangles: number;
};

export function combineShapes(shapesArray: Shape[]): RenderBufferGroup {
    const verts: number[] = [];
    const cols: number[] = [];
    let triCount = 0;

    for (let i = 0; i < shapesArray.length; i++) {
        const shape = shapesArray[i];
        const glCol = RGBToGLRGB(shape.color);
        for (let j = 0; j < shape.vertices.length; j += 3) {
            verts.push(shape.vertices[j]);
            cols.push(glCol.r);
            verts.push(shape.vertices[j + 1]);
            cols.push(glCol.g);
            verts.push(shape.vertices[j + 2]);
            cols.push(glCol.b);
            triCount++;
        }
    }
    shapesArray = [];
    return {
        vertices: new Float32Array(verts),
        colors: new Float32Array(cols),
        numTriangles: triCount,
    };
}

export function generateSquareCentered(
    color: RGB,
    radius: number,
    x: number = 0.0,
    y: number = 0.0,
    z: number = 0.0,
): Shape {
    const tris: number[] = [];

    tris.push(x + radius, y + radius, z);
    tris.push(x + radius, y - radius, z);
    tris.push(x - radius, y - radius, z);

    tris.push(x + radius, y + radius, z);
    tris.push(x - radius, y - radius, z);
    tris.push(x - radius, y + radius, z);

    return { vertices: tris, color: color };
}

export function shiftShape(
    shape: Shape,
    xOffset: number = 0,
    yOffset: number = 0,
    zOffset: number = 0,
): Shape {
    const newShape: Shape = {
        color: shape.color,
        vertices: [],
    };

    for (let i = 0; i < shape.vertices.length; i += 3) {
        newShape.vertices.push(shape.vertices[i] + xOffset);
        newShape.vertices.push(shape.vertices[i + 1] + yOffset);
        newShape.vertices.push(shape.vertices[i + 2] + zOffset);
    }
    return newShape;
}

export function getTileShapes(gameState: GameState): Shape[] {
    const shapes: Shape[] = [];

    gameState.map.forEachTile((tile) => {
        shapes.push(shapeFromTile(tile));
    });

    return shapes;
}

function shapeFromTile(tile: Tile) {
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
    const shape = generateSquareCentered(color, 0.5, tile.x, tile.y, 1.0);
    return shape;
}
