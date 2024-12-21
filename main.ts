import { denoCacheDir } from "https://deno.land/x/plug@1.0.0-rc.3/util.ts";
import { startWebGpuWindow } from "./src/Graphics/webGPUgraphicsDriver.ts";
import { logTiming } from "./src/loggingFuncs.ts";
import { GameState } from "./src/simulation/GameState.ts";
import { RenderDataObject } from "./src/Graphics/RenderDataObject.ts";

const sizeArg:number = parseInt(Deno.args[0]);


const width = sizeArg ? sizeArg : 200;
const height = (width / 16.0) * 9.0


logTiming('Glorowarg Started');
const gameState = new GameState(width, height);
const rdo = new RenderDataObject(gameState);
logTiming('GameState set');




startWebGpuWindow(rdo);

