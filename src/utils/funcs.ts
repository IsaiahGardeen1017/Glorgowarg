//If Max is three then possible returns are [0, 1, 2]
export function getRandomInt(max: number) {
    return Math.floor(Math.random() * max);
}

export function maybeDo(percentChance: number): boolean{
    if(percentChance < 0){
        return false;
    }
    
    if(percentChance > 100){
        return true;
    }

    const r = Math.random();
    return (r * 100) < percentChance;

    return false;
}