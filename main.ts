import { startCanvasWindow } from "./src/canvasing/canvasDriver.ts";
import { drawMap } from "./src/canvasing/drawMap.ts";
import { startOpenGlWindow } from "./src/Graphics/graphicsDriver.ts";
import { GameState } from "./src/simulation/GameState.ts";

console.log('Starting glorgowarg');


const gameState = new GameState(2, 2);

//startCanvasWindow(gameState, drawMap);

startOpenGlWindow(gameState);