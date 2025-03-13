import { magenta } from 'https://deno.land/std@0.157.0/fmt/colors.ts';

type Vector = {
	x: number;
	y: number;
};

function numsToVec(a: number, b: number): Vector {
	return {
		x: a,
		y: b,
	};
}

function mag(vec: Vector): number {
	return Math.sqrt(vec.x * vec.x + vec.y * vec.y);
}

export function normalize(a: Vector): Vector {
	const m = mag(a);
	return {
		x: m ? a.x / m : 0,
		y: m ? a.y / m : 0,
	};
}
