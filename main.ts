import { startGraphics } from './LocalGraphics/DWM.ts';
import { startServer } from './WebGraphics/WebServer.ts';

const sizeArg: number = parseInt(Deno.args[0]);

const width = sizeArg ? sizeArg : 200;
const height = (width / 16.0) * 9.0;

startGraphics();
startServer(80);
