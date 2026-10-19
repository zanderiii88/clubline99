import {youthReadiness} from './world-development.js?v=1.89.0';
import {suitsRole} from './recruitment.js?v=1.90.0';
const owner=(c,p)=>c.owners?.[p.id]||p.clubId;
const owned=(c,p)=>owner(c,p)===c.clubId||c.loans?.[p.id]?.parent===c.clubId;
const seasonLabel=start=>`${start.slice(0,4)}–${String(Number(start.slice(0,4))+1).slice(-2)}`;
const thresholds={appearances:[1,50,100,200,300,500],goals:[1,25,50,100,200]};
export function trackPlayer(c,p,origin){
 const state=c.playerProgress,old=state.players[p.id];
 if(!old||old.clubId!==c.clubId||origin==='joined')state.players[p.id]={clubId:c.clubId,since:c.date,baseline:p.overall,origin:origin||((c.season===1&&c.date===c.seasonStart&&!c.reports.length)?'start':'tracking'),season:c.season,seasonSince:c.date,seasonBaseline:p.overall};
 const row=state.players[p.id];if(row.season!==c.season){row.season=c.season;row.seasonSince=c.date;row.seasonBaseline=p.overall;}
 return row;
}
export function initialisePlayerProgress(c,league){
 const fresh=!c.playerProgress;c.playerProgress??={version:1,players:{},records:[],processed:[],milestones:[]};
 const validIds=new Set([...league.players,...(c.prospects||[])].map(p=>p.id));for(const id of Object.keys(c.playerProgress.players))if(!validIds.has(id))delete c.playerProgress.players[id];
 const tracked=new Map(league.players.filter(p=>owned(c,p)&&!c.players?.[p.id]?.retired).map(p=>[p.id,p]));
 for(const p of c.prospects||[])if(!p.promoted&&!p.calledUp)tracked.set(p.id,p);
 for(const p of tracked.values())trackPlayer(c,p);
 if(fresh){const archives=[...(c.archives||[]).map(a=>({season:a.season,start:`${Number(c.seasonStart.slice(0,4))-(c.season-a.season)}-08-03`,reports:a.reports||[]})),{season:c.season,start:c.seasonStart,reports:c.reports||[]}];for(const a of archives.sort((a,b)=>a.season-b.season))for(const r of [...a.reports].sort((a,b)=>a.date.localeCompare(b.date)))recordPlayerProgress(c,league,r,{season:a.season,start:a.start,announce:false});}
 return c.playerProgress;
}
export function recordPlayerProgress(c,league,report,{season=c.season,start=c.seasonStart,announce=true}={}){
 if(report.friendly)return [];const state=c.playerProgress||initialisePlayerProgress(c,league),key=[season,report.date,report.homeId||c.clubId,report.awayId||report.opponent,report.competition||'league'].join(':');
 if(state.processed.includes(key))return [];state.processed.push(key);state.processed=state.processed.slice(-600);const events=[];
 const known=new Map(league.players.map(p=>[p.id,p]));
 for(const perf of report.performances||[]){if(!known.has(perf.id)||!Number.isFinite(perf.minutes)||perf.minutes<=0)continue;
  let row=state.records.find(r=>r.id===perf.id&&r.season===season&&r.clubId===c.clubId);if(!row){row={id:perf.id,clubId:c.clubId,season,start,apps:0,goals:0,assists:0,minutes:0,ratingTotal:0,ratedMinutes:0};state.records.push(row);}
  const prior=playerTotals(c,perf.id);row.apps++;row.goals+=perf.goals||0;row.assists+=perf.assists||0;row.minutes+=perf.minutes;if(Number.isFinite(perf.rating)){row.ratingTotal+=perf.rating*perf.minutes;row.ratedMinutes+=perf.minutes;}
  const after=playerTotals(c,perf.id);
  for(const [field,values]of Object.entries(thresholds))for(const value of values){if(prior[field]>=value||after[field]<value)continue;const milestoneKey=`${c.clubId}:${perf.id}:${field}:${value}`;if(state.milestones.some(m=>m.key===milestoneKey))continue;const title=field==='appearances'?(value===1?'Competitive club debut':`${value} competitive club appearances`):(value===1?'First competitive club goal':`${value} competitive club goals`),event={key:milestoneKey,id:perf.id,clubId:c.clubId,type:field,value,date:report.date,season,title};state.milestones.push(event);events.push(event);if(announce)c.news.push({date:report.date,kind:'milestone',clubId:c.clubId,playerId:perf.id,text:`${known.get(perf.id).name}: ${title.toLowerCase()}.`});}
 }
 return events;
}
export function playerTotals(c,id){return (c.playerProgress?.records||[]).filter(r=>r.id===id).reduce((a,r)=>({appearances:a.appearances+r.apps,goals:a.goals+r.goals,assists:a.assists+r.assists,minutes:a.minutes+r.minutes}),{appearances:0,goals:0,assists:0,minutes:0});}
export function progressSummary(c,p){const r=c.playerProgress?.players[p.id];return r?{...r,sinceChange:p.overall-r.baseline,seasonChange:p.overall-r.seasonBaseline,seasonLabel:seasonLabel(c.seasonStart),records:(c.playerProgress.records||[]).filter(r=>r.id===p.id).sort((a,b)=>b.season-a.season),milestones:(c.playerProgress.milestones||[]).filter(m=>m.id===p.id).slice(-5).reverse()}:null;}
export function youthAdvice(c,league,p){
 const estimate=youthReadiness(c,league,p),pool=league.players.filter(x=>x.id!==p.id&&owner(c,x)===c.clubId&&!c.players?.[x.id]?.retired&&!c.players?.[x.id]?.unregistered&&!c.players?.[x.id]?.academyOnly&&!c.players?.[x.id]?.injuryDays&&!c.players?.[x.id]?.suspensionMatches&&!c.loans?.[x.id]&&suitsRole(x,p.primary)),effective=x=>Math.round(x.overall*(x.primary===p.primary?1:(x.positions?.[p.primary]||0)/x.overall)),best=[...pool].sort((a,b)=>effective(b)-effective(a))[0],target=best?effective(best):null,space=league.players.filter(x=>owner(c,x)===c.clubId&&!c.players?.[x.id]?.retired&&!c.players?.[x.id]?.unregistered&&!c.players?.[x.id]?.academyOnly).length;
 let title='Keep developing in the academy',reason=`The coaches estimate ${estimate.low}–${estimate.high} current readiness. More youth football and coaching are advised.`,action='academy';
 if(c.players?.[p.id]?.injuryDays){title='Recover before making a move';reason='Wait until fit before assessing a call-up or arranging a loan.';action='recover';}
 else if(c.loans?.[p.id]){title='Review the current loan';reason='Use recent playing-time reports before considering recall.';action='loan-review';}
 else if(target===null||estimate.low>=target-5){title='Could compete for senior minutes';reason=best?`The readiness range overlaps ${best.name}, your strongest available ${p.primary} option (${target} effective ability). A first-team opportunity is worth considering.`:'No suitable senior option is currently available in this position. Consider a temporary call-up for cover.';action='call-up';}
 else if(estimate.high>=target-8){title='Consider a temporary first-team trial';reason=`The upper readiness estimate is close to ${best.name} (${target} effective ability), but regular selection is uncertain. A call-up lets you assess fit without permanent promotion.`;action='call-up';}
 else if(p.age>=18){title=p.promoted||!p.academy?'Consider a suitable loan':'Academy first; a loan is another option';reason=`Available senior cover is stronger in ${p.primary}. ${p.academy&&!p.promoted?'Permanent promotion is required before a loan; keep academy development as an alternative.':'Look for a club offering regular minutes, and review the wage contribution and recall clause.'}`;action='loan';}
 if(action==='call-up'&&space>=30&&!p.calledUp){title='Free a squad place before calling up';reason+=' All 30 active registration places are occupied.';action='blocked';}
 if(p.promoted&&action==='call-up'){title='Give this player a senior opportunity';reason=best?`Readiness overlaps your available cover in ${p.primary}. Consider minutes when condition and the match situation allow.`:'There is a gap in available cover for this position.';}
 return {title,reason,action,low:estimate.low,high:estimate.high,available:pool.length,best:best?.id,target,space};
}
export function validPlayerProgress(c,ids,clubs){
 const s=c.playerProgress;if(s===undefined)return true;const obj=x=>!!x&&typeof x==='object'&&!Array.isArray(x),date=x=>typeof x==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(x)&&Number.isFinite(Date.parse(x)),num=(x,max=1000000)=>Number.isFinite(x)&&x>=0&&x<=max,int=(x,max=1000000)=>Number.isInteger(x)&&num(x,max);
 if(!obj(s)||s.version!==1||!obj(s.players)||!Array.isArray(s.records)||!Array.isArray(s.processed)||!Array.isArray(s.milestones)||s.records.length>200000||s.processed.length>600||s.processed.some(x=>typeof x!=='string'||x.length>300)||new Set(s.processed).size!==s.processed.length)return false;
 for(const [id,r]of Object.entries(s.players))if(!ids.has(id)||!obj(r)||!clubs.has(r.clubId)||!date(r.since)||!date(r.seasonSince)||!num(r.baseline,100)||!num(r.seasonBaseline,100)||!int(r.season,10000)||r.season<1||r.season>c.season||!['start','joined','tracking'].includes(r.origin))return false;
 const keys=new Set();for(const r of s.records){if(!obj(r)||!ids.has(r.id)||!clubs.has(r.clubId)||!int(r.season,10000)||r.season<1||r.season>c.season||!date(r.start)||!['apps','goals','assists','minutes','ratedMinutes'].every(k=>int(r[k]))||!num(r.ratingTotal,10000000)||r.ratedMinutes>r.minutes)return false;const key=r.id+':'+r.clubId+':'+r.season;if(keys.has(key))return false;keys.add(key);}
 const seen=new Set();for(const m of s.milestones){if(!obj(m)||!ids.has(m.id)||!clubs.has(m.clubId)||!date(m.date)||!int(m.season,10000)||m.season<1||m.season>c.season||!thresholds[m.type]?.includes(m.value)||m.key!==`${m.clubId}:${m.id}:${m.type}:${m.value}`||seen.has(m.key)||typeof m.title!=='string'||m.title.length>100)return false;seen.add(m.key);}
 return true;
}
