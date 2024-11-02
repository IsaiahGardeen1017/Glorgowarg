import { SimMap } from "./Map.ts";


export type RenderContext = {
    zoom: number;
    xOffset: number;
    yOffset: number;
}


export class GameState {
    map: SimMap
    renderContext: RenderContext

    constructor(xSize: number, ySize: number){
        this.map = new SimMap(xSize, ySize);
        this.renderContext = {
            zoom: 10,
            xOffset: 0,
            yOffset: 0,
        }
    }

    process(){
        this.map.process();
    }


    zoomIn(){
        const z = this.renderContext.zoom;
        if(z > 10){
            this.renderContext.zoom += 2;
        }else{
            this.renderContext.zoom++;
        }
    }
    
    zoomOut(){
        const z = this.renderContext.zoom;
        if (z <= 1) {
            // Do nothing, max out
        }else if(z > 10){
            this.renderContext.zoom -= 2;
        }else{
            this.renderContext.zoom--;
        }
    }

}