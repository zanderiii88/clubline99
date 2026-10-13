import {insertCupFixture} from './cup-scheduling.js?v=1.72.0';
import {seasonSchedule} from './season-calendar.js?v=1.72.0';
export const DIVISIONS=[{id:'premier',name:'Premier Division',size:20,relegation:3},{id:'first',name:'First Division',size:24,relegation:3},{id:'second',name:'Second Division',size:24,relegation:0}];
const after=(s,n)=>new Date(Date.parse(s+'T12:00:00Z')+n*86400000).toISOString().slice(0,10);
export const domesticClub=id=>/^C\d{2}$/.test(id);
export const startingDivision=id=>!domesticClub(id)?'european':Number(id.slice(1))<=20?'premier':Number(id.slice(1))<=44?'first':'second';
export const divisionOf=(c,id=c.clubId)=>c.divisions?.[id]||startingDivision(id);
export const divisionInfo=id=>DIVISIONS.find(d=>d.id===id);
export const divisionClubs=(c,league,id=divisionOf(c))=>league.clubs.filter(x=>divisionOf(c,x.id)===id);
export const divisionLeague=(c,league)=>({...league,clubs:divisionClubs(c,league)});
export function makeSchedule(c,league,year){
 const dates=new Map();
 for(const d of DIVISIONS)for(const r of seasonSchedule(divisionClubs(c,league,d.id).map(x=>x.id),year,c.season||1)){
  if(!dates.has(r.date))dates.set(r.date,{date:r.date,fixtures:[]});
  dates.get(r.date).fixtures.push(...r.fixtures.map(f=>({...f,competition:d.id,kind:'league'})));
 }
 const schedule=[...dates.values()].sort((a,b)=>a.date.localeCompare(b.date));
 // Wimbleton and Croydon share Selwood Park: move the second home fixture to Sunday.
 for(const r of [...schedule])if(r.fixtures.some(f=>f.home==='C20')&&r.fixtures.some(f=>f.home==='C34')){const fixture=r.fixtures.find(f=>f.home==='C34');r.fixtures.splice(r.fixtures.indexOf(fixture),1);let next=schedule.find(x=>x.date===after(r.date,1));if(!next){next={date:after(r.date,1),fixtures:[]};schedule.push(next);}next.fixtures.push(fixture);}
 return schedule.sort((a,b)=>a.date.localeCompare(b.date));
}
export function initialiseDivisions(c,league){
 if(c.divisions){if(!validDivisions(c,league)||!validPlayoffs(c,league))throw Error('Invalid division membership or playoffs');return false;}
 c.divisions=Object.fromEntries(league.clubs.filter(x=>domesticClub(x.id)).map(x=>[x.id,startingDivision(x.id)]));c.playoffs={};c.divisionHistory=[];
 if(!c.schedule?.length){c.schedule=makeSchedule(c,league,Number(c.seasonStart.slice(0,4)));return false;}
 // Upgrade a saved top-flight career without touching dates, scores or active matches.
 const existing=c.schedule;for(const r of existing)for(const f of r.fixtures)if(!f.friendly){f.competition='premier';f.kind='league';}
 const extra=makeSchedule(c,league,Number(c.seasonStart.slice(0,4)));
 const dates=new Map(existing.map(r=>[r.date,r]));
 for(const r of extra){const fixtures=r.fixtures.filter(f=>f.competition!=='premier');if(!fixtures.length)continue;if(!dates.has(r.date))dates.set(r.date,{date:r.date,fixtures:[]});dates.get(r.date).fixtures.push(...fixtures);}
 c.schedule=[...dates.values()].sort((a,b)=>a.date.localeCompare(b.date));return true;
}
export function validDivisions(c,league){return c.divisions&&Object.keys(c.divisions).length===league.clubs.filter(x=>domesticClub(x.id)).length&&DIVISIONS.every(d=>league.clubs.filter(x=>c.divisions[x.id]===d.id).length===d.size)&&league.clubs.filter(x=>domesticClub(x.id)).every(x=>DIVISIONS.some(d=>d.id===c.divisions[x.id]));}
export function divisionTable(c,league,id=divisionOf(c),name=x=>c.names?.[x]||league.clubs.find(t=>t.id===x)?.name||x){
 const rows=Object.fromEntries(divisionClubs(c,league,id).map(x=>[x.id,{id:x.id,P:0,W:0,D:0,L:0,GF:0,GA:0,Pts:0}]));
 for(const r of c.schedule)for(const f of r.fixtures){if(f.friendly||f.kind==='playoff'||f.competition!==id||f.homeGoals===null||f.awayGoals===null)continue;const h=rows[f.home],a=rows[f.away];if(!h||!a)continue;h.P++;a.P++;h.GF+=f.homeGoals;h.GA+=f.awayGoals;a.GF+=f.awayGoals;a.GA+=f.homeGoals;if(f.homeGoals>f.awayGoals){h.W++;a.L++;h.Pts+=3}else if(f.homeGoals<f.awayGoals){a.W++;h.L++;a.Pts+=3}else{h.D++;a.D++;h.Pts++;a.Pts++;}}
 // Football League used goals scored before goal difference during this era.
 return Object.values(rows).sort((a,b)=>b.Pts-a.Pts||(id==='premier'?(b.GF-b.GA)-(a.GF-a.GA)||b.GF-a.GF:b.GF-a.GF||(b.GF-b.GA)-(a.GF-a.GA))||name(a.id).localeCompare(name(b.id))||a.id.localeCompare(b.id));
}
export const regularComplete=(c,id)=>c.schedule.some(r=>r.fixtures.some(f=>f.competition===id&&f.kind==='league'))&&c.schedule.every(r=>r.fixtures.filter(f=>f.competition===id&&f.kind==='league').every(f=>f.homeGoals!==null));
const addRound=(c,date,fixtures)=>fixtures.map(f=>insertCupFixture(c,f,date)).sort().at(-1);
const playoffFixture=(id,home,away,tie,leg,neutral=false)=>({home,away,competition:id,kind:'playoff',tie,leg,neutral,kickoff:'15:00',homeGoals:null,awayGoals:null});
export function resolvePlayoff(c,f,score,random=Math.random){
 if(f.kind!=='playoff'||f.homeGoals===null||f.winner)return;
 let h=f.homeGoals,a=f.awayGoals,awayH=0,awayA=0;
 if(f.leg===1)return;
 if(f.leg===2){const first=c.schedule.flatMap(r=>r.fixtures).find(x=>x.competition===f.competition&&x.tie===f.tie&&x.leg===1);if(!first||first.homeGoals===null)return;h+=first.awayGoals;a+=first.homeGoals;awayH=first.awayGoals;awayA=f.awayGoals;}
 if(h===a){const [eh,ea]=score(f.home,f.away);f.extraTime={home:Math.min(2,Math.floor(eh/2)),away:Math.min(2,Math.floor(ea/2))};f.homeGoals+=f.extraTime.home;f.awayGoals+=f.extraTime.away;h+=f.extraTime.home;a+=f.extraTime.away;if(f.leg===2)awayA+=f.extraTime.away;}
 if(h!==a)f.winner=h>a?f.home:f.away;
 else if(f.leg===2&&Number((c.seasonStart||'1998').slice(0,4))<1999&&awayH!==awayA){f.winner=awayH>awayA?f.home:f.away;f.decision='away goals';}
 else{const homeWins=random()<.5;f.penalties={home:homeWins?5:4,away:homeWins?4:5};f.winner=homeWins?f.home:f.away;f.decision='penalties';}
 f.decision??=f.extraTime?'extra time':f.leg===3?'full time':'aggregate';
}
export function progressPlayoffs(c,league,name=x=>x){
 c.playoffs??={};
 for(const id of ['first','second']){
  if(!regularComplete(c,id))continue;
  let p=c.playoffs[id];
  if(!p){const t=divisionTable(c,league,id,name),last=c.schedule.filter(r=>r.fixtures.some(f=>f.competition===id&&f.kind==='league')).at(-1).date;const first=after([last,c.date].sort().at(-1),7);p=c.playoffs[id]={automatic:t.slice(0,2).map(x=>x.id),entrants:t.slice(2,6).map(x=>x.id),stage:'semi-finals'};
   const pairs=[[p.entrants[0],p.entrants[3]],[p.entrants[1],p.entrants[2]]];const firstEnd=addRound(c,first,pairs.map(([high,low],i)=>playoffFixture(id,low,high,'semi-'+i,1)));addRound(c,after(firstEnd,4),pairs.map(([high,low],i)=>playoffFixture(id,high,low,'semi-'+i,2)));
   c.news.push({date:c.date,kind:'playoffs',important:p.entrants.includes(c.clubId),text:`${divisionInfo(id).name} playoffs: ${p.entrants.map(name).join(', ')}. Two-legged semi-finals, then a neutral final.`,action:'table'});
  }
  const fs=c.schedule.flatMap(r=>r.fixtures).filter(f=>f.kind==='playoff'&&f.competition===id);
  const semis=fs.filter(f=>f.leg===2);
  if(p.stage==='semi-finals'&&semis.length===2&&semis.every(f=>f.winner)){const last=c.schedule.filter(r=>r.fixtures.some(f=>semis.includes(f))).at(-1).date;addRound(c,after(last,7),[playoffFixture(id,semis[0].winner,semis[1].winner,'final',3,true)]);p.stage='final';}
  const final=fs.find(f=>f.leg===3);if(final?.winner&&p.stage!=='complete'){p.winner=final.winner;p.stage='complete';c.news.push({date:c.date,kind:'promotion',important:true,text:`${name(p.winner)} win the ${divisionInfo(id).name} playoff and promotion.`,action:'table'});}
 }
}
export function seasonReady(c){return c.leagueCup?.status!=='active'&&c.faCup?.status!=='active'&&c.championsLeague?.status!=='active'&&c.uefaCup?.status!=='active'&&c.schedule.every(r=>r.fixtures.every(f=>f.homeGoals!==null))&&['first','second'].every(id=>c.playoffs?.[id]?.stage==='complete');}
export function rolloverDivisions(c,league,name=x=>x){
 if(!seasonReady(c))throw Error('Finish all leagues and playoffs first');
 const before={...c.divisions},tables=Object.fromEntries(DIVISIONS.map(d=>[d.id,divisionTable(c,league,d.id,name)]));
 const relegated={premier:tables.premier.slice(-3).map(x=>x.id),first:tables.first.slice(-3).map(x=>x.id)};
 const promoted=Object.fromEntries(['first','second'].map(id=>[id,[...c.playoffs[id].automatic,c.playoffs[id].winner]]));
 for(const id of relegated.premier)c.divisions[id]='first';for(const id of relegated.first)c.divisions[id]='second';for(const id of promoted.first)c.divisions[id]='premier';for(const id of promoted.second)c.divisions[id]='first';
 if(!validDivisions(c,league))throw Error('Division movement failed');
 c.divisionHistory??=[];c.divisionHistory.push({season:c.season,membership:before,tables,promoted,relegated,playoffs:structuredClone(c.playoffs)});
 const old=before[c.clubId],next=c.divisions[c.clubId];c.news.push({date:c.date,kind:'promotion',important:true,text:old===next?`Your club remain in the ${divisionInfo(next).name}.`:`Your club ${DIVISIONS.findIndex(d=>d.id===next)<DIVISIONS.findIndex(d=>d.id===old)?'are promoted':'are relegated'} to the ${divisionInfo(next).name}.`,action:'table'});c.playoffs={};return {promoted,relegated};
}
export function tableZone(id,index){return id!=='premier'&&index<2?'promotion':id!=='premier'&&index<6?'playoff':id!=='second'&&index>=divisionInfo(id).size-3?'relegation':'';}
export const seasonPrize=(id,rank)=>id==='premier'?250000+(21-rank)*75000:id==='first'?100000+(25-rank)*20000:50000+(25-rank)*10000;

export function validPlayoffs(c,league){if(c.playoffs===undefined)return true;if(!c.playoffs||typeof c.playoffs!=='object'||Array.isArray(c.playoffs)||Object.keys(c.playoffs).some(k=>!['first','second'].includes(k)))return false;return Object.entries(c.playoffs).every(([id,p])=>p&&['semi-finals','final','complete'].includes(p.stage)&&Array.isArray(p.automatic)&&p.automatic.length===2&&Array.isArray(p.entrants)&&p.entrants.length===4&&new Set([...p.automatic,...p.entrants]).size===6&&[...p.automatic,...p.entrants].every(x=>league.clubs.some(c=>c.id===x)&&divisionOf(c,x)===id)&&(p.winner===undefined||p.entrants.includes(p.winner))&&(p.stage!=='complete'||p.entrants.includes(p.winner)));}
