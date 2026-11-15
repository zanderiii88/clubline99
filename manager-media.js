import {rivalryHistory,rivalryQuestion} from './rivalry-history.js?v=1.106.0';
import {managerFor} from './managers.js?v=1.96.0';
import {hash} from './player-attributes.js?v=1.74.0';

// Existing transfer-rivalry pairings, shared by recruitment and media.
export const RIVALRIES=[['C01','C18'],['C11','C08'],['C12','C47'],['C14','C21'],['C16','C28'],['C24','C02'],['C15','C07'],['C32','C27'],['C17','C39'],['EU002','EU004'],['EU007','EU009'],['EU001','SC01'],['SC02','SC03'],['SC05','SC11'],['EU051','SC01']];
export const clubRivals=(a,b)=>a!==b&&RIVALRIES.some(pair=>pair.includes(a)&&pair.includes(b));
export const mediaFixtureKey=(season,date,f)=>[season,date,f.home,f.away,f.competition||'league',f.tie||'',f.leg||0].join(':');
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const days=(a,b)=>Math.round((Date.parse(b)-Date.parse(a))/86400000);
const after=(date,n)=>new Date(Date.parse(date+'T12:00:00Z')+n*86400000).toISOString().slice(0,10);
export const PERSONALITIES=['measured','fiery','tactical','gracious'];
export const managerPersonality=id=>PERSONALITIES[hash(id+':press-personality')%PERSONALITIES.length];
export function initialiseMedia(c){const s=c.managerMedia??={version:1,enabled:true,events:[],relationships:{},totals:{morale:0,supporters:0},lastCreated:''};s.lastPostCreated??='';return s;}
export const pendingMedia=c=>(c.managerMedia?.events||[]).find(e=>e.status==='pending');
export const relationshipLabel=n=>n>=4?'Respectful':n<=-4?'Strained':n<0?'Wary':n>0?'Cordial':'Neutral';
const fixtureFor=(c,e)=>c.schedule?.flatMap(r=>r.fixtures.map(f=>({date:r.date,...f}))).find(f=>mediaFixtureKey(e.season,f.date,f)===(e.phase==='post'?e.key.slice(0,-5):e.key));

function preQuote(personality,derby,key){
 const quotes={measured:['There is quality on both sides. Preparation and concentration will decide it.','We know what they can do. Our job is to make them work for every chance.'],fiery:['We will not be taking a backward step. They will know they have been in a game.','We are ready for the contest. I expect our players to make that clear.'],tactical:['The spaces between their lines will matter. We have worked on how to use them.','Their shape presents a few questions. We believe we have prepared the answers.'],gracious:['Their manager has done good work. We look forward to testing ourselves against them.','There is plenty to admire about their side. We will need to be at our best.']};
 return (derby?'The supporters know what this fixture means. ':'')+quotes[personality][hash(key+':quote')%2];
}
function postQuote(personality,result){
 const won=result.outcome==='loss',lost=result.outcome==='win';
 const lines={measured:won?'We took our chances. It was a disciplined performance.':lost?'We have things to improve. The result gives us plenty to work on.':'There were good spells for both teams. Neither found the decisive edge.',fiery:won?'Our players stood up when it mattered. They deserve the credit.':lost?'That hurts. We will demand a stronger response next time.':'We wanted the win, but nobody can question our commitment.',tactical:won?'We found the spaces we planned to attack and used them well.':lost?'We did not control the key areas well enough. We need to review that.':'The teams largely cancelled each other out. Clear openings were scarce.',gracious:won?'I am delighted for our players. Credit to the opposition for a hard contest.':lost?'They earned the result. We will learn from it and move forward.':'Both teams contributed to a competitive match. A draw is a fair reflection.'};
 return lines[personality];
}
function managerReply(e,choiceId){
 if(!e.personality)return choiceId==='provoke'?'We will let the football do the talking.':choiceId==='respect'?'The respect is mutual. It should be a good contest.':null;
 if(choiceId==='respect')return e.personality==='gracious'?'That is appreciated. There is mutual respect between the two benches.':e.phase==='post'?'I appreciate that. We can assess the football without making it personal.':'The respect is mutual. It should be a good contest.';
 if(choiceId!=='provoke')return null;
 return {measured:'I would rather discuss the football than trade personal remarks.',fiery:'They can say what they like. We will stand up for our team.',tactical:'There is more to discuss in the match than the comments from the other bench.',gracious:'I disagree with that assessment, but I wish them well.'}[e.personality];
}

