import { startCanvasWindow } from "./src/canvasing/canvasDriver.ts";
import { drawMap } from "./src/canvasing/drawMap.ts";
import { startOpenGlWindow } from "./src/Graphics/graphicsDriver.ts";
import { startWebGpuWindow } from "./src/Graphics/webGPUgraphicsDriver.ts";
import { startHeadlessSimulation } from "./src/Headless/driver.ts";
import { logTiming } from "./src/loggingFuncs.ts";
import { GameState } from "./src/simulation/GameState.ts";

const WIDTH = 200;
const HEIGHT =100;
logTiming('Glorowarg Started');
const gameState = new GameState(WIDTH, HEIGHT);
logTiming('GameState set');

//startCanvasWindow(gameState, drawMap);

//startOpenGlWindow(gameState);
startWebGpuWindow(gameState);


//startHeadlessSimulation(gameState);