import {PRESETS,PLAN_OPTIONS,PROFILES,STRENGTHS,assessPlan} from './lab-tactics.js?v=1.147.0';
import {createSimulation,stepSimulation,matchFlow,startSecondHalf,simulationSnapshot,setTactic,adjustPlan,instructPlayer,assessBuildUp,onPitch,requestSubstitution,continueAfterInjury,cancelQueuedSubstitutions,suggestedReplacement,STEP} from './possession-sim.js?v=1.147.0';
const root=document.querySelector('#match-lab'),query=selector=>root.querySelector(selector),svgNS='http://www.w3.org/2000/svg';
let pauseReason='';
let fullMatch=false,fastForward=false;
let sim=createSimulation({managedTeam:0}),previous=simulationSnapshot(sim),running=false,speed=2,lastFrame=null,accumulator=0,eventCursor=0,sound=false,inspected=null,disposed=false,runGeneration=0;
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
 const names=[0,1].map(team=>{const active=sim.players.find(p=>p.team===team&&['Overlap with cover','Risk an overlap','Recover the flank'].includes(p.intent)),cover=sim.players.find(p=>p.team===team&&['Cover the fullback','Cover the recovering fullback'].includes(p.intent));return `${sim.teams[team].name}: ${active?`#${active.number} ${active.intent.toLowerCase()}`:sim.flankPlans?.[team]?.reason||'Hold shape'}${cover?`; #${cover.number} covers`:''}.`;});query('[data-flank-summary]').textContent=names.join(' ');
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
 for(const e of events){if(e.type==='half-time'||e.type==='injury'&&e.team===0||e.type==='penalty'||e.type==='card'&&e.colour==='red'||e.type==='knock'&&e.team===0){running=false;fastForward=false;pauseReason=e.text;}if(!sound||!running)continue;if(e.type==='goal')ambience?.react({type:'goal',key:`${runGeneration}:${sim.seed}:${e.id}`,gain:e.team===0?.5:.25});if(e.type==='save')ambience?.react({type:'save',key:`${runGeneration}:${sim.seed}:${e.id}`,gain:.14});}
 if(!running)syncAudio();
}
let benchSignature='';
function updateBench(){
 const outgoing=sim.players.filter(p=>p.team===0&&!p.bench&&!p.subbedOff&&!p.sentOff),incoming=sim.players.filter(p=>p.team===0&&p.bench&&!p.played&&!p.injuredOff);
 const signature=JSON.stringify([outgoing.map(p=>[p.id,!!p.injuredOff]),incoming.map(p=>p.id),sim.subsUsed,sim.pendingSubs,sim.pendingInjury?.playerId]);
 if(signature!==benchSignature){benchSignature=signature;for(const [selector,players]of [['[data-sub-out]',outgoing],['[data-sub-in]',incoming]]){const control=query(selector),prior=control.value;control.replaceChildren(...players.map(p=>{const option=document.createElement('option');option.value=p.id;option.textContent=`#${p.number} ${p.name} · ${p.role}${p.injuredOff?' · injured':''}`;return option;}));if(players.some(p=>p.id===prior))control.value=prior;}
  if(sim.pendingInjury?.team===0){query('[data-sub-out]').value=sim.pendingInjury.playerId;const match=suggestedReplacement(sim,sim.pendingInjury.playerId);if(match)query('[data-sub-in]').value=match.id;query('.lab-bench').open=true;}
 }
 const queued=(sim.pendingSubs||[]).filter(q=>q.team===0).length;query('[data-sub-count]').textContent=`${sim.subsUsed?.[0]||0}/3 substitutions used${queued?`; ${queued} queued`:''}. Five named substitutes.`;
 query('[data-lab="substitute"]').disabled=!outgoing.length||!incoming.length||(sim.subsUsed?.[0]||0)+queued>=3||sim.phase==='ended';query('[data-lab="cancel-subs"]').hidden=!queued;query('[data-lab="continue-injury"]').hidden=!sim.pendingInjury;
 const p=sim.players.find(p=>p.id===query('[data-sub-in]').value);query('[data-bench-attributes]').textContent=p?`${p.name}: passing ${Math.round(p.pass)}, technique ${Math.round(p.technique)}, stamina ${Math.round(p.stamina)}, energy ${Math.round(p.energy)}%.`:'';
}
function paint(alpha=1){
 const now=simulationSnapshot(sim),old=new Map(previous.players.map(p=>[p.id,p])),blend=reduced?1:alpha;
 for(const p of now.players){const before=old.get(p.id)||p,x=before.x+(p.x-before.x)*blend,y=before.y+(p.y-before.y)*blend;const node=nodes.get(p.id);node.style.display=p.onField?'':'none';if(node.dataset.role!==p.role){node.dataset.role=p.role;node.setAttribute('aria-label',`${sim.teams[p.team].name}, number ${p.number}, ${p.name}, ${p.role}`);node.querySelector('.lab-shirt').setAttribute('fill',p.role==='GK'?(p.team===0?'#e4af34':'#65a178'):(p.team===0?'#2474ca':'#c94151'));}nodes.get(p.id).setAttribute('transform',`translate(${y*10} ${(105-x)*10})`);}
 const height=now.ball.z||0;query('[data-ball]').setAttribute('r',String(9+Math.min(height,16)*.45));
 const x=previous.ball.x+(now.ball.x-previous.ball.x)*blend,y=previous.ball.y+(now.ball.y-previous.ball.y)*blend;
 for(const sel of ['[data-ball]','[data-ball-halo]']){query(sel).setAttribute('cx',y*10);query(sel).setAttribute('cy',(105-x)*10);}
 query('[data-restart]').hidden=sim.phase!=='restart'||!!sim.pendingInjury;query('[data-restart-status]').textContent=`Restart setup · ${Math.max(0,Math.ceil(sim.restartUntil-sim.time))}s`;query('[data-timing]').textContent=`Ball in play ${format(sim.timing?.live||0)} · Restart setup ${format(sim.timing?.stopped||0)}. Skipping setup advances the same simulation clock.`;
 query('[data-lab="full-match"]').setAttribute('aria-pressed',String(fullMatch));
 query('[data-lab="full-match"]').textContent=fullMatch?'Short tests':'Full match test';
 const forward=query('[data-lab="fast-forward"]');
 forward.hidden=!fullMatch||['half-time','injury','ended'].includes(sim.phase);
 forward.textContent=fastForward?'Stop fast-forward':'Fast-forward';
 query('[data-scenario]').disabled=fullMatch;
 const flow=matchFlow(sim);
 const pair=fn=>flow.map(fn).join(' – ');
 query('[data-flow-spells]').textContent=`Average possession ${pair(row=>row.spells?row.meanSeconds.toFixed(1)+'s':'—')} · Under 5s ${pair(row=>row.shortSpells)}`;
 query('[data-flow-losses]').textContent=`Turnovers by own third / midfield / final third · Blue ${flow[0].losses.join(' / ')} · Red ${flow[1].losses.join(' / ')}`;
 query('[data-flow-clearances]').textContent=`After clearing · Opponent controls within 5s ${pair(row=>row.quickOppositionRegains)} · Opponent shoots within 12s ${pair(row=>row.returnShots)}`;
 query('[data-score]').textContent=`${sim.score[0]} – ${sim.score[1]}`;query('[data-clock]').textContent=`${format(sim.time)} / ${format(sim.duration)}`;
 query('[data-play-state]').textContent=sim.phase==='ended'?(fullMatch?'Full-time':'Test complete'):sim.phase==='half-time'?'Half-time':fastForward?'Fast-forwarding':!running?(sim.time===0?'Pre-match setup':'Paused'):sim.phase==='restart'?(({'direct':'Direct free kick','penalty':'Penalty kick','kickoff':'Kick-off','goal-kick':'Goal kick','throw-in':'Throw-in','corner':'Corner','indirect':'Indirect free kick'}[sim.restartKind]||'Restart')):sim.flight?.kind==='shot'?'Shot':sim.flight?.kind==='kick'?'Long keeper kick':sim.flight?.kind==='long-ball'?'Ball over the top':sim.flight?.kind==='cross'?'Cross into the box':sim.flight?.kind==='cutback'?'Cutback':sim.flight?.kind==='clearance'?'Headed clearance':`${sim.teams[sim.possession].name} possession`;
 query('[data-lab="pause"]').textContent=sim.phase==='half-time'?'Start second half':sim.phase==='ended'?'Replay':running||fastForward?'Pause':'Play';query('[data-lab="pause"]').setAttribute('aria-label',sim.phase==='half-time'?'Start second half':sim.phase==='ended'?'Replay test':running||fastForward?'Pause simulation':'Play simulation');
 const owner=sim.players.find(p=>p.id===(inspected||sim.ball.owner));query('[data-ball-owner]').textContent=owner?`${inspected?'Player':'Ball'}: #${owner.number} ${owner.name}`:sim.flight?'Ball in flight':'Loose ball';
 const recentGoal=sim.events.findLast(e=>e.type==='goal'&&sim.time-e.second<2),recentFlag=sim.events.findLast(e=>e.type==='offside'&&sim.time-e.second<3),latest=recentGoal||recentFlag||sim.events.at(-1);query('[data-current]').textContent=latest?.text||'Ready to play.';if(recentGoal&&!['ended','half-time'].includes(sim.phase))query('[data-play-state]').textContent='GOAL!';else if(recentFlag&&!['ended','half-time'].includes(sim.phase))query('[data-play-state]').textContent='Offside · Indirect free kick';
 query('[data-through-balls]').textContent=sim.stats.map(row=>
  `${row.throughBallsCompleted||0}/${row.throughBalls||0}`).join(' – ');
 query('[data-one-twos]').textContent=sim.stats.map(row=>
  `${row.oneTwosCompleted||0}/${row.oneTwos||0}`).join(' – ');
 query('[data-pass-attempts]').textContent=sim.stats.map(row=>row.passes).join(' – ');
 query('[data-pass-completion]').textContent=sim.stats.map(row=>
  row.passes?`${Math.round(100*row.completed/row.passes)}%`:'—').join(' – ');
 query('[data-goal-kicks]').textContent=sim.stats.map(row=>row.goalKicks||0).join(' – ');
 query('[data-shots]').textContent=sim.stats.map(s=>s.shots).join(' – ');query('[data-passes]').textContent=sim.stats.map(s=>s.completed).join(' – ');for(const [selector,key]of Object.entries({'[data-injuries]':'injuries','[data-subs]':'substitutions','[data-fouls]':'fouls','[data-penalties]':'penalties','[data-yellows]':'yellows','[data-reds]':'reds','[data-knocks]':'knocks','[data-recycles]':'recycles','[data-switches]':'switches','[data-saves]':'saves','[data-parries]':'parries','[data-blocks]':'blocks','[data-long-balls]':'longBalls','[data-crosses]':'crosses','[data-cutbacks]':'cutbacks','[data-errant-passes]':'errantPasses','[data-aerials]':'aerials','[data-clearances]':'clearances'}))query(selector).textContent=sim.stats.map(st=>st[key]||0).join(' – ');query('[data-offsides]').textContent=sim.stats.map(s=>s.offsides||0).join(' – ');query('[data-corners]').textContent=sim.stats.map(s=>s.corners||0).join(' – ');query('[data-miscontrols]').textContent=sim.stats.map(s=>s.miscontrols||0).join(' – ');query('[data-long-kicks]').textContent=sim.stats.map(s=>s.longKicks||0).join(' – ');query('[data-carries]').textContent=sim.stats.map(s=>s.carries).join(' – ');
 const carrier=sim.players.find(p=>p.id===sim.ball.owner);query('[data-build-summary]').textContent=carrier?`#${carrier.number} ${carrier.name}: ${assessBuildUp(sim,carrier).reason.toLowerCase()}.`:sim.flight?'Ball in flight; support and cover are moving.':'Both sides can collect the loose ball.';
 if(sim.pendingInjury)pauseReason=sim.events.findLast(e=>e.type==='injury')?.text||'An injury needs a decision.';query('[data-intervention]').hidden=!pauseReason;query('[data-intervention]').textContent=pauseReason?`${pauseReason} ${sim.pendingInjury?'Choose a replacement below or continue short-handed.':sim.phase==='half-time'?'Use Start second half when ready.':'Adjust your plan or press Play to continue.'}`:'';
 query('[data-lab="pause"]').disabled=!!sim.pendingInjury;query('[data-lab="step"]').disabled=!!sim.pendingInjury||sim.phase==='half-time';updateBench();
 const total=sim.stats.reduce((n,s)=>n+s.possession,0),home=total?Math.round(sim.stats[0].possession/total*100):50;query('[data-possession]').textContent=`${home}% – ${100-home}%`;
 const log=query('[data-log]');if(Number(log.dataset.last)!==sim.serial){log.dataset.last=sim.serial;log.replaceChildren(...sim.events.slice(-12).reverse().map(e=>{const li=document.createElement('li');li.textContent=`${format(e.second)} · ${e.text}`;return li;}));}
 query('[data-seed]').textContent=`Seed ${sim.seed}`;if(sim.time===0||Math.floor(sim.time)!==lastAdviceSecond){lastAdviceSecond=Math.floor(sim.time);updateAdvice();}if(inspected){const p=sim.players.find(p=>p.id===inspected);query('[data-instruction]').disabled=p.team!==0||!onPitch(sim).some(q=>q.id===p.id);query('[data-player-intent]').textContent=`Now: ${p.intent}. Energy ${Math.round(p.energy)}%.`;}
}
function advance(){previous=simulationSnapshot(sim);const phase=sim.phase;stepSimulation(sim);if(sim.phase!==phase)previous=simulationSnapshot(sim);consumeEvents();if(sim.phase==='ended'){running=false;fastForward=false;syncAudio();}}
function frame(timestamp){
 if(disposed)return;
 if(lastFrame===null)lastFrame=timestamp;
 const elapsed=Math.max(0,Math.min(.15,(timestamp-lastFrame)/1000));lastFrame=timestamp;
 if(fastForward&&!document.hidden){
  const deadline=performance.now()+10;
  let iterations=0;
  while(fastForward&&iterations++<400&&performance.now()<deadline){
   const serial=sim.serial;
   stepSimulation(sim);
   if(sim.serial!==serial)consumeEvents();
   if(sim.phase==='ended')fastForward=false;
  }
  previous=simulationSnapshot(sim);
  paint(1);
 }else if(running&&!document.hidden){accumulator+=elapsed*speed;let guard=0;while(running&&accumulator>=STEP&&sim.phase!=='ended'&&guard++<16){advance();accumulator-=STEP;}if(sim.phase==='ended')accumulator=0;paint(running?Math.min(1,accumulator/STEP):1);}
 requestAnimationFrame(frame);
}
function restart(seed=sim.seed,scenario=query('[data-scenario]').value,autoplay=false){
 fastForward=false;benchSignature='';query('[data-sub-feedback]').textContent='';runGeneration++;ambience?.setContext('off');sim=createSimulation({seed,scenario,profile,strengths,preset:appliedPreset,managedTeam:0,fullMatch});
 sim.teams[0].plan={...appliedPlan};for(const [id,instruction]of Object.entries(initialInstructions))instructPlayer(sim,id,instruction);
 pauseReason=sim.events.findLast(e=>e.type==='injury'&&e.team===0||e.type==='penalty'||e.type==='card'&&e.colour==='red'||e.type==='knock'&&e.team===0)?.text||'';previous=simulationSnapshot(sim);accumulator=0;lastFrame=null;eventCursor=sim.events.length;inspected=null;query('.lab-player-instructions').hidden=true;lastAdviceSecond=-1;
 running=autoplay&&!reduced;syncPlanControls();syncAudio();paint();
}
function inspectPlayer(id){
 const p=sim.players.find(p=>p.id===id);if(!p)return;inspected=id;const panel=query('.lab-player-instructions');panel.hidden=false;panel.open=true;query('[data-selected-player]').textContent=`${sim.teams[p.team].name} · #${p.number} ${p.name}`;query('[data-player-attributes]').textContent=`${p.role==='GK'?`Handling ${Math.round(p.handling)} · Reflexes ${Math.round(p.reflexes)} · Distribution ${Math.round(p.pass)}`:`Passing ${Math.round(p.pass)} · Finishing ${Math.round(p.finish)} · Dribbling ${Math.round(p.dribbling)} · Heading ${Math.round(p.heading)} · Pace ${Math.round(Math.max(0,Math.min(100,(p.pace-3)*25)))} · Acceleration ${Math.round(p.acceleration)} · Agility ${Math.round(p.agility)}`}  · Off-ball ${Math.round(p.offball)} · Decisions ${Math.round(p.decisions)} · Discipline ${Math.round(p.discipline)} · Teamwork ${Math.round(p.teamwork)}`;const control=query('[data-instruction]');control.disabled=p.team!==0;control.value=p.instruction;for(const option of control.options)option.disabled=p.role==='GK'&&!['hold','auto'].includes(option.value);paint(1);
}
root.addEventListener('click',event=>{
 const person=event.target.closest('[data-player-id]');if(person){inspectPlayer(person.dataset.playerId);return;}
 const action=event.target.closest('[data-lab]')?.dataset.lab;if(!action)return;if(sim.pendingInjury&&['pause','step','skip-setup'].includes(action))return;
 if(action==='substitute'){const result=requestSubstitution(sim,0,query('[data-sub-out]').value,query('[data-sub-in]').value);query('[data-sub-feedback]').textContent=result.ok?(result.queued?'Change queued for the next stoppage.':'Substitution made.') : result.reason;if(!sim.pendingInjury)pauseReason='';previous=simulationSnapshot(sim);}
 if(action==='cancel-subs'){cancelQueuedSubstitutions(sim,0);query('[data-sub-feedback]').textContent='Queued changes cancelled.';}
 if(action==='continue-injury'){continueAfterInjury(sim);pauseReason='';previous=simulationSnapshot(sim);query('[data-sub-feedback]').textContent='Continuing short-handed.';}
 if(action==='full-match'){
  fullMatch=!fullMatch;
  restart();
 }
 if(action==='fast-forward'&&fullMatch&&!['half-time','injury','ended'].includes(sim.phase)){
  pauseReason='';
  running=false;
  if(!fastForward&&sim.time===0&&pendingPlan())applyDraft();
  fastForward=!fastForward;
 }
 if(action==='pause'){
  pauseReason='';
  if(fastForward){fastForward=false;}
  else if(sim.phase==='half-time'){
   startSecondHalf(sim);
   previous=simulationSnapshot(sim);
   running=true;
  }else if(sim.phase==='ended')restart(sim.seed,undefined,true);
  else if(!running&&sim.time===0&&pendingPlan()){applyDraft();running=true;}
  else running=!running;
  accumulator=0;
  lastFrame=null;
 }
 if(action==='mismatch'){strengths=['elite','lower'];restart();}if(action==='even'){strengths=['standard','standard'];restart();}
 if(action==='apply')applyDraft();if(action==='replay')restart(sim.seed,undefined,true);if(action==='new')restart((sim.seed+1)>>>0);
 if(action==='skip-setup'){fastForward=false;const wasRunning=running;for(let i=0;i<700&&sim.phase==='restart';i++)advance();running=wasRunning&&!sim.pendingInjury&&sim.phase!=='ended';previous=simulationSnapshot(sim);accumulator=0;lastFrame=null;}
 if(action==='step'&&sim.phase!=='half-time'){pauseReason='';running=false;fastForward=false;const serial=sim.serial,budget=200+(sim.phase==='restart'?Math.ceil(Math.max(0,sim.restartUntil-sim.time)/STEP):0);for(let i=0;i<budget&&sim.serial===serial&&sim.phase!=='ended';i++)advance();previous=simulationSnapshot(sim);accumulator=0;}
 if(action==='sound'){sound=!sound;query('[data-lab="sound"]').textContent=sound?'Sound on':'Sound off';query('[data-lab="sound"]').setAttribute('aria-pressed',String(sound));if(sound)enableAudio();}
 if(action==='export'){
  const report={prototype:'CLUBLINE 99 spatial match lab',version:'1.147.0',seed:sim.seed,scenario:sim.scenario,setup:{fullMatch,profile,strengths:[...strengths],preset:appliedPreset,plan:appliedPlan,instructions:initialInstructions},state:sim,limits:'Experimental passage with basic restarts and received-pass offside. Full-match tests use fixed pitch orientation and two 45-minute halves. Pending penalties can extend a half. General added time and further calibration remain open. Injury decisions and a five-player lab bench are active. Basic contact fouls, penalties, advantage, cards and temporary knocks are active. No VAR.'};const url=URL.createObjectURL(new Blob([JSON.stringify(report,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=`Clubline-match-test-${sim.seed}.json`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
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
