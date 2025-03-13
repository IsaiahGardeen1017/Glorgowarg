export type InputAction = 'zoom-out' | 'zoom-in' | 'pan-left' | 'pan-right' | 'pan-up' | 'pan-down' | 'print-debug' | undefined;

export function mapKeyToInputAction(key: string): InputAction {
	console.log(key);
	switch (key) {
		case 'Unknown(333)':
		case 'KeyD':
			return 'pan-right';
		case 'Unknown(331)':
		case 'KeyA':
			return 'pan-left';
		case 'Unknown(328)':
		case 'KeyW':
			return 'pan-up';
		case 'Unknown(336)':
		case 'KeyS':
			return 'pan-down';
		case 'KeyP':
			return 'print-debug';
	}
	return undefined;
}
