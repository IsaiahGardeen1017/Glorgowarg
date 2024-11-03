import { SHADER_TYPE } from "https://deno.land/x/gluten@0.1.3/api/gles23.2.ts";
import { RGB, RGBToGLRGB } from "./colorUtils.ts";

export type Shape = {
    vertices: number[];
    color: RGB;
};

export type renderBuffers = {
    vertices: Float32Array;
    colors: Float32Array;
    numTriangles: number;
};

export function combineShapes(shapesArray: Shape[]): renderBuffers {
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

export function shiftShape(shape: Shape, xOffset: number = 0, yOffset: number = 0, zOffset: number = 0): Shape {
    const newShape: Shape = {
        color: shape.color,
        vertices: []
    }
    
    for (let i = 0; i < shape.vertices.length; i += 3) {
        newShape.vertices.push(shape.vertices[i] + xOffset);
        newShape.vertices.push(shape.vertices[i + 1] + yOffset);
        newShape.vertices.push(shape.vertices[i + 2] + zOffset);
    }
    return newShape;
}
