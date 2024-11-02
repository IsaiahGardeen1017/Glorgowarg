import { startCanvasWindow } from "./src/canvasing/canvasDriver.ts";
import { drawMap } from "./src/canvasing/drawMap.ts";
import { GameState } from "./src/simulation/GameState.ts";

console.log('Starting glorgowarg');


const gameState = new GameState(500, 250);

startCanvasWindow(gameState, drawMap);