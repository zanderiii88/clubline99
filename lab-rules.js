// Prototype contact judgement. Probabilities are design choices, not historical ratings.
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export function judgeChallenge({tackle=70,discipline=70,energy=100,relativeSpeed=0,behind=false,clearChance=false,foulRoll=.5,forceRoll=.5}){
 const fatigue=(100-energy)/100,probability=clamp(.008+(100-tackle)*.0003+(100-discipline)*.00035+fatigue*.015+Math.min(relativeSpeed,10)*.0015+(behind?.008:0),.012,.14);
 const foul=foulRoll<probability,force=clamp(forceRoll+Math.min(relativeSpeed,10)*.015+(behind?.06:0),0,1);
 const serious=foul&&forceRoll>.996&&(relativeSpeed>2||behind),reckless=foul&&!serious&&forceRoll>.84&&force>.86;
 return {foul,probability,force,card:foul&&(serious||clearChance)?'red':reckless?'yellow':null,reason:serious?'serious foul play':foul&&clearChance?'denying an obvious scoring opportunity':reckless?'reckless challenge':foul?'careless challenge':'fair challenge',injuryRisk:clamp(.0005+force**3*.012+fatigue*.003,0,.025)};
}
