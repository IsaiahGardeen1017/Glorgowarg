import { CanvasRenderingContext2D } from "https://deno.land/x/dwm@0.3.7/ext/canvas.ts";
import { GameState, RenderContext } from "../simulation/GameState.ts";
import { getRandomInt } from "../utils/funcs.ts";
import { Tile } from "../simulation/Tile.ts";

export type DrawContext = RenderContext & {
    windowHeight?: number;
    windowWidth?: number;
}

function int(num: number): number{
    return Math.floor(num);
}


export const drawMap = (
    ctx: CanvasRenderingContext2D,
    gameState: GameState,
): void => {
    gameState.process();

    const r = getRandomInt(255);
    const g = getRandomInt(255);
    const b = getRandomInt(255);


    
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    const drawContext: DrawContext = {
        zoom: gameState.renderContext.zoom,
        xOffset: gameState.renderContext.xOffset,
        yOffset: gameState.renderContext.yOffset,
        windowHeight: ctx.canvas.height,
        windowWidth: ctx.canvas.width,
    }

    gameState.map.allTiles().forEach((tile) => {
        drawTile(ctx, drawContext, tile);
    });
    
};

const TILE_SIZE = 1;

function drawTile(ctx: CanvasRenderingContext2D, context: DrawContext, tile: Tile) {
    ctx.beginPath();
    const squareSize = int(TILE_SIZE * context.zoom);
    const x = (tile.x * squareSize) + context.xOffset;
    const y = (tile.y * squareSize) + context.yOffset;

    // Set start-point (Bottom Left)
    ctx.moveTo(x, y);

    // Set sub-points
    ctx.lineTo(x, y + squareSize); //Top Left
    ctx.lineTo(x + squareSize, y + squareSize); //Top Right
    ctx.lineTo(x + squareSize, y); //Bottom Right

    // Set end-point
    ctx.lineTo(x, y);

    const greenVal = 180 + tile.getColorOffset();
    const tileColor = "rgb(140,"+ greenVal +",40)"
    ctx.fillStyle = tileColor;

    ctx.fill();
    ctx.closePath();
}
