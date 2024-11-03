import {
    createWindow,
    getProcAddress,
    mainloop,
} from "https://deno.land/x/dwm@0.3.4/mod.ts";
import * as gl from "https://deno.land/x/gluten@0.1.3/api/gles23.2.ts";
import { GameState } from "../simulation/GameState.ts";
import { GLRGB, HexToGLRGB, HexToRGB} from "./colorUtils.ts";
import { combineShapes, generateSquareCentered } from "./shapeFunctions.ts";
import { loadShader } from "./OpenGLFunctions.ts";

export async function startOpenGlWindow(game: GameState) {
    const window = createWindow({
        title: "DenoGL",
        width: 1000,
        height: 1000,
        resizable: true,
        glVersion: "v3.2",
        gles: true,
    });

    gl.load(getProcAddress);

    const vShaderSrc = `
    #version 300 es
    in vec4 vPosition;
    in vec4 vColor;
    uniform vec4 vScalar;

    out vec4 color;

    void main() {
      gl_Position = vPosition;
      color = vColor;
    }
    `;

    const fShaderSrc = `
    #version 300 es
    precision mediump float;
    in vec4 color;

    void main() {
      gl_FragColor = color;
    }
    `;

    const vShader = loadShader(gl.VERTEX_SHADER, vShaderSrc);
    const fShader = loadShader(gl.FRAGMENT_SHADER, fShaderSrc);

    const program = gl.CreateProgram();
    gl.AttachShader(program, vShader);
    gl.AttachShader(program, fShader);

    const vPosAttInt = 0;
    const vColAttInt = 1;
    const vScalarAttInt = 2;
    gl.BindAttribLocation(program, vPosAttInt, new TextEncoder().encode("vPosition\0"));
    gl.BindAttribLocation(program, vColAttInt, new TextEncoder().encode("vColor\0"));
    gl.BindAttribLocation(program, vScalarAttInt, new TextEncoder().encode("vScalar\0"));

    gl.LinkProgram(program);

    const status = new Int32Array(1);
    gl.GetProgramiv(program, gl.LINK_STATUS, status);
    if (status[0] === gl.FALSE) {
        const logLength = new Int32Array(1);
        gl.GetProgramiv(program, gl.INFO_LOG_LENGTH, logLength);
        const log = new Uint8Array(logLength[0]);
        gl.GetProgramInfoLog(program, logLength[0], logLength, log);
        console.log(new TextDecoder().decode(log));
        gl.DeleteProgram(program);
        Deno.exit(1);
    }

    const cc: GLRGB = HexToGLRGB("#34b6c9");
    gl.ClearColor(cc.r, cc.g, cc.b, 1.0);

    addEventListener("resize", (event) => {
        gl.Viewport(0, 0, event.width, event.height);
    });

    function frame() {
        const scalerVector = [2.0,1.0,1.0,1.0];

        gl.Clear(gl.COLOR_BUFFER_BIT);
        gl.UseProgram(program);
        // deno-fmt-ignore

        game.process();
        const shapes = game.getShapesToRender();
        const renderBuffer = combineShapes(shapes);

        gl.VertexAttribPointer(vPosAttInt, 3, gl.FLOAT, gl.FALSE, 0, renderBuffer.vertices);
        gl.EnableVertexAttribArray(vPosAttInt);

        gl.VertexAttribPointer(vColAttInt, 3, gl.FLOAT, gl.FALSE, 0, renderBuffer.colors);
        gl.EnableVertexAttribArray(vColAttInt);

        gl.DrawArrays(gl.TRIANGLES, 0, renderBuffer.numTriangles);
        window.swapBuffers();
    }

    await mainloop(frame);
}
