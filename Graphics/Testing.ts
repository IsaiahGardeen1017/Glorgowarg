import { createWindow, mainloop } from 'https://deno.land/x/dwm@0.3.7/mod.ts';
import * as PIXI from 'pixi.js';

console.log('PixiJS version:', PIXI.VERSION);

export function startGraphics() {
	console.log('here');

	const adapter = await navigator.gpu.requestAdapter();
	const device = await adapter!.requestDevice();

	const window = createWindow({
		title: 'Deno Window Manager',
		width: 1920,
		height: 1080,
		resizable: true,
	});
}