export function mediaChoices(e){if(e.phase==='post'){const result=e.result.outcome;return [
 {id:'respect',label:'Credit the opposition',text:result==='loss'?'They earned that result. Credit to their players and manager.':result==='win'?'They made us work for it. We respect the contest they gave us.':'Both sides worked hard. There was quality in the opposition as well.',morale:0,supporters:0,relationship:2,risk:false},
 {id:'neutral',label:'Keep perspective',text:'We will review the performance carefully and prepare for the next game.',morale:0,supporters:0,relationship:0,risk:false},
 {id:'confident',label:result==='win'?'Praise our players':result==='loss'?'Stand by our players':'Credit our effort',text:result==='win'?'The players deserve the praise. They delivered when it mattered.':result==='loss'?'I stand by this group. We will work together to put things right.':'The effort was there. We will build on the positives.',morale:1,supporters:0,relationship:0,risk:false},
 {id:'provoke',label:'Criticise the other manager',text:'I disagree with their assessment. They should concentrate on their own team.',morale:0,supporters:e.derby?1:0,relationship:-3,risk:false},
 {id:'none',label:'No comment',text:'I have nothing to add.',morale:0,supporters:0,relationship:0,risk:false}
 ];}return [
 {id:'respect',label:'Show respect',text:'They are a good side. We respect the work their manager is doing.',morale:0,supporters:0,relationship:2,risk:false},
 {id:'neutral',label:'Focus on our team',text:'Our preparation is what matters. We will concentrate on our own performance.',morale:0,supporters:0,relationship:0,risk:false},
 {id:'confident',label:'Back our players',text:'I trust this group. We are going there to win.',morale:1,supporters:e.derby?1:0,relationship:0,risk:true},
 {id:'provoke',label:'Challenge the other manager',text:'They have plenty to say. Let us see whether their team can back it up.',morale:1,supporters:1,relationship:-3,risk:true},
 {id:'none',label:'No comment',text:'I have nothing to add.',morale:0,supporters:0,relationship:0,risk:false}
 ];}
