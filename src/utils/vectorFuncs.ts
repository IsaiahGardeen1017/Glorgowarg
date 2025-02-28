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
	return { x: a.x / mag(a), y: a.y / mag(a) };
}
