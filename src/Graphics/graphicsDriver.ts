import {
    createWindow,
    getProcAddress,
    mainloop,
} from "https://deno.land/x/dwm@0.3.4/mod.ts";
import * as gl from "https://deno.land/x/gluten@0.1.3/api/gles23.2.ts";
import { GameState } from "../simulation/GameState.ts";
import { GLRGB, HexToGLRGB, HexToRGB} from "./colorUtils.ts";
import { combineShapes, generateSquareCentered } from "./shapeFunctions.ts";
import { loadShader } from "./glFunctions.ts";

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
      gl_Position = vPosition * vScalar;
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

    const program:gl.GLuint = gl.CreateProgram();
    gl.AttachShader(program, vShader);
    gl.AttachShader(program, fShader);

    gl.LinkProgram(program);

    const vPosAttInt = gl.GetAttribLocation(program, new TextEncoder().encode("vPosition\0"));
    const vColAttInt = gl.GetAttribLocation(program, new TextEncoder().encode("vColor\0"));
    const vScalarAttInt = gl.GetUniformLocation(program, new TextEncoder().encode("vScalar\0"));

    console.log(vPosAttInt);
    console.log(vColAttInt);
    console.log(vScalarAttInt);

    //gl.BindAttribLocation(program, vPosAttInt, new TextEncoder().encode("vPosition\0"));
    //gl.BindAttribLocation(program, vColAttInt, new TextEncoder().encode("vColor\0"));
    //gl.BindAttribLocation(program, vScalarAttInt, new TextEncoder().encode("vScalar\0"));

    

    

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

    let zoomLevel = 100;
    addEventListener("keydown", (evt) => {
        if (evt.code === "KeyW") {
            //Zoom Out
            if(zoomLevel > 5){
                zoomLevel-=5;
            }
        } else if (evt.code === "KeyS") {
            //Zoome In
            zoomLevel+=5;
        }
    });

    const BASE_SCALE = 1000.0;

    function frame() {
        const viewport = new Int32Array(4);
        gl.GetIntegerv(gl.VIEWPORT, viewport);
        const width = viewport[2];
        const height = viewport[3];

        const scale = BASE_SCALE * (zoomLevel / 100.0);
        const scalerVector = [scale/width,scale/height,1.0,1.0];

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

        gl.Uniform4f(vScalarAttInt, scalerVector[0], scalerVector[1], scalerVector[2], scalerVector[3]);

        gl.DrawArrays(gl.TRIANGLES, 0, renderBuffer.numTriangles);
        window.swapBuffers();
    }

    await mainloop(frame);
}
