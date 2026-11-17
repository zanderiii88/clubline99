import {createSimulation,stepSimulation,simulationSnapshot,setTactic,STEP} from './possession-sim.js?v=1.128.0';
import {createAmbience} from './ambience.js?v=1.126.0';
const root=document.querySelector('#match-lab'),query=selector=>root.querySelector(selector),svgNS='http://www.w3.org/2000/svg';
let sim=createSimulation(),previous=simulationSnapshot(sim),running=!matchMedia('(prefers-reduced-motion: reduce)').matches,speed=4,lastFrame=null,accumulator=0,eventCursor=0,sound=false,inspected=null,disposed=false,runGeneration=0;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,ambience=createAmbience();
let prefs={};try{prefs=JSON.parse(localStorage.getItem('clubline-audio-settings')||'{}')}catch{}
const configureAudio=()=>ambience.configure({muted:!sound||prefs.ambienceMuted===true,volume:prefs.ambienceVolume??.25,effectsMuted:!sound||prefs.effectsMuted===true,effectsVolume:prefs.effectsVolume??.65,hidden:document.hidden});
configureAudio();
const nodes=new Map(),format=seconds=>`${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(Math.floor(seconds%60)).padStart(2,'0')}`;
for(const p of sim.players){
 const g=document.createElementNS(svgNS,'g');g.setAttribute('class','lab-player');g.setAttribute('role','button');g.setAttribute('tabindex','0');g.setAttribute('data-player-id',p.id);g.setAttribute('aria-label',`${sim.teams[p.team].name}, number ${p.number}, ${p.name}, ${p.role}`);
 const title=document.createElementNS(svgNS,'title');title.textContent=`${p.name} · #${p.number} · ${p.role}`;g.append(title);
 const shirt=document.createElementNS(svgNS,'path');shirt.setAttribute('d','M-13 -20 L-26 -10 L-19 1 L-13 -3 L-13 20 L13 20 L13 -3 L19 1 L26 -10 L13 -20 L6 -15 L-6 -15Z');shirt.setAttribute('class','lab-shirt');shirt.setAttribute('fill',p.role==='GK'?(p.team===0?'#e4af34':'#65a178'):(p.team===0?'#2474ca':'#c94151'));g.append(shirt);
 const number=document.createElementNS(svgNS,'text');number.setAttribute('class','lab-number');number.setAttribute('y','9');number.textContent=p.number;g.append(number);query('[data-shirts]').append(g);nodes.set(p.id,g);
}
function syncAudio(){configureAudio();ambience.setContext(!running||document.hidden||sim.phase==='ended'?'paused':'match');}
function consumeEvents(){
 const events=sim.events.slice(eventCursor);eventCursor=sim.events.length;
 for(const e of events){if(!sound||!running)continue;if(e.type==='goal')ambience.react({type:'goal',key:`${runGeneration}:${sim.seed}:${e.id}`,gain:e.team===0?.5:.25});if(e.type==='save')ambience.react({type:'save',key:`${runGeneration}:${sim.seed}:${e.id}`,gain:.14});}
}
function paint(alpha=1){
 const now=simulationSnapshot(sim),old=new Map(previous.players.map(p=>[p.id,p])),blend=reduced?1:alpha;
 for(const p of now.players){const before=old.get(p.id)||p,x=before.x+(p.x-before.x)*blend,y=before.y+(p.y-before.y)*blend;nodes.get(p.id).setAttribute('transform',`translate(${y*10} ${(105-x)*10})`);}
 const x=previous.ball.x+(now.ball.x-previous.ball.x)*blend,y=previous.ball.y+(now.ball.y-previous.ball.y)*blend;
 for(const sel of ['[data-ball]','[data-ball-halo]']){query(sel).setAttribute('cx',y*10);query(sel).setAttribute('cy',(105-x)*10);}
 query('[data-score]').textContent=`${sim.score[0]} – ${sim.score[1]}`;query('[data-clock]').textContent=`${format(sim.time)} / ${format(sim.duration)}`;
 query('[data-play-state]').textContent=sim.phase==='ended'?'Test complete':!running?'Paused':sim.phase==='restart'?(sim.restartKind==='kickoff'?'Kick-off':'Goal kick'):sim.flight?.kind==='shot'?'Shot':`${sim.teams[sim.possession].name} possession`;
 query('[data-lab="pause"]').textContent=sim.phase==='ended'?'Replay':running?'Pause':'Play';query('[data-lab="pause"]').setAttribute('aria-label',sim.phase==='ended'?'Replay test':running?'Pause simulation':'Play simulation');
 const owner=sim.players.find(p=>p.id===(inspected||sim.ball.owner));query('[data-ball-owner]').textContent=owner?`${inspected?'Player':'Ball'}: #${owner.number} ${owner.name}`:sim.flight?'Ball in flight':'Loose ball';
 const recentGoal=sim.events.findLast(e=>e.type==='goal'&&sim.time-e.second<2),latest=recentGoal||sim.events.at(-1);query('[data-current]').textContent=latest?.text||'Ready to play.';if(recentGoal)query('[data-play-state]').textContent='GOAL!';
 query('[data-shots]').textContent=sim.stats.map(s=>s.shots).join(' – ');query('[data-passes]').textContent=sim.stats.map(s=>s.completed).join(' – ');
 const total=sim.stats.reduce((n,s)=>n+s.possession,0),home=total?Math.round(sim.stats[0].possession/total*100):50;query('[data-possession]').textContent=`${home}% – ${100-home}%`;
 const log=query('[data-log]');if(Number(log.dataset.last)!==sim.serial){log.dataset.last=sim.serial;log.replaceChildren(...sim.events.slice(-12).reverse().map(e=>{const li=document.createElement('li');li.textContent=`${format(e.second)} · ${e.text}`;return li;}));}
 query('[data-seed]').textContent=`Seed ${sim.seed}`;
}
function advance(){previous=simulationSnapshot(sim);const phase=sim.phase;stepSimulation(sim);if(sim.phase!==phase)previous=simulationSnapshot(sim);consumeEvents();if(sim.phase==='ended'){running=false;syncAudio();}}
function frame(timestamp){
 if(disposed)return;
 if(lastFrame===null)lastFrame=timestamp;
 const elapsed=Math.max(0,Math.min(.15,(timestamp-lastFrame)/1000));lastFrame=timestamp;
 if(running&&!document.hidden){accumulator+=elapsed*speed;let guard=0;while(accumulator>=STEP&&sim.phase!=='ended'&&guard++<16){advance();accumulator-=STEP;}if(sim.phase==='ended')accumulator=0;paint(running?Math.min(1,accumulator/STEP):1);}
 requestAnimationFrame(frame);
}
function restart(seed=sim.seed,scenario=query('[data-scenario]').value){runGeneration++;ambience.setContext('off');sim=createSimulation({seed,scenario});previous=simulationSnapshot(sim);accumulator=0;lastFrame=null;eventCursor=sim.events.length;inspected=null;query('[data-tactic]').value=sim.teams[0].tactic;running=!reduced;syncAudio();paint();}
root.addEventListener('click',event=>{
 const person=event.target.closest('[data-player-id]');if(person){inspected=person.dataset.playerId;paint(1);return;}
 const action=event.target.closest('[data-lab]')?.dataset.lab;if(!action)return;
 if(action==='pause'){if(sim.phase==='ended')restart();else{running=!running;accumulator=0;lastFrame=null;inspected=null;}}
 if(action==='replay')restart();if(action==='new')restart((sim.seed+1)>>>0);
 if(action==='step'){running=false;const serial=sim.serial;for(let i=0;i<200&&sim.serial===serial&&sim.phase!=='ended';i++)advance();previous=simulationSnapshot(sim);accumulator=0;}
 if(action==='sound'){sound=!sound;query('[data-lab="sound"]').textContent=sound?'Sound on':'Sound off';query('[data-lab="sound"]').setAttribute('aria-pressed',String(sound));if(sound)ambience.unlock();}
 if(action==='export'){
  const report={prototype:'CLUBLINE 99 spatial match lab',version:'1.128.0',seed:sim.seed,scenario:sim.scenario,state:sim,limits:'Experimental ground-ball passage, not a calibrated full match.'};const url=URL.createObjectURL(new Blob([JSON.stringify(report,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=`Clubline-match-test-${sim.seed}.json`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
 }
 syncAudio();paint(1);
});
root.addEventListener('keydown',event=>{if(event.target.matches('[data-player-id]')&&['Enter',' '].includes(event.key)){event.preventDefault();inspected=event.target.dataset.playerId;paint(1);}});
root.addEventListener('change',event=>{if(event.target.matches('[data-speed]'))speed=Number(event.target.value);if(event.target.matches('[data-tactic]')){setTactic(sim,0,event.target.value);inspected=null;}if(event.target.matches('[data-scenario]'))restart();paint(1);});
document.addEventListener('visibilitychange',()=>{if(document.hidden){running=false;accumulator=0;lastFrame=null;}syncAudio();paint(1);});
window.addEventListener('pagehide',()=>{disposed=true;running=false;ambience.stop();});
if(reduced)query('[data-current]').textContent='Reduced motion: press Play or Next action.';
paint();requestAnimationFrame(frame);

window.addEventListener('pageshow',event=>{if(event.persisted){disposed=false;running=false;lastFrame=null;accumulator=0;syncAudio();paint(1);requestAnimationFrame(frame);}});
