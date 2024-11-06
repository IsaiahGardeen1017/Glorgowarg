import {
    mainloop,
    WindowCanvas,
} from "https://deno.land/x/dwm@0.3.7/ext/canvas.ts";
import { CanvasRenderingContext2D } from "jsr:@gfx/canvas@0.5.6";
import { GameState } from "../simulation/GameState.ts";

export type CanvasRenderer = (
    ctx: CanvasRenderingContext2D,
    gameState: GameState,
) => void;

export async function startCanvasWindow(
    gameObject: GameState,
    gameRenderer: CanvasRenderer,
) {
    console.log("Starting Canvas");

    const canvas = new WindowCanvas({
        title: "Skia Canvas",
        width: 800,
        height: 600,
        resizable: true,
    });

    canvas.onDraw = (ctx) => {
        gameRenderer(ctx, gameObject);
    };

    addEventListener("keydown", (evt) => {
        console.log(evt.code);
        if (evt.code === "KeyW") {
            //Zoom Out
        } else if (evt.code === "KeyS") {
            //Zoome In
        }
    });

    await mainloop(() => {
        canvas.draw();
    });

    console.log("over");
}
