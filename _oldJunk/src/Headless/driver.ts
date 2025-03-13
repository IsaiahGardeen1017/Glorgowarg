import {
    mainloop,
} from "https://deno.land/x/dwm@0.3.4/mod.ts";
import { GameState } from "../simulation/GameState.ts";

export async function startHeadlessSimulation(game: GameState) {
    
    addEventListener("keydown", (evt) => {
        console.log(evt.code);
        const mem = Deno.memoryUsage();
        console.log('rss: ' + mem.rss * 0.000001);
        console.log('heapTotal: ' + mem.heapTotal * 0.000001);
        console.log('heapUsed: ' + mem.heapUsed * 0.000001);
        console.log('external: '  + mem.external * 0.000001);
    });

    function frame() {
        game.process();
        if(game.ticks % 100 === 0){
            console.log(game.ticks);
        }
    }

    await mainloop(frame);
}