function applyReaction(c,morale,supporters){
 const s=initialiseMedia(c),out={morale:0,supporters:0};
 // Cumulative media contribution stays within ±3, independent of other stories.
 if(!c.clubLife)return out;
 for(const [key,field,wanted] of [['morale','morale',morale],['supporters','supporters',supporters]]){
  const allowed=clamp(s.totals[key]+wanted,-3,3)-s.totals[key],before=c.clubLife[field];
  c.clubLife[field]=clamp(before+allowed,0,100);out[key]=c.clubLife[field]-before;s.totals[key]+=out[key];
 }
 return out;
}
export function settleMediaResults(c){
 const s=c.managerMedia;if(!s)return;
 for(const e of s.events){
  if(e.phase==='post')continue;
  if(e.status==='pending'){const f=fixtureFor(c,e);if(f&&f.homeGoals!==null){e.status='expired';e.expiryReason='The match has been played.';}continue;}
  if(e.status!=='responded'||e.settled)continue;
  const f=fixtureFor(c,e);if(!f||f.homeGoals===null||f.awayGoals===null)continue;
  e.settled=true;const us=f.home===e.clubId?f.homeGoals:f.awayGoals,them=f.home===e.clubId?f.awayGoals:f.homeGoals;
  const risk=mediaChoices(e).find(x=>x.id===e.choice)?.risk;
  const lost=us<them||us===them&&f.penalties&&f.winner&&f.winner!==e.clubId;
  const changes=risk&&lost?applyReaction(c,e.choice==='provoke'?-2:-1,e.derby||e.choice==='provoke'?-1:0):{morale:0,supporters:0};
  e.followUp={date:c.date,...changes,text:risk&&lost?'The defeat puts your pre-match confidence under scrutiny.':'The result brings no further direct media effect.'};
  if(risk)c.news.push({date:c.date,kind:'manager-media',mediaKey:e.key,clubId:c.clubId,text:`Press follow-up: ${e.followUp.text} Club morale ${changes.morale>=0?'+':''}${changes.morale}; community goodwill ${changes.supporters>=0?'+':''}${changes.supporters}.`});
 }
}
export function refreshMedia(c,league){
 const s=initialiseMedia(c);settleMediaResults(c);
 for(const e of s.events.filter(e=>e.status==='pending')){
  const f=fixtureFor(c,e),m=managerFor(c,e.opponentId);
  const closed=e.phase==='post'?c.date>e.deadline:!f||f.homeGoals!==null||e.matchDate<c.date||m?.id!==e.managerId;
  if(!s.enabled||e.season!==c.season||closed){e.status='expired';e.expiryReason=!s.enabled?'Press questions disabled.':e.phase!=='post'&&m?.id!==e.managerId?'The opposing manager has changed.':'The response window has closed.';}
 }
 return s;
}
export function mediaDay(c,league){
 const s=refreshMedia(c,league);
 if(!s.enabled||pendingMedia(c))return null;
 const next=c.schedule.flatMap(r=>r.fixtures.map(f=>({date:r.date,...f}))).filter(f=>!f.friendly&&f.homeGoals===null&&[f.home,f.away].includes(c.clubId)&&f.date>=c.date).sort((a,b)=>a.date.localeCompare(b.date))[0];
 // Do not queue an interview behind a matchday that is already opening.
 if(!next||days(c.date,next.date)<1||days(c.date,next.date)>3)return null;
 const opponentId=next.home===c.clubId?next.away:next.home,manager=managerFor(c,opponentId);if(!manager)return null;
 const key=mediaFixtureKey(c.season,next.date,next),derby=clubRivals(c.clubId,opponentId);
 if(s.events.some(e=>e.key===key)||s.lastCreated&&days(s.lastCreated,c.date)<(derby?7:21))return null;
 const relation=s.relationships[manager.id]||0,type=relation<=-4||hash(key)%2===0?'comment':'question';
 const history=rivalryHistory(c,opponentId,manager.id,next.date);
 const personality=managerPersonality(manager.id),quote=type==='question'?null:relation<=-4?'There has been enough talk from their side. They still have to face us on the pitch.':preQuote(personality,derby,key);
 const e={key,date:c.date,matchDate:next.date,season:c.season,clubId:c.clubId,opponentId,managerId:manager.id,managerName:manager.name,personality,context:history.text,question:rivalryQuestion(history,derby),derby,type,quote:quote&&history.lastChoice==='provoke'?'I remember the comments at our previous meeting. '+quote:quote,status:'pending',deferred:false,choice:null,changes:null,reply:null,responseDate:null,followUp:null,settled:false};
 s.events.push(e);s.events=s.events.slice(-80);s.lastCreated=c.date;
 c.news.push({date:c.date,kind:'manager-media',mediaKey:key,clubId:c.clubId,text:`${derby?'Rivalry match: ':''}${type==='comment'?manager.name+' has spoken before your meeting. The press want your response.':'The press ask for your view of '+manager.name+' ahead of your next match.'}`});return e;
}
export function postMatchMedia(c,league,report){
 const s=initialiseMedia(c);if(!s.enabled||report.friendly||report.date!==c.date||![report.homeId,report.awayId].includes(c.clubId)||pendingMedia(c))return null;
 const f=c.schedule.find(r=>r.date===report.date)?.fixtures.find(f=>f.home===report.homeId&&f.away===report.awayId&&f.competition===report.competition);
 if(!f||f.homeGoals===null||f.awayGoals===null)return null;
 const base=mediaFixtureKey(c.season,report.date,f),key=base+':post',pre=s.events.find(e=>e.key===base),derby=clubRivals(c.clubId,report.opponent);
 if(s.events.some(e=>e.key===key)||pre?.choice==='none'||s.lastPostCreated&&days(s.lastPostCreated,c.date)<7)return null;
 if(!derby&&!(pre?.status==='responded'&&['respect','confident','provoke'].includes(pre.choice))&&!(Math.abs(report.us-report.them)>=3&&(!s.lastPostCreated||days(s.lastPostCreated,c.date)>=14)))return null;
 const manager=managerFor(c,report.opponent);if(!manager)return null;
 const outcome=report.us>report.them?'win':report.us<report.them?'loss':report.penalties&&report.winner?(report.winner===c.clubId?'win':'loss'):'draw',result={us:report.us,them:report.them,outcome,penalties:!!report.penalties},personality=managerPersonality(manager.id);
 const e={key,phase:'post',date:c.date,matchDate:report.date,deadline:after(c.date,2),season:c.season,clubId:c.clubId,opponentId:report.opponent,managerId:manager.id,managerName:manager.name,personality,derby,type:'comment',quote:postQuote(personality,result),result,status:'pending',deferred:false,choice:null,changes:null,reply:null,responseDate:null,followUp:null,settled:false};
 s.events.push(e);s.events=s.events.slice(-80);s.lastPostCreated=c.date;
 c.news.push({date:c.date,kind:'manager-media',mediaKey:key,clubId:c.clubId,text:`After the ${outcome==='win'?'win':outcome==='loss'?'defeat':'draw'}: ${manager.name} has spoken. The press ask for your assessment.`});return e;
}
export function respondMedia(c,key,choiceId){
 const s=c.managerMedia,e=s?.events.find(e=>e.key===key),option=e&&mediaChoices(e).find(x=>x.id===choiceId),f=e&&fixtureFor(c,e);
 if(!e||e.status!=='pending'||!option)return {error:'This press question is no longer awaiting a response.'};
 const closed=e.phase==='post'?c.date>e.deadline:!f||f.homeGoals!==null||e.matchDate<c.date||managerFor(c,e.opponentId)?.id!==e.managerId;
 if(!s.enabled||e.season!==c.season||closed)return {error:'This response window has closed. Return to the club and advance time.'};
 const reaction=applyReaction(c,option.morale,option.supporters),before=s.relationships[e.managerId]||0,after=clamp(before+option.relationship,-10,10);s.relationships[e.managerId]=after;
 e.choice=option.id;e.status='responded';e.responseDate=c.date;e.changes={...reaction,relationship:after-before};
 e.reply=managerReply(e,choiceId);
 if(e.phase==='post'){e.settled=true;e.followUp={date:c.date,morale:0,supporters:0,text:'Your response is recorded. There is no further media reaction pending.'};}
 c.news.push({date:c.date,kind:'manager-media',mediaKey:e.key,clubId:c.clubId,text:`Your press response: ${option.text} Club morale ${reaction.morale>=0?'+':''}${reaction.morale}; community goodwill ${reaction.supporters>=0?'+':''}${reaction.supporters}; relationship ${after-before>=0?'+':''}${after-before}.${e.reply?' '+e.managerName+': '+e.reply:''}`});
 return {event:e};
}

