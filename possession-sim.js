import {judgeChallenge} from './lab-rules.js?v=1.154.0';
import {makePlan,PRESETS,PLAN_OPTIONS,INSTRUCTIONS,applyProfile,applyStrength,setRatedClubs,labLineup,applyLabLineups} from './lab-tactics.js?v=1.154.0';
// Experimental, deterministic spatial football model. No DOM, audio or career storage.
export const STEP=.1;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const names=[['A. Grant','B. Ross','C. Reid','D. Fraser','E. Clark','F. Young','G. Scott','H. Murray','I. Wilson','J. Brown','K. Adams'],['L. Shaw','M. Hill','N. Wood','O. Bell','P. Gray','Q. Green','R. Hart','S. Cole','T. King','U. Ward','V. Ford']];
const anchors=[[5,34,'GK'],[25,9,'FB'],[23,25,'CB'],[23,43,'CB'],[25,59,'FB'],[47,8,'W'],[45,26,'CM'],[45,42,'CM'],[47,60,'W'],[68,26,'ST'],[68,42,'ST']];
function random(s){s.rng=(s.rng+0x6D2B79F5)>>>0;let n=s.rng;n=Math.imul(n^(n>>>15),n|1);n^=n+Math.imul(n^(n>>>7),n|61);return ((n^(n>>>14))>>>0)/4294967296;}
export const onPitch=s=>s.players.filter(p=>!p.sentOff&&!p.bench&&!p.subbedOff&&!p.injuredOff);
const player=(s,id)=>s.players.find(p=>p.id===id);
const direction=team=>team===0?1:-1;
const goalX=team=>team===0?105:0;
const GOAL_HALF_WIDTH=3.66;
const KEEPER_WIDE_MARGIN=.59;
function shotGoalOffset(f,ball){
 return Math.abs(ball.y+f.vy*(goalX(f.team)-ball.x)/f.vx-34);
}
function emit(s,type,team,actorId,text,extra={}){const e={id:++s.serial,second:Number(s.time.toFixed(1)),type,team,actorId,text,...extra};s.events.push(e);return e;}
function homeSpace(p,team){return team===0?p.x:105-p.x;}
function nearest(s,team,pos,exclude=null){return onPitch(s).filter(p=>p.team===team&&p.id!==exclude).sort((a,b)=>Math.round(distance(a,pos)*1e8)-Math.round(distance(b,pos)*1e8)||a.number-b.number);}
function segmentDistance(p,a,b){const dx=b.x-a.x,dy=b.y-a.y,k=clamp(((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1),0,1);return distance(p,{x:a.x+dx*k,y:a.y+dy*k});}
// Track controlled possession through passes and loose balls until the other
// team gains control or play stops. Restarts never count as turnovers.
function finishPossession(s, turnoverAt=null){
 const metrics=s.flow, current=metrics?.possession;
 if(!current)return;
 const row=metrics.teams[current.team];
 row.spells++;
 const seconds=s.time-current.start;
 row.seconds+=seconds;
 if(seconds<5)row.shortSpells++;
 if(turnoverAt!==null)row.losses[Math.min(2,Math.floor(homeSpace(turnoverAt,current.team)/35))]++;
 metrics.possession=null;
}
function observeControl(s,p){
 if(s.phase!=='play')return;
 const metrics=s.flow;
 const current=metrics.possession;
 const changed=current&&current.team!==p.team;
 if(changed)finishPossession(s,p);
 if(!metrics.possession)metrics.possession={team:p.team,start:s.time};
 const clearance=metrics.clearance;
 if(!clearance)return;
 const row=metrics.teams[clearance.team];
 if(clearance.firstControl===null){
  clearance.firstControl=p.team;
  if(p.team!==clearance.team&&s.time-clearance.at<=5)row.quickOppositionRegains++;
 }else if(changed){
  metrics.clearance=null;
 }
}
function stopFlow(s){
 finishPossession(s);
 if(s.flow)s.flow.clearance=null;
}
export function matchFlow(s){
 return s.flow.teams.map((row,team)=>{
  const current=s.flow.possession?.team===team?s.flow.possession:null;
  const elapsed=current?s.time-current.start:0;
  const spells=row.spells+(current?1:0);
  const clean={...row,seconds:row.seconds+elapsed,losses:[...row.losses],spells,meanSeconds:spells?(row.seconds+elapsed)/spells:0};
  return clean;
 });
}
function own(s,p,immunity=.8){if(s.giveAndGo&&p.id!==s.giveAndGo.wallId)s.giveAndGo=null;observeControl(s,p);if(s.possession!==p.team&&s.phase==='play'){s.transition={team:p.team,at:s.time};for(const q of s.players)q.thinkAt=Math.min(q.thinkAt||0,s.time+.2+(100-q.anticipation)/100);}s.offsidePhase=null;s.looseDelivery=null;s.ball.owner=p.id;s.ball.z=0;s.ball.x=p.x+direction(p.team)*.55;s.ball.y=p.y;s.flight=null;s.looseSince=null;s.possession=p.team;s.immunity=s.time+immunity;p.readyAt=s.time+.25+(100-(p.composure??70))*.006;const tempo=s.teams[p.team].plan.tempo;s.decisionAt=s.time+(tempo==='quick'?.68:tempo==='patient'?1.25:1)*(1.55+random(s)*2.8);}
const anchorFor=p=>anchors[p.role==='GK'?0:(p.slot??p.number)-1];
function resetShape(s){for(const p of onPitch(s)){const [x,y]=anchorFor(p);p.x=p.team===0?x:105-x;p.y=p.team===0?y:68-y;p.vx=0;p.vy=0;p.target=null;p.thinkAt=0;p.runUntil=0;}}
const inPenalty=(pos,team)=>homeSpace(pos,team)<=16.5&&Math.abs(pos.y-34)<=20.16;
export function offsidePositions(s,team,restartKind=null){
 if(['goal-kick','throw-in','corner'].includes(restartKind))return [];
 const line=onPitch(s).filter(p=>p.team!==team).map(p=>homeSpace(p,team)).sort((a,b)=>b-a)[1]??105;
 const limit=Math.max(52.5,homeSpace(s.ball,team),line);
 return onPitch(s).filter(p=>p.team===team&&p.id!==s.ball.owner&&homeSpace(p,team)>limit+.001).map(p=>({id:p.id,x:p.x,y:p.y,margin:homeSpace(p,team)-limit}));
}
// Elapsed retrieval/setup time, separate from viewing speed. Prototype ranges,
// not a target for effective playing time or a historical measurement.
export function restartDelay(s,kind){
 if(kind==='kickoff'&&s.time===0)return 2;
 const range={kickoff:[22,32],'throw-in':[8,15],'goal-kick':[18,28],corner:[18,26],direct:[12,25],indirect:[10,20],penalty:[40,60],'drop-ball':[6,10]}[kind]||[8,12];
 return range[0]+random(s)*(range[1]-range[0]);
}
export function awardRestart(s,team,kind,point=null){
 s.giveAndGo=null;
 stopFlow(s);
 commitSubstitutions(s);
 s.advantage=null;s.phase='restart';s.restartKind=kind;s.restartTeam=team;s.restartUntil=s.time+restartDelay(s,kind);s.flight=null;s.offsidePhase=null;s.pendingRestart=true;if(['direct','drop-ball','throw-in'].includes(kind)){for(const q of onPitch(s)){q.vx=q.vy=0;q.target=null;q.thinkAt=0;q.runUntil=0;}}else resetShape(s);
 const pos=kind==='penalty'?{x:team===0?94:11,y:34}:point?{x:clamp(point.x,1,104),y:clamp(point.y,1,67)}:kind==='kickoff'?{x:52.5,y:34}:{x:team===0?5:100,y:34};
 if(!['kickoff','goal-kick','direct','drop-ball','throw-in'].includes(kind))for(const q of onPitch(s).filter(q=>q.role!=='GK')){const local=homeSpace(pos,q.team),[ax,ay]=anchorFor(q);q.x=q.team===0?clamp(ax+(local-52.5)*.5,8,97):105-clamp(ax+(local-52.5)*.5,8,97);q.y=clamp((q.team===0?ay:68-ay)+(pos.y-34)*.18,3,65);}
 if(kind==='drop-ball'){if((pos.x<=5.5||pos.x>=99.5)&&Math.abs(pos.y-34)<=9.16)pos.x=pos.x<52.5?5.5:99.5;s.ball={x:pos.x,y:pos.y,z:0,owner:null};s.restartPoint=pos;s.restartTaker=null;emit(s,'restart',team,null,'Play will restart with a contested dropped ball.',{kind,point:{...pos}});return;}
 const p=['kickoff','penalty'].includes(kind)?onPitch(s).filter(p=>p.team===team&&p.role!=='GK').sort((a,b)=>kind==='penalty'?(b.finish+b.composure)-(a.finish+a.composure):Math.abs((a.slot??a.number)-10)-Math.abs((b.slot??b.number)-10))[0]:kind==='goal-kick'?onPitch(s).find(p=>p.team===team&&p.role==='GK'):nearest(s,team,pos).find(p=>p.role!=='GK');
 p.x=pos.x;p.y=pos.y;
 if(kind==='kickoff')for(const q of onPitch(s)){if(homeSpace(q,q.team)>50)q.x=q.team===0?50:55;}
 if(kind==='kickoff'){p.x=52.5;const partner=onPitch(s).find(q=>q.team===team&&(q.slot??q.number)===11&&q.id!==p.id)||onPitch(s).find(q=>q.team===team&&q.id!==p.id&&q.role!=='GK');partner.x=52.5-direction(team)*.15;partner.y=34+direction(team)*5;}
 for(const q of onPitch(s).filter(q=>q.team!==team)){if(kind==='goal-kick'&&inPenalty(q,team))q.x=team===0?18:87;const d=distance(q,pos),minimum=kind==='throw-in'?2:9.2;if(d<minimum){const dx=q.x-pos.x,dy=q.y-pos.y;q.x=clamp(pos.x+(dx/(d||1)||-direction(team))*minimum,1,104);q.y=clamp(pos.y+dy/(d||1)*minimum,1,67);}}
 own(s,p);s.ball.x=pos.x;s.ball.y=pos.y;s.restartPoint=pos;s.restartTaker=p.id;
 if(kind==='corner')s.stats[team].corners=(s.stats[team].corners||0)+1;if(kind==='throw-in')s.stats[team].throwIns=(s.stats[team].throwIns||0)+1;
 if(kind==='penalty'){const keeper=onPitch(s).find(q=>q.team!==team&&q.role==='GK');keeper.x=goalX(team);keeper.y=34;for(const q of onPitch(s).filter(q=>q.id!==p.id&&q.id!==keeper.id)){if(homeSpace(q,team)>84)q.x=team===0?84:21;}}
 if(kind==='direct'&&105-homeSpace(pos,team)<32){const dir=direction(team),dx=goalX(team)-pos.x,dy=34-pos.y,d=Math.hypot(dx,dy);for(const [i,q]of onPitch(s).filter(q=>q.team!==team&&q.role==='CB').slice(0,2).entries()){q.x=clamp(pos.x+dx/d*9.3-dy/d*(i?1:-1),1,104);q.y=clamp(pos.y+dy/d*9.3+dx/d*(i?1:-1),1,67);}}
 const label={'direct':'direct free kick','penalty':'penalty kick','kickoff':'kick-off','goal-kick':'goal kick','throw-in':'throw-in','corner':'corner','indirect':'indirect free kick'}[kind]||kind;
 emit(s,'restart',team,p.id,`${s.teams[team].name} prepare ${kind==='indirect'?'an':'a'} ${label}.`,{kind,point:{...pos}});
}
function restart(s,team,kind,point=null){awardRestart(s,team,kind,point);}
function takeRestart(s){
 const p=player(s,s.restartTaker),kind=s.restartKind;s.pendingRestart=false;s.restartOrigin=kind;
 if(kind==='drop-ball'){s.restartOrigin=null;s.ball.owner=null;s.looseSince=s.time;emit(s,'drop-ball',null,null,'The referee drops the ball; either side can collect it.');return;}
 if(kind==='penalty'){const error=.3+(100-(p.finish*.6+p.composure*.4))*.035,side=random(s)<.5?-1:1;launch(s,p,'shot',{x:goalX(p.team)+direction(p.team),y:34+(side*2.2+(random(s)-.5)*2*error)*direction(p.team)},null,{style:'penalty',text:`${p.name} takes the penalty!`});return;}
 if(kind==='direct'&&105-homeSpace(p,p.team)<30&&Math.abs(p.y-34)<20&&random(s)<.65){const error=2+(100-p.technique)*.07+(105-homeSpace(p,p.team))*.1;launch(s,p,'shot',{x:goalX(p.team)+direction(p.team),y:34+(random(s)-.5)*2*error*direction(p.team)},null,{style:'free-kick',text:`${p.name} shoots from the free kick!`});return;}
 if(kind==='kickoff'){const q=onPitch(s).find(q=>q.team===p.team&&(q.slot??q.number)===11&&q.id!==p.id)||onPitch(s).find(q=>q.team===p.team&&q.id!==p.id&&q.role!=='GK');launch(s,p,'pass',{x:52.5+direction(p.team)*.4,y:34+direction(p.team)*5},q);return;}
 if(kind==='goal-kick'&&keeperKick(s,p,20))return;
 let options=onPitch(s).filter(q=>q.team===p.team&&q.id!==p.id&&q.role!=='GK'&&distance(p,q)>3);
 if(kind==='goal-kick'||['indirect','direct'].includes(kind)&&inPenalty(p,p.team))options=options.filter(q=>!inPenalty(q,p.team));
 if(kind==='kickoff')options=options.filter(q=>homeSpace(q,p.team)>52.5);
 if(kind==='throw-in'){
  const nearby=options.filter(q=>distance(p,q)<=20);
  if(nearby.length){
   const offers=nearby.map(q=>({q,score:assessPass(s,p,q).weight-distance(p,q)*.12}));
   offers.sort((a,b)=>Math.round((b.score-a.score)*1e8)||a.q.number-b.q.number);
   const {q}=offers[0];
   launch(s,p,'pass',{x:q.x,y:clamp(q.y,2,66)},q,{
    text:`${p.name} throws short to ${q.name}.`
   });
   return;
  }
 }
 options.sort((a,b)=>(kind==='corner'?Math.abs(homeSpace(a,p.team)-94):distance(p,a))-(kind==='corner'?Math.abs(homeSpace(b,p.team)-94):distance(p,b)));
 const q=options[0];if(!q){s.restartOrigin=null;restart(s,p.team,kind,s.restartPoint);return;}
 launch(s,p,kind==='corner'?'cross':'pass',{x:q.x,y:q.y},q);
}
function offsideContact(s,p){
 const phase=s.offsidePhase,offender=phase?.team===p.team&&phase.candidates.find(q=>q.id===p.id);if(!offender)return false;
 s.stats[p.team].offsides=(s.stats[p.team].offsides||0)+1;
 emit(s,'offside',p.team,p.id,`The flag is up! ${p.name} is given offside.`,{releasePosition:offender,passEvent:phase.passEvent});
 restart(s,1-p.team,'indirect',offender);return true;
}
// Return the first line crossed by this step, even at a pitch corner.
export function pitchExit(from,to){
 let exit=null;
 for(const [axis,limit] of [['x',0],['x',105],['y',0],['y',68]]){
  if(limit===0?to[axis]>=limit:to[axis]<=limit)continue;
  const fraction=(limit-from[axis])/(to[axis]-from[axis]);
  if(fraction<0||fraction>1||exit&&fraction>=exit.fraction-1e-10)continue;
  const point={x:from.x+(to.x-from.x)*fraction,y:from.y+(to.y-from.y)*fraction,[axis]:limit};
  exit={axis,limit,fraction,point};
 }
 return exit;
}
function boundaryRestart(s,lastTeam,exit,cause){
 const {axis,limit,point}=exit;
 const defending=limit===0?0:1;
 const kind=axis==='y'?'throw-in':lastTeam===defending?'corner':'goal-kick';
 const team=kind==='goal-kick'?defending:1-lastTeam;
 const restartPoint=kind==='throw-in'?{x:point.x,y:limit===0?1:67}:
  kind==='corner'?{x:limit===0?1:104,y:point.y<34?1:67}:null;
 if(kind==='goal-kick')s.stats[team].goalKicks=(s.stats[team].goalKicks||0)+1;
 emit(s,'ball-out',team,null,kind==='throw-in'?'The ball crosses the touchline.':
  kind==='corner'?'The ball goes behind off the defending side.':'The ball runs out for a goal kick.',
  {restartKind:kind,lastTouchTeam:lastTeam,point,cause});
 restart(s,team,kind,restartPoint);
}
export function createSimulation({seed=99,duration=180,scenario='open',profile='balanced',preset='balanced',strengths=['standard','standard'],kickoffTeam=0,managedTeam=null,fullMatch=false,clubs=null,homeSide=null,rosters=null}={}){
 const initialSeed=Number(seed)>>>0;
 const s={version:19,flow:{possession:null,clearance:null,teams:[0,1].map(()=>({
  spells:0,seconds:0,shortSpells:0,losses:[0,0,0],clearances:0,quickOppositionRegains:0,returnShots:0
 }))},timing:{live:0,stopped:0},seed:initialSeed,rng:initialSeed,time:0,duration:fullMatch?5400:clamp(Number(duration)||180,30,600),fullMatch:fullMatch?{firstKickoff:kickoffTeam===1?1:0,half:1}:null,phase:'restart',serial:0,events:[],players:[],ball:{x:52.5,y:34,owner:null},flight:null,score:[0,0],managedTeam:managedTeam===0||managedTeam===1?managedTeam:null,subsUsed:[0,0],pendingSubs:[],teams:[{name:'Blue XI',tactic:preset,plan:makePlan(preset),profile},{name:'Red XI',tactic:'balanced',plan:makePlan(),profile:'balanced'}],stats:[0,1].map(()=>({passes:0,completed:0,recycles:0,switches:0,shots:0,shotsOnTarget:0,fouls:0,penalties:0,yellows:0,reds:0,knocks:0,injuries:0,substitutions:0,saves:0,parries:0,blocks:0,tackles:0,interceptions:0,carries:0,takeOns:0,longKicks:0,miscontrols:0,offsides:0,corners:0,throwIns:0,longBalls:0,crosses:0,cutbacks:0,errantPasses:0,aerials:0,clearances:0,possession:0})),possession:0,decisionAt:0,immunity:0,restartUntil:0,scenario:!fullMatch&&['open','counter','wide','keeper','offside','support','corner','throw-in','long-ball','early-cross','byline-cross','cutback','passing','overlap-safe','overlap-threat','overlap-risk','recovery','shot-angle','shot-close','box-defence','build-up','switch-play','pressed-build-up','foul-demo','penalty-demo','appeal-demo','advantage-demo','red-demo','knock-demo','injury-demo','strain-demo','keeper-injury-demo','substitution-demo','through-ball','one-two','pass-lane','tackle-duel','tired-press'].includes(scenario)?scenario:'open'};
 for(let team=0;team<2;team++)for(let i=0;i<11;i++){const [x,y,role]=anchors[i];s.players.push({id:`${team}-${i+1}`,team,number:i+1,name:names[team][i],role,x:team===0?x:105-x,y:team===0?y:68-y,vx:0,vy:0,pass:62+random(s)*25,finish:role==='ST'?70+random(s)*16:50+random(s)*23,tackle:role==='CB'?78:60+random(s)*20,pace:4.7+random(s)*.8});}
 for(const p of onPitch(s)){for(const key of ['technique','decisions','composure','offball','positioning','teamwork','discipline','stamina','anticipation','handling','reflexes'])p[key]=56+random(s)*26;p.acceleration=clamp((p.pace-3)*20+p.stamina*.28,25,95);p.agility=clamp(p.technique*.65+p.decisions*.35,25,95);p.dribbling=p.technique;p.heading=clamp((p.technique+p.finish)/2+(['ST','CB'].includes(p.role)?6:0),25,95);p.strength=(p.tackle+p.stamina)/2;p.roam=random(s);p.energy=100;p.instruction='auto';p.thinkAt=0;p.target=null;p.intent='Keep shape';}applyProfile(s,0,profile);for(let team=0;team<2;team++)applyStrength(s,team,strengths[team]||'standard');
 const reserveNames=[['W. Morris','X. Duncan','Y. Cameron','Z. Miller','A. Watson'],['W. Ellis','X. Turner','Y. Bennett','Z. Harris','A. Lewis']];
 for(let team=0;team<2;team++)for(const [i,index]of [0,2,6,5,9].entries()){
  const original=s.players[team*11+index],q=JSON.parse(JSON.stringify(original));q.id=`${team}-${12+i}`;q.number=12+i;q.name=reserveNames[team][i];q.bench=true;q.played=false;q.intent='Named substitute';q.target=null;q.vx=q.vy=0;q.energy=100;q.base={...original.base};
  for(const key of Object.keys(q.base))if(typeof q.base[key]==='number'&&key!=='roam'){const delta=(random(s)-.6)*(key==='pace'?.3:10);q.base[key]=clamp(q.base[key]+delta,key==='pace'?3.5:25,key==='pace'?6.5:95);}
  s.players.push(q);
 }
 if(fullMatch){
  const lineups=Array.isArray(rosters)&&rosters.length===2?rosters.map(labLineup):null;
  const rosterBased=lineups?.every(Boolean)===true;
  setRatedClubs(s,clubs,homeSide,rosterBased);
  if(rosterBased&&s.teams.every(team=>team.rosterBased))applyLabLineups(s,lineups);
 }
 for(let team=0;team<2;team++)applyProfile(s,team,s.teams[team].profile);
 restart(s,kickoffTeam===1?1:0,s.scenario==='keeper'?'goal-kick':'kickoff');
 if(['counter','wide'].includes(s.scenario)){
  s.phase='play';const p=s.players.find(p=>p.team===0&&p.number===(s.scenario==='wide'?9:7));p.x=s.scenario==='wide'?72:48;p.y=s.scenario==='wide'?59:33;
  if(s.scenario==='counter'){for(const q of onPitch(s).filter(p=>p.team===1&&p.role!=='GK'))q.x-=18;}
  if(s.scenario==='wide')s.teams[0].plan.width='wide';own(s,p);emit(s,'scenario',0,p.id,s.scenario==='wide'?'Blue start a wide attack.':'Blue regain the ball with room to counter.');
 }
 if(['through-ball','one-two'].includes(s.scenario)){
  setupCombination(s);
 }
 if(s.scenario==='offside'){
  s.phase='play';const p=s.players.find(p=>p.id==='0-7'),q=s.players.find(p=>p.id==='0-10');
  for(const d of onPitch(s).filter(p=>p.team===1)){d.x=d.role==='GK'?100:78;d.y=d.role==='GK'?34:d.number%2?12:56;}
  p.x=65;p.y=34;q.x=85;q.y=34;own(s,p);launch(s,p,'pass',{x:85,y:34},q);
 }
 if(s.scenario==='support'){
  s.phase='play';const p=s.players.find(p=>p.id==='0-10');p.x=55;p.y=34;
  for(const id of ['0-2','0-7','0-8']){const q=player(s,id);q.x=53;q.y=34;q.target=null;q.thinkAt=0;}own(s,p);
  emit(s,'scenario',0,p.id,'Blue need to spread out and offer passing angles.');
 }
 if(s.scenario==='corner')restart(s,0,'corner',{x:104,y:1});if(s.scenario==='throw-in')restart(s,0,'throw-in',{x:60,y:1});
 if(['long-ball','early-cross','byline-cross','cutback','passing'].includes(s.scenario)){
  s.phase='play';s.pendingRestart=false;const p=player(s,s.scenario==='long-ball'?'0-3':s.scenario==='passing'?'0-7':'0-9'),q=player(s,'0-10');
  p.x=s.scenario==='long-ball'?36:s.scenario==='passing'?52:s.scenario==='early-cross'?74:96;p.y=['long-ball','passing'].includes(s.scenario)?34:59;
  q.x=s.scenario==='long-ball'?70:s.scenario==='passing'?72:90;q.y=30;player(s,'0-11').x=87;player(s,'0-11').y=40;
  for(const d of onPitch(s).filter(d=>d.team===1&&d.role!=='GK')){d.x=s.scenario==='long-ball'?77:s.scenario==='passing'?84:92;d.y=d.number%2?20:48;}
  own(s,p);s.decisionAt=0;
  if(s.scenario==='long-ball')deliver(s,p,'long-ball',{x:80,y:30},q,20);
  else if(s.scenario==='passing')deliver(s,p,'pass',{x:q.x,y:q.y},q,20);
  else deliver(s,p,s.scenario==='cutback'?'cutback':'cross',{x:s.scenario==='cutback'?88:94,y:30},q,20,s.scenario==='early-cross'?'early':s.scenario==='cutback'?'cutback':'byline');
 }
 if(['overlap-safe','overlap-threat','overlap-risk','recovery'].includes(s.scenario)){
  s.phase='play';s.pendingRestart=false;s.teams[0].plan.fullbacks=s.scenario==='overlap-risk'?'attack':'balanced';
  const fb=player(s,'0-2'),cover=player(s,'0-7'),wing=player(s,'0-6');Object.assign(fb,{x:32,y:9,instruction:s.scenario==='overlap-risk'?'overlap':'auto'});Object.assign(cover,{x:38,y:17,positioning:78,teamwork:78});Object.assign(wing,{x:58,y:14});
  for(const q of onPitch(s).filter(p=>p.team===1&&p.role!=='GK')){q.x=75;q.y=q.number%2?28:52;}
  if(s.scenario!=='overlap-safe')Object.assign(player(s,'1-9'),{x:36,y:10});
  if(s.scenario==='overlap-risk')for(const q of onPitch(s).filter(p=>p.team===0&&['CM','W'].includes(p.role)&&p.id!==wing.id))q.x=70;
  if(s.scenario==='recovery'){Object.assign(fb,{x:72,y:9,vx:4,overlapAt:0});cover.coverFor=fb.id;const opponent=player(s,'1-7');opponent.x=65;opponent.y=14;own(s,opponent);s.transition={team:1,at:0};}
  else own(s,wing);
  emit(s,'scenario',s.possession,s.ball.owner,s.scenario==='overlap-safe'?'Blue can overlap with a midfielder covering.':s.scenario==='overlap-threat'?'An opposing winger is holding the flank.':s.scenario==='overlap-risk'?'Blue are instructed to overlap despite the exposed flank.':'Blue must recover after losing the ball.');
 }
 if(['shot-angle','shot-close','box-defence'].includes(s.scenario)){
  s.phase='play';s.pendingRestart=false;const p=player(s,'0-10'),keeper=player(s,'1-1');
  for(const q of s.players){q.target=null;q.thinkAt=0;q.vx=q.vy=0;if(q.role!=='GK'){q.x=q.team===0?65:82;q.y=q.number%2?10:58;}}
  p.x=s.scenario==='shot-close'?95:89;p.y=s.scenario==='shot-angle'?47:34;own(s,p);
  const aim=keeperTarget(s,keeper);keeper.x=aim.x;keeper.y=aim.y;
  if(s.scenario==='box-defence'){Object.assign(player(s,'1-3'),{x:94,y:33});Object.assign(player(s,'1-4'),{x:97,y:38});p.x=94;p.y=36;own(s,p);s.decisionAt=s.time+.8;}
  else launch(s,p,'shot',{x:106,y:s.scenario==='shot-angle'?32:35});
  emit(s,'scenario',0,p.id,s.scenario==='box-defence'?'Blue attack with defenders protecting the goal.':'A controlled shot tests the keeper’s angle and reaction.');
 }
 if(['build-up','switch-play','pressed-build-up'].includes(s.scenario)){
  s.phase='play';s.pendingRestart=false;for(const q of s.players){q.target=null;q.thinkAt=0;q.vx=q.vy=0;if(q.role!=='GK'){q.x=q.team===0?45:72;q.y=q.number%2?12:56;}}
  const p=player(s,'0-7'),back=player(s,'0-3'),wide=player(s,'0-9'),front=player(s,'0-10');p.x=52;p.y=s.scenario==='switch-play'?10:34;back.x=42;back.y=24;wide.x=48;wide.y=43;front.x=65;front.y=34;
  Object.assign(player(s,'1-7'),{x:58,y:p.y});Object.assign(player(s,'1-8'),{x:59,y:p.y+4});
  if(s.scenario==='pressed-build-up')Object.assign(player(s,'1-7'),{x:55,y:35});
  if(s.scenario==='switch-play'){for(const q of onPitch(s).filter(q=>q.team===1&&q.role!=='GK')){q.x=58+(q.number%3)*3;q.y=8+(q.number%3)*4;}}
  own(s,p);s.decisionAt=s.time+1.5;
  emit(s,'scenario',0,p.id,s.scenario==='build-up'?'The route ahead is crowded; Blue can recycle possession.':s.scenario==='switch-play'?'The defending side has shifted across; Blue can look for the far side.':'Blue must decide before the press arrives.');
 }
 if(['foul-demo','penalty-demo','appeal-demo','advantage-demo','red-demo','knock-demo'].includes(s.scenario)){
  s.phase='play';s.pendingRestart=false;const p=player(s,'0-10'),q=player(s,'1-3');p.x=s.scenario.includes('penalty')||s.scenario==='appeal-demo'?95:78;p.y=34;p.vx=0;q.x=p.x-1;q.y=34;q.vx=0;own(s,p);
  emit(s,'scenario',0,p.id,'Controlled incident fixture; the same adjudication and restart code is used in open play.');
  resolveChallenge(s,q.id,p.id,{foul:s.scenario==='appeal-demo'?1:0,force:s.scenario==='red-demo'?1:.2,injury:s.scenario==='knock-demo'?0:1,serious:1,appeal:true,advantage:s.scenario==='advantage-demo'});
  if(s.scenario==='advantage-demo'){const opponent=player(s,'1-7');own(s,opponent);}
 }
 if(['injury-demo','strain-demo','keeper-injury-demo'].includes(s.scenario)){
  s.phase='play';s.pendingRestart=false;s.ball.owner='0-7';s.possession=0;const p=player(s,s.scenario==='keeper-injury-demo'?'0-1':'0-7');s.ball.x=p.x;s.ball.y=p.y;
  emit(s,'scenario',0,p.id,'Controlled injury fixture; choose a substitute or continue short-handed.');injurePlayer(s,p.id,{cause:s.scenario==='strain-demo'?'non-contact':'contact'});
 }
 if(s.scenario==='pass-lane'){
  s.phase='play';s.pendingRestart=false;for(const q of onPitch(s)){q.target=null;q.thinkAt=0;q.vx=q.vy=0;if(q.role!=='GK'){q.x=q.team===0?35:88;q.y=q.number%2?10:58;}}
  const passer=player(s,'0-7'),receiver=player(s,'0-10'),defender=player(s,'1-7');Object.assign(passer,{x:52,y:34});Object.assign(receiver,{x:74,y:34});Object.assign(defender,{x:65,y:36,anticipation:90});own(s,passer);launch(s,passer,'pass',{x:74,y:34},receiver);emit(s,'scenario',1,defender.id,'Red can anticipate the passing lane; physical movement and contact decide the outcome.');
 }
 if(s.scenario==='tackle-duel'){
  s.phase='play';s.pendingRestart=false;const carrier=player(s,'0-10'),defender=player(s,'1-3');Object.assign(carrier,{x:92,y:34});Object.assign(defender,{x:93.2,y:34});own(s,carrier);s.immunity=0;s.decisionAt=s.time+1.5;emit(s,'scenario',1,defender.id,'Red must choose when to tackle or stay on their feet in the box.');
 }
 if(s.scenario==='tired-press'){
  s.phase='play';s.pendingRestart=false;for(const p of onPitch(s).filter(p=>p.team===0&&p.role!=='GK'))p.energy=55;own(s,player(s,'1-7'));emit(s,'scenario',0,null,'Blue outfield players start at 55% energy; compare the current plan with a high press and fresh substitutes.');
 }
 if(s.scenario==='substitution-demo'){
  s.phase='play';s.pendingRestart=false;const p=player(s,'0-6');p.x=60;p.y=1;own(s,p);s.ball.y=.3;launch(s,p,'pass',{x:s.ball.x,y:-8},player(s,'0-9'),{text:'Controlled fixture: the ball is about to leave play. Queue a change, then choose Next action.'});
 }
 return s;
}
export function setTactic(s,team,tactic){
 if(![0,1].includes(team))return;
 // Preserve old lab API aliases while the visible presets use the four new plans.
 if(['wide','direct'].includes(tactic)){s.teams[team].plan=makePlan();s.teams[team].plan[tactic==='wide'?'width':'passing']=tactic;s.teams[team].tactic='balanced';}
 else{if(!PRESETS[tactic])return;s.teams[team].tactic=tactic;s.teams[team].plan=makePlan(tactic);}
 for(const p of onPitch(s).filter(p=>p.team===team))p.thinkAt=0;
 emit(s,'tactic',team,null,`${s.teams[team].name} switch to ${PRESETS[tactic]?.label||tactic}.`,{plan:{...s.teams[team].plan}});
}
export function adjustPlan(s,team,key,value){if(![0,1].includes(team)||!PLAN_OPTIONS[key]?.values[value])return false;s.teams[team].plan[key]=value;for(const p of onPitch(s).filter(p=>p.team===team))p.thinkAt=0;emit(s,'tactic',team,null,`${s.teams[team].name}: ${PLAN_OPTIONS[key].label.toLowerCase()} — ${PLAN_OPTIONS[key].values[value]}.`,{plan:{...s.teams[team].plan}});return true;}
export function instructPlayer(s,id,instruction){const p=player(s,id);if(!p||p.sentOff||p.bench||p.subbedOff||p.injuredOff||!INSTRUCTIONS[instruction]||p.role==='GK'&&instruction!=='hold'&&instruction!=='auto')return false;p.instruction=instruction;p.thinkAt=0;emit(s,'instruction',p.team,p.id,`${p.name}: ${INSTRUCTIONS[instruction].toLowerCase()}.`);return true;}
// Condition is an abstract capacity, not a measured heart-rate/calorie model.
// Load follows actual movement; a stationary keeper should not tire like a pressing midfielder.
export function conditionAfter(p,{exertion=0,pressing=false,rest=false,dt=STEP}={}){
 const energy=p.energy??100,stamina=clamp(p.stamina??70,25,95),work=clamp(exertion,0,1);
 if(rest)return clamp(energy+dt*.002*(1-energy/100),25,100);
 const load=p.role==='GK'?.0004+work*work*.003:.0008+work*work*.012+(pressing?.006:0);
 return clamp(energy-dt*load*(1.8-stamina/100),25,100);
}
export function moveVelocity(p,target,dt=STEP){
 const dx=target.x-p.x,dy=target.y-p.y,d=Math.hypot(dx,dy),desired=(p.pace||5)*(.75+.25*p.energy/100)*Math.min(1,d/1.8)*(p.carryFactor??1)*(p.knockUntil>p.currentTime?.78:1);
 const oldSpeed=Math.hypot(p.vx,p.vy),oldAngle=Math.atan2(p.vy,p.vx),desiredAngle=d>1e-4?Math.atan2(dy,dx):oldAngle;
 let difference=Math.atan2(Math.sin(desiredAngle-oldAngle),Math.cos(desiredAngle-oldAngle));if(Math.abs(Math.abs(difference)-Math.PI)<1e-9)difference=Math.PI;const turn=(1.5+(p.agility??70)*.055)*dt;
 const angle=oldSpeed>.15?oldAngle+clamp(difference,-turn,turn):desiredAngle;
 const cornering=oldSpeed>.15?clamp(1-Math.abs(difference)*.16,.5,1):1,goalSpeed=desired*cornering;
 const acceleration=(2.2+(p.acceleration??70)*.045)*(.7+.3*p.energy/100),rate=goalSpeed<oldSpeed?acceleration*1.4:acceleration;
 const speed=clamp(oldSpeed+clamp(goalSpeed-oldSpeed,-rate*dt,rate*dt),0,p.pace||5);
 return {vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed};
}
export function assessFlank(s,team){
 const ours=onPitch(s).filter(p=>p.team===team),owner=player(s,s.ball.owner),plan=s.teams[team].plan;
 const result={attackId:null,coverId:null,oppositeId:null,hole:null,risk:false,reason:'Hold defensive shape'};
 if(!owner||owner.team!==team||owner.role==='GK')return result;
 const localBall=homeSpace(s.ball,team),pressure=distance(owner,nearest(s,1-team,owner)[0]),options=[];
 for(const fb of ours.filter(p=>p.role==='FB'&&p.id!==owner.id)){
  const mode=fb.instruction==='hold'?'stay':fb.instruction==='overlap'?'attack':plan.fullbacks||'balanced';
  if(mode==='stay'||!['auto','overlap'].includes(fb.instruction)||fb.energy<40||localBall<43)continue;
  const baseY=team===0?anchors[(fb.slot??fb.number)-1][1]:68-anchors[(fb.slot??fb.number)-1][1];if(Math.abs(s.ball.y-baseY)>31)continue;
  const threat=onPitch(s).filter(p=>p.team!==team&&p.role!=='GK'&&Math.abs(p.y-baseY)<14&&homeSpace(p,team)<homeSpace(fb,team)+12).sort((a,b)=>homeSpace(a,team)-homeSpace(b,team))[0];
  const hole={x:team===0?clamp(homeSpace(fb,team)-3,24,42):105-clamp(homeSpace(fb,team)-3,24,42),y:baseY};
  const cover=ours.filter(p=>['CM','W'].includes(p.role)&&p.id!==owner.id&&!['hold','forward','overlap'].includes(p.instruction)&&homeSpace(p,team)<localBall-4).sort((a,b)=>(distance(a,hole)-(a.positioning+a.teamwork)*.08)-(distance(b,hole)-(b.positioning+b.teamwork)*.08))[0];
  const covered=cover&&distance(cover,hole)<23&&(cover.positioning+cover.teamwork)/2>=57;
  const danger=Boolean(threat)||pressure<3||!covered;
  if(mode==='balanced'&&danger)continue;
  options.push({fb,cover:covered?cover:null,hole,risk:danger,score:Math.abs(s.ball.y-baseY)+(mode==='attack'?-4:0)});
 }
 options.sort((a,b)=>a.score-b.score||a.fb.number-b.fb.number);const choice=options[0];
 if(!choice){result.reason=plan.fullbacks==='stay'?'Fullbacks instructed to stay back':'Fullbacks waiting for space and cover';return result;}
 Object.assign(result,{attackId:choice.fb.id,coverId:choice.cover?.id||null,hole:choice.hole,risk:choice.risk,oppositeId:ours.find(p=>p.role==='FB'&&p.id!==choice.fb.id)?.id||null,reason:choice.risk?'Overlap risks space behind':'Overlap with midfield cover'});return result;
}
function trackingTargets(s,team,pressers){
 if(s.possession===team)return new Map();const result=new Map(),available=onPitch(s).filter(p=>p.team===team&&['CB','FB'].includes(p.role)&&p.instruction!=='hold'&&!pressers.includes(p.id));
 const runners=onPitch(s).filter(p=>p.team!==team&&['ST','W'].includes(p.role)&&homeSpace(p,team)<65).sort((a,b)=>Math.round((homeSpace(a,team)-homeSpace(b,team))*1e7)||a.number-b.number);
 for(const runner of runners){const choices=available.filter(p=>!result.has(p.id)&&distance(p,runner)<22).sort((a,b)=>Math.round(((distance(a,runner)-a.positioning*.035)-(distance(b,runner)-b.positioning*.035))*1e7)||a.number-b.number);const p=choices[0];if(!p)continue;result.set(p.id,{x:homeSpace(runner,team)-2-(100-p.positioning)*.015,y:runner.y+(34-runner.y)*.08});if(result.size===2)break;}
 return result;
}
// Cover the angle between ball and posts; do not follow the ball's full lateral offset.
export function keeperTarget(s,p){
 const local=homeSpace(s.ball,p.team),depth=clamp(local*.12,1.5,7),ratio=depth/Math.max(depth,local);
 let y=34+(s.ball.y-34)*ratio,intent='Cover the goal angle';
 const f=s.flight;
 if(f?.kind==='shot'&&f.team!==p.team&&shotGoalOffset(f,s.ball)<=GOAL_HALF_WIDTH+KEEPER_WIDE_MARGIN&&f.age>=.16+(100-(p.reflexes??70))*.003){
  const plane=p.team===0?depth:105-depth,time=(plane-s.ball.x)/f.vx;
  if(time>=0){y=s.ball.y+f.vy*time;intent='React to the shot';}
 }
 return {x:p.team===0?depth:105-depth,y:clamp(y,29.5,38.5),intent};
}
// A defender may close a reachable future point on the actual shot path.
// Anticipation affects reaction; movement still goes through moveVelocity.
export function shotBlockTarget(s,p){
 const f=s.flight;if(!f||f.kind!=='shot'||p.role==='GK'||p.team===f.team||f.age<.12+(100-p.anticipation)*.003)return null;
 const speed2=f.vx*f.vx+f.vy*f.vy;if(!speed2)return null;
 const projection=((p.x-s.ball.x)*f.vx+(p.y-s.ball.y)*f.vy)/speed2;
 if(projection<=0)return null;
 const goalTime=(goalX(f.team)-s.ball.x)/f.vx;if(goalTime<=0)return null;
 const t=Math.min(projection,goalTime),point={x:s.ball.x+f.vx*t,y:s.ball.y+f.vy*t};
 const running=Math.hypot(p.vx,p.vy),travel=Math.min(p.pace*t,running*t+.5*(2.2+p.acceleration*.045)*(.7+.3*p.energy/100)*t*t);
 return distance(p,point)<=travel+.75?point:null;
}
// Close a pass lane ahead of the ball instead of chasing its current position.
// This is only an intention; ordinary travel and contact resolve interception.
export function passInterceptTarget(s,p){
 const f=s.flight;if(!f||!['pass','cutback'].includes(f.kind)||f.loft||f.team===p.team||p.role==='GK'||f.mustLeaveArea)return null;
 const reaction=.12+(100-p.anticipation)*.004;if(f.age<reaction)return null;
 const speed=Math.hypot(f.vx,f.vy),remaining=Math.min(2.5,distance(s.ball,f.target)/(speed||1));
 for(let t=.1;t<=remaining+.001;t+=.1){const aim={x:s.ball.x+f.vx*t,y:s.ball.y+f.vy*t};if(aim.x<1||aim.x>104||aim.y<1||aim.y>67)break;
  const acceleration=(2.2+p.acceleration*.045)*(.7+.3*p.energy/100),reach=Math.min(p.pace*t,Math.hypot(p.vx,p.vy)*t+.5*acceleration*t*t);
  if(distance(p,aim)<=reach+1.1)return {...aim,arrival:t};
 }
 return null;
}
// Contact alone is not a save. A well-set keeper should rarely miss a routine
// central ball; a late or fully stretched contact is substantially harder.
export function keeperSaveChance(p,f,contactDistance){
 const reflexes=p.reflexes??70,reaction=.16+(100-reflexes)*.003;
 const reach=f.delivery==='penalty'?.8+reflexes*.009:1.5+reflexes*.017;
 const stretch=clamp(contactDistance/reach,0,1),late=clamp((reaction+.2-f.age)/.2,0,1);
 const stretchCost=f.delivery==='penalty'?.12:.27;
 return clamp(.975+reflexes*.0002-stretch*stretch*(stretchCost+(100-reflexes)*.001)
  -late*(.04+(100-reflexes)*.0006),.6,.995);
}
// Assess the same physical space for movement and passing; no score/rate targets.
export function assessBuildUp(s,p){
 const plan=s.teams[p.team].plan,dir=direction(p.team),opponents=onPitch(s).filter(q=>q.team!==p.team),pressure=Math.min(...opponents.map(q=>distance(p,q)));
 const ahead={x:p.x+dir*6,y:p.y},forwardSpace=Math.min(...opponents.map(q=>distance(ahead,q)));
 const counter=s.transition?.team===p.team&&s.time-s.transition.at<5&&plan.win==='counter';
 const blocked=forwardSpace<5,settle=p.controlUntil>s.time,committed=p.dribbleUntil>s.time;
 const advance=settle?0:committed?7:blocked?(plan.tempo==='patient'?.15:.4):counter?7:plan.tempo==='patient'?.65:plan.tempo==='quick'?4:1.4;
 return {pressure,forwardSpace,blocked,counter,advance,reason:settle?'Control the first touch':committed?'Committed to a dribble':counter?'Attack the transition':blocked?'Forward route closed':plan.tempo==='patient'?'Wait for a passing option':'Assess the passing options'};
}
export function assessPass(s,p,q){
 const plan=s.teams[p.team].plan,dir=direction(p.team),d=distance(p,q),progress=(q.x-p.x)*dir,opponents=onPitch(s).filter(o=>o.team!==p.team);
 const space=Math.min(...opponents.map(o=>distance(q,o))),lane=Math.min(...opponents.map(o=>segmentDistance(o,p,q)));
 // Arrival margin along the pass, including time available to close the lane.
 let margin=10;for(const o of opponents){const dx=q.x-p.x,dy=q.y-p.y,k=clamp(((o.x-p.x)*dx+(o.y-p.y)*dy)/(d*d||1),.05,1),point={x:p.x+dx*k,y:p.y+dy*k},reach=distance(o,point)-o.pace*(d*k/15)*(.55+o.anticipation/220);margin=Math.min(margin,reach);}
 const awareness=(p.decisions+p.composure)/200,forwardWeight=plan.passing==='direct'?.22:plan.passing==='short'?.025:.09;
 const safety=Math.min(space,10)*.35+clamp(margin,-5,4)*(.45+awareness)
  -Math.max(0,2-lane)*(1+awareness);
 const distanceCost=plan.passing==='short'?.14:plan.passing==='direct'?.055:.085;
 const intoBox=progress>2&&d<23&&space>3&&margin>1&&lane>2
  &&!inPenalty(p,1-p.team)&&inPenalty(q,1-p.team)
  &&!offsidePositions(s,p.team).some(candidate=>candidate.id===q.id);
 const boxBonus=intoBox?2.4*awareness:0;
 const build=assessBuildUp(s,p),recycle=progress< -3&&space>4&&lane>2&&build.blocked,switchPlay=Math.abs(q.y-p.y)>24&&Math.abs(progress)<18&&space>5;
 return {distance:d,progress,space,lane,margin,recycle,switchPlay,intoBox,weight:Math.max(.05,3+progress*forwardWeight+safety-d*distanceCost+boxBonus+(recycle?(plan.passing==='direct'?1:3)*awareness:0)+(switchPlay&&plan.width==='wide'?2*awareness:0))};
}
function movePlayers(s){
 const owner=player(s,s.ball.owner),ball=s.ball,targets=new Map(),recent=s.transition&&s.time-s.transition.at<5;
 const flanks=[0,1].map(team=>assessFlank(s,team));s.flankPlans=flanks;
 const recoverers=!owner&&!s.flight?[0,1].map(team=>nearest(s,team,ball).filter(p=>p.role!=='GK'||homeSpace(ball,team)<18&&Math.abs(ball.y-34)<23)[0]?.id):[];
 const press=[0,1].map(team=>{const plan=s.teams[team].plan,count=plan.press==='high'||recent&&plan.loss==='counterpress'?2:1;return nearest(s,team,ball).filter(p=>p.role!=='GK'&&p.instruction!=='hold'&&p.energy>35&&!(p.role==='FB'&&plan.loss==='regroup'&&s.time-(p.overlapAt??-99)<8)).slice(0,count).map(p=>p.id);});
 const tracking=[0,1].map(team=>trackingTargets(s,team,press[team]));
 const intercepts=new Map(onPitch(s).map(p=>({p,aim:passInterceptTarget(s,p)})).filter(q=>q.aim).sort((a,b)=>Math.round((a.aim.arrival-b.aim.arrival)*1e8)||a.p.number-b.p.number).slice(0,2).map(q=>[q.p.id,q.aim]));
 const landing=s.flight?.loft&&s.flight.kind!=='shot'?[0,1].map(team=>nearest(s,team,s.flight.target).filter(p=>p.role!=='GK').slice(0,2).map(p=>p.id)):[];
 const support=[0,1].map(team=>nearest(s,team,ball,owner?.id).filter(p=>['CM','FB'].includes(p.role)&&p.instruction!=='hold'&&p.id!==flanks[team].attackId&&p.id!==flanks[team].coverId).sort((a,b)=>(distance(a,ball)-a.teamwork*.04-a.offball*.03)-(distance(b,ball)-b.teamwork*.04-b.offball*.03)).slice(0,2).map(p=>p.id));
 for(const p of onPitch(s)){
  const block=shotBlockTarget(s,p),intercept=intercepts.get(p.id);
  const meeting=s.flight?.receiverId===p.id&&s.time>=(s.flight.receiverReadyAt??0);
  const going=s.giveAndGo?.runnerId===p.id&&s.time<s.giveAndGo.expires;

  if(p.role!=='GK'&&!block&&!intercept&&!going&&!(meeting&&p.meetingFlight!==s.flight.passEvent)&&p.id!==recoverers[p.team]&&p.target&&s.time<p.thinkAt){targets.set(p.id,p.target);continue;}
  const dir=direction(p.team),localBall=homeSpace(ball,p.team),[ax,ay]=anchorFor(p),baseY=p.team===0?ay:68-ay,ours=s.possession===p.team,plan=s.teams[p.team].plan,instruction=p.instruction;
  let tx=ax+(localBall-52.5)*(ours?.38:.48)+(ours?5:plan.press==='deep'?-10:plan.press==='high'?2:-4),ty=baseY+(ball.y-34)*.14,intent=ours?'Keep an option':'Recover shape';
  if(block){tx=homeSpace(block,p.team);ty=block.y;intent='Block the shot';}
  else if(intercept){tx=homeSpace(intercept,p.team);ty=intercept.y;intent='Intercept the pass';}
  else if(p.id===recoverers[p.team]){tx=localBall;ty=ball.y;intent='Collect loose ball';}
  else if(p.role==='GK'&&meeting&&s.flight.team===p.team&&s.flight.kind==='pass'){
   tx=homeSpace(s.flight.target,p.team);ty=s.flight.target.y;
   intent='Step out for the back-pass';
  }
  else if(p.role==='GK'&&s.flight?.loft&&s.flight.team!==p.team&&inPenalty(s.flight.target,p.team)&&distance(p,s.flight.target)<12&&s.flight.age/s.flight.duration>.35){tx=homeSpace(s.flight.target,p.team);ty=s.flight.target.y;intent='Come for the high ball';}
  else if(p.role==='GK'){const aim=keeperTarget(s,p);tx=homeSpace(aim,p.team);ty=aim.y;intent=aim.intent;}
  else if(p.id===owner?.id){const build=assessBuildUp(s,p);tx=homeSpace(p,p.team)+build.advance;const lanes=[-3,0,3].map(value=>{const offset=value*dir,y=clamp(p.y+offset,3,65),space=Math.min(...onPitch(s).filter(q=>q.team!==p.team).map(q=>distance(q,{x:p.x+dir*Math.max(1,build.advance),y})));return {y,score:space-Math.abs(value)*(build.blocked?.35:.9)};}).sort((a,b)=>Math.round(b.score*1e8)-Math.round(a.score*1e8));ty=build.advance>.5?lanes[0].y:p.y;intent=build.reason;}
  else if(going){tx=homeSpace(s.giveAndGo.target,p.team);ty=s.giveAndGo.target.y;intent='Run for the return pass';}
  else if(meeting){tx=homeSpace(s.flight.target,p.team);ty=s.flight.target.y;p.meetingFlight=s.flight.passEvent;intent=['cross','cutback'].includes(s.flight.kind)?'Attack the delivery':s.flight.delivery==='through-ball'?'Run onto the through ball':'Meet the pass';}
  else if(s.flight?.loft&&landing[p.team]?.includes(p.id)&&s.time>=(s.flight.receiverReadyAt??0)+.15+(100-p.anticipation)/150){tx=homeSpace(s.flight.target,p.team)-(s.flight.team===p.team?2:1);ty=s.flight.target.y+(p.number%2?-1.5:1.5)*dir;intent=s.flight.team===p.team?'Support the landing':'Track the long ball';}
  else if(instruction==='hold'&&(owner||s.flight)){tx=ax+(localBall-52.5)*.22;ty=baseY;intent='Hold position';}
  else if(!owner&&!s.flight&&nearest(s,p.team,ball)[0]?.id===p.id){tx=localBall;ty=ball.y;intent='Collect loose ball';}
  else if(!ours&&press[p.team].includes(p.id)&&(plan.press!=='deep'||localBall<65)){const contain=p.containUntil>s.time;tx=localBall-(contain?1.1:.6);ty=ball.y;intent=contain?'Stay on feet':recent&&plan.loss==='counterpress'?'Counterpress':'Close the carrier';}
  else if(!ours&&p.coverFor&&s.time-(player(s,p.coverFor)?.overlapAt??-99)<8&&homeSpace(player(s,p.coverFor),p.team)>42){const fb=player(s,p.coverFor);tx=32;ty=p.team===0?anchors[(fb.slot??fb.number)-1][1]:68-anchors[(fb.slot??fb.number)-1][1];intent='Cover the recovering fullback';}
  else if(!ours&&tracking[p.team].has(p.id)){const mark=tracking[p.team].get(p.id);tx=mark.x;ty=mark.y;intent='Track the runner';}
  else if(!ours&&p.role==='FB'&&s.time-(p.overlapAt??-99)<8&&homeSpace(p,p.team)>37){tx=Math.min(tx,homeSpace(p,p.team)-12);ty=baseY;intent='Recover the flank';}
  else if(!ours&&p.role==='CM'&&localBall<65&&Math.abs(p.y-ball.y)<24){tx=localBall-6-(100-p.positioning)*.03;ty=34+(ball.y-34)*.55+(baseY<34?-4:4);intent='Screen the route to goal';}
  else if(!ours&&['CB','CM'].includes(p.role)&&p.teamwork>=65&&nearest(s,p.team,ball).filter(q=>['CB','CM'].includes(q.role)&&!press[p.team].includes(q.id))[0]?.id===p.id){tx=localBall-8;ty=ball.y+(baseY<34?-5:5);intent='Cover the press';}
  else if(ours){
   if(support[p.team].includes(p.id)){const index=support[p.team].indexOf(p.id);tx=localBall-(index?8:3);ty=ball.y+(index?1:-1)*11*dir;intent='Offer a passing angle';}
   if(p.role==='W'){tx=Math.max(tx,localBall+2);ty=baseY<34?(plan.width==='wide'?4:plan.width==='narrow'?19:8):(plan.width==='wide'?64:plan.width==='narrow'?49:60);intent='Provide width';}
   if(p.role==='ST'||instruction==='forward'){tx=Math.max(tx,localBall+9+p.offball/18);ty=baseY+(ball.y-34)*.12;intent='Run beyond';}
   if(p.role!=='FB'&&instruction==='overlap'){tx=localBall+9;ty=baseY<34?7:61;intent='Overlap';}
   if(p.runUntil>s.time&&instruction!=='hold'){tx=Math.max(tx,homeSpace(p,p.team)+6);ty=p.y+(p.number%2?-5:5)*dir;intent='Pass and move';}
   if(recent&&plan.win==='counter'&&['ST','W'].includes(p.role)){tx=Math.max(tx,localBall+16);intent='Counterattack run';}
   if(instruction==='support'){tx=localBall-5;ty=ball.y+(baseY<34?-9:9);intent='Offer support';}
   if(instruction==='hold'){tx=ax+(localBall-52.5)*.22;ty=baseY;intent='Hold position';}
   const freedom=instruction==='hold'?0:instruction==='roam'?1:plan.freedom==='free'?.9:plan.freedom==='disciplined'?.12:.45;
   const radius=freedom*(2+p.offball/22+p.roam*2),anchor={x:tx,y:ty};
   if(radius&&(p.role!=='CB'||instruction==='roam')){
    const candidates=[];for(const dx of [-radius,0,radius])for(const rawY of [-radius,0,radius]){const dy=rawY*dir,local={x:tx+dx,y:ty+dy},world={x:p.team===0?local.x:105-local.x,y:local.y},space=Math.min(...onPitch(s).filter(q=>q.team!==p.team).map(q=>distance(q,world))),link=owner?distance(owner,world):15,anchorCost=distance(local,anchor)*(freedom>.8?.1+p.discipline/400:.2+p.discipline/200);candidates.push({local,score:Math.min(space,12)*(p.offball+p.decisions)/180-Math.abs(link-15)*.12-anchorCost});}candidates.sort((a,b)=>Math.round(b.score*1e8)-Math.round(a.score*1e8));tx=candidates[0].local.x;ty=candidates[0].local.y;if(instruction==='roam')intent='Find a pocket of space';
   }
  }
  if(ours&&owner&&p.id!==owner.id&&p.instruction==='auto'&&support[p.team].includes(p.id)){
   const index=support[p.team].indexOf(p.id),side=(index?1:-1)*dir,desired={x:localBall-(index?10:4),y:clamp(ball.y+side*11,5,63)};
   const candidates=[];for(const dx of [-4,0,4])for(const rawY of [-4,0,4]){const dy=rawY*dir,local={x:clamp(desired.x+dx,10,95),y:clamp(desired.y+dy,4,64)},world={x:p.team===0?local.x:105-local.x,y:local.y},space=Math.min(...onPitch(s).filter(q=>q.team!==p.team).map(q=>distance(q,world))),lane=Math.min(...onPitch(s).filter(q=>q.team!==p.team).map(q=>segmentDistance(q,ball,world)));candidates.push({local,score:Math.min(space,12)*(p.offball+p.decisions)/160+Math.min(lane,5)*p.teamwork/100-distance(local,desired)*.4});}candidates.sort((a,b)=>Math.round(b.score*1e8)-Math.round(a.score*1e8));tx=candidates[0].local.x;ty=candidates[0].local.y;intent='Offer a passing angle';
  }
  const flank=flanks[p.team];
  if(ours&&p.id!==recoverers[p.team]&&p.id!==owner?.id&&p.role!=='GK'&&s.flight?.receiverId!==p.id){
   if(p.id===flank.attackId){tx=localBall+8;ty=baseY<34?6:62;p.overlapAt=s.time;intent=flank.risk?'Risk an overlap':'Overlap with cover';}
   else if(p.id===flank.coverId){tx=homeSpace(flank.hole,p.team);ty=flank.hole.y;p.coverFor=flank.attackId;intent='Cover the fullback';}
   else if(p.id===flank.oppositeId&&instruction==='auto'){tx=Math.min(tx,Math.max(27,localBall-24));ty=baseY<34?19:49;intent='Tuck in behind';}
   else if(p.role==='FB'&&(plan.fullbacks==='stay'||instruction==='hold'||instruction==='auto')){tx=Math.min(tx,Math.max(27,localBall-20));ty=baseY;intent='Hold the flank';}
  }
  if(ours&&p.id!==recoverers[p.team]&&p.id!==owner?.id&&p.role!=='GK'&&s.flight?.receiverId!==p.id&&!going&&instruction!=='hold'){
   const line=onPitch(s).filter(q=>q.team!==p.team).map(q=>homeSpace(q,p.team)).sort((a,b)=>b-a)[1]??105;
   tx=Math.min(tx,Math.max(52,localBall,line)-.7+(100-p.offball)/35*(p.roam-.3));
  }
  if(!block&&!intercept&&!ours&&p.role!=='GK'&&!['Counterpress','Close the carrier','Cover the press','Collect loose ball'].includes(intent))tx+=(p.roam-.5)*(100-p.positioning)*.1;
  // Teammates avoid choosing the same patch; targets change at decision intervals.
  if(!block&&!intercept&&!meeting&&!going&&!['Close the carrier','Counterpress','Stay on feet'].includes(intent)&&p.role!=='GK'&&p.id!==owner?.id&&p.id!==recoverers[p.team]){const spacing=ours?6:2.2;for(const q of onPitch(s).filter(q=>q.team===p.team&&q.id!==p.id)){const reserved=targets.get(q.id)||q.target||q,qx=homeSpace(reserved,p.team),d=Math.hypot(tx-qx,ty-reserved.y);if(d<spacing){const dx=d>.05?(tx-qx)/d:0,dy=d>.05?(ty-reserved.y)/d:(p.number%2?1:-1)*dir;tx+=dx*(spacing-d)*.6;ty+=dy*(spacing-d)*.6;}}}
  if(p.id===recoverers[p.team]){tx=clamp(tx,1,104);ty=clamp(ty,1,67);}else if(p.role!=='GK'){tx=clamp(tx,ours?10:1.5,96);ty=clamp(ty,3,65);}
  p.target={x:p.team===0?tx:105-tx,y:ty};p.intent=intent;p.thinkAt=s.time+(block||intercept ? STEP : p.id===owner?.id||s.flight?.receiverId===p.id ? .25 :!ours&&distance(p,ball)<18?.25+(100-p.anticipation)/160:.65+(100-p.decisions)/65);targets.set(p.id,p.target);
 }
 for(const p of onPitch(s)){
  const target=targets.get(p.id);p.currentTime=s.time;p.carryFactor=p.id===owner?.id ? .67+(p.dribbling??p.technique)*.0015:1;const velocity=moveVelocity(p,target);p.vx=velocity.vx;p.vy=velocity.vy;p.x=clamp(p.x+p.vx*STEP,p.role==='GK'?0:1,p.role==='GK'?105:104);p.y=clamp(p.y+p.vy*STEP,1,67);
  const exertion=Math.hypot(p.vx,p.vy)/p.pace,pressing=['Counterpress','Close the carrier'].includes(p.intent);p.energy=conditionAfter(p,{exertion,pressing});
 }
 if(owner){ball.x=clamp(owner.x+direction(owner.team)*.55,.1,104.9);ball.y=owner.y;}
}
function launch(s,p,kind,target,receiver=null,details={}){
 s.giveAndGo=null;
 if(kind==='clearance'){
  s.flow.teams[p.team].clearances++;
  s.flow.clearance={team:p.team,at:s.time,firstControl:null};
 }
 if(kind==='shot'&&s.flow.clearance){
  const clearance=s.flow.clearance;
  if(clearance.firstControl===p.team&&p.team!==clearance.team&&s.time-clearance.at<=12){
   s.flow.teams[clearance.team].returnShots++;
   s.flow.clearance=null;
  }
 }
 if(kind!=='shot'){p.runUntil=s.time+2+p.offball/35;p.thinkAt=0;}
 const restartKind=s.restartOrigin||null;s.restartOrigin=null;s.offsidePhase={team:p.team,candidates:offsidePositions(s,p.team,restartKind),passEvent:s.serial+1};
 const start={x:s.ball.x,y:s.ball.y},d=Math.max(.1,distance(start,target)),speed=kind==='shot'&&details.style==='header'?16:kind==='shot'||kind==='kick'?22:kind==='long-ball'?20:kind==='cross'?15:kind==='clearance'?19:15;
 const loft=kind==='kick'?Math.min(16,d*.22):kind==='long-ball'||kind==='clearance'?Math.min(12,d*.18):kind==='cross'?Math.min(9,d*.19):0;
 const anticipation=receiver?.anticipation??70;
 const readyDelay=details.style==='one-two-return'?0:details.style==='through-ball'
  ?.04+(100-anticipation)*.003:.18+(100-anticipation)/110;
 s.flight={restartKind,mustLeaveArea:restartKind==='goal-kick'||['indirect','direct'].includes(restartKind)&&inPenalty(p,p.team),kind,team:p.team,actorId:p.id,receiverId:receiver?.id||null,target:{...target},vx:(target.x-start.x)/d*speed,vy:(target.y-start.y)/d*speed,age:0,duration:d/speed,loft,passEvent:s.serial+1,receiverReadyAt:s.time+readyDelay,delivery:details.style||kind,contacted:[]};s.ball.owner=null;
 const st=s.stats[p.team];
 if(details.style==='through-ball')st.throughBalls=(st.throughBalls||0)+1;
 if(details.style==='one-two-start')st.oneTwos=(st.oneTwos||0)+1;
 if(kind==='shot'){s.advantage=null;st.shots++;}else if(kind!=='clearance')st.passes++;
 const stat={kick:'longKicks','long-ball':'longBalls',cross:'crosses',cutback:'cutbacks',clearance:'clearances'}[kind];if(stat)st[stat]=(st[stat]||0)+1;
 const text=details.text|| (kind==='shot'?`${p.name} shoots!`:kind==='kick'?`${p.name} kicks long towards ${receiver.name}.`:kind==='long-ball'?`${p.name} lifts a long ball over the top for ${receiver.name}.`:kind==='cross'?`${p.name} sends ${details.style==='early'?'an early cross':details.style==='byline'?'a byline cross':'a cross'} towards ${receiver.name}.`:kind==='cutback'?`${p.name} cuts it back for ${receiver.name}.`:kind==='clearance'?`${p.name} heads clear.`:`${p.name} looks for ${receiver.name}.`);
 emit(s,kind,p.team,p.id,text,{receiverId:receiver?.id||null,start,end:{...target},delivery:s.flight.delivery,loft,...details});
}
// Accuracy changes the actual endpoint, not the recipient's success probability.
export function deliveryTarget(s,p,aim,kind='pass',pressure=20){
 const origin=s.ball,d=distance(origin,aim),dx=(aim.x-origin.x)/(d||1),dy=(aim.y-origin.y)/(d||1),quality=(p.pass*.7+p.technique*.3),hard=kind==='cross'?1.3:kind==='long-ball'?1.2:1;
 const fatigue=(100-p.energy)/100,stress=pressure<5?(5-pressure)/5*(100-p.composure)/100:0;
 const spread=(.3+(100-quality)*.045+d*.018+fatigue*2+stress*3)*hard;
 const risk=clamp(.015+(100-quality)*.002+d*.001+fatigue*.13+stress*.18,.02,.45),errant=random(s)<risk;
 const mode=Math.floor(random(s)*3),extra=errant?(2+random(s)*(3+(100-quality)*.06)):0;
 const along=(random(s)-.5)*spread+(errant&&mode<2?extra*(mode===0?-1:1):0),across=(random(s)-.5)*spread+(errant&&mode===2?extra*(random(s)<.5?-1:1):0);
 return {target:{x:clamp(aim.x+dx*along-dy*across,-3,108),y:clamp(aim.y+dy*along+dx*across,-3,71)},errant,mode:mode===0?'underhit':mode===1?'overhit':'off-target',error:Math.hypot(along,across),aim:{...aim}};
}
function deliver(s,p,kind,aim,q,pressure,style,context={}){
 if(kind==='pass'&&q?.role==='GK'){
  // Offer the ball in front of the keeper so they can step out to play it.
  const depth=Math.max(8,homeSpace(aim,p.team)+2);
  aim={...aim,x:p.team===0?depth:105-depth};
 }
 const attempt=deliveryTarget(s,p,aim,kind,pressure);launch(s,p,kind,attempt.target,q,{style:style||kind,intendedEnd:attempt.aim,accuracyError:attempt.error,...context});
 if(attempt.errant){s.stats[p.team].errantPasses=(s.stats[p.team].errantPasses||0)+1;const phrase=attempt.mode==='underhit'?'underhits the delivery':attempt.mode==='overhit'?'puts too much on the delivery':'sends the delivery off target';emit(s,'misplaced',p.team,p.id,`${p.name} ${phrase}.`,{receiverId:q?.id??null,mode:attempt.mode,attemptEvent:s.flight.passEvent});}
}
// Crosses need an onside runner who can reach the delivery as it drops.
export function wideDeliveryOptions(s,p,cutback=false){
 const opponents=onPitch(s).filter(q=>q.team!==p.team);
 const flagged=new Set(offsidePositions(s,p.team).map(q=>q.id));
 const local=homeSpace(p,p.team),dir=direction(p.team);
 return onPitch(s).filter(q=>q.team===p.team&&q.id!==p.id&&q.role!=='GK'&&!flagged.has(q.id)
  &&homeSpace(q,p.team)>70&&Math.abs(q.y-34)<20&&(!cutback||homeSpace(q,p.team)<local-3))
 .flatMap(q=>{
  const anticipationDelay=.18+(100-q.anticipation)/110;
  const depth=clamp(homeSpace(q,p.team)+4,89,99);
  const aim=cutback?{x:q.x+q.vx*.35,y:q.y+q.vy*.35}
   :{x:dir===1?depth:105-depth,y:clamp(q.y+q.vy*.5,22,46)};
  const flightTime=distance(s.ball,aim)/15;
  const travel=q.pace*Math.max(0,flightTime-anticipationDelay)+1.35;
  if(distance(q,aim)>travel)return [];
  const space=Math.min(...opponents.map(o=>distance(o,aim)));
  if(cutback&&(space<1.8||opponents.some(o=>segmentDistance(o,s.ball,aim)<1.25)))return [];
  return [{q,aim,score:(q.role==='ST'?2:0)+Math.min(space,10)*.55+q.offball*.03}];
 });
}
function wideDelivery(s,p,pressure){
 const plan=s.teams[p.team].plan,local=homeSpace(p,p.team);
 if(p.role==='GK'||Math.abs(p.y-34)<=17||local<67||!['W','FB','CM'].includes(p.role))return false;
 const byline=local>92;
 const cutbacks=byline?wideDeliveryOptions(s,p,true):[];
 const cutback=cutbacks.length>0&&random(s)<.65;
 const candidates=cutback?cutbacks:wideDeliveryOptions(s,p);
 if(!candidates.length||random(s)>(plan.width==='wide'?.78:.6))return false;
 for(const choice of candidates)choice.score+=random(s)*(100-p.decisions)/25;
 candidates.sort((a,b)=>Math.round((b.score-a.score)*1e8)||a.q.number-b.q.number);
 const {q,aim}=candidates[0];
 const style=cutback?'cutback':local<83?'early':byline?'byline':'box';
 deliver(s,p,cutback?'cutback':'cross',aim,q,pressure,style);
 return true;
}
function overTheTop(s,p,pressure){
 if(p.role==='GK')return false;const plan=s.teams[p.team].plan,dir=direction(p.team),flagged=offsidePositions(s,p.team).map(p=>p.id);
 const candidates=onPitch(s).filter(q=>q.team===p.team&&q.id!==p.id&&['ST','W'].includes(q.role)&&distance(p,q)>22&&distance(p,q)<62&&(q.x-p.x)*dir>16).map(q=>{const aim={x:clamp(q.x+dir*(5+q.offball*.055),5,100),y:clamp(q.y+q.vy*.45,4,64)},space=distance(aim,nearest(s,1-p.team,aim)[0]);return {q,aim,space,score:space+(q.offball+p.decisions)*.035-(flagged.includes(q.id)?p.decisions*.1:0)+random(s)*(100-p.decisions)/30};}).sort((a,b)=>b.score-a.score);
 if(!candidates.length)return false;
 const choice=candidates[0];
 const intent=plan.passing==='direct'?.27:plan.passing==='short'?.012:.05;
 const runIntoSpace=choice.q.vx*dir>1.4&&choice.space>5;
 const chance=clamp(intent+(p.decisions+p.anticipation-140)*.0004
  +(runIntoSpace?.07:0)+(pressure<2.5?.04:0),.008,.45);
 if(random(s)>chance)return false;deliver(s,p,'long-ball',choice.aim,choice.q,pressure);return true;
}
export function dribbleAppetite(p,{pressure,spaceAhead,nearby,safePass}){
 const skill=p.dribbling??p.technique,flair=p.roam||0,decision=p.decisions/100;
 return clamp(.03+skill*.0035+flair*.07+Math.min(spaceAhead,12)*.015-(nearby>1?(nearby-1)*.15*decision:0)-(safePass>8?.12*decision:0)-(spaceAhead<3?.22:0)+(pressure<7?(skill-65)*.003:0),.02,.7);
}
// A lofted keeper kick bypasses ground contacts until it descends. Landing remains
// a spatial collection/loose-ball contest with basic aerial contacts.
function keeperKick(s,p,pressure){
 const plan=s.teams[p.team].plan,preference=plan.keeper||'mixed';
 const chance=preference==='short'?.18:preference==='long'?.92:.72;
 if(random(s)>Math.min(.98,chance+(pressure<5?.06:0)))return false;
 const options=onPitch(s).filter(q=>q.team===p.team&&q.role!=='GK'&&distance(p,q)>=32&&distance(p,q)<=72&&(q.x-p.x)*direction(p.team)>25).map(q=>({q,weight:Math.max(.1,2+(q.role==='ST'?2:0)+Math.min(distance(q,nearest(s,1-p.team,q)[0]),12)*.2-Math.abs(distance(p,q)-55)*.055)}));
 if(!options.length)return false;
 let roll=random(s)*options.reduce((n,o)=>n+o.weight,0),chosen=options.at(-1).q;
 for(const o of options){roll-=o.weight;if(roll<=0){chosen=o.q;break;}}
 const error=3+(100-p.pass)*.10+(100-p.technique)*.045+(pressure<5?(100-p.composure)*.06:0);
 const target={x:clamp(chosen.x+chosen.vx*.7+(random(s)-.5)*error*direction(p.team),3,102),y:clamp(chosen.y+chosen.vy*.7+(random(s)-.5)*error*direction(p.team),3,65)};
 launch(s,p,'kick',target,chosen);return true;
}
// Assess the opening from the ball and the better of two shooting lanes.
export function assessOpenPlayShot(s,p,opponents){
 const dir=direction(p.team),goal=goalX(p.team);
 const depth=Math.max(1,(goal-s.ball.x)*dir);
 const range=Math.hypot(depth,s.ball.y-34);
 const opening=Math.atan2(37.66-s.ball.y,depth)-Math.atan2(30.34-s.ball.y,depth);
 const defenders=opponents.filter(q=>q.role!=='GK');
 const keeper=opponents.find(q=>q.role==='GK');
 const lanes=[-1,1].map(side=>{
  const y=34+side*2.55*dir;
  const target={x:goal,y};
  const clearance=Math.min(4,...defenders.map(q=>segmentDistance(q,s.ball,target)));
  const cover=keeper?segmentDistance(keeper,s.ball,target):0;
  return {y,clearance,score:clearance*.85+Math.min(4,cover)};
 });
 const preferred=lanes[1].score>lanes[0].score+1e-8?lanes[1]:lanes[0];
 const pressure=Math.min(5,...opponents.map(q=>distance(p,q)));
 const openingFactor=clamp(opening/.41,0,1);
 const distanceFactor=clamp((30-range)/18,0,1);
 const laneFactor=clamp((preferred.clearance-.25)/2.5,.15,1);
 const pressureFactor=.55+.45*clamp((pressure-1)/3,0,1);
 const chance=.50*openingFactor**1.4*distanceFactor*laneFactor*pressureFactor;
 return {preferred,depth,range,opening,pressure,chance};
}
export function openPlayShotAim(s,p,errorRoll,look=assessOpenPlayShot(s,p,onPitch(s).filter(q=>q.team!==p.team))){
 const dir=direction(p.team),goal=goalX(p.team);
 const quality=p.finish*.75+p.composure*.25;
 const pressureStress=Math.max(0,4-look.pressure)/4;
 const spread=1.05+look.range*.062+(100-quality)*.075
  +pressureStress*(1.2+(100-p.composure)*.025)+(100-p.energy)*.018;
 const aim=34+(look.preferred.y-34)*clamp(.55+quality*.006,.6,1);
 const crossing=aim+(errorRoll-.5)*2*spread*dir;
 // The flight aims beyond the line. Project the intended crossing onto that plane.
 return {x:goal+dir,y:crossing+(crossing-s.ball.y)/look.depth};
}
// Match the pass to a moving, legally positioned runner and assess space
// at the destination as well as the lane the ball will travel down.
export function throughBallOption(s,passer){
 const dir=direction(passer.team);
 const opponents=onPitch(s).filter(q=>q.team!==passer.team);
 const backs=opponents.filter(q=>q.role!=='GK');
 const line=opponents.map(q=>homeSpace(q,passer.team)).sort((a,b)=>b-a)[1]??105;
 const flagged=new Set(offsidePositions(s,passer.team).map(q=>q.id));
 const options=[];
 if(homeSpace(passer,passer.team)<37)return null;
 for(const runner of onPitch(s)){
  if(runner.team!==passer.team||!['ST','W','CM'].includes(runner.role)||runner.id===passer.id
     ||runner.instruction==='hold'||flagged.has(runner.id)||runner.vx*dir<.9)continue;
  const distanceToRunner=distance(passer,runner);
  const runnerDepth=homeSpace(runner,passer.team);
  if(distanceToRunner<9||distanceToRunner>35||runnerDepth<line-8)continue;
  const advance=clamp(distanceToRunner*.24,4,8);
  const depth=Math.min(101,runnerDepth+advance);
  if(depth<line+1||depth<homeSpace(passer,passer.team)+6)continue;
  const target={x:dir===1?depth:105-depth,y:clamp(runner.y+runner.vy*.55,3,65)};
  const lane=Math.min(...backs.map(q=>segmentDistance(q,s.ball,target)));
  const room=Math.min(...opponents.map(q=>distance(q,target)));
  const reach=runner.pace*(distance(s.ball,target)/15+.45);
  if(lane<2||room<4||distance(runner,target)>reach)continue;
  options.push({runner,target,score:room+Math.min(5,lane)*.5+runner.offball*.04});
 }
 options.sort((a,b)=>Math.round((b.score-a.score)*1e8)||a.runner.number-b.runner.number);
 return options[0]??null;
}
function playThroughBall(s,passer,option,pressure){
 const {runner,target}=option;
 deliver(s,passer,'pass',target,runner,pressure,'through-ball',{
  text:`${passer.name} threads a through ball for ${runner.name}.`
 });
}
function wallPassOption(s,runner,defenders,pressure){
 if(pressure<2||pressure>5||homeSpace(runner,runner.team)<40)return null;
 const dir=direction(runner.team),marker=defenders[0];
 if((marker.x-runner.x)*dir<.4)return null;
 const opponents=defenders.filter(q=>q.role!=='GK');
 const flagged=new Set(offsidePositions(s,runner.team).map(q=>q.id));
 const options=[];
 for(const wall of onPitch(s)){
  if(wall.team!==runner.team||wall.id===runner.id||wall.role==='GK'||flagged.has(wall.id))continue;
  const length=distance(runner,wall);
  const lateral=(wall.y-runner.y)*dir;
  if(length<4||length>12||Math.abs(lateral)<3||Math.abs(wall.x-runner.x)>7)continue;
  const target={x:clamp(runner.x+dir*7,4,101),y:clamp(runner.y+Math.sign(lateral)*3*dir,3,65)};
  const lane=Math.min(...opponents.map(q=>segmentDistance(q,s.ball,wall)));
  const gap=Math.min(...defenders.map(q=>distance(q,target)));
  if(lane<1.75||gap<3)continue;
  options.push({wall,target,score:gap+wall.technique*.025});
 }
 options.sort((a,b)=>Math.round((b.score-a.score)*1e8)||a.wall.number-b.wall.number);
 return options[0]??null;
}
function startWallPass(s,runner,{wall,target},pressure){
 deliver(s,runner,'pass',{x:wall.x+wall.vx*.2,y:wall.y+wall.vy*.2},wall,pressure,'one-two-start',{
  text:`${runner.name} plays a short pass to ${wall.name} and runs on.`
 });
 s.giveAndGo={runnerId:runner.id,wallId:wall.id,target,expires:s.time+2.8};
}
function returnWallPass(s,wall,defenders,pressure){
 const combination=s.giveAndGo;
 if(!combination||combination.wallId!==wall.id)return false;
 s.giveAndGo=null;
 const runner=onPitch(s).find(q=>q.id===combination.runnerId);
 if(s.time>=combination.expires||!runner||offsidePositions(s,wall.team).some(q=>q.id===runner.id))return false;
 const target=combination.target;
 const lane=Math.min(...defenders.filter(q=>q.role!=='GK').map(q=>segmentDistance(q,s.ball,target)));
 const gap=Math.min(...defenders.map(q=>distance(q,target)));
 if(lane<1.5||gap<2.5||distance(s.ball,target)>18)return false;
 deliver(s,wall,'pass',target,runner,pressure,'one-two-return',{
  text:`${wall.name} tries to return the one-two to ${runner.name}.`
 });
 return true;
}
function setupCombination(s){
 s.phase='play';
 s.pendingRestart=false;
 const passer=player(s,'0-7'),runner=player(s,'0-10');
 const defenders=onPitch(s).filter(q=>q.team===1);
 for(const q of onPitch(s)){
  if(q.team===0&&q.role!=='GK'&&q!==passer&&q!==runner){
   q.x=37;
   q.y=q.number%2?14:55;
  }
 }
 for(const q of defenders){
  if(q.role!=='GK'){q.x=70;q.y=q.number%2?16:55;}
 }
 Object.assign(passer,{x:52,y:32,pass:90,technique:90});
 const marker=defenders.find(q=>q.number===3);
 if(s.scenario==='through-ball'){
  Object.assign(runner,{x:67,y:31,vx:3,pace:6.5});
  own(s,passer);
  const option=throughBallOption(s,passer);
  if(option)playThroughBall(s,passer,option,20);
 }else{
  Object.assign(marker,{x:55,y:31});
  Object.assign(passer,{vx:3.6,pace:6.3,offball:86,anticipation:86});
  Object.assign(runner,{x:52,y:39,vx:0,technique:90,pass:90});
  own(s,passer);
  const ordered=nearest(s,1,passer);
  const pressure=distance(passer,ordered[0]);
  const option=wallPassOption(s,passer,ordered,pressure);
  if(option)startWallPass(s,passer,option,pressure);
 }
}
function chooseAction(s,p){
 p.lastActionAt=s.time;
 const defenders=nearest(s,1-p.team,p),pressure=defenders[0]?distance(p,defenders[0]):20,toGoal=105-homeSpace(p,p.team),plan=s.teams[p.team].plan;
 if(returnWallPass(s,p,defenders,pressure))return;
 if(p.role==='GK'&&keeperKick(s,p,pressure))return;
 if(wideDelivery(s,p,pressure)||overTheTop(s,p,pressure))return;
 if(p.role!=='GK'&&toGoal<30){
  const look=assessOpenPlayShot(s,p,defenders);
  if(random(s)<look.chance){
   const target=openPlayShotAim(s,p,random(s),look);
   launch(s,p,'shot',target,null,{pressure:look.pressure,goalOpening:look.opening,shotLane:look.preferred.clearance});
   return;
  }
 }
 if(p.role!=='GK'){
  const through=throughBallOption(s,p);
  if(through&&random(s)<clamp(.10+(p.decisions+p.pass-125)*.003,.05,.33)){
   playThroughBall(s,p,through,pressure);
   return;
  }
  const wall=wallPassOption(s,p,defenders,pressure);
  if(wall&&random(s)<clamp(.05+(p.decisions+p.teamwork-110)*.002,.025,.20)){
   startWallPass(s,p,wall,pressure);
   return;
  }
 }
 const candidates=onPitch(s).filter(q=>q.team===p.team&&q.id!==p.id&&distance(p,q)>3.5&&distance(p,q)<(plan.passing==='direct'?48:plan.passing==='short'?27:36)).map(q=>{
  const offer=assessPass(s,p,q);return {q,...offer,weight:offer.weight+random(s)*(100-p.decisions)/20};
 }).sort((a,b)=>b.weight-a.weight);
 const nearTouchline=Math.min(p.y,68-p.y)<12;
 const safeOutlet=candidates.some(offer=>offer.distance<18&&offer.margin>1&&offer.space>3);
 if(['FB','CB','W'].includes(p.role)&&homeSpace(p,p.team)<42&&nearTouchline&&pressure<3.6&&!safeOutlet){
  const dir=direction(p.team);
  const side=p.y<34?-1:1;
  const aim={x:clamp(p.x+dir*(15+random(s)*13),2,103),y:34+side*(26+random(s)*11)};
  deliver(s,p,'clearance',aim,null,pressure,'touchline-clearance',{
   text:`${p.name} clears up the line under pressure.`
  });
  return;
 }
 const spaceAhead=Math.min(...defenders.map(def=>distance(def,{x:p.x+direction(p.team)*6,y:p.y}))),nearby=defenders.filter(def=>distance(def,p)<5).length;
 const appetite=dribbleAppetite(p,{pressure,spaceAhead,nearby,safePass:candidates[0]?.weight||0});
 if(p.role!=='GK'&&p.instruction!=='hold'&&random(s)<appetite){
  const takingOn=pressure<7;p.dribbleUntil=s.time+1.2+(p.dribbling??p.technique)/90;s.decisionAt=p.dribbleUntil;p.thinkAt=0;s.stats[p.team].carries++;if(takingOn)s.stats[p.team].takeOns++;
  emit(s,takingOn?'dribble':'carry',p.team,p.id,takingOn?`${p.name} takes on the defender.`:`${p.name} drives into the space ahead.`,{start:{x:p.x,y:p.y}});return;
 }
 if(candidates.length&&(pressure<5||random(s)<.7||p.role==='GK')){
  const exponent=1+p.decisions/45,pool=candidates.slice(0,4).map(o=>({...o,preference:o.weight**exponent})),total=pool.reduce((n,x)=>n+x.preference,0);let roll=random(s)*total,chosen=pool.at(-1).q;for(const x of pool){roll-=x.preference;if(roll<=0){chosen=x.q;break;}}
  const offer=assessPass(s,p,chosen);if(offer.progress< -3)s.stats[p.team].recycles=(s.stats[p.team].recycles||0)+1;if(offer.switchPlay)s.stats[p.team].switches=(s.stats[p.team].switches||0)+1;
  const lead=clamp(offer.distance/15*.45,.1,.65);
  deliver(s,p,'pass',{x:chosen.x+chosen.vx*lead,y:chosen.y+chosen.vy*lead},chosen,pressure,'pass',{choice:offer.intoBox?'box-entry':offer.recycle?'recycle':offer.switchPlay?'switch':offer.progress>3?'forward':'retain',laneMargin:offer.margin,text:offer.recycle?`${p.name} recycles possession through ${chosen.name}.`:offer.switchPlay?`${p.name} switches play towards ${chosen.name}.`:`${p.name} looks for ${chosen.name}.`});
 }else{s.stats[p.team].carries++;emit(s,'carry',p.team,p.id,`${p.name} carries the ball forward.`,{start:{x:p.x,y:p.y}});s.decisionAt=s.time+.8+random(s)*.8;}
}
function aerialContact(s,f,from,to){
 if(f.kind==='shot'||!f.loft||f.age/f.duration<.65||(s.ball.z||0)>2.7||(s.ball.z||0)<.3)return false;
 const contenders=onPitch(s).filter(p=>p.id!==f.actorId&&!f.contacted.includes(p.id)&&segmentDistance(p,from,to)<(p.role==='GK'?2.4:1.65));if(!contenders.length)return false;
 const rank=contenders.map(p=>({p,value:(p.role==='GK'?(p.handling??70):p.heading??p.technique)*.4+p.anticipation*.25+(p.strength??70)*.2-distance(p,to)*10+random(s)*24})).sort((a,b)=>b.value-a.value);const p=rank[0].p;
 if(offsideContact(s,p))return true;s.stats[p.team].aerials=(s.stats[p.team].aerials||0)+1;
 emit(s,'aerial',p.team,p.id,p.role==='GK'?`${p.name} comes to claim the high ball.`:`${p.name} wins the ball in the air.`,{opponentId:rank.find(q=>q.p.team!==p.team)?.p.id||null,deliveryEvent:f.passEvent});
 if(p.role==='GK'){own(s,p);if(p.team===f.team&&f.kind!=='clearance')s.stats[p.team].completed++;return true;}
 if(p.team!==f.team){
  const pressure=distance(p,nearest(s,1-p.team,p)[0]);
  if(pressure>4&&(p.technique+p.decisions)/2>=65){
   own(s,p);
   p.controlUntil=s.time+.45+(100-p.technique)/100;
   s.decisionAt=Math.max(s.decisionAt,p.controlUntil);
   emit(s,'control',p.team,p.id,`${p.name} has time to bring the high ball down.`);
   return true;
  }
  own(s,p);const aim={x:clamp(p.x+direction(p.team)*(16+random(s)*12),2,103),y:clamp(p.y+(random(s)-.5)*25*direction(p.team),2,66)};launch(s,p,'clearance',aim);return true;}
 if(f.kind!=='clearance')s.stats[p.team].completed++;
 const headerDistance=105-homeSpace(p,p.team),headerAngle=Math.abs(Math.atan2(37.66-p.y,headerDistance)-Math.atan2(30.34-p.y,headerDistance)),marker=distance(p,nearest(s,1-p.team,p)[0]);
 if(f.kind==='cross'&&headerDistance<18&&Math.abs(p.y-34)<14&&random(s)<clamp(headerAngle*.9+(p.decisions-65)*.003-(marker<2?.15:0),.08,.8)){own(s,p);const error=1.2+(100-(p.heading??70))*.095+(105-homeSpace(p,p.team))*.2+Math.abs(p.y-34)*.18,target={x:goalX(p.team)+direction(p.team),y:34+(random(s)-.5)*error*2*direction(p.team)};launch(s,p,'shot',target,null,{style:'header',text:`${p.name} heads towards goal!`});return true;}
 own(s,p);emit(s,'control',p.team,p.id,`${p.name} brings the high ball down.`);return true;
}
function receiveBall(s,p,f,point=s.ball){
 if(offsideContact(s,p))return;
 const pressure=distance(p,nearest(s,1-p.team,p)[0]),risk=clamp(.025+(100-p.technique)*.0014+(pressure<3?.14*(100-p.composure)/100:0)+(f.loft?.09:0)+(100-p.energy)*.001,.025,.35);
 if(random(s)<risk){
  const backPass=p.role==='GK'&&f.team===p.team&&!f.loft;
  const travel=(3+random(s)*4)*(backPass?.32:f.loft?.82:1);
  const scatter=(random(s)-.5)*1.6;
  const angle=Math.atan2(f.vy,f.vx)+scatter;
  const event=emit(s,'miscontrol',p.team,p.id,`${p.name}'s first touch runs away from him.`,{opponentId:f.actorId});
  s.stats[p.team].miscontrols=(s.stats[p.team].miscontrols||0)+1;
  // The failed touch redirects the incoming ball instead of moving it instantly.
  setRebound(s,p,{x:point.x,y:point.y},Math.cos(angle)*travel/0.65,Math.sin(angle)*travel/0.65,.65,event,'miscontrol');
  s.offsidePhase=null;
  return;
 }
 own(s,p);p.controlUntil=s.time+.25+(100-p.technique)/100;s.decisionAt=Math.max(s.decisionAt,p.controlUntil);if(f.kind!=='clearance')s.stats[p.team].completed++;
 if(f.receiverId===p.id){
  const stats=s.stats[p.team];
  if(f.delivery==='through-ball')stats.throughBallsCompleted=(stats.throughBallsCompleted||0)+1;
  if(f.delivery==='one-two-return')stats.oneTwosCompleted=(stats.oneTwosCompleted||0)+1;
  if(f.delivery==='one-two-start'&&s.giveAndGo?.wallId===p.id){
   p.controlUntil=s.time+.18+(100-p.technique)*.004;
   s.decisionAt=p.controlUntil;
  }
 }
 emit(s,'complete',p.team,f.actorId,`${player(s,f.actorId).name} finds ${p.name}, who controls the ball.`,{receiverId:p.id});
}
function setRebound(s,p,point,vx,vy,duration,event,origin){
 s.looseDelivery=null;
 s.looseSince=null;
 s.ball={...point,z:0,owner:null};
 s.possession=p.team;
 s.flight={kind:'rebound',team:p.team,actorId:p.id,receiverId:null,
  target:{x:point.x+vx*duration,y:point.y+vy*duration},vx,vy,age:0,duration,
  loft:0,passEvent:event.id,contacted:[p.id],origin};
}
function deflect(s,f,p,from,to){
 const point=contactPoint(p,from,to);
 const incoming=Math.atan2(f.vy,f.vx);
 const turn=(random(s)-.5)*3.8;
 const speed=6+random(s)*7;
 const event=emit(s,'block',p.team,p.id,`${p.name} blocks the shot.`,{opponentId:f.actorId,shotId:f.passEvent});
 const vx=Math.cos(incoming+turn)*speed,vy=Math.sin(incoming+turn)*speed;
 const behindGoal=wouldReachOwnMouth(p.team,point,vx,vy,.8);
 // A planted block in front of the goal generally sends the ball back into play.
 setRebound(s,p,point,behindGoal?direction(p.team)*Math.abs(vx)*.6:vx,vy,.8,event,'block');
}
// A reaching defender can get a touch on a wide pass without controlling it.
function glanceWideDelivery(s,f,p,point,reach){
 if(p.role==='GK'||f.restartKind||Math.min(point.y,68-point.y)>10)return false;
 const crossing=['cross','cutback'].includes(f.kind)&&f.age<.65;
 const stretching=reach>.65&&['pass','long-ball','clearance'].includes(f.kind);
 if(!crossing&&!stretching)return false;
 const balance=clamp((100-p.technique)*.008+reach*.18,.12,.55);
 if(random(s)>=(crossing?.7:balance))return false;
 const side=point.y<34?-1:1;
 const fromInside=(p.y-point.y)*side<-.15;
 const outward=fromInside||crossing;
 const vx=f.vx*.36;
 const vy=outward?side*(5+4*reach):f.vy*.55;
 const origin=crossing?'cross-block':'pass-deflection';
 const event=emit(s,origin,p.team,p.id,crossing?`${p.name} blocks the wide delivery.`:
  `${p.name} gets a foot to the pass and it breaks loose.`,{opponentId:f.actorId});
 s.giveAndGo=null;
 // A glancing touch is a deflection, so the existing offside phase still applies.
 setRebound(s,p,point,vx,vy,.85,event,origin);
 return true;
}
function wouldReachOwnMouth(team,point,vx,vy,duration){
 if(vx*direction(team)>=0)return false;
 const line=team===0?0:105;
 const time=(line-point.x)/vx;
 return time>=0&&time<=duration&&Math.abs(point.y+vy*time-34)<=3.66;
}
function contactPoint(p,from,to){
 const dx=to.x-from.x,dy=to.y-from.y;
 const t=clamp(((p.x-from.x)*dx+(p.y-from.y)*dy)/(dx*dx+dy*dy||1),0,1);
 return {x:from.x+dx*t,y:from.y+dy*t};
}
function advanceFlight(s){
 const f=s.flight,from={x:s.ball.x,y:s.ball.y};f.age+=STEP;const travel=f.kind==='rebound'?Math.min(STEP,Math.max(0,(f.duration??.5)-(f.age-STEP))):STEP;
 const intended={x:from.x+f.vx*travel,y:from.y+f.vy*travel};
 const exit=pitchExit(from,intended);
 const to=exit?.point??intended;
 const shotOffset=f.kind==='shot'?shotGoalOffset(f,from):null;
 if(f.mustLeaveArea&&!exit&&!inPenalty(to,f.team))f.mustLeaveArea=false;
 const progress=f.loft?clamp((f.age-STEP+travel*(exit?.fraction??1))/f.duration,0,1):0;s.ball.z=f.loft?4*f.loft*progress*(1-progress):0;
 if(!f.mustLeaveArea&&aerialContact(s,f,from,to))return;
 for(const p of onPitch(s).slice().sort((a,b)=>distance(a,from)-distance(b,from))){
  if(f.mustLeaveArea||s.ball.z>2||p.id===f.actorId&&f.age<.5||f.contacted.includes(p.id))continue;
  const reach=f.kind==='shot'?(p.role==='GK'?(f.delivery==='penalty'?.8+(p.reflexes??70)*.009:1.5+(p.reflexes??70)*.017):.75):1.35;
  const contactDistance=segmentDistance(p,from,to);
  if(contactDistance>reach)continue;
  if(f.kind==='shot'){
   if(p.team===f.team||p.role==='GK'&&shotOffset>GOAL_HALF_WIDTH+KEEPER_WIDE_MARGIN)continue;
   f.contacted.push(p.id);
   if(p.role==='GK'){if(random(s)<keeperSaveChance(p,f,contactDistance)){
    const onTarget=shotOffset<=GOAL_HALF_WIDTH;
    if(onTarget){
     s.stats[f.team].shotsOnTarget=(s.stats[f.team].shotsOnTarget||0)+1;
     s.stats[p.team].saves++;
    }
    const hold=clamp(.35+(p.handling??70)*.006-contactDistance*.12,.15,.94);
    if(random(s)<hold){own(s,p);emit(s,'save',p.team,p.id,onTarget?`${p.name} saves and gathers.`:`${p.name} gathers the ball near the post.`,{opponentId:f.actorId,shotId:f.passEvent,onTarget,outcome:'held'});}
    else{
     if(onTarget)s.stats[p.team].parries=(s.stats[p.team].parries||0)+1;
     const point=contactPoint(p,from,to);
     const wide=Math.abs(point.y-34)>2.1&&segmentDistance(p,from,to)>1.35;
     const vx=wide?f.vx*.27:direction(p.team)*8;
     const vy=wide?Math.sign(point.y-34)*(7+random(s)*4):(random(s)-.5)*10*direction(p.team);
     const event=emit(s,'save',p.team,p.id,onTarget?`${p.name} parries! The rebound is loose.`:`${p.name} gets a touch near the post. The ball is loose.`,{opponentId:f.actorId,shotId:f.passEvent,onTarget,outcome:'parried'});
     const duration=wide?.9:.5;
     const push=wouldReachOwnMouth(p.team,point,vx,vy,duration)?direction(p.team)*Math.abs(vx):vx;
     setRebound(s,p,point,push,vy,duration,event,'parry');
    }return;
   }}
   else if(random(s)<.64){s.stats[p.team].blocks=(s.stats[p.team].blocks||0)+1;deflect(s,f,p,from,to);return;}
  }else{
   if(p.team!==f.team&&random(s)>p.tackle/100){f.contacted.push(p.id);continue;}
   if(f.kind==='rebound'){if(offsideContact(s,p))return;own(s,p);emit(s,'recovery',p.team,p.id,`${p.name} collects the rebound.`);}
   else if(p.team===f.team)receiveBall(s,p,f,contactPoint(p,from,to));
   else if(glanceWideDelivery(s,f,p,contactPoint(p,from,to),contactDistance))return;
   else{own(s,p);s.stats[p.team].interceptions++;emit(s,'interception',p.team,p.id,`${p.name} intercepts. ${s.teams[p.team].name} can break.`,{opponentId:f.actorId});}
   return;
  }
 }
 s.ball.x=to.x;s.ball.y=to.y;
 if(exit){
  if(f.mustLeaveArea){
   emit(s,'retake',f.team,f.actorId,'The kick went out before leaving the penalty area.');
   restart(s,f.team,f.restartKind,s.restartPoint);
   return;
  }
  if(exit.axis==='x'){
   const scoringTeam=exit.limit===0?1:0;
   const ownRestart=f.restartKind&&scoringTeam!==f.team;
   if(to.y>=30.34&&to.y<=37.66&&(s.ball.z||0)<=2.44&&!['throw-in','indirect'].includes(f.restartKind)&&!ownRestart){
    s.score[scoringTeam]++;
    if(f.kind==='shot'&&scoringTeam===f.team)s.stats[f.team].shotsOnTarget=(s.stats[f.team].shotsOnTarget||0)+1;
    emit(s,'goal',scoringTeam,f.actorId,scoringTeam===f.team?`GOAL! ${player(s,f.actorId).name} scores for ${s.teams[scoringTeam].name}.`:
     `Own goal! ${player(s,f.actorId).name} puts the ball into his own net.`,
     {ownGoal:scoringTeam!==f.team,shotId:f.kind==='shot'?f.passEvent:null,start:{...from},end:{...to}});
    restart(s,1-scoringTeam,'kickoff');
    return;
   }
  }
  if(f.kind==='shot')emit(s,'miss',f.team,f.actorId,`${player(s,f.actorId).name} shoots wide.`,{shotId:f.passEvent});
  boundaryRestart(s,f.team,exit,f.origin??f.delivery??f.kind);
  return;
 }
 if(f.kind!=='shot'&&(f.kind==='rebound'?f.age>=(f.duration??.5):((f.target.x>=0&&f.target.x<=105&&f.target.y>=0&&f.target.y<=68)
   &&(distance(s.ball,f.target)<1.8||f.loft&&f.age>=f.duration))||f.age>5)){
  if(f.mustLeaveArea){emit(s,'retake',f.team,f.actorId,'The kick must leave the penalty area. It will be retaken.');restart(s,f.team,f.restartKind,s.restartPoint);return;}
  s.looseDelivery=f.kind==='rebound'?null:{...f,looseAt:s.time};s.flight=null;s.ball.z=0;s.looseSince=s.time;s.ball.x=to.x;s.ball.y=to.y;
  emit(s,'loose',f.team,f.actorId,'The ball runs loose.');
 }
}
export function suggestedReplacement(s,outgoingId){
 const out=player(s,outgoingId);if(!out)return null;
 const fit=q=>q.role===out.role?100:out.role==='GK'?q.handling*.5:q.role==='GK'?-100:['CB','FB'].includes(out.role)&&['CB','FB','CM'].includes(q.role)?60:['W','ST'].includes(out.role)&&['W','ST','CM'].includes(q.role)?50:30;
 return s.players.filter(q=>q.team===out.team&&q.bench&&!q.played&&!q.injuredOff).sort((a,b)=>fit(b)+b.energy*.05-(fit(a)+a.energy*.05))[0]||null;
}
function ensureKeeper(s,team){
 if(onPitch(s).some(p=>p.team===team&&p.role==='GK'))return;
 const p=onPitch(s).filter(p=>p.team===team).sort((a,b)=>b.handling-a.handling)[0];if(!p)return;p.naturalRole=p.role;p.role='GK';p.emergencyKeeper=true;p.handling=Math.min(p.handling,35);p.reflexes=Math.min(p.reflexes,35);p.thinkAt=0;
 emit(s,'emergency-keeper',team,p.id,`${p.name} takes over in goal as an emergency keeper.`);
}
function performSubstitution(s,team,outgoingId,incomingId){
 const out=player(s,outgoingId),incoming=player(s,incomingId);
 if(!out||!incoming||out.team!==team||incoming.team!==team)return {ok:false,reason:'Choose players from the same team.'};
 if(out.sentOff||out.subbedOff||out.bench||!incoming.bench||incoming.played||incoming.sentOff||incoming.injuredOff)return {ok:false,reason:'That player is unavailable for this substitution.'};
 s.subsUsed??=[0,0];if(s.subsUsed[team]>=3)return {ok:false,reason:'All three substitutions have been used.'};
 const role=out.role;
 if(role==='GK')for(const p of onPitch(s).filter(p=>p.team===team&&p.emergencyKeeper)){p.role=p.naturalRole;p.emergencyKeeper=false;}
 out.subbedOff=true;out.vx=out.vy=0;out.target=null;out.intent='Substituted';incoming.bench=false;incoming.played=true;incoming.slot=out.slot??out.number;incoming.x=out.x;incoming.y=out.y;incoming.vx=incoming.vy=0;incoming.target=null;incoming.thinkAt=0;incoming.instruction=out.instruction;
 incoming.naturalRole??=incoming.role;incoming.role=role;if(role!=='GK'&&incoming.naturalRole!==role)incoming.positioning=Math.max(25,incoming.positioning-12);
 if(role==='GK'&&incoming.naturalRole!=='GK'){incoming.emergencyKeeper=true;incoming.handling=Math.min(incoming.handling,35);incoming.reflexes=Math.min(incoming.reflexes,35);}
 s.subsUsed[team]++;s.stats[team].substitutions=(s.stats[team].substitutions||0)+1;
 emit(s,'substitution',team,incoming.id,`${incoming.name} replaces ${out.name}.`,{outgoingId:out.id,incomingId:incoming.id,slot:incoming.slot});return {ok:true,queued:false};
}
function commitSubstitutions(s){
 const pending=s.pendingSubs||[];s.pendingSubs=[];for(const q of pending){const result=performSubstitution(s,q.team,q.outgoingId,q.incomingId);if(!result.ok)emit(s,'substitution-rejected',q.team,q.outgoingId,result.reason);}
}
export function requestSubstitution(s,team,outgoingId,incomingId){
 if(![0,1].includes(team)||s.phase==='ended')return {ok:false,reason:'The test is not available for a substitution.'};
 const out=player(s,outgoingId),incoming=player(s,incomingId),pending=s.pendingSubs||[];
 if(!out||!incoming||out.team!==team||incoming.team!==team||out.sentOff||out.subbedOff||out.bench||!incoming.bench||incoming.played||incoming.injuredOff)return {ok:false,reason:'Choose an available player and an unused named substitute.'};
 if((s.subsUsed?.[team]||0)+pending.filter(q=>q.team===team).length>=3)return {ok:false,reason:'All three substitutions are used or queued.'};
 if(pending.some(q=>q.outgoingId===outgoingId||q.incomingId===incomingId))return {ok:false,reason:'A change involving this player is already queued.'};
 if(['injury','restart','half-time'].includes(s.phase)){
  const result=performSubstitution(s,team,outgoingId,incomingId);
  if(result.ok&&s.pendingInjury?.team===team&&s.pendingInjury.playerId===outgoingId)finishInjuryDecision(s);
  else if(result.ok&&s.phase==='restart'&&s.restartTaker===outgoingId){
   // The incoming player inherits the taker's position and the existing award.
   s.restartTaker=incomingId;
   s.ball.owner=incomingId;
  }
  return result;
 }
 s.pendingSubs??=[];s.pendingSubs.push({team,outgoingId,incomingId});emit(s,'substitution-queued',team,outgoingId,'The substitution will take place at the next stoppage.',{incomingId});return {ok:true,queued:true};
}
function finishInjuryDecision(s){
 const pending=s.pendingInjury;if(!pending||s.phase==='ended')return {ok:false,reason:'No injury decision is waiting.'};s.pendingInjury=null;
 ensureKeeper(s,pending.team);
 if(onPitch(s).filter(p=>p.team===pending.team).length<7){stopFlow(s);s.phase='ended';emit(s,'abandoned',pending.team,null,'The test stops: fewer than seven players remain.');return {ok:true};}
 awardRestart(s,pending.restart.team,pending.restart.kind,pending.restart.point);return {ok:true};
}
export function cancelQueuedSubstitutions(s,team){s.pendingSubs=(s.pendingSubs||[]).filter(q=>q.team!==team);emit(s,'substitution-cancelled',team,null,'Queued substitutions cancelled.');}
export function continueAfterInjury(s){return finishInjuryDecision(s);}
export function injurePlayer(s,id,{forced=true,cause='contact',force=.5,opponentId=null}={}){
 const p=player(s,id);if(!p||p.sentOff||p.subbedOff||p.bench||p.injuredOff||s.phase==='ended')return false;
 if(!forced){p.knockUntil=s.time+20+force*25;s.stats[p.team].knocks=(s.stats[p.team].knocks||0)+1;emit(s,'knock',p.team,p.id,`${p.name} takes a knock in the challenge but can continue.`,{opponentId,force});return true;}
 const restart=s.phase==='restart'?{team:s.restartTeam,kind:s.restartKind,point:{...s.restartPoint}}:{team:s.possession,kind:'drop-ball',point:{x:s.ball.x,y:s.ball.y}};
 p.injuredOff=true;p.vx=p.vy=0;p.target=null;p.intent='Unable to continue';s.stats[p.team].injuries=(s.stats[p.team].injuries||0)+1;
 s.giveAndGo=null;stopFlow(s);s.flight=null;s.advantage=null;s.ball.owner=null;s.phase='injury';s.pendingInjury={team:p.team,playerId:p.id,cause,restart};
 emit(s,'injury',p.team,p.id,cause==='non-contact'?`${p.name} pulls up without contact and cannot continue.`:`${p.name} is hurt in the challenge and cannot continue.`,{opponentId,cause,forcedOff:true});
 const queued=(s.pendingSubs||[]).find(q=>q.outgoingId===p.id);if(queued){s.pendingSubs=s.pendingSubs.filter(q=>q!==queued);const done=performSubstitution(s,p.team,p.id,queued.incomingId);if(done.ok){finishInjuryDecision(s);return true;}}
 if(s.managedTeam!==p.team){const choice=suggestedReplacement(s,p.id);if(choice&&(s.subsUsed?.[p.team]||0)<3)performSubstitution(s,p.team,p.id,choice.id);finishInjuryDecision(s);}
 return true;
}
export function resolveChallenge(s,challengerId,victimId,sample={}){
 const defender=player(s,challengerId),victim=player(s,victimId);if(!defender||!victim||defender.sentOff||victim.sentOff||defender.role==='GK')return null;
 const dir=direction(victim.team),point={x:victim.x,y:victim.y},behind=(defender.x-victim.x)*dir<-.5;
 const covering=onPitch(s).filter(q=>q.team===defender.team&&q.id!==defender.id&&q.role!=='GK'&&(q.x-victim.x)*dir> -2&&distance(q,victim)<15);
 const goalVector={x:goalX(victim.team)-victim.x,y:34-victim.y},speed=Math.hypot(victim.vx,victim.vy),towards=(victim.vx*goalVector.x+victim.vy*goalVector.y)/(speed*Math.hypot(goalVector.x,goalVector.y)||1);
 const clearChance=105-homeSpace(victim,victim.team)<18&&Math.abs(victim.y-34)<9&&speed>1&&towards>.7&&!(victim.controlUntil>s.time)&&!covering.length;
 const judgement=judgeChallenge({tackle:defender.tackle,discipline:defender.discipline,energy:defender.energy,relativeSpeed:Math.hypot(defender.vx-victim.vx,defender.vy-victim.vy),behind,clearChance,foulRoll:sample.foul??random(s),forceRoll:sample.force??random(s)});
 const inBox=inPenalty(point,defender.team),injury=sample.injury??random(s);
 const forced=injury<judgement.injuryRisk&&(sample.serious??random(s))<.06+judgement.force*.12;
 if(injury<judgement.injuryRisk&&!forced)injurePlayer(s,victim.id,{forced:false,cause:'contact',force:judgement.force,opponentId:defender.id});
 if(!judgement.foul){if(inBox&&(sample.appeal===true||random(s)<.14))emit(s,'appeal',victim.team,victim.id,`${victim.name} appeals for a penalty. The referee waves play on.`,{opponentId:defender.id,decision:'play-on'});if(forced)injurePlayer(s,victim.id,{cause:'contact',force:judgement.force,opponentId:defender.id});return judgement;}
 s.stats[defender.team].fouls=(s.stats[defender.team].fouls||0)+1;emit(s,'foul',defender.team,defender.id,`${defender.name} brings down ${victim.name}: ${judgement.reason}.`,{opponentId:victim.id,point,reason:judgement.reason});
 if(judgement.card){
  const second=judgement.card==='yellow'&&(defender.bookings||0)>=1,red=judgement.card==='red'||second;
  if(judgement.card==='yellow'){defender.bookings=(defender.bookings||0)+1;s.stats[defender.team].yellows=(s.stats[defender.team].yellows||0)+1;}
  if(red){defender.sentOff=true;defender.vx=defender.vy=0;defender.target=null;defender.intent='Sent off';s.stats[defender.team].reds=(s.stats[defender.team].reds||0)+1;}
  emit(s,'card',defender.team,defender.id,red?`${defender.name} is sent off${second?' after a second booking':''}.`:`${defender.name} is booked.`,{colour:red?'red':'yellow',secondYellow:second,reason:judgement.reason});
 }
 if(inBox){s.stats[victim.team].penalties=(s.stats[victim.team].penalties||0)+1;emit(s,'penalty',victim.team,victim.id,'Penalty! The referee points to the spot.',{opponentId:defender.id,point});restart(s,victim.team,'penalty');}
 else{
  const ahead={x:victim.x+dir*6,y:victim.y},space=Math.min(...onPitch(s).filter(q=>q.team!==victim.team).map(q=>distance(q,ahead)));
  if(!forced&&!judgement.card&&sample.advantage!==false&&(sample.advantage===true||space>5&&victim.vx*dir>1)){
   s.advantage={team:victim.team,point,expires:s.time+3,started:s.time};emit(s,'advantage',victim.team,victim.id,'The referee allows advantage.',{point});
  }else restart(s,victim.team,'direct',point);
 }
 if(forced)injurePlayer(s,victim.id,{cause:'contact',force:judgement.force,opponentId:defender.id});
 if(onPitch(s).filter(q=>q.team===defender.team).length<7){stopFlow(s);s.phase='ended';s.pendingInjury=null;s.pendingRestart=false;s.flight=null;emit(s,'abandoned',defender.team,null,'The test stops: fewer than seven players remain.');}
 return judgement;
}
// Decide whether to commit or stay on feet. Discipline makes a defender more
// cautious around a settled carrier in the area; an exposed touch invites a tackle.
export function assessChallenge(s,defender,victim){
 const reach=distance(defender,s.ball),behind=(defender.x-victim.x)*direction(victim.team)<-.5;
 const skill=((victim.dribbling??victim.technique)+victim.technique)/2,exposed=victim.controlUntil>s.time;
 const box=inPenalty(victim,defender.team),caution=(box?.45:.1)*defender.discipline/100;
 const attemptChance=reach>1.6?0:clamp(.65+(defender.tackle-skill)*.004+(exposed?.25:0)-(behind?.18:0)-caution-((defender.bookings||0)>0?.1:0),.08,.95);
 return {attemptChance,reach,behind,exposed,box,reason:exposed?'Challenge the unsettled touch':box?'Stay on feet unless the ball can be won':'Choose the moment to tackle'};
}
// A fair tackle can win clean possession or knock the ball loose. Ability and
// approach matter; failed contact does not imply a foul or a guaranteed take-on.
export function resolveBallTackle(s,challengerId,victimId,sample={}){
 const defender=player(s,challengerId),victim=player(s,victimId);
 if(s.phase!=='play'||s.ball.owner!==victimId||!defender||!victim||defender.team===victim.team||distance(defender,victim)>1.6||!onPitch(s).includes(defender)||!onPitch(s).includes(victim)||defender.role==='GK')return {won:false};
 const behind=(defender.x-victim.x)*direction(victim.team)<-.5,skill=((victim.dribbling??victim.technique)+victim.technique)/2;
 const chance=clamp(.55+(defender.tackle-skill)*.006-(behind?.12:0)-(victim.dribbleUntil>s.time?.05:0),.12,.85);
 if((sample.win??random(s))>=chance)return {won:false,chance};
 s.stats[defender.team].tackles++;
 const clean=(sample.control??random(s))<clamp(.35+defender.technique*.004,.4,.8);
 if(clean){own(s,defender,1.1);emit(s,'tackle',defender.team,defender.id,`${defender.name} tackles ${victim.name} and wins the ball.`,{opponentId:victim.id,outcome:'controlled'});}
 else{
  const dir=direction(defender.team),length=sample.length??random(s),sideRoll=sample.side??random(s);
  const dx=length*2+1.5;
  const nearLine=Math.min(s.ball.y,68-s.ball.y)<9;
  const lateral=victim.y-defender.y;
  const dy=nearLine&&Math.abs(lateral)>.2
   ?Math.sign(lateral)*(2+length*3)+(sideRoll-.5)*2*dir
   :(sideRoll-.5)*4*dir;
  s.offsidePhase=null;s.looseDelivery=null;s.ball={x:s.ball.x,y:s.ball.y,z:0,owner:null};s.looseSince=null;s.possession=defender.team;s.immunity=s.time+.35;
  const event=emit(s,'tackle',defender.team,defender.id,`${defender.name} knocks the ball away from ${victim.name}; it is loose.`,{opponentId:victim.id,outcome:'loose'}),duration=.35;
  s.flight={kind:'rebound',team:defender.team,actorId:defender.id,receiverId:null,target:{x:s.ball.x+dir*dx,y:s.ball.y+dy},vx:dir*dx/duration,vy:dy/duration,age:0,duration,loft:0,passEvent:event.id,contacted:[victim.id],origin:'tackle'};
 }
 return {won:true,clean,chance};
}
export function startSecondHalf(s){
 if(s.phase!=='half-time'||!s.fullMatch)return false;
 s.fullMatch.half=2;
 // Allow a pending penalty to finish without shortening the second half.
 s.duration=s.time+2700;
 emit(s,'second-half',null,null,'Second half.');
 awardRestart(s,1-s.fullMatch.firstKickoff,'kickoff');
 return true;
}
export function stepSimulation(s){
 if(['ended','injury','half-time'].includes(s.phase))return s;
 const previousTime=s.time;
 const penaltyPending=s.restartKind==='penalty'&&(s.pendingRestart||s.flight?.delivery==='penalty');
 const firstHalf=s.fullMatch?.half===1;
 const limit=firstHalf?2700:s.duration;
 const next=Number((s.time+STEP).toFixed(5));
 s.time=penaltyPending?next:Math.max(s.time,Math.min(limit,next));
 if(!s.timing)s.timing={live:0,stopped:0};
 s.timing[s.phase==='restart'?'stopped':'live']+=s.time-previousTime;
 if(s.time>=limit&&!penaltyPending){
  s.giveAndGo=null;
  stopFlow(s);
  s.flight=null;
  s.pendingRestart=false;
  if(firstHalf){
   s.phase='half-time';
   s.ball.owner=null;
   s.advantage=null;
   commitSubstitutions(s);
   emit(s,'half-time',null,null,'Half-time. Review your plan or make a substitution.');
  }else{
   s.phase='ended';
   emit(s,'end',null,null,s.fullMatch?'Full-time.':'End of the test passage.');
  }
  return s;
 }
 if(s.phase==='restart'){for(const p of onPitch(s))p.energy=conditionAfter(p,{rest:true});if(s.time>=s.restartUntil){s.phase='play';s.decisionAt=s.time+.6;emit(s,'resume',s.possession,s.ball.owner,'Play resumes.');if(s.pendingRestart)takeRestart(s);}return s;}
 if(s.advantage){const a=s.advantage;if(s.possession!==a.team){emit(s,'advantage-recalled',a.team,null,'No advantage: the referee returns to the original foul.',{point:a.point});restart(s,a.team,'direct',a.point);return s;}if(s.time>=a.expires){emit(s,'advantage-used',a.team,null,'The advantage has been taken.');s.advantage=null;}}
 if(s.time>=(s.nextInjuryCheck??1)){s.nextInjuryCheck=Math.floor(s.time)+1;for(const p of onPitch(s)){const fatigue=Math.max(0,70-p.energy)/70,exertion=Math.min(1,Math.hypot(p.vx,p.vy)/p.pace),risk=(.0000007+fatigue*fatigue*.000007)*(.15+exertion*.85);if(random(s)<risk){injurePlayer(s,p.id,{cause:'non-contact'});return s;}}}
 s.stats[s.possession].possession+=STEP;movePlayers(s);
 if(s.flight){advanceFlight(s);return s;}
 const owner=player(s,s.ball.owner);
 if(!owner){const closest=onPitch(s).slice().sort((a,b)=>distance(a,s.ball)-distance(b,s.ball))[0];if(distance(closest,s.ball)<1.6){if(offsideContact(s,closest))return s;const delivery=s.looseDelivery;s.looseDelivery=null;if(delivery&&delivery.actorId!==closest.id&&delivery.team===closest.team&&s.time-delivery.looseAt<4){receiveBall(s,closest,delivery);return s;}own(s,closest);emit(s,'recovery',closest.team,closest.id,`${closest.name} collects the loose ball.`);}return s;}
 if(s.time>=s.immunity){const challenger=nearest(s,1-owner.team,owner).filter(p=>p.role!=='GK')[0];if(challenger&&distance(challenger,owner)<1.45&&s.time>=(challenger.challengeAt??0)){challenger.challengeAt=s.time+1.5+(100-challenger.agility)*.008;const choice=assessChallenge(s,challenger,owner);if(random(s)<choice.attemptChance){s.immunity=s.time+.65;const contact=resolveChallenge(s,challenger.id,owner.id);if(contact?.foul||s.phase!=='play')return s;if(resolveBallTackle(s,challenger.id,owner.id).won)return s;}else{challenger.containUntil=challenger.challengeAt;challenger.thinkAt=0;}}}
 const urgent=distance(owner,nearest(s,1-owner.team,owner)[0])<3.2&&s.time>=(owner.readyAt??0)&&s.time>=(owner.controlUntil??0)&&s.time>=(owner.lastActionAt??-99)+.8&&s.time>=(owner.dribbleUntil??0);
 if(urgent||s.time>=s.decisionAt)chooseAction(s,owner);return s;
}
export function simulationSnapshot(s){return {time:s.time,phase:s.phase,ball:{...s.ball},players:s.players.map(p=>({id:p.id,team:p.team,number:p.shirtNumber??p.number,name:p.name,role:p.role,x:p.x,y:p.y,sentOff:!!p.sentOff,onField:!p.sentOff&&!p.bench&&!p.subbedOff&&!p.injuredOff})),score:[...s.score]};}
