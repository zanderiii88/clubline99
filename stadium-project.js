import {SECTIONS,STANDS,ROOFS,REARS,FINISHES,capacity,changeCost} from './stadium-model.js';
// Itemised quote only: no registration, money or layout changes.
export function stadiumProject(c,club,draft,quote,weeklyWages){
 const labels={stand:STANDS,roof:ROOFS,rear:REARS,finish:FINISHES};
 const rows=SECTIONS.flatMap(section=>{const old=c.stadium.sections[section.id],next=draft.sections[section.id],cost=changeCost(old,next);if(!cost)return [];const changes=['stand','roof','rear','finish','frontage'].filter(k=>(old[k]??(k==='frontage'?'plain':null))!==(next[k]??(k==='frontage'?'plain':null))).map(k=>({field:k,from:k==='stand'?STANDS[old[k]].label:labels[k]?.[old[k]]||old[k]||'plain',to:k==='stand'?STANDS[next[k]].label:labels[k]?.[next[k]]||next[k]||'plain'}));return [{id:section.id,cost,changes}];});
 const remaining=c.balance-quote.cost,reserve=Math.max(0,weeklyWages)*4;
 return {rows,total:rows.reduce((n,r)=>n+r.cost,0),remaining,reserve,reserveShortfall:Math.max(0,reserve-remaining),payrollWeeks:weeklyWages>0?Math.max(0,Math.floor(remaining/weeklyWages)):null,minimumCapacity:Math.min(10000,club.capacity)};
}

// Current calendar and fixtures drive the display; rendering never completes a job.
export function activeStadiumProject(c,club){
 const job=c.construction?.[0];if(!job)return null;
 const duration=(a,b)=>Math.round((Date.parse(b+'T12:00:00Z')-Date.parse(a+'T12:00:00Z'))/86400000),total=job.started?duration(job.started,job.opens):null,elapsed=job.started?duration(job.started,c.date):null,remaining=Math.max(0,duration(c.date,job.opens));
 const after=structuredClone(c.stadium);Object.assign(after.sections,job.sections);
 const fixtures=(c.schedule||[]).flatMap(r=>r.fixtures.map(f=>({...f,date:r.date}))).filter(f=>f.home===c.clubId&&!f.neutral&&f.homeGoals==null&&f.date>=c.date&&f.date<job.opens).sort((a,b)=>a.date.localeCompare(b.date));
 return {started:job.started||null,opens:job.opens,remaining,total:total!==null&&Number.isFinite(total)?total:null,percent:total>0&&Number.isFinite(elapsed)?Math.max(0,Math.min(100,Math.floor(elapsed/total*100))):null,sections:Object.keys(job.sections),paid:Number.isFinite(job.cost)?job.cost:null,afterCapacity:capacity(after,club),fixtures};
}
