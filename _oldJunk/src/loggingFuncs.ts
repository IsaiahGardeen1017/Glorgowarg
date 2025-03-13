import { FUNC_SUBTRACT } from "https://deno.land/x/gluten@0.1.3/api/gles23.2.ts";

let lastLoggedTime: number;

export function logTiming(message: string){
    if(!lastLoggedTime){
        lastLoggedTime = Date.now();
    }
    const nowTime = Date.now();
    const timeDiff = nowTime - lastLoggedTime;
    lastLoggedTime = nowTime;
    if(timeDiff < 1000){
        console.log(message + ': ' + timeDiff + ' ms.');
    }else{
        const sec = timeDiff/1000.0;
        console.log(message + ': ' + timeDiff + 'ms, (' + sec + ') Seconds');
    }
}

export async function logVertexArray(arr: Float32Array){
    const fileName = Date.now() + "_v_log.txt";
    let outStr = "";
    for(let i = 0; i < arr.length; i = i + 7){
        outStr = outStr + arr[i] + ' ' + arr[i + 1] + ' ' + arr[i+2] + "\n";
        outStr = outStr + arr[i + 3] + ' ' + arr[i + 4] + ' ' + arr[i + 5] + ' ' + arr[i + 6] + "\n";
        outStr = outStr + "\n";
    }
    await Deno.writeTextFileSync(fileName, outStr);
}

export async function logItemToFile(obj: any){
    const fileName = Date.now() + "_o_log.json";
    const content = JSON.stringify(obj);
    await Deno.writeTextFileSync(fileName, content);
}