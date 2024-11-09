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