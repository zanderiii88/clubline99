import {PRESETS,PLAN_OPTIONS,PROFILES,STRENGTHS,assessPlan} from './lab-tactics.js?v=1.132.0';
import {createSimulation,stepSimulation,simulationSnapshot,setTactic,adjustPlan,instructPlayer,STEP} from './possession-sim.js?v=1.132.0';
const root=document.querySelector('#match-lab'),query=selector=>root.querySelector(selector),svgNS='http://www.w3.org/2000/svg';
let sim=createSimulation(),previous=simulationSnapshot(sim),running=false,speed=4,lastFrame=null,accumulator=0,eventCursor=0,sound=false,inspected=null,disposed=false,runGeneration=0;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;let ambience=null,audioLoading=false;
let prefs={};try{prefs=JSON.parse(localStorage.getItem('clubline-audio-settings')||'{}')}catch{}
const configureAudio=()=>ambience?.configure({muted:!sound||prefs.ambienceMuted===true,volume:prefs.ambienceVolume??.25,effectsMuted:!sound||prefs.effectsMuted===true,effectsVolume:prefs.effectsVolume??.65,hidden:document.hidden});
configureAudio();
let draftPreset='balanced',draftPlan={...sim.teams[0].plan},appliedPlan={...draftPlan},appliedPreset='balanced',profile='balanced';
let strengths=['standard','standard'],initialInstructions={},lastAdviceSecond=-1;
const descriptions={balanced:'A middle block and mixed passing. A starting point for most sides.',possession:'Short, patient passing. Composure matters when opponents press.',counter:'Defend deeper and break quickly. Trades territory for space to attack.',press:'Win the ball high up the pitch. Costs energy and can leave space behind.'};
const pendingPlan=()=>JSON.stringify(draftPlan)!==JSON.stringify(appliedPlan)||draftPreset!==appliedPreset;
function updateAdvice(){
 const preview={...sim,teams:[{...sim.teams[0],plan:draftPlan},sim.teams[1]]},assessment=assessPlan(preview);
 query('[data-suitability]').textContent=assessment.label+(pendingPlan()?' · Draft':'');
 const signature=JSON.stringify(assessment);if(query('[data-advice]').dataset.signature!==signature){query('[data-advice]').dataset.signature=signature;query('[data-advice]').replaceChildren(...assessment.reasons.map(text=>{const li=document.createElement('li');li.textContent=text;return li;}));}
 query('[data-energy]').textContent=`Blue energy ${assessment.energy}%`;
}
function syncPlanControls(){
 for(const el of root.querySelectorAll('[data-strength]'))el.value=strengths[Number(el.dataset.strength)];query('[data-strength-summary]').textContent=`${STRENGTHS[strengths[0]]} v ${STRENGTHS[strengths[1]]}`;query('[data-tactic]').value=draftPreset;query('[data-profile]').value=profile;
 for(const el of root.querySelectorAll('[data-plan-field]'))el.value=draftPlan[el.dataset.planField];
 query('[data-plan-description]').textContent=descriptions[draftPreset];
 query('[data-applied-plan]').textContent=pendingPlan()?`${PRESETS[appliedPreset].label} active · changes not applied`:`${PRESETS[appliedPreset].label} applied${Object.keys(PLAN_OPTIONS).some(k=>appliedPlan[k]!==PRESETS[appliedPreset][k])?' · adjusted':''}`;
 query('[data-lab="apply"]').hidden=!pendingPlan();updateAdvice();
}
function applyDraft(){setTactic(sim,0,draftPreset);for(const key of Object.keys(PLAN_OPTIONS))if(sim.teams[0].plan[key]!==draftPlan[key])adjustPlan(sim,0,key,draftPlan[key]);appliedPreset=draftPreset;appliedPlan={...sim.teams[0].plan};syncPlanControls();}
for(const [key,field]of Object.entries(PLAN_OPTIONS)){const label=document.createElement('label');label.textContent=field.label;const select=document.createElement('select');select.className='select';select.dataset.planField=key;select.setAttribute('aria-label',field.label);for(const [value,text]of Object.entries(field.values)){const option=document.createElement('option');option.value=value;option.textContent=text;select.append(option);}label.append(select);query('[data-plan-fields]').append(label);}
const nodes=new Map(),format=seconds=>`${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(Math.floor(seconds%60)).padStart(2,'0')}`;
for(const p of sim.players){
 const g=document.createElementNS(svgNS,'g');g.setAttribute('class','lab-player');g.setAttribute('role','button');g.setAttribute('tabindex','0');g.setAttribute('data-player-id',p.id);g.setAttribute('aria-label',`${sim.teams[p.team].name}, number ${p.number}, ${p.name}, ${p.role}`);
 const title=document.createElementNS(svgNS,'title');title.textContent=`${p.name} · #${p.number} · ${p.role}`;g.append(title);
 const shirt=document.createElementNS(svgNS,'path');shirt.setAttribute('d','M-13 -20 L-26 -10 L-19 1 L-13 -3 L-13 20 L13 20 L13 -3 L19 1 L26 -10 L13 -20 L6 -15 L-6 -15Z');shirt.setAttribute('class','lab-shirt');shirt.setAttribute('fill',p.role==='GK'?(p.team===0?'#e4af34':'#65a178'):(p.team===0?'#2474ca':'#c94151'));g.append(shirt);
 const number=document.createElementNS(svgNS,'text');number.setAttribute('class','lab-number');number.setAttribute('y','9');number.textContent=p.number;g.append(number);query('[data-shirts]').append(g);nodes.set(p.id,g);
}
async function enableAudio(){if(audioLoading)return;if(ambience){ambience.unlock();syncAudio();return;}audioLoading=true;try{const {createAmbience}=await import('./ambience.js?v=1.126.0');ambience=createAmbience();configureAudio();if(sound&&!disposed)ambience.unlock();syncAudio();}catch{sound=false;query('[data-lab="sound"]').textContent='Sound unavailable';query('[data-lab="sound"]').setAttribute('aria-pressed','false');}finally{audioLoading=false;}}
function syncAudio(){configureAudio();ambience?.setContext(!running||document.hidden||sim.phase==='ended'?'paused':'match');}
function consumeEvents(){
 const events=sim.events.slice(eventCursor);eventCursor=sim.events.length;
 for(const e of events){if(!sound||!running)continue;if(e.type==='goal')ambience?.react({type:'goal',key:`${runGeneration}:${sim.seed}:${e.id}`,gain:e.team===0?.5:.25});if(e.type==='save')ambience?.react({type:'save',key:`${runGeneration}:${sim.seed}:${e.id}`,gain:.14});}
}
function paint(alpha=1){
 const now=simulationSnapshot(sim),old=new Map(previous.players.map(p=>[p.id,p])),blend=reduced?1:alpha;
 for(const p of now.players){const before=old.get(p.id)||p,x=before.x+(p.x-before.x)*blend,y=before.y+(p.y-before.y)*blend;nodes.get(p.id).setAttribute('transform',`translate(${y*10} ${(105-x)*10})`);}
 const height=now.ball.z||0;query('[data-ball]').setAttribute('r',String(9+Math.min(height,16)*.45));
 const x=previous.ball.x+(now.ball.x-previous.ball.x)*blend,y=previous.ball.y+(now.ball.y-previous.ball.y)*blend;
 for(const sel of ['[data-ball]','[data-ball-halo]']){query(sel).setAttribute('cx',y*10);query(sel).setAttribute('cy',(105-x)*10);}
 query('[data-score]').textContent=`${sim.score[0]} – ${sim.score[1]}`;query('[data-clock]').textContent=`${format(sim.time)} / ${format(sim.duration)}`;
 query('[data-play-state]').textContent=sim.phase==='ended'?'Test complete':!running?(sim.time===0?'Pre-match setup':'Paused'):sim.phase==='restart'?(({'kickoff':'Kick-off','goal-kick':'Goal kick','throw-in':'Throw-in','corner':'Corner','indirect':'Indirect free kick'}[sim.restartKind]||'Restart')):sim.flight?.kind==='shot'?'Shot':sim.flight?.kind==='kick'?'Long keeper kick':`${sim.teams[sim.possession].name} possession`;
 query('[data-lab="pause"]').textContent=sim.phase==='ended'?'Replay':running?'Pause':'Play';query('[data-lab="pause"]').setAttribute('aria-label',sim.phase==='ended'?'Replay test':running?'Pause simulation':'Play simulation');
 const owner=sim.players.find(p=>p.id===(inspected||sim.ball.owner));query('[data-ball-owner]').textContent=owner?`${inspected?'Player':'Ball'}: #${owner.number} ${owner.name}`:sim.flight?'Ball in flight':'Loose ball';
 const recentGoal=sim.events.findLast(e=>e.type==='goal'&&sim.time-e.second<2),recentFlag=sim.events.findLast(e=>e.type==='offside'&&sim.time-e.second<3),latest=recentGoal||recentFlag||sim.events.at(-1);query('[data-current]').textContent=latest?.text||'Ready to play.';if(recentGoal&&sim.phase!=='ended')query('[data-play-state]').textContent='GOAL!';else if(recentFlag&&sim.phase!=='ended')query('[data-play-state]').textContent='Offside · Indirect free kick';
 query('[data-shots]').textContent=sim.stats.map(s=>s.shots).join(' – ');query('[data-passes]').textContent=sim.stats.map(s=>s.completed).join(' – ');query('[data-offsides]').textContent=sim.stats.map(s=>s.offsides||0).join(' – ');query('[data-corners]').textContent=sim.stats.map(s=>s.corners||0).join(' – ');query('[data-miscontrols]').textContent=sim.stats.map(s=>s.miscontrols||0).join(' – ');query('[data-long-kicks]').textContent=sim.stats.map(s=>s.longKicks||0).join(' – ');query('[data-carries]').textContent=sim.stats.map(s=>s.carries).join(' – ');
 const total=sim.stats.reduce((n,s)=>n+s.possession,0),home=total?Math.round(sim.stats[0].possession/total*100):50;query('[data-possession]').textContent=`${home}% – ${100-home}%`;
 const log=query('[data-log]');if(Number(log.dataset.last)!==sim.serial){log.dataset.last=sim.serial;log.replaceChildren(...sim.events.slice(-12).reverse().map(e=>{const li=document.createElement('li');li.textContent=`${format(e.second)} · ${e.text}`;return li;}));}
 query('[data-seed]').textContent=`Seed ${sim.seed}`;if(sim.time===0||Math.floor(sim.time)!==lastAdviceSecond){lastAdviceSecond=Math.floor(sim.time);updateAdvice();}if(inspected){const p=sim.players.find(p=>p.id===inspected);query('[data-player-intent]').textContent=`Now: ${p.intent}. Energy ${Math.round(p.energy)}%.`;}
}
function advance(){previous=simulationSnapshot(sim);const phase=sim.phase;stepSimulation(sim);if(sim.phase!==phase)previous=simulationSnapshot(sim);consumeEvents();if(sim.phase==='ended'){running=false;syncAudio();}}
function frame(timestamp){
 if(disposed)return;
 if(lastFrame===null)lastFrame=timestamp;
 const elapsed=Math.max(0,Math.min(.15,(timestamp-lastFrame)/1000));lastFrame=timestamp;
 if(running&&!document.hidden){accumulator+=elapsed*speed;let guard=0;while(accumulator>=STEP&&sim.phase!=='ended'&&guard++<16){advance();accumulator-=STEP;}if(sim.phase==='ended')accumulator=0;paint(running?Math.min(1,accumulator/STEP):1);}
 requestAnimationFrame(frame);
}
function restart(seed=sim.seed,scenario=query('[data-scenario]').value,autoplay=false){
 runGeneration++;ambience?.setContext('off');sim=createSimulation({seed,scenario,profile,strengths,preset:appliedPreset});
 sim.teams[0].plan={...appliedPlan};for(const [id,instruction]of Object.entries(initialInstructions))instructPlayer(sim,id,instruction);
 previous=simulationSnapshot(sim);accumulator=0;lastFrame=null;eventCursor=sim.events.length;inspected=null;query('.lab-player-instructions').hidden=true;lastAdviceSecond=-1;
 running=autoplay&&!reduced;syncPlanControls();syncAudio();paint();
}
function inspectPlayer(id){
 const p=sim.players.find(p=>p.id===id);if(!p)return;inspected=id;const panel=query('.lab-player-instructions');panel.hidden=false;panel.open=true;query('[data-selected-player]').textContent=`${sim.teams[p.team].name} · #${p.number} ${p.name}`;query('[data-player-attributes]').textContent=`${p.role==='GK'?`Handling ${Math.round(p.handling)} · Reflexes ${Math.round(p.reflexes)}`:`Passing ${Math.round(p.pass)} · Finishing ${Math.round(p.finish)} · Dribbling ${Math.round(p.dribbling)}`}  · Off-ball ${Math.round(p.offball)} · Decisions ${Math.round(p.decisions)} · Discipline ${Math.round(p.discipline)} · Teamwork ${Math.round(p.teamwork)}`;const control=query('[data-instruction]');control.disabled=p.team!==0;control.value=p.instruction;for(const option of control.options)option.disabled=p.role==='GK'&&!['hold','auto'].includes(option.value);paint(1);
}
root.addEventListener('click',event=>{
 const person=event.target.closest('[data-player-id]');if(person){inspectPlayer(person.dataset.playerId);return;}
 const action=event.target.closest('[data-lab]')?.dataset.lab;if(!action)return;
 if(action==='pause'){if(pendingPlan())applyDraft();if(sim.phase==='ended')restart(sim.seed,undefined,true);else{running=!running;accumulator=0;lastFrame=null;}}
 if(action==='mismatch'){strengths=['elite','lower'];restart();}if(action==='even'){strengths=['standard','standard'];restart();}
 if(action==='apply')applyDraft();if(action==='replay')restart(sim.seed,undefined,true);if(action==='new')restart((sim.seed+1)>>>0);
 if(action==='step'){running=false;const serial=sim.serial;for(let i=0;i<200&&sim.serial===serial&&sim.phase!=='ended';i++)advance();previous=simulationSnapshot(sim);accumulator=0;}
 if(action==='sound'){sound=!sound;query('[data-lab="sound"]').textContent=sound?'Sound on':'Sound off';query('[data-lab="sound"]').setAttribute('aria-pressed',String(sound));if(sound)enableAudio();}
 if(action==='export'){
  const report={prototype:'CLUBLINE 99 spatial match lab',version:'1.132.0',seed:sim.seed,scenario:sim.scenario,setup:{profile,strengths:[...strengths],preset:appliedPreset,plan:appliedPlan,instructions:initialInstructions},state:sim,limits:'Experimental passage with basic restarts and received-pass offside. No calibrated full match, fouls, penalties, cards, injuries or aerial duels. No VAR.'};const url=URL.createObjectURL(new Blob([JSON.stringify(report,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=`Clubline-match-test-${sim.seed}.json`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
 }
 syncAudio();paint(1);
});
root.addEventListener('keydown',event=>{if(event.target.matches('[data-player-id]')&&['Enter',' '].includes(event.key)){event.preventDefault();inspectPlayer(event.target.dataset.playerId);}});
root.addEventListener('change',event=>{
 const el=event.target;
 if(el.matches('[data-speed]'))speed=Number(el.value);
 if(el.matches('[data-tactic]')){draftPreset=el.value;draftPlan={...PRESETS[draftPreset]};syncPlanControls();}
 if(el.matches('[data-plan-field]')){draftPlan[el.dataset.planField]=el.value;syncPlanControls();}
 if(el.matches('[data-strength]')){strengths[Number(el.dataset.strength)]=el.value;restart();}
 if(el.matches('[data-profile]')){profile=el.value;restart();}
 if(el.matches('[data-instruction]')&&inspected){if(instructPlayer(sim,inspected,el.value))initialInstructions[inspected]=el.value;}
 if(el.matches('[data-scenario]'))restart();paint(1);
});
document.addEventListener('visibilitychange',()=>{if(document.hidden){running=false;accumulator=0;lastFrame=null;}syncAudio();paint(1);});
window.addEventListener('pagehide',()=>{disposed=true;running=false;ambience?.stop();});
if(reduced)query('[data-current]').textContent='Reduced motion: press Play or Next action.';
syncPlanControls();paint();requestAnimationFrame(frame);

window.addEventListener('pageshow',event=>{if(event.persisted){disposed=false;running=false;lastFrame=null;accumulator=0;syncAudio();paint(1);requestAnimationFrame(frame);}});

query('[data-loading]').remove();
