import {STANDS,ROOFS,FINISHES} from './stadium-model.js?v=1.74.0';
const choices={stand:STANDS,roof:ROOFS,finish:FINISHES};
export function cycleStadiumField(draft,ids,field,direction){
 const options=choices[field],selected=[...new Set(ids)].filter(id=>draft?.sections?.[id]);
 if(!options||!selected.length||![1,-1].includes(direction))return null;
 const keys=Object.keys(options),current=draft.sections[selected[0]][field],index=keys.indexOf(current),value=keys[(Math.max(0,index)+direction+keys.length)%keys.length];
 for(const id of selected){draft.sections[id][field]=value;if(draft.sections[id].stand==='empty')draft.sections[id].roof='none';}
 return value;
}
export function stadiumChoice(draft,ids,field){
 const options=choices[field],selected=[...ids].filter(id=>draft?.sections?.[id]),values=new Set(selected.map(id=>draft.sections[id][field]));
 if(!options||!selected.length)return {label:'Select sections',position:''};
 if(values.size>1)return {label:'Mixed selection',position:'Choose a shared style'};
 const value=[...values][0],keys=Object.keys(options),index=keys.indexOf(value);
 const label=field==='stand'?value==='empty'?'Open space':STANDS[value].tiers.length>1?STANDS[value].tiers.length+' tiers':value.startsWith('terrace')||value==='grass'?'Standing':value.startsWith('bleacher')?'Bleachers':'Single tier':field==='roof'?value==='none'?'Uncovered':'Covered':{brick:'Brick · red',metal:'Metal · grey',dark:'Cladding · dark'}[value];
 return {label,position:(index+1)+' / '+keys.length};
}
export const buildDurationLabel=days=>!days?'No changes':days>=84?`${Math.round(days/30.44)} months`:`${Math.ceil(days/7)} weeks`;
