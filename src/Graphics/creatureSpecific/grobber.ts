import { MAX_TRANSFORM_FEEDBACK_INTERLEAVED_COMPONENTS } from "https://deno.land/x/gluten@0.1.3/api/gles23.2.ts";
import { GameState } from "../../simulation/GameState.ts";
import { getMapVertData } from "../shapeFunctions.ts";
import { Greeplant } from "../../simulation/Vegetations/Greeplant/Greeplant.ts";

export function getGrobberInstanceData(gameState: GameState): Float32Array{
    const FLOATS_PER_INSTANCE = 4;
    const r = gameState.creatures['grobber'];
    const f32 = new Float32Array(r.length * FLOATS_PER_INSTANCE);
    for(let i = 0; i < r.length; i++){
        const idx = i * 4;
        f32[idx] = r[i].x;
        f32[idx + 1] = r[i].y;
        f32[idx + 2] = 1.0;
        f32[idx + 3] = 2.0;
    }
    return f32;
}

export function getGreeplantInstanceData(gameState: GameState): Float32Array{
    const FLOATS_PER_INSTANCE = 4;
    const r: Greeplant[] = gameState.vegetations['greeplant'] as Greeplant[];
    const f32 = new Float32Array(r.length * FLOATS_PER_INSTANCE);
    for(let i = 0; i < r.length; i++){
        const idx = i * 4;
        f32[idx] = r[i].x;
        f32[idx + 1] = r[i].y;
        const growthScale = r[i].growthStage / 10.1 * 1.5;
        f32[idx + 2] = growthScale;
        f32[idx + 3] = growthScale;
    }
    return f32;
}