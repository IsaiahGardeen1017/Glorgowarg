import { NoiseMaker } from "./src/simulation/NoiseFunctions.ts";

const nm = new NoiseMaker(1, 10);


for (let x = 0; x < 10; x++) {
  for (let y = 0; y < 10; y++) {
    console.log(nm.get2Dnoise(x, y));
  }
}