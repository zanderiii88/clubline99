import {SECTIONS,changeCost} from './stadium-model.js';
const same=(a,b)=>['stand','roof','rear','finish','frontage'].every(k=>(a?.[k]??(k==='frontage'?'plain':null))===(b?.[k]??(k==='frontage'?'plain':null)));
// Distinct planning states; no queue, payment or completion is inferred here.
export function stadiumSectionReview(c,draft){
 return SECTIONS.map(s=>{
  const built=c.stadium.sections[s.id],preview=draft.sections[s.id],target=c.stadiumBlueprint?.sections[s.id],job=c.construction?.find(j=>j.sections[s.id]);
  const last=(c.stadiumProjects||[]).filter(p=>p.completed<=c.date&&p.sections[s.id]).sort((a,b)=>a.completed.localeCompare(b.completed)).at(-1);
  return {id:s.id,previewChanged:changeCost(built,preview)>0,closed:!!job,opens:job?.opens||null,targetRemaining:!!target&&!same(built,target),targetBuilt:!!target&&same(built,target)&&!!last&&same(last.sections[s.id],target),built,preview,target:target||null};
 });
}
