import {
    createWindow,
    getProcAddress,
    mainloop,
} from "https://deno.land/x/dwm@0.3.4/mod.ts";
import * as gl from "https://deno.land/x/gluten@0.1.3/api/gles23.2.ts";
import { GameState } from "../simulation/GameState.ts";
import { GLRGB, HexToGLRGB, HexToRGB } from "./colorUtils.ts";
import {
    combineShapes,
    generateSquareCentered,
    getCreatureShapes,
    getTileShapes,
    RenderBufferGroup,
    Shape,
} from "./shapeFunctions.ts";
import { loadShader } from "./glFunctions.ts";
import { logTiming } from "../loggingFuncs.ts";
import { GLFW_ACCUM_ALPHA_BITS } from "https://deno.land/x/dwm@0.3.7/src/platform/glfw/constants.ts";

const BASE_SCALE = 1000;

const START_VIEWPORT_WIDTH = Math.floor(BASE_SCALE) * 2;
const START_VIEWPORT_HEIGHT = Math.floor(BASE_SCALE);

export async function startOpenGlWindow(game: GameState) {
    let timeCounter = logTiming("Starting graphics driver");
    const window = createWindow({
        title: "DenoGL",
        width: START_VIEWPORT_WIDTH,
        height: START_VIEWPORT_HEIGHT,
        resizable: true,
        glVersion: "v3.2",
        gles: true,
    });

    timeCounter = logTiming("Created Window");

    gl.load(getProcAddress);

    const vShaderSrc = `
    #version 300 es
    in vec4 vPosition;
    in vec4 vColor;
    uniform vec4 vScalar;
    uniform vec4 vPan;

    out vec4 color;

    void main() {
      gl_Position = (vPosition + vPan) * vScalar;
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

    //Setup shaders
    const vShader = loadShader(gl.VERTEX_SHADER, vShaderSrc);
    const fShader = loadShader(gl.FRAGMENT_SHADER, fShaderSrc);

    const program: gl.GLuint = gl.CreateProgram();
    gl.AttachShader(program, vShader);
    gl.AttachShader(program, fShader);

    gl.LinkProgram(program);

    //Get shader input integers
    //const staticAttrbLoc_vPosition = gl.GetAttribLocation(program,new TextEncoder().encode("vPosition\0"),);
    //const staticAttrbLoc_vColor = gl.GetAttribLocation(program,new TextEncoder().encode("vColor\0"),);
    //const unifLoc_vScalar = gl.GetUniformLocation(program,new TextEncoder().encode("vScalar\0"),);
    //const unifLoc_vPan = gl.GetUniformLocation(program,new TextEncoder().encode("vPan\0"),);

    //Do some stuff (?)
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

    gl.UseProgram(program);

    //Set clear color
    const cc: GLRGB = HexToGLRGB("#34b6c9");
    gl.ClearColor(cc.r, cc.g, cc.b, 1.0);

    addEventListener("resize", (event) => {
        gl.Viewport(0, 0, event.width, event.height);
    });

    //Handle input
    let zoomLevel = 10;
    let maxZoom = 100;
    let minZoom = 0.05;
    addEventListener("scroll", (evt) => {
        const scrollValue = evt.scrollY; // 1 or -1
        const zoomDelta = zoomLevel * 0.1 * scrollValue;
        zoomLevel += zoomDelta;

        if (zoomLevel >= maxZoom) {
            zoomLevel = maxZoom;
        } else if (zoomLevel <= minZoom) {
            zoomLevel = minZoom;
        }
    });

    addEventListener("keydown", (evt) => {
        console.log(evt.code);
        console.log("zoom:" + zoomLevel);
        const mem = Deno.memoryUsage();
        console.log("rss: " + mem.rss * 0.000001);
        console.log("heapTotal: " + mem.heapTotal * 0.000001);
        console.log("heapUsed: " + mem.heapUsed * 0.000001);
        console.log("external: " + mem.external * 0.000001);
    });

    let panX = game.map.xSize / -2.0;
    let panY = game.map.ySize / -2.0;

    logTiming("GL setup complete");

    let tileShapes = getTileShapes(game);
    let tileShapesData = combineShapes(tileShapes);
    const numTileTriangles = tileShapesData.numTriangles;

    logTiming("Shapes arrays compiled");

    console.log("HERHE");
    let buff: gl.Buffer = new Float32Array();
    console.log(buff);
    gl.GenBuffers(1, buff);
    console.log(buff);

    gl.BindBuffer(gl.ARRAY_BUFFER, 0);

    console.log("idk");
    gl.GenBuffers(1, tileShapesData.colors);
    //gl.VertexAttribPointer(staticAttrbLoc_vPosition,3,gl.FLOAT,gl.FALSE,0,tileShapesData.vertices);
    //gl.EnableVertexAttribArray(staticAttrbLoc_vPosition);

    //gl.VertexAttribPointer(staticAttrbLoc_vColor,3,gl.FLOAT,gl.FALSE,0,tileShapesData.colors);
    //gl.EnableVertexAttribArray(staticAttrbLoc_vColor);

    logTiming("Attributes set, starting loop");

    //Do every frame
    function frame() {
        game.process();

        const viewport = new Int32Array(4);
        gl.GetIntegerv(gl.VIEWPORT, viewport);
        const width = viewport[2];
        const height = viewport[3];

        const scale = BASE_SCALE * (zoomLevel / 100.0);
        const scalerVector = [scale / width, scale / height, 1.0, 1.0];
        const panVector = [panX, panY, 0.0, 0.0]; // Since we add this to the vertex position vector we want the last two to be 0.0

        gl.Clear(gl.COLOR_BUFFER_BIT);

        //Set Uniforms
        //gl.Uniform4f(unifLoc_vScalar,scalerVector[0],scalerVector[1],scalerVector[2],scalerVector[3],);
        //gl.Uniform4f(unifLoc_vPan,panVector[0],panVector[1],panVector[2],panVector[3],);

        gl.DrawArrays(gl.TRIANGLES, 0, numTileTriangles);
        window.swapBuffers();
    }

    await mainloop(frame);
}
