import { Tile } from "./Tile.ts";

export class SimMap{
    xSize: number;
    ySize: number;
    tiles: Tile[][];

    constructor(xSize: number, ySize: number){
        this.xSize = xSize;
        this.ySize = ySize;

        this.tiles = [];

        this.generateMap();
    }

    generateMap(){
        //Create Tiles
        for (let i = 0; i < this.xSize; i++) {
            const col = [];
            for (let j = 0; j < this.ySize; j++) {
                const newTile: Tile = new Tile(i, j);
                col.push(newTile);
            }
            this.tiles.push(col);
        }
    
        // Set Adjacency References
        const tiles = this.allTiles();
        tiles.forEach((tile) => {
            const x = tile.x;
            const y = tile.y;
            if (x + 1 < this.xSize) {
                tile.right = this.tiles[x + 1][y];
            }
            if (x > 0) {
                tile.left = this.tiles[x - 1][y];
            }
            if (y + 1 < this.ySize) {
                tile.above = this.tiles[x][y + 1];
            }
            if (y > 0) {
                tile.below = this.tiles[x][y - 1];
            }
        });
    }


    allTiles() {
        const tiles = [];
        for (let i = 0; i < this.xSize; i++) {
            for (let j = 0; j < this.ySize; j++) {
                tiles.push(this.tiles[i][j]);
            }
        }
        return (tiles);
    }

    process(){
        this.allTiles().forEach((tile) => {
            tile.process();
        });
    }
}