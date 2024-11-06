import { startCanvasWindow } from "./src/canvasing/canvasDriver.ts";
import { drawMap } from "./src/canvasing/drawMap.ts";
import { startOpenGlWindow } from "./src/Graphics/graphicsDriver.ts";
import { startHeadlessSimulation } from "./src/Headless/driver.ts";
import { GameState } from "./src/simulation/GameState.ts";

console.log('Starting glorgowarg');

const WIDTH = 1000;
const HEIGHT = 750;
const gameState = new GameState(WIDTH, HEIGHT);

//startCanvasWindow(gameState, drawMap);

startOpenGlWindow(gameState);

//startHeadlessSimulation(gameState);