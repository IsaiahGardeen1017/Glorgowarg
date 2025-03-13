import { getAverageFromLayer, NoiseMaker } from "./src/simulation/NoiseFunctions.ts";

const nm = new NoiseMaker(1, 10);

let numField: number[][] = [];

for (let x = 0; x < 10; x++) {
    numField.push([]);
    for (let y = 0; y < 10; y++) {
        numField[x].push(Math.random());
    }
}

const rackot = getAverageFromLayer(numField, 1, 1, 2);
console.log(rackot);