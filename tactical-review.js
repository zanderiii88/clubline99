import {FORMATIONS} from './formations.js?v=1.100.0';

const STYLES=['Balanced','High press','Possession','Direct','Counter'];
const ORDERS=['Standard','Attack','Protect lead'];
const INSTRUCTIONS=['Standard','Get forward','Hold position','Press more','Stay wide','Cut inside'];
const POSITIONS=['GK','LB','CB','RB','DM','CM','AM','LW','RW','ST'];
const integer=(n,max=10000)=>Number.isInteger(n)&&n>=0&&n<=max;
const object=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
function counters(m){
 const side=name=>({shots:m.stats[name].shots,onTarget:m.stats[name].onTarget,goals:name==='home'?m.homeGoals:m.awayGoals});
 const samples=m.stats.possession||[];
 return {home:side('home'),away:side('away'),samples:samples.length,homeSum:samples.reduce((n,s)=>n+s.home,0)};
}
const signature=s=>JSON.stringify([s.formation,s.style,s.order,s.override,s.assistant,s.lineup,s.roles,s.instructions,s.opponents]);
// Snapshot immediately before play. A command at minute 45 affects minute 46 onward.
export function recordTacticalState(m,context){
 const j=m.tacticalRecord??={version:1,from:m.minute,through:m.minute,ended:false,states:[],end:counters(m)};
 if(j.ended)return;
 const state={minute:m.minute,...structuredClone(context),base:counters(m)},previous=j.states.at(-1);
 if(previous&&signature(previous)===signature(state))return;
 if(previous?.minute===state.minute)j.states[j.states.length-1]=state;else j.states.push(state);
}
export function recordTacticalMinute(m){const j=m.tacticalRecord;if(j&&!j.ended){j.through=m.minute;j.end=counters(m)}}
export function sealTacticalRecord(m){if(m.tacticalRecord)m.tacticalRecord.ended=true}

function validCounters(c){
 return object(c)&&['home','away'].every(k=>object(c[k])&&['shots','onTarget','goals'].every(n=>integer(c[k][n]))&&c[k].goals<=c[k].onTarget&&c[k].onTarget<=c[k].shots)&&integer(c.samples,120)&&Number.isFinite(c.homeSum)&&c.homeSum>=0&&c.homeSum<=100*c.samples;
}
function follows(a,b){return ['home','away'].every(k=>['shots','onTarget','goals'].every(n=>b[k][n]>=a[k][n]))&&b.samples>=a.samples&&b.homeSum+1e-8>=a.homeSum&&b.homeSum-a.homeSum<=100*(b.samples-a.samples)+1e-8}
export function validTacticalRecord(j,ids){
 if(j===undefined)return true;
 if(!object(j)||j.version!==1||!integer(j.from,120)||!integer(j.through,120)||j.from>j.through||typeof j.ended!=='boolean'||!Array.isArray(j.states)||!j.states.length||j.states.length>121||!validCounters(j.end))return false;
 let previous=null;
 for(const s of j.states){
  if(!object(s)||!integer(s.minute,120)||s.minute<j.from||s.minute>j.through||previous&&s.minute<=previous.minute||!previous&&s.minute!==j.from||typeof s.formation!=='string'||!Object.hasOwn(FORMATIONS,s.formation)||!STYLES.includes(s.style)||!ORDERS.includes(s.order)||s.override!==null&&!ORDERS.includes(s.override)||typeof s.assistant!=='boolean'||!integer(s.opponents,11))return false;
  if(!Array.isArray(s.lineup)||s.lineup.length!==11||s.lineup.some(id=>id!==null&&!ids.has(id))||new Set(s.lineup.filter(Boolean)).size!==s.lineup.filter(Boolean).length||!Array.isArray(s.roles)||s.roles.length!==11||s.roles.some(x=>!POSITIONS.includes(x))||!Array.isArray(s.instructions)||s.instructions.length!==11||s.instructions.some(x=>!INSTRUCTIONS.includes(x)))return false;
  if(!Array.isArray(s.unfamiliar)||new Set(s.unfamiliar).size!==s.unfamiliar.length||s.unfamiliar.some(id=>!id||!s.lineup.includes(id)))return false;
  const c=s.condition;
  if(!object(c)||!['average','minimum'].every(k=>c[k]===null||Number.isFinite(c[k])&&c[k]>=0&&c[k]<=100)||!integer(c.low,11)||c.low>s.lineup.filter(Boolean).length||!validCounters(s.base)||previous&&!follows(previous.base,s.base))return false;
  previous=s;
 }
 return follows(previous.base,j.end);
}

// Read-only descriptive comparisons; no tactical effect is inferred from a short spell.
export function tacticalSpells(j,clubId,homeId,events=[]){
 if(!j)return [];
 const ours=homeId===clubId?'home':'away',other=ours==='home'?'away':'home';
 return j.states.flatMap((state,i)=>{
  const next=j.states[i+1],end=next?.base||j.end,to=next?.minute??j.through,minutes=to-state.minute;
  if(minutes<=0)return [];
  const delta=k=>Object.fromEntries(['shots','onTarget','goals'].map(n=>[n,end[k][n]-state.base[k][n]])),samples=end.samples-state.base.samples,home=samples?(end.homeSum-state.base.homeSum)/samples:null;
  return [{from:state.minute+1,to,minutes,state,us:delta(ours),them:delta(other),samples,possession:home===null?null:Math.round(Math.max(0,Math.min(100,ours==='home'?home:100-home))),incidents:events.filter(e=>['red','injury'].includes(e.type)&&e.minute>state.minute&&e.minute<=to)}];
 });
}
