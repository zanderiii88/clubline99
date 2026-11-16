import {divisionOf} from './divisions.js?v=1.93.0';
import {managerFor} from './managers.js?v=1.96.0';
import {rivalryHistory} from './rivalry-history.js?v=1.106.0';
import {clubRivals} from './manager-media.js?v=1.106.0';
const unique=(rows,key)=>{const seen=new Set();return rows.filter(r=>{const k=key(r);if(seen.has(k))return false;seen.add(k);return true;});};
// Editorial summaries only: no stored events, reactions, random rolls or time changes.
export function seasonStories(c,league,{scope='club'}={},name=id=>league.clubs.find(t=>t.id===id)?.name||id){
 const players=new Map(league.players.map(p=>[p.id,p])),clubs=new Set(league.clubs.map(t=>t.id)),items=[],current=date=>typeof date==='string'&&date>=c.seasonStart&&date<=c.date;
 const reports=unique((c.reports||[]).filter(r=>current(r.date)&&!r.friendly&&Number.isInteger(r.us)&&r.us>=0&&Number.isInteger(r.them)&&r.them>=0&&[r.homeId,r.awayId].includes(c.clubId)),r=>[r.date,r.homeId,r.awayId,r.competition||r.kind||'league'].join(':')).sort((a,b)=>a.date.localeCompare(b.date));
 if(scope==='division'){
  const oldest=new Date(Date.parse(c.date+'T12:00:00Z')-29*86400000).toISOString().slice(0,10),own=divisionOf(c);
  for(const e of c.managerWorld?.events||[]){
   if(!current(e.date)||e.date<oldest||!clubs.has(e.clubId)||divisionOf(c,e.clubId)!==own)continue;
   const old=c.managerWorld.people[e.out],record=old?.history?.find(h=>h.clubId===e.clubId&&h.to===e.date)?.record;
   items.push({id:'manager:'+e.date+':'+e.clubId+':'+e.in,group:'Managers',date:e.date,title:'A new chapter at '+name(e.clubId),text:e.text,evidence:record?`Departing manager’s recorded spell: ${record.played} matches · ${record.won} wins, ${record.drawn} draws, ${record.lost} defeats.`:'The retained appointment record provides the context; no earlier spell total is available.',clubId:e.clubId});
  }
  for(const round of c.schedule||[])for(const f of round.fixtures){
   if(!current(round.date)||round.date<oldest||f.friendly||!Number.isInteger(f.homeGoals)||f.homeGoals<0||!Number.isInteger(f.awayGoals)||f.awayGoals<0||!clubs.has(f.home)||!clubs.has(f.away)||divisionOf(c,f.home)!==own||divisionOf(c,f.away)!==own)continue;
   const derby=clubRivals(f.home,f.away),margin=Math.abs(f.homeGoals-f.awayGoals);if(!derby&&margin<4)continue;
   items.push({id:['result',round.date,f.home,f.away,f.competition||f.kind].join(':'),group:'Results',date:round.date,title:derby?'A rivalry in the spotlight':'A result that stands out',text:`${name(f.home)} ${f.homeGoals}–${f.awayGoals} ${name(f.away)}${f.penalties&&f.winner?'. '+name(f.winner)+' advanced on penalties':''}.`,evidence:derby?'A recognised club rivalry; the score is the recorded match result.':`A ${margin}-goal margin in a completed competitive fixture.`,clubId:f.home,otherClubId:f.away});
  }
  return {scope,reportCount:reports.length,items:unique(items,s=>s.id).sort((a,b)=>b.date.localeCompare(a.date)||a.id.localeCompare(b.id)).slice(0,12)};
 }
 const next=(c.schedule||[]).flatMap(r=>r.fixtures.filter(f=>!f.friendly&&f.homeGoals===null&&f.awayGoals===null&&[f.home,f.away].includes(c.clubId)&&r.date>=c.date).map(f=>({...f,date:r.date}))).sort((a,b)=>a.date.localeCompare(b.date))[0];
 if(next){const id=next.home===c.clubId?next.away:next.home,m=managerFor(c,id),history=rivalryHistory(c,id,m?.id,next.date);items.push({id:'next:'+next.date+':'+id,group:'Next chapter',date:next.date,title:(clubRivals(c.clubId,id)?'Rivalry ahead: ':'Next meeting: ')+name(id),text:history.text,evidence:m?`Current opposing manager: ${m.name}. Club meetings and personal press exchanges are separate histories.`:'An opposing manager is not recorded.',clubId:id,press:true});}
 const leagueReports=reports.filter(r=>r.kind==='league');
 if(leagueReports.length){const last=leagueReports.at(-1),tail=test=>{let n=0;for(let i=leagueReports.length-1;i>=0&&test(leagueReports[i]);i--)n++;return n;},wins=tail(r=>r.us>r.them),unbeaten=tail(r=>r.us>=r.them),winless=tail(r=>r.us<=r.them),count=wins>=3?wins:unbeaten>=3?unbeaten:winless>=3?winless:0;
  if(count)items.push({id:'form:'+last.date,group:'Club form',date:last.date,title:wins>=3?`${count} straight league wins`:unbeaten>=3?`${count} league games unbeaten`:`${count} league games without a win`,text:`From ${leagueReports.at(-count).date} to ${last.date}, across the retained league reports for ${name(c.clubId)}. Cup games and friendlies do not extend or break this league run.`,evidence:`${leagueReports.length} league report${leagueReports.length===1?'':'s'} retained this season. This describes recorded games; it is not a result prediction.`,reportDate:last.date});
 }
 const rows=(c.playerProgress?.records||[]).filter(r=>r.season===c.season&&r.clubId===c.clubId&&players.has(r.id)&&r.apps>0&&(!r.start||r.start<=c.date)),scorer=[...rows].filter(r=>r.goals>=3).sort((a,b)=>b.goals-a.goals||b.minutes-a.minutes||a.id.localeCompare(b.id))[0];
 if(scorer){const p=players.get(scorer.id);items.push({id:'scorer:'+c.season+':'+p.id,group:'Players',date:c.date,title:p.name+' leads the recorded scoring',text:`${scorer.goals} competitive goals in ${scorer.apps} appearances for your club this season${rows.some(r=>r.id!==p.id&&r.goals===scorer.goals)?' · joint leading scorer':''}.`,evidence:'Based on retained club player records, including cups and excluding friendlies. Earlier untracked games can be missing.',playerId:p.id});}
 for(const r of [...rows].filter(r=>players.get(r.id).age<=21&&r.apps>=5&&r.minutes>=450).sort((a,b)=>b.minutes-a.minutes||a.id.localeCompare(b.id)).slice(0,2)){const p=players.get(r.id);items.push({id:'young:'+c.season+':'+p.id,group:'Players',date:c.date,title:p.name+' has earned senior minutes',text:`Age ${p.age} · ${r.minutes} recorded competitive minutes across ${r.apps} appearances for your club this season.`,evidence:'At least five appearances and 450 minutes. Playing time is recorded evidence, not a promise of ability growth or future selection.',playerId:p.id});}
 const milestones=unique((c.playerProgress?.milestones||[]).filter(m=>m.clubId===c.clubId&&m.season===c.season&&current(m.date)&&players.has(m.id)),m=>m.key).sort((a,b)=>b.date.localeCompare(a.date)||b.value-a.value||a.key.localeCompare(b.key)).slice(0,4);
 for(const m of milestones){const p=players.get(m.id),what=m.type==='appearances'?(m.value===1?'first recorded competitive appearance':`${m.value} recorded competitive appearances`):(m.value===1?'first recorded competitive goal':`${m.value} recorded competitive goals`);items.push({id:'milestone:'+m.key,group:'Recorded milestones',date:m.date,title:p.name+' · '+what,text:'Reached for your club on '+m.date+'.',evidence:'Career tracking and retained records only; this is not a claim about the player’s real-world career.',playerId:p.id});}
 for(const e of unique((c.clubHistory?.events||[]).filter(e=>current(e.date)),e=>e.key).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,3))items.push({id:'club:'+e.key,group:'Club chapters',date:e.date,title:'A chapter in your club’s story',text:e.text,evidence:'From the retained club-history record.',history:true});
 return {scope:'club',reportCount:reports.length,items};
}
