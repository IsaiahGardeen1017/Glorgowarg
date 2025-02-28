import { Grobber } from '../../simulation/Creatures/Grobber/Grobber.ts';
import { Greeplant } from '../../simulation/Vegetations/Greeplant/Greeplant.ts';
import { GreeplantColor, GrobberColor, normalizeColor } from '../colors.ts';
import { RenderDataObject } from '../RenderDataObject.ts';
import { generateCircleCentered, generateStarCentered } from '../shapeFunctions.ts';

export class GrobberRenderDataObject extends RenderDataObject {
	override descriptor = 'Greeplant';
	override maxInstances = 1000;

	initSpriteVertices(): Float32Array {
		return generateCircleCentered(
			normalizeColor(GrobberColor()),
			0.5,
			8,
			0,
			0,
			1.0,
		);
	}

	override compileInstanceData(): Float32Array {
		const FLOATS_PER_INSTANCE = 4;
		const r: Grobber[] = this.gameState.creatures['grobber'] as Grobber[];
		const f32 = new Float32Array(r.length * FLOATS_PER_INSTANCE);
		for (let i = 0; i < r.length; i++) {
			const idx = i * 4;
			f32[idx] = r[i].x;
			f32[idx + 1] = r[i].y;
			f32[idx + 2] = 1.0;
			f32[idx + 3] = 1.0;
		}
		return f32;
	}
}
