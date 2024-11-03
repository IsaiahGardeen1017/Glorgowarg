import * as gl from "https://deno.land/x/gluten@0.1.3/api/gles23.2.ts";




export function loadShader(type: number, src: string): number {
    const shader = gl.CreateShader(type);
    gl.ShaderSource(
        shader,
        1,
        new Uint8Array(
            new BigUint64Array([
                BigInt(
                    Deno.UnsafePointer.value(
                        Deno.UnsafePointer.of(new TextEncoder().encode(src)),
                    ),
                ),
            ]).buffer,
        ),
        new Int32Array([src.length]),
    );
    gl.CompileShader(shader);
    const status = new Int32Array(1);
    gl.GetShaderiv(shader, gl.COMPILE_STATUS, status);
    if (status[0] === gl.FALSE) {
        const logLength = new Int32Array(1);
        gl.GetShaderiv(shader, gl.INFO_LOG_LENGTH, logLength);
        const log = new Uint8Array(logLength[0]);
        gl.GetShaderInfoLog(shader, logLength[0], logLength, log);
        console.log(new TextDecoder().decode(log));
        gl.DeleteShader(shader);
        return 0;
    }
    return shader;
}