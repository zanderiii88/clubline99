import {createSimulation, setTactic, adjustPlan, instructPlayer} from './possession-sim.js?v=1.162.0';
import {labAnchor, labShape} from './lab-tactics.js?v=1.162.0';
import {formationSlots} from './formations.js?v=1.100.0';

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
 const goals={}, cards={}, injured=[];
 const events=[];
 const minuteAt=seconds=>Math.max(1,Math.min(90,Math.ceil(seconds/60)));
 for(const e of sim.events){
  const minute=minuteAt(e.second), playerId=ids.get(e.actorId), team=clubs[e.team];
  const note={minute,playerId,team,text:e.text};
  if(e.type==='substitution'){
   const out=ids.get(e.outgoingId);
   played[out].end??=minute;
   played[playerId]={start:minute,end:null};
   events.push({...note,type:'substitution'});
  }else if(e.type==='card'||e.type==='injury'){
   const type=e.type==='card'?e.colour:'injury';
   if(type==='injury')injured.push(playerId);
   else cards[playerId]=(cards[playerId]||0)+1;
   if(type==='red'||type==='injury')played[playerId].end??=minute;
   events.push({...note,type,secondYellow:!!e.secondYellow});
  }else if(e.type==='goal'){
   if(!e.ownGoal)goals[playerId]=(goals[playerId]||0)+1;
   events.push({...note,type:'goal',ownGoal:!!e.ownGoal});
  }
 }
 const totals=sim.stats[0].possession+sim.stats[1].possession;
 const statLine=({shots,shotsOnTarget,yellows,reds})=>({shots,onTarget:shotsOnTarget,yellow:yellows,red:reds});
 return {homeGoals:sim.score[homeSide],awayGoals:sim.score[1-homeSide],played,events,
  goalCounts:goals,cardCounts:cards,injured,stats:{home:statLine(sim.stats[homeSide]),
   away:statLine(sim.stats[1-homeSide]),possession:totals?[{minute:90,home:100*sim.stats[homeSide].possession/totals}]:[]}};
}
