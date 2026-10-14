import {playerAliases,normaliseName} from './player-aliases.js?v=1.74.0';
import {contractStatus} from './contracts.js?v=1.74.0';
// League-wide search uses current ownership and saved career availability.
export const playerValue=p=>Math.round(Math.max(50000,Math.min(15000000,(p.overall-55)**3*320*(p.age>=32?.55:p.age>=29?.78:1)+Math.max(0,p.potential-p.overall)*75000))/10000)*10000;
export const transferFee=(p,c)=>p.freeAgent?0:Math.round(playerValue(p)*1.1*(c?(contractStatus(c,p).days<=183?.55:contractStatus(c,p).days<=366?.8:1):1)/10000)*10000;
export const blankTransferFilters=()=>({name:'',listed:'all',position:'all',valueMin:'',valueMax:'',ageMin:'',ageMax:'',ratingMin:'',ratingMax:'',hotOnly:false,sort:'rating',feeMax:'',expiry:''});
export function searchLeaguePlayers(players,career,filters){
 const f={...blankTransferFilters(),...filters},listed=new Set(career.transferList||[]),hot=new Set(career.hotList||[]),text=normaliseName(f.name.trim());
 const within=(n,min,max)=>(min===''||min==null||n>=Number(min))&&(max===''||max==null||n<=Number(max));
 const groups={defence:['LB','RB','CB'],midfield:['DM','CM','AM'],attack:['LW','RW','ST']};
 const result=players.filter(p=>{
  if(career.players?.[p.id]?.retired||career.players?.[p.id]?.unregistered)return false;
  if(text&&!normaliseName(p.name+' '+(playerAliases[p.id]||'')).includes(text))return false;
  if(f.listed==='listed'&&!listed.has(p.id)||f.listed==='unlisted'&&listed.has(p.id))return false;
  if(f.listed==='free'&&!p.freeAgent||f.listed==='contracted'&&p.freeAgent)return false;
  if(f.expiry&&(p.freeAgent||contractStatus(career,p).days>Number(f.expiry)))return false;
  if(f.hotOnly&&!hot.has(p.id))return false;
  if(f.position!=='all'&&!(groups[f.position]||[f.position]).some(pos=>p.primary===pos||(p.positions?.[pos]||0)>=p.overall*.75))return false;
  return within(transferFee(p,career),'',f.feeMax)&&within(playerValue(p),f.valueMin,f.valueMax)&&within(p.age,f.ageMin,f.ageMax)&&within(p.overall,f.ratingMin,f.ratingMax);
 });
 return result.sort((a,b)=>{let order=f.sort==='name'?a.name.localeCompare(b.name,'en-GB'):f.sort==='age'?a.age-b.age:f.sort==='fee'?transferFee(a,career)-transferFee(b,career):f.sort==='value'?playerValue(b)-playerValue(a):b.overall-a.overall;return order||a.name.localeCompare(b.name,'en-GB')});
}