export function validMedia(c,league){
 const s=c.managerMedia;if(s===undefined)return true;
 const obj=x=>!!x&&typeof x==='object'&&!Array.isArray(x),str=(v,n)=>typeof v==='string'&&v.length<=n,date=v=>str(v,10)&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&Number.isFinite(Date.parse(v)),int=(v,a,b)=>Number.isInteger(v)&&v>=a&&v<=b,clubs=new Set(league.clubs.map(x=>x.id)),people=c.managerWorld?.people||{},reaction=x=>obj(x)&&int(x.morale,-3,3)&&int(x.supporters,-3,3);
 if(!obj(s)||s.version!==1||typeof s.enabled!=='boolean'||!Array.isArray(s.events)||s.events.length>80||!obj(s.relationships)||Object.keys(s.relationships).length>500||!reaction(s.totals)||s.lastCreated!==''&&!date(s.lastCreated)||s.lastPostCreated!==undefined&&s.lastPostCreated!==''&&!date(s.lastPostCreated))return false;
 if(Object.entries(s.relationships).some(([id,n])=>!people[id]||!int(n,-10,10)))return false;
 const keys=new Set();for(const e of s.events){
  if(obj(e)&&e.question!==undefined&&!str(e.question,500))return false;
  if(obj(e)&&e.context!==undefined&&!str(e.context,700))return false;
  if(!obj(e)||!str(e.key,300)||keys.has(e.key)||!date(e.date)||!date(e.matchDate)||e.date>e.matchDate||!int(e.season,1,c.season)||e.clubId!==c.clubId||!clubs.has(e.opponentId)||e.opponentId===e.clubId||!people[e.managerId]||!str(e.managerName,100)||typeof e.derby!=='boolean'||!['comment','question'].includes(e.type)||e.quote!==null&&!str(e.quote,500)||!['pending','responded','expired'].includes(e.status)||typeof e.deferred!=='boolean'||typeof e.settled!=='boolean'||e.expiryReason!==undefined&&!str(e.expiryReason,200))return false;
  const parts=e.key.split(':');if(parts[0]!==String(e.season)||parts[1]!==e.matchDate||![parts[2],parts[3]].includes(e.clubId)||![parts[2],parts[3]].includes(e.opponentId))return false;
  if(e.phase!==undefined&&!['pre','post'].includes(e.phase)||e.personality!==undefined&&!PERSONALITIES.includes(e.personality))return false;
  if(e.phase==='post'){
   if(!e.key.endsWith(':post')||e.date!==e.matchDate||!date(e.deadline)||e.deadline!==after(e.date,2)||!obj(e.result)||!int(e.result.us,0,99)||!int(e.result.them,0,99)||!['win','draw','loss'].includes(e.result.outcome)||typeof e.result.penalties!=='boolean'||e.result.us>e.result.them&&e.result.outcome!=='win'||e.result.us<e.result.them&&e.result.outcome!=='loss'||e.result.us===e.result.them&&!e.result.penalties&&e.result.outcome!=='draw')return false;
  }
  keys.add(e.key);
  if(e.status==='responded'){
   if(!mediaChoices(e).some(x=>x.id===e.choice)||!date(e.responseDate)||e.responseDate<e.date||e.responseDate>(e.phase==='post'?e.deadline:e.matchDate)||!reaction(e.changes)||!int(e.changes.relationship,-3,2)||e.reply!==null&&!str(e.reply,300))return false;
   if(e.phase==='post'&&(!e.settled||!e.followUp||e.followUp.morale!==0||e.followUp.supporters!==0))return false;
  }else if(e.choice!==null||e.responseDate!==null||e.changes!==null||e.reply!==null||e.settled)return false;
  if(e.followUp!==null&&(!reaction(e.followUp)||!date(e.followUp.date)||e.followUp.date<e.matchDate||!str(e.followUp.text,500)||!e.settled)||e.settled&&e.followUp===null)return false;
 }
 return true;
}
