import { CanvasRenderingContext2D } from "https://deno.land/x/dwm@0.3.7/ext/canvas.ts";
import { GameState } from "../simulation/GameState.ts";
import { getRandomInt } from "../utils/funcs.ts";

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
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.textBaseline = "top";
    ctx.fillText('wow', 10, 10);
    drawDiamond(ctx);
    
};

function drawDiamond(ctx: CanvasRenderingContext2D) {

    const sizeWidth = ctx.canvas.width;
    const sizeHeight = ctx.canvas.height;

    const midX = Math.floor(sizeWidth/2);
    const midY = Math.floor(sizeHeight/2);
    const hv = Math.floor(sizeHeight/2);
    const wv = Math.floor(sizeWidth/2);
    
    // Set start-point
    ctx.moveTo(midX, midY + hv);//tip top

    // Set sub-points
    ctx.lineTo(midX + wv, midY);//right
    ctx.lineTo(midX, midY - hv);//bottom
    ctx.lineTo(midX - wv, midY);//Left

    // Set end-point
    ctx.lineTo(midX, midY + hv);

    // Stroke it (do the drawing)
    ctx.strokeStyle = "red";
    ctx.fillStyle = "green";

    ctx.stroke();
    ctx.fill();
}
