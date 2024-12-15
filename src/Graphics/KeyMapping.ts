export type InputAction = 'zoom-out' | 'zoom-in' | 'pan-left' | 'pan-right' | 'pan-up' | 'pan-down' | 'print-debug' | undefined;


export function mapKeyToInputAction(key: string): InputAction{
    switch(key){
        case 'Unknown(333)':
            return 'pan-right';
        case 'Unknown(331)':
            return 'pan-left';
        case 'Unknown(328)':
            return 'pan-up';
        case 'Unknown(336)':
            return 'pan-down';
        case 'KeyP': 
            return 'print-debug';
    }
    return undefined;
}