import {divisionOf,divisionTable,domesticClub} from './divisions.js?v=1.93.0';
import {scottishClub} from './scottish-world.js?v=1.89.0';
import {changeManager,dismissPlayerManager,managerFor} from './managers.js?v=1.193.0';

export function reviewEmployment(c,league,report){
 const state=c.employment;
 if(!state?.enabled||state.dismissal||!report||state.reviewed===report.id)return null;
 state.reviewed=report.id;
 const manager=managerFor(c,c.clubId);
 const severe=manager?.jobRecord.played>=8&&report.confidence<30;
 if(!severe){
  delete state.warning;
  return null;
 }
 if(!state.warning||manager.jobRecord.played<state.warning.played+3){
  state.warning??={date:c.date,played:manager.jobRecord.played,target:report.target};
  return 'warning';
 }
 const managerId=dismissPlayerManager(c,league);
 if(!managerId)return null;
 state.dismissal={date:c.date,clubId:c.clubId,managerId,position:report.position,target:report.target,
  confidence:report.confidence,balance:report.balance,read:false};
 delete state.warning;
 updateManagerMarket(c,league);
 return 'dismissed';
}

const tier={premier:0,first:1,second:2,'scot-premier':0,'scot-first':1};

const marketDay=(date,days)=>new Date(Date.parse(date)+days*86400000).toISOString().slice(0,10);

function eligibleClubs(c,league){
 const former=c.employment.dismissal.clubId,formerTier=tier[divisionOf(c,former)];
 const visited=new Set(c.employment.spells?.map(spell=>spell.clubId));
 visited.add(former);
 const tables=new Map();
 const listings=[];
 for(const club of league.clubs){
  if(!domesticClub(club.id)||scottishClub(club.id)!==scottishClub(former)||visited.has(club.id))continue;
  const division=divisionOf(c,club.id),manager=managerFor(c,club.id);
  if(tier[division]<formerTier||!manager?.fictional)continue;
  if(!tables.has(division))tables.set(division,divisionTable(c,league,division));
  const table=tables.get(division),position=table.findIndex(row=>row.id===club.id)+1;
  listings.push({clubId:club.id,division,position,size:table.length,pressure:manager.confidence,caretakerId:manager.id});
 }
 return listings.sort((a,b)=>(a.pressure-b.pressure)||(b.position/b.size-a.position/a.size)
   ||a.clubId.localeCompare(b.clubId));
}

export function availableManagerJobs(c,league){
 const state=c.employment;
 if(!state?.dismissal)return [];
 const vacancies=c.managerWorld.events.filter(event=>event.caretaker&&event.date>=marketDay(c.date,-21));
 const applications=state.applications||[];
 return eligibleClubs(c,league).flatMap(job=>{
  const opening=vacancies.findLast(event=>event.clubId===job.clubId&&event.in===job.caretakerId);
  const application=applications.find(item=>item.clubId===job.clubId);
  return !application&&opening?[{...job,opened:opening.date}]:[];
 }).slice(0,4);
}

export function updateManagerMarket(c,league){
 const state=c.employment;
 if(!state?.dismissal)return false;
 const applications=state.applications??=[];
 let reply=false;
 for(const item of applications){
  if(item.status==='declined')continue;
  const manager=managerFor(c,item.clubId);
  if(item.status==='offered'){
   if(manager?.id!==item.caretakerId){item.status='declined';reply=true;}
   continue;
  }
  if(item.replyOn>c.date)continue;
  // When a board is interviewing several managers, a strong peer club can pass.
  // A club actively seeking a replacement after an empty list will make an offer.
  item.status=manager?.id===item.caretakerId&&item.suitable?'offered':'declined';
  reply=true;
 }
 if(applications.some(item=>item.status!=='declined')||availableManagerJobs(c,league).length)return reply;
 const eligible=eligibleClubs(c,league);
 const opening=eligible.find(job=>!applications.some(item=>item.clubId===job.clubId))||eligible[0];
 if(opening&&changeManager(c,league,opening.clubId,opening.pressure<45?'dismissed':'resigned',{caretaker:true})){
  state.applications=applications.filter(item=>item.clubId!==opening.clubId);
  state.recruitingClub=opening.clubId;
 }
 return reply;
}

export function applyForManagerJob(c,league,clubId){
 if(!c.employment?.dismissal?.read)return false;
 const state=c.employment,applications=state.applications??=[];
 if(applications.filter(item=>item.status!=='declined').length>=2)return false;
 const job=availableManagerJobs(c,league).find(job=>job.clubId===clubId);
 if(!job)return false;
 const formerTier=tier[divisionOf(c,state.dismissal.clubId)],record=c.managerWorld.people[state.dismissal.managerId].record;
 const pointsPerGame=(3*record.won+record.drawn)/Math.max(1,record.played);
 const suitable=clubId===state.recruitingClub||tier[job.division]>formerTier||job.position>job.size/2||pointsPerGame>=1.35;
 applications.push({clubId,caretakerId:job.caretakerId,replyOn:marketDay(c.date,3),status:'pending',suitable});
 return true;
}

export function managerJobOffer(c,clubId){
 const offer=c.employment?.applications?.find(item=>item.clubId===clubId&&item.status==='offered');
 return !!offer&&managerFor(c,clubId)?.id===offer.caretakerId;
}

export function validEmployment(c,league){
 const state=c.employment;
 if(state===undefined)return true;
 if(!state||typeof state!=='object'||Array.isArray(state)||typeof state.enabled!=='boolean')return false;
 const date=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value));
 if(state.reviewed!==undefined&&typeof state.reviewed!=='string')return false;
 const warning=state.warning,dismissal=state.dismissal;
 if(warning&&(!date(warning.date)||!Number.isInteger(warning.played)||warning.played<8||!Number.isInteger(warning.target)))return false;
 if(dismissal&&(!date(dismissal.date)||dismissal.clubId!==c.clubId||!state.enabled||
  typeof dismissal.read!=='boolean'||!Number.isFinite(dismissal.balance)||
  !['position','target','confidence'].every(key=>Number.isInteger(dismissal[key]))||
  c.managerWorld?.people?.[dismissal.managerId]?.clubId!==null||
  c.managerWorld?.people?.[dismissal.managerId]?.fictional!==false))return false;
 const isClub=id=>league.clubs.some(club=>club.id===id);
 if(state.recruitingClub!==undefined&&(!dismissal||!isClub(state.recruitingClub)))return false;
 if(state.applications!==undefined){
  const items=state.applications;
  if(!dismissal||!Array.isArray(items)||items.length>league.clubs.length)return false;
  if(!items.every(item=>item&&isClub(item.clubId)&&typeof item.caretakerId==='string'&&
   date(item.replyOn)&&typeof item.suitable==='boolean'&&['pending','declined','offered'].includes(item.status)))return false;
  if(new Set(items.map(item=>item.clubId)).size!==items.length||items.filter(item=>item.status!=='declined').length>2)return false;
 }
 return state.spells===undefined||Array.isArray(state.spells)&&state.spells.length<=68&&state.spells.every(spell=>
  spell&&league.clubs.some(club=>club.id===spell.clubId)&&date(spell.to)&&Number.isFinite(spell.balance));
}
