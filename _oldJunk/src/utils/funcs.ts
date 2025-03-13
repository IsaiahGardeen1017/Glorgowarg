//If Max is three then possible returns are [0, 1, 2]
export function getRandomInt(max: number) {
	return Math.floor(Math.random() * max);
}

export function getRandomIntRange(min: number, max: number) {
	const range = max - min;
	return getRandomInt(range) + min;
}

export function maybeDo(percentChance: number): boolean {
	if (percentChance < 0) {
		return false;
	}

	if (percentChance > 100) {
		return true;
	}

	const r = Math.random();
	return (r * 100) < percentChance;

	return false;
}

export function sameSign(a: number, b: number): boolean {
	return (a > 0 && b > 0) || (a < 0 && b < 0);
}

/**
 * Scales a value on a range to a value between 0 and 1
 *
 * @param scaleMin Minimum value of range
 * @param maxScale Maximum value of range
 * @param value Value in range
 * @returns value scaled between 0 and 1
 */
export function getScalar(scaleMin: number, scaleMax: number, value: number): number {
	const diff = scaleMax - scaleMin;
	const val = value - scaleMin;
	return val === 0 ? 0 : val / diff;
}

/**
 * @param scaleMin Minimum value of range
 * @param maxScale Maximum value of range
 * @param value Value between 0 and 1
 * @returns scaled value in range
 */
export function scaleValue(scaleMin: number, scaleMax: number, value: number): number {
	const diff = scaleMax - scaleMin;
	return (value * diff) + scaleMin;
}

export function rescale(
	sourceRangeMin: number,
	sourceRangeMax: number,
	targetRangeMin: number,
	targetRangeMax: number,
	value: number,
) {
	const val = getScalar(sourceRangeMin, sourceRangeMax, value);
	return scaleValue(targetRangeMin, targetRangeMax, val);
}
