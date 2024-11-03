export type GLRGB = {
    r: number,
    g: number, 
    b: number
}

export type RGB = {
    r: number,
    g: number,
    b: number
}


export function HexToRGB(hex: string): RGB{
    const realHex = hex.split('#').pop() || hex;
    const bigint = parseInt(realHex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    return {
        r,g,b
    };
}

export function RGBToGLRGB(rgb: RGB): GLRGB{
    return {
        r: rgb.r / 255.0,
        g: rgb.g / 255.0,
        b: rgb.b / 255.0,
    }
}

export function HexToGLRGB(hex: string): GLRGB{
    return RGBToGLRGB(HexToRGB(hex));
}