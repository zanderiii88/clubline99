import {SECTIONS,STANDS,ROOFS,REARS,FINISHES,changeCost,capacity} from './stadium-model.js';
import {constructionQuote} from './construction.js?v=1.109.0';
import {fixedSiteError} from './fixed-surroundings.js?v=1.89.0';
export function validStadiumBlueprint(c){
 const p=c.stadiumBlueprint;if(p===undefined||p===null)return true;
 const obj=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
 if(!obj(p)||p.version!==1||typeof p.saved!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(p.saved)||!Number.isFinite(Date.parse(p.saved))||!obj(p.sections)||Object.keys(p.sections).length!==SECTIONS.length)return false;
 return SECTIONS.every(({id})=>{const s=p.sections[id];return obj(s)&&Object.hasOwn(STANDS,s.stand)&&Object.hasOwn(ROOFS,s.roof)&&Object.hasOwn(REARS,s.rear)&&Object.hasOwn(FINISHES,s.finish)&&(s.frontage===undefined||['plain','brickwindows','artdeco','towers'].includes(s.frontage))});
}
export function saveStadiumBlueprint(c,draft){c.stadiumBlueprint={version:1,saved:c.date,sections:structuredClone(draft.sections)}}
export function restoreStadiumBlueprint(c){if(!c.stadiumBlueprint||!validStadiumBlueprint(c))return null;return {...structuredClone(c.stadium),sections:structuredClone(c.stadiumBlueprint.sections)}}
export function stadiumPhases(c,club,draft){
 const changed=SECTIONS.filter(s=>changeCost(c.stadium.sections[s.id],draft.sections[s.id])>0),all=constructionQuote(c,club,draft);
 const groups=[['N','North stand'],['S','South stand'],['E','East end'],['W','West end'],['corners','Corners']];
 const phases=groups.flatMap(([id,label])=>{const sections=changed.filter(s=>id==='corners'?s.corner:s.side===id);if(!sections.length)return [];const layout=structuredClone(c.stadium);for(const s of sections)layout.sections[s.id]=structuredClone(draft.sections[s.id]);return [{id,label,sections:sections.map(s=>s.id),draft:layout,quote:constructionQuote(c,club,layout),capacity:capacity(layout,club),siteError:fixedSiteError(club,layout)}]});
 return {all,phases,remaining:changed.length};
}
