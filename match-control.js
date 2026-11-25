import {validTacticalRecord} from './tactical-review.js?v=1.102.0';
// Restore a watched match without running the clock before the manager is ready.
export function restoreMatchControl(match){
 if(match?.phase!=='live')return match;
 match.paused=true;
 if(!['red','injury','half'].includes(match.pauseReason))match.pauseReason='restored';
 if(['red','injury','half'].includes(match.pauseReason))match.drawerOpen=true;
 match.pendingSubIndex=null;
 return match;
}
export function validLiveMatch(match,ids){
 if(match&&!validTacticalRecord(match.tacticalRecord,ids))return false;
 if(match?.phase!=='live')return match?.pitch===undefined;
 const selection=a=>Array.isArray(a)&&a.every(id=>id===null||ids.has(id));
 if(!selection(match.lineup)||match.lineup.length!==11||!selection(match.bench)||match.bench.length>7||!selection(match.oppLineup)||match.oppLineup.length!==11)return false;
 const chosen=[...match.lineup,...match.bench].filter(Boolean);
 if(new Set(chosen).size!==chosen.length||!Number.isInteger(match.subCount)||match.subCount<0||match.subCount>3||!Number.isInteger(match.minute)||match.minute<0||match.minute>120||![match.homeGoals,match.awayGoals].every(x=>Number.isInteger(x)&&x>=0)||!Array.isArray(match.events)||typeof match.paused!=='boolean')return false;
 return match.pitch===undefined||validPitchMatch(match,ids);
}

const object=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
const count=value=>Number.isInteger(value)&&value>=0;
const pair=value=>Array.isArray(value)&&value.length===2;

const observationIds=['wide','fatigue','tempo'];
export function normalisePitchContinuity(playback,time){
 const handled=playback?.handledAdvice;
 const penalty=playback?.penalty;
 return {
  handledAdvice:Array.isArray(handled)?observationIds.filter(id=>handled.includes(id)):[],
  penalty:object(penalty)&&Number.isFinite(penalty.until)&&penalty.until>time&&penalty.until<=time+5
   &&typeof penalty.text==='string'&&penalty.text.length<=300?{until:penalty.until,text:penalty.text}:null
 };
}

function validPitchMatch(match,ids){
 const p=match.pitch;
 if(!object(p)||match.phase!=='live'||![0,1].includes(p.homeSide)||!pair(p.clubs)||
  p.clubs[p.homeSide]!==match.home||p.clubs[1-p.homeSide]!==match.away||
  !pair(p.shirts)||p.shirts.some((shirt,i)=>!object(shirt)||shirt.id!==p.clubs[i]))return false;
 if(p.playback!==undefined&&(!object(p.playback)||!['full','highlights','extended'].includes(p.playback.view)||
  ![1,2,4,8].includes(p.playback.speed)||p.playback.sound!==undefined&&typeof p.playback.sound!=='boolean'))return false;
 const s=p.sim;
 if(!object(s)||s.version!==19||!Number.isFinite(s.duration)||!Number.isFinite(s.time)||s.time<0||s.time>7200||
  !['restart','play','injury','half-time','ended'].includes(s.phase)||!object(s.fullMatch)||![1,2].includes(s.fullMatch.half)||
  !count(s.seed)||!count(s.rng)||s.managedTeam!==0||!pair(s.score)||!s.score.every(count)||
  !pair(s.teams)||s.teams.some(t=>!object(t)||typeof t.name!=='string'||!object(t.plan))||
  !pair(s.stats)||s.stats.some(t=>!object(t)||!['shots','shotsOnTarget','possession'].every(k=>Number.isFinite(t[k])&&t[k]>=0))||
  !pair(s.subsUsed)||s.subsUsed.some(n=>!count(n)||n>3)||!Array.isArray(s.events)||
  s.events.some(e=>!object(e)||!count(e.id)||typeof e.type!=='string'||typeof e.text!=='string'||!Number.isFinite(e.second))||
  !object(s.ball)||![s.ball.x,s.ball.y].every(Number.isFinite)||!object(s.flow)||!pair(s.flow.teams)||s.flow.teams.some(t=>!object(t)||!Array.isArray(t.losses))||
  !Array.isArray(s.players)||s.players.length<22||s.players.length>36||!Array.isArray(s.pendingSubs))return false;
 if(s.players.some(q=>!object(q)||![0,1].includes(q.team)||typeof q.id!=='string'||!ids.has(q.rosterId)||
  typeof q.name!=='string'||!count(q.number)||q.number<1||q.number>18||
  ![q.x,q.y,q.energy,q.pace].every(Number.isFinite)))return false;
 const secondHalf=s.events.findLast(e=>e.type==='second-half');
 const expectedDuration=s.fullMatch.half===2&&secondHalf?secondHalf.second+2700:5400;
 if(Math.abs(s.duration-expectedDuration)>1e-8||s.duration<5400||s.duration>7200)return false;
 const playerIds=new Set(s.players.map(q=>q.id)),rosterIds=new Set(s.players.map(q=>q.rosterId));
 if(playerIds.size!==s.players.length||rosterIds.size!==s.players.length)return false;
 for(const [team,lineup] of [match.lineup,match.oppLineup].entries()){
  const starters=new Set(s.players.filter(q=>q.team===team&&q.number<=11).map(q=>q.rosterId));
  if(starters.size!==11||lineup.some(id=>!starters.has(id)))return false;
 }
 const injury=s.pendingInjury;
 if(s.phase==='injury'&&(!object(injury)||!playerIds.has(injury.playerId)||!object(injury.restart)))return false;
 if(s.flight!=null&&(!object(s.flight)||!playerIds.has(s.flight.actorId)||!object(s.flight.target)||
  !Array.isArray(s.flight.contacted)||![s.flight.vx,s.flight.vy,s.flight.age,s.flight.duration].every(Number.isFinite)))return false;
 return (s.ball.owner==null||playerIds.has(s.ball.owner))&&s.pendingSubs.every(q=>object(q)&&
  playerIds.has(q.outgoingId)&&playerIds.has(q.incomingId));
}
