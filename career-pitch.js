import {createSimulation, setTactic, adjustPlan, instructPlayer} from './possession-sim.js?v=1.193.0';
import {labAnchor, labShape} from './lab-tactics.js?v=1.169.0';
import {formationSlots} from './formations.js?v=1.100.0';
import {cornerOutput,isPitchCorner,penaltyIncidentText} from './match-incidents.js?v=1.193.0';

const tactics = {'Possession':'possession', 'Counter':'counter', 'High press':'press'};
const instructions = {'Hold position':'hold', 'Get forward':'forward', 'Cut inside':'roam'};

export function createCareerPitch(sides, homeSide, seed, order) {
 const formations = sides.map(side => labShape(side.shape));
 const selectedLineups = sides.map(({shape, starters, bench}, team) => {
  const available = formationSlots(shape).map((role, index) => ({role, player:starters[index]}));
  const eleven = Array.from({length:11}, (_,slot) => {
   const role = labAnchor(formations[team],slot)[2];
   return available.splice(available.findIndex(entry => entry.role===role),1)[0].player;
  });
  return [...eleven,...bench];
 });
 const sim = createSimulation({seed, fullMatch:true, managedTeam:0, homeSide,
  kickoffTeam:homeSide, formations, clubs:sides.map(side=>side.club), selectedLineups});
 sides.forEach(({style},team)=>setTactic(sim,team,tactics[style]??'balanced'));
 if(order==='Attack')adjustPlan(sim,0,'fullbacks','attack');
 if(order==='Protect lead'){
  adjustPlan(sim,0,'fullbacks','stay');
  adjustPlan(sim,0,'press','deep');
 }
 for(const p of sim.players){
  const selected=selectedLineups[p.team][p.number-1];
  if(instructions[selected.instruction])instructPlayer(sim,p.id,instructions[selected.instruction]);
 }
 return sim;
}

export function careerPitchResult(sim, clubs, homeSide) {
 const ids=new Map(sim.players.map(p=>[p.id,p.rosterId]));
 const participants=sim.players.filter(p=>p.number<=11).map(p=>[p.rosterId,{start:0,end:null}]);
 const played=Object.fromEntries(participants);
 const goals={}, assists={}, cards={}, injured=[];
 const events=[];
 const shots=new Map(sim.events.filter(e=>e.type==='shot').map(e=>[e.id,e]));
 const corners=sim.events.filter(isPitchCorner);
 const savesById=new Map(sim.events.filter(e=>e.type==='save'&&shots.has(e.shotId)).map(e=>[e.id,e]));
 const cornersBySave=new Map(corners.filter(e=>savesById.has(e.saveEventId)).map(e=>[e.saveEventId,e]));
 const resolvedShots=new Set();
 const minuteAt=seconds=>Math.max(1,Math.min(90,Math.ceil(seconds/60)));
 for(const e of sim.events){
  const minute=minuteAt(e.second), playerId=ids.get(e.actorId), team=clubs[e.team];
  const note={minute,playerId,team,text:e.text};
  if(e.type==='substitution'){
   const out=ids.get(e.outgoingId);
   played[out].end??=minute;
   played[playerId]={start:minute,end:null};
   events.push({...note,type:'substitution',outgoingId:out});
  }else if(e.type==='card'||e.type==='injury'){
   const type=e.type==='card'?e.colour:'injury';
   if(type==='injury')injured.push(playerId);
   else cards[playerId]=(cards[playerId]||0)+1;
   if(type==='red'||type==='injury')played[playerId].end??=minute;
   events.push({...note,type,secondYellow:!!e.secondYellow});
  }else if(e.type==='penalty'){
   events.push({...note,type:'penalty',text:`Penalty for ${sim.teams[e.team].name}. ${e.text.replace(/^Penalty! /,'')}`});
  }else if(isPitchCorner(e)&&!savesById.has(e.saveEventId)){
   events.push({...note,type:'corner'});
  }else if(['save','block','miss'].includes(e.type)&&shots.has(e.shotId)&&!resolvedShots.has(e.shotId)){
   const shot=shots.get(e.shotId);
   resolvedShots.add(e.shotId);
   const shooter=ids.get(shot.actorId);
   if(!shooter)continue;
   const corner=e.type==='save'?cornersBySave.get(e.id):null;
   const penalty=shot.delivery==='penalty';
   events.push({...note,type:'chance',playerId:shooter,team:clubs[shot.team],
    text:penaltyIncidentText(corner?.text??e.text,penalty),
    ...(corner?{restartKind:'corner'}:{}),
    onTarget:e.type==='save'&&e.onTarget===true,
    keeperId:e.type==='save'&&e.onTarget?playerId:null});
  }else if(e.type==='goal'){
   if(!e.ownGoal)goals[playerId]=(goals[playerId]||0)+1;
   const assistId=!e.ownGoal&&e.assistId!==e.actorId?ids.get(e.assistId):null;
   if(assistId)assists[assistId]=(assists[assistId]||0)+1;
   const penalty=shots.get(e.shotId)?.delivery==='penalty';
   events.push({...note,type:'goal',text:penaltyIncidentText(e.text,penalty),assistId:assistId??null,ownGoal:!!e.ownGoal});
  }
 }
 const totals=sim.stats[0].possession+sim.stats[1].possession;
 const cornerStats=cornerOutput(sim.events);
 const statLine=({shots,shotsOnTarget,yellows,reds,passes,completed,corners,penalties,fouls,offsides,saves,blocks})=>
  ({shots,onTarget:shotsOnTarget,yellow:yellows,red:reds,passes,completed,corners,penalties,fouls,offsides,saves,blocks});
 return {homeGoals:sim.score[homeSide],awayGoals:sim.score[1-homeSide],played,events,
  goalCounts:goals,assistCounts:assists,cardCounts:cards,injured,
  stats:{home:{...statLine(sim.stats[homeSide]),...cornerStats[homeSide]},
   away:{...statLine(sim.stats[1-homeSide]),...cornerStats[1-homeSide]},
   possession:totals?[{minute:90,home:100*sim.stats[homeSide].possession/totals}]:[]}};
}
