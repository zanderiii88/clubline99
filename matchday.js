import {UC_ID} from './uefa-cup.js?v=1.62.1';
import {CL_ID} from './champions-league.js?v=1.62.1';
import {divisionOf} from './divisions.js?v=1.62.1';
export const cupName=id=>id===UC_ID?'UEFA Cup':id===CL_ID?'Champions League':id==='fa-cup'?'FA Cup':'League Cup';
export const isCup=id=>['league-cup','fa-cup',CL_ID,UC_ID].includes(id);
export function relevantFixture(c,f){return f.friendly?[f.home,f.away].includes(c.clubId):f.competition===UC_ID?!!c.uefaCup?.entrants?.includes(c.clubId):f.competition===CL_ID?!!c.championsLeague?.entrants?.includes(c.clubId):isCup(f.competition)?(f.competition==='fa-cup'?c.faCup:c.leagueCup)?.status!=='deferred':f.competition===divisionOf(c);}
export const dayFixtures=(c,date=c.date)=>c.schedule.filter(r=>r.date===date).flatMap(r=>r.fixtures).filter(f=>relevantFixture(c,f));
export function prepareMatchday(c){
 c.matchdaySeen??=[];if(c.matchday||c.matchdaySeen.includes(c.date))return false;
 const fs=dayFixtures(c);if(!fs.some(f=>f.homeGoals===null))return false;
 c.matchday={date:c.date,phase:'fixtures',tableBefore:null};return true;
}
export function pendingDraw(c){
 const europe=(c.championsLeague?.stages||[]).filter(r=>r.drawDate<=c.date&&!r.eventSeen&&r.entrants.includes(c.clubId)).map(round=>({competition:CL_ID,round}));
 const uefa=(c.uefaCup?.rounds||[]).filter(r=>r.drawDate<=c.date&&!r.eventSeen&&r.entrants.includes(c.clubId)).map(round=>({competition:UC_ID,round}));
 return [...europe,...uefa,...[['league-cup',c.leagueCup],['fa-cup',c.faCup]].flatMap(([competition,cup])=>(cup?.rounds||[]).filter(r=>r.drawDate<=c.date&&!r.eventSeen).map(round=>({competition,round})))].sort((a,b)=>a.round.drawDate.localeCompare(b.round.drawDate)||a.competition.localeCompare(b.competition)||a.round.index-b.round.index)[0]||null;
}
export function initialiseMatchdays(c){
 c.matchdaySeen??=[];announceDraws(c);
 for(const r of [...(c.championsLeague?.stages||[]),...(c.uefaCup?.rounds||[])])if(r.eventSeen===undefined)r.eventSeen=r.drawDate<c.date||r.revealed===r.selections.length;
 for(const cup of [c.leagueCup,c.faCup])for(const r of cup?.rounds||[])if(r.eventSeen===undefined)r.eventSeen=r.drawDate<c.date||r.revealed===r.ties.length;
}
export function validMatchdays(c){
 if(c.matchdaySeen!==undefined&&(!Array.isArray(c.matchdaySeen)||new Set(c.matchdaySeen).size!==c.matchdaySeen.length||c.matchdaySeen.some(x=>typeof x!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(x))))return false;
 const d=c.matchday;return !d||typeof d.date==='string'&&d.date===c.date&&['fixtures','await-match','results','table'].includes(d.phase)&&dayFixtures(c,d.date).length>0&&(d.tableBefore===null||d.tableBefore&&typeof d.tableBefore==='object'&&!Array.isArray(d.tableBefore));
}

export function announceDraws(c){
 for(const r of c.uefaCup?.rounds||[])if(r.drawDate<=c.date&&!r.announced){c.news.push({date:r.drawDate,kind:'cup-draw',important:r.entrants.includes(c.clubId),text:`UEFA Cup ${r.name.toLowerCase()} draw is ready.`,action:UC_ID});r.announced=true;}
 for(const r of c.championsLeague?.stages||[])if(r.drawDate<=c.date&&!r.announced){c.news.push({date:r.drawDate,kind:'cup-draw',important:r.entrants.includes(c.clubId),text:`Champions League ${r.name.toLowerCase()} draw is ready.`,action:CL_ID});r.announced=true;}

 for(const [competition,cup]of [['league-cup',c.leagueCup],['fa-cup',c.faCup]])for(const r of cup?.rounds||[])if(r.drawDate<=c.date&&!r.announced){
  if(!c.news.some(n=>n.kind==='cup-draw'&&n.action===competition&&n.date===r.drawDate&&n.text.toLowerCase().includes(r.name.toLowerCase())))c.news.push({date:r.drawDate,kind:'cup-draw',important:r.entrants.includes(c.clubId),text:`${cupName(competition)} ${r.name.toLowerCase()} draw is ready.`,action:competition});r.announced=true;
 }
}
