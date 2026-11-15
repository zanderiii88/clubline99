import {SECTIONS,STANDS,ROOFS,REARS,FINISHES} from './stadium-model.js';
export function recordStadiumProject(c,job){
 const key=[job.started||'',job.opens,Object.keys(job.sections).sort().join(',')].join(':');
 c.stadiumProjects??=[];if(c.stadiumProjects.some(p=>p.key===key))return;
 c.stadiumProjects.push({key,started:job.started||null,opens:job.opens,completed:c.date,paid:Number.isFinite(job.cost)?job.cost:null,before:Number.isFinite(job.capacityBefore)?job.capacityBefore:null,after:Number.isFinite(job.capacityAfter)?job.capacityAfter:null,sections:structuredClone(job.sections)});
 c.stadiumProjects=c.stadiumProjects.slice(-200);
}
export function validStadiumHistory(c){
 const rows=c.stadiumProjects;if(rows===undefined)return true;
 const obj=x=>x!==null&&typeof x==='object'&&!Array.isArray(x),date=x=>typeof x==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(x)&&Number.isFinite(Date.parse(x)),amount=x=>x===null||Number.isFinite(x)&&x>=0,ids=new Set(SECTIONS.map(s=>s.id)),keys=new Set();
 if(!Array.isArray(rows)||rows.length>200)return false;
 for(const p of rows){
  if(!obj(p)||typeof p.key!=='string'||keys.has(p.key)||p.started!==null&&!date(p.started)||!date(p.opens)||!date(p.completed)||p.completed<p.opens||p.started!==null&&p.started>p.opens||!['paid','before','after'].every(k=>amount(p[k]))||!obj(p.sections)||!Object.keys(p.sections).length||Object.keys(p.sections).length>28)return false;
  if(p.key!==[p.started||'',p.opens,Object.keys(p.sections).sort().join(',')].join(':'))return false;
  for(const [id,s]of Object.entries(p.sections))if(!ids.has(id)||!obj(s)||!Object.hasOwn(STANDS,s.stand)||!Object.hasOwn(ROOFS,s.roof)||!Object.hasOwn(REARS,s.rear)||!Object.hasOwn(FINISHES,s.finish)||s.frontage!==undefined&&!['plain','brickwindows','artdeco','towers'].includes(s.frontage))return false;
  keys.add(p.key);
 }
 return true;
}
