import { ReleaseShaderCompiler } from 'https://deno.land/x/gluten@0.1.3/api/gles23.2.ts';
import { Greeplant } from '../../simulation/Vegetations/Greeplant/Greeplant.ts';
import { GreeplantColor, normalizeColor } from '../colors.ts';
import { RenderDataObject } from '../RenderDataObject.ts';
import { generateStarCentered } from '../shapeFunctions.ts';
import { rescale } from '../../utils/funcs.ts';

export class GreeplantRenderDataObject extends RenderDataObject {
	override descriptor = 'Greeplant';
	override maxInstances = 1000;

	initSpriteVertices(): Float32Array {
		return generateStarCentered(normalizeColor(GreeplantColor()), 0.5, 0.25, 8, 0, 0, 1.1);
	}

	override compileInstanceData(): Float32Array {
		const FLOATS_PER_INSTANCE = 4;
		const r: Greeplant[] = this.gameState.vegetations['greeplant'] as Greeplant[];
		const f32 = new Float32Array(r.length * FLOATS_PER_INSTANCE);
		for (let i = 0; i < r.length; i++) {
			const idx = i * 4;
			f32[idx] = r[i].x;
			f32[idx + 1] = r[i].y;
			/** Growth scale  */
			let growthScale = 0.5;
			const gs = r[i].growthStage;
			growthScale = rescale(0, 12, 0.5, 1.1, gs);
			f32[idx + 2] = growthScale;
			f32[idx + 3] = growthScale;
		}
		return f32;
	}
}
