import {validClubHistory} from './club-history.js?v=1.80.0';
import {validPlayerProgress} from './player-progress.js?v=1.90.0';
import {validNegotiations,SQUAD_ROLES} from './negotiations.js?v=1.90.0';
import {validLoanReport} from './loans.js?v=1.80.0';
import {validManagerState} from './managers.js?v=1.89.0';
import {COUNTRIES} from './nationalities.js?v=1.89.0';
import {validSeasonReviews} from './season-review.js?v=1.89.0';
import {validUC} from './uefa-cup.js?v=1.89.0';
import {validCL} from './champions-league.js?v=1.89.0';
import {validVenue} from './venues.js?v=1.89.0';
import {validFA} from './fa-cup.js?v=1.89.0';
import {validMatchdays} from './matchday.js?v=1.89.0';
import {validCup} from './league-cup.js?v=1.89.0';
import {validDivisions,validPlayoffs} from './divisions.js?v=1.89.0';
import {validClubLife} from './club-events.js?v=1.74.0';
// Portable career data only. Device audio/notification preferences are independent.
export function createBackup(save,appVersion){return {format:'clubline-career-backup',formatVersion:1,appVersion,exportedAt:new Date().toISOString(),save:structuredClone(save)}}
const object=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
export function parseBackup(text,league,formations,styles){
 const fail=()=>{throw Error('This is not a compatible Clubline career backup.')};
 if(typeof text!=='string'||text.length>32*1024*1024)fail();let data;try{data=JSON.parse(text)}catch{throw Error('Could not read the JSON backup.')}
 const walk=(x,depth=0)=>{if(depth>80)fail();if(x&&typeof x==='object')for(const [k,v]of Object.entries(x)){if(['__proto__','prototype','constructor'].includes(k))fail();walk(v,depth+1)}};walk(data);
 if(data?.format!=='clubline-career-backup'||data.formatVersion!==1||!object(data.save)||!object(data.save.career))fail();
 const save=structuredClone(data.save),c=save.career,clubs=new Set(league.clubs.map(c=>c.id));
 const calendarTypes=new Set(['loan-report','club-event','board-review','recruitment','investment','stadium-review','youth','sale','draw','club-proposal','draw:league-cup','draw:fa-cup','draw:champions-league','draw:uefa-cup']);
 if(c.ui?.calendarIgnoredPrompts!==undefined&&(!object(c.ui.calendarIgnoredPrompts)||Object.entries(c.ui.calendarIgnoredPrompts).some(([k,v])=>!calendarTypes.has(k)||typeof v!=='boolean')))fail();
 if(c.ui?.calendarSkippedStops!==undefined&&(!Array.isArray(c.ui.calendarSkippedStops)||c.ui.calendarSkippedStops.length>200||c.ui.calendarSkippedStops.some(k=>typeof k!=='string'||k.length>300)))fail();

 if(c.managerProfile!==undefined&&(!object(c.managerProfile)||['firstName','surname'].some(k=>typeof c.managerProfile[k]!=='string'||c.managerProfile[k].length>30)||typeof c.managerProfile.nationality!=='string'||c.managerProfile.nationality&&!COUNTRIES[c.managerProfile.nationality]))fail();
 if(c.clubInvestment!==undefined){const x=c.clubInvestment,p=x?.pending,validDate=d=>typeof d==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(d)&&Number.isFinite(Date.parse(d));if(!object(x)||!validDate(x.nextAvailable)||p!==null&&(!object(p)||!['training','youth'].includes(p.kind)||p.field!==(p.kind==='youth'?'youthFunding':'trainingFunding')||typeof p.title!=='string'||!Number.isFinite(p.target)||p.target<1||p.target>5||!validDate(p.completion)))fail();}
 if(!validManagerState(c,league))fail();
 if(c.playerIdentities!==undefined){if(!object(c.playerIdentities))fail();for(const x of Object.values(c.playerIdentities))if(!object(x)||typeof x.nationality!=='string'||x.nationality&&!COUNTRIES[x.nationality]||x.name!==undefined&&(typeof x.name!=='string'||x.name.length>100))fail();}
 if(c.managementMode!==undefined&&!['streamlined','in-depth'].includes(c.managementMode))fail();
 if(c.rosterEdition!==league.rosterEdition||c.version!==1||!clubs.has(c.clubId)||!Number.isFinite(c.balance)||!/^\d{4}-\d{2}-\d{2}$/.test(c.date)||!Number.isFinite(Date.parse(c.date))||!formations.includes(c.formation)||!styles.includes(c.style)||!object(c.players)||!object(c.stadium)||!Array.isArray(c.reports)||!Array.isArray(c.news)||!Array.isArray(c.schedule)||!c.schedule.length)fail();
 if(c.schedule.some(r=>r.fixtures.some(f=>!validVenue(f,league)))||save.match&&!validVenue(save.match,league))fail();
 for(const field of ['youthFunding','trainingFunding'])if(c[field]!==undefined&&(!Number.isInteger(c[field])||c[field]<0||c[field]>8))fail();
 const ids=new Set(league.players.map(p=>p.id));
 if(c.generatedPlayers!==undefined&&!Array.isArray(c.generatedPlayers))fail();for(const p of c.generatedPlayers||[]){if(!object(p)||typeof p.id!=='string'||ids.has(p.id)||typeof p.name!=='string'||!clubs.has(p.clubId)||!Number.isFinite(p.overall)||!Number.isFinite(p.wage)||!object(p.positions))fail();ids.add(p.id)}
 if(!validClubHistory(c,ids,clubs)||!validNegotiations(c,ids)||!validPlayerProgress(c,new Set([...ids,...(c.prospects||[]).map(p=>p.id)]),clubs))fail();
 if(c.loans!==undefined){if(!object(c.loans))fail();for(const [id,l]of Object.entries(c.loans))if(!ids.has(id)||!object(l)||!clubs.has(l.parent)||!clubs.has(l.to)||l.parent===l.to||l.contribution!==undefined&&![25,50,75,100].includes(l.contribution)||l.end!==undefined&&!/^\d{4}-\d{2}-\d{2}$/.test(l.end)||l.currentReport!==undefined&&!validLoanReport(l.currentReport)||l.previousReport!==undefined&&l.previousReport!==null&&!validLoanReport(l.previousReport)||l.lastReportDate!==undefined&&(!/^\d{4}-\d{2}-\d{2}$/.test(l.lastReportDate)||!Number.isFinite(Date.parse(l.lastReportDate))))fail();}
 if(c.futureTransfers!==undefined&&(!Array.isArray(c.futureTransfers)||c.futureTransfers.some(t=>!object(t)||!ids.has(t.id)||!clubs.has(t.from)||!clubs.has(t.to)||!Number.isFinite(t.fee)||t.fee<0||!/^\d{4}-07-01$/.test(t.arrival)||!['agreed','completed','cancelled'].includes(t.status)||t.role!==undefined&&!SQUAD_ROLES[t.role]||t.years!==undefined&&(!Number.isInteger(t.years)||t.years<1||t.years>4)||t.wage!==undefined&&(!Number.isFinite(t.wage)||t.wage<0||t.wage>1000000))))fail();
 if(c.clubLife!==undefined&&!validClubLife(c.clubLife,ids))fail();
 if(c.contracts!==undefined){if(!object(c.contracts))fail();for(const [id,t]of Object.entries(c.contracts))if(!ids.has(id)||!object(t)||typeof t.end!=='string'||!/^\d{4}-06-30$/.test(t.end)||!Number.isFinite(Date.parse(t.end)))fail();}
 if(c.training!==undefined){const t=c.training,pos=['LB','CB','RB','DM','CM','AM','LW','RW','ST'];if(!object(t)||!['Balanced','Fitness','Development'].includes(t.mode)||typeof t.assistant!=='boolean'||!object(t.assignments)||!Array.isArray(t.reports)||!object(t.focusDays)||!Array.isArray(t.recentDays)||t.recentDays.some(d=>!object(d)||typeof d.date!=='string'||!['Balanced','Fitness','Development'].includes(d.mode)))fail();if(!['lastDay','lastReportDate'].every(k=>typeof t[k]==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(t[k])&&Number.isFinite(Date.parse(t[k]))))fail();for(const n of Object.values(t.focusDays))if(!Number.isInteger(n)||n<0)fail();for(const [id,a]of Object.entries(t.assignments))if(!ids.has(id)||!object(a)||!pos.includes(a.position)||!Number.isFinite(a.progress)||a.progress<0||a.progress>=1)fail();for(const r of t.reports){if(!object(r)||typeof r.date!=='string'||!object(r.focusDays)||!Array.isArray(r.rows))fail();for(const row of r.rows)if(!object(row)||!ids.has(row.id)||typeof row.name!=='string'||!Number.isFinite(row.overall)||!Number.isFinite(row.delta)||!Number.isFinite(row.condition)||!Number.isFinite(row.conditionChange)||!Array.isArray(row.positionChanges)||row.positionChanges.some(x=>!object(x)||typeof x.position!=='string'||!Number.isFinite(x.delta)))fail();}if(!object(t.baseline))fail();for(const [id,b]of Object.entries(t.baseline))if(!ids.has(id)||!object(b)||!Number.isFinite(b.overall)||!Number.isFinite(b.fitness)||!object(b.positions))fail();}
 const selection=(x,length)=>{if(!Array.isArray(x)||length!==undefined&&x.length!==length||x.some(id=>id!==null&&!ids.has(id)))fail()};selection(c.lineup,11);selection(c.bench,7);if(new Set([...c.lineup,...c.bench].filter(Boolean)).size!==[...c.lineup,...c.bench].filter(Boolean).length)fail();
 if(!validSeasonReviews(c,league)||!validCL(c,league)||!validUC(c,league)||!validCup(c,league)||!validFA(c,league)||!validMatchdays(c))fail();if(c.faPlayedFor!==undefined&&(!object(c.faPlayedFor)||Object.entries(c.faPlayedFor).some(([id,team])=>!ids.has(id)||!clubs.has(team))))fail();if(c.cupPlayedFor!==undefined&&(!object(c.cupPlayedFor)||Object.entries(c.cupPlayedFor).some(([id,team])=>!ids.has(id)||!clubs.has(team))))fail();
 if(c.divisions!==undefined&&(!validDivisions(c,league)||!validPlayoffs(c,league)))fail();
 if(c.ucPlayedFor!==undefined&&(!object(c.ucPlayedFor)||Object.entries(c.ucPlayedFor).some(([id,team])=>!ids.has(id)||!clubs.has(team))))fail();
 if(c.clPlayedFor!==undefined&&(!object(c.clPlayedFor)||Object.entries(c.clPlayedFor).some(([id,team])=>!ids.has(id)||!clubs.has(team))))fail();
 for(const id of ids){if(!c.players[id]&&league.players.find(p=>p.id===id)?.clubId.startsWith('EU')&&(!c.championsLeague||!c.uefaCup&&!league.clubs.find(x=>x.id===league.players.find(p=>p.id===id)?.clubId)?.clEligible))continue;if(!c.divisions&&!c.players[id]&&Number(league.players.find(p=>p.id===id)?.clubId?.slice(1))>20)continue;const p=c.players[id];if(!object(p)||!Number.isFinite(p.fitness)||!Array.isArray(p.form)||p.form.some(n=>!Number.isFinite(n)))fail()}
 for(const r of c.schedule){if(!object(r)||typeof r.date!=='string'||!Array.isArray(r.fixtures)||r.fixtures.some(f=>!object(f)||!clubs.has(f.home)||!clubs.has(f.away)||f.home===f.away||![f.homeGoals,f.awayGoals].every(g=>g===null||Number.isInteger(g)&&g>=0)))fail()}
 for(const team of Object.values(c.owners||{}))if(team!=='FREE'&&!clubs.has(team))fail();for(const o of c.offers||[])if(!object(o)||!ids.has(o.id)||!clubs.has(o.clubId)||!Number.isFinite(o.fee)||o.fee<0)fail();
 if(save.match){const m=save.match;if(!object(m)||!['choice','confirm','live','report'].includes(m.phase)||!clubs.has(m.home)||!clubs.has(m.away)||m.home===m.away)fail();if(m.lineup)selection(m.lineup,11);if(m.bench)selection(m.bench);if(m.oppLineup)selection(m.oppLineup,11);if(m.phase==='live'&&(!Number.isFinite(m.minute)||!Array.isArray(m.events)||!m.lineup||!m.bench))fail()}
 return save;
}
