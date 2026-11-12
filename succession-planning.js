import {assignSquad} from './squad-selection.js?v=1.87.0';
import {contractStatus} from './contracts.js?v=1.90.0';
import {suitsRole} from './recruitment.js?v=1.93.0';
import {youthReadiness} from './world-development.js?v=1.91.0';

const owner=(c,p)=>c.owners?.[p.id]||p.clubId;
const alive=(c,p)=>!c.players?.[p.id]?.retired;
const effective=(p,pos)=>Math.round(pos===p.primary?p.overall:p.positions?.[pos]||0);
const sorted=(pool,pos)=>pool.filter(p=>suitsRole(p,pos)).sort((a,b)=>effective(b,pos)-effective(a,pos)||a.id.localeCompare(b.id));
function assignment(pool,slots){const lineup=assignSquad([...pool].sort((a,b)=>a.id.localeCompare(b.id)),slots,(p,pos)=>suitsRole(p,pos)?10000+effective(p,pos):-1e6);return {lineup,filled:lineup.filter(Boolean).length,total:slots.length};}

// A live, read-only plan. No predicted growth, new contract or registration is
// assumed. Joint coverage uses distinct players across the whole formation.
export function successionPlan(c,league,slots){
 const opening=`${Number(c.seasonStart.slice(0,4))+1}${c.seasonStart.slice(4)}`,called=new Set((c.prospects||[]).filter(p=>p.calledUp&&!p.promoted).map(p=>p.id));
 const actual=league.players.filter(p=>owner(c,p)===c.clubId&&alive(c,p)&&!c.players?.[p.id]?.unregistered&&!c.players?.[p.id]?.academyOnly&&(!p.academy||called.has(p.id)));
 const current=actual.filter(p=>!c.loans?.[p.id]&&!c.players?.[p.id]?.injuryDays&&!c.players?.[p.id]?.suspensionMatches);
 const owned=league.players.filter(p=>(c.loans?.[p.id]?.parent||owner(c,p))===c.clubId&&alive(c,p)&&!p.academy&&!c.players?.[p.id]?.academyOnly);
 const departingDeals=(c.futureTransfers||[]).filter(t=>t.status==='agreed'&&t.from===c.clubId&&t.to!==c.clubId&&t.arrival<=opening),outIds=new Set(departingDeals.map(t=>t.id));
 const retires=p=>!!c.players?.[p.id]?.retirementAfterSeason&&c.players[p.id].retirementAfterSeason<=c.season;
 const leaving=p=>retires(p)||outIds.has(p.id);
 const departures=owned.filter(leaving).map(p=>({id:p.id,retirement:retires(p),transfer:outIds.has(p.id)}));
 const retained=owned.filter(p=>!leaving(p)&&!c.loans?.[p.id]&&!c.players?.[p.id]?.unregistered);
 const renewalIds=new Set(retained.filter(p=>contractStatus(c,p).end<=opening).map(p=>p.id));
 const riskPool=retained.filter(p=>!renewalIds.has(p.id));
 const currentXI=assignment(current,slots),retainedXI=assignment(retained,slots),renewalRiskXI=assignment(riskPool,slots);
 const returning=owned.filter(p=>c.loans?.[p.id]?.parent===c.clubId&&(c.loans[p.id].end||c.loans[p.id].season||'9999-12-31')<=opening&&!leaving(p));
 const held=owned.filter(p=>c.players?.[p.id]?.unregistered&&!c.loans?.[p.id]&&!leaving(p));
 const arrivals=(c.futureTransfers||[]).filter(t=>t.status==='agreed'&&t.to===c.clubId&&t.from!==c.clubId&&t.arrival<=opening).map(t=>({deal:t,p:league.players.find(p=>p.id===t.id)})).filter(x=>x.p&&!x.p.academy&&alive(c,x.p));
 const prospects=(c.prospects||[]).filter(p=>!p.promoted&&!c.players?.[p.id]?.retired);
 const rows=[...new Set(slots)].map(pos=>{
  const need=slots.filter(x=>x===pos).length,now=sorted(current,pos),permanent=sorted(retained,pos),secure=sorted(riskPool,pos);
  const losses=owned.filter(p=>leaving(p)&&suitsRole(p,pos)).map(p=>p.id),renewals=permanent.filter(p=>renewalIds.has(p.id)).map(p=>p.id),older=permanent.filter(p=>p.age>=(p.primary==='GK'?36:33)).map(p=>p.id);
  const currentGap=slots.filter((x,i)=>x===pos&&!currentXI.lineup[i]).length,futureGap=slots.filter((x,i)=>x===pos&&!retainedXI.lineup[i]).length,renewalGap=slots.filter((x,i)=>x===pos&&!renewalRiskXI.lineup[i]).length;
  const academy=prospects.filter(p=>p.primary===pos||p.primary!=='GK'&&pos!=='GK'&&p.secondary===pos).map(p=>{const subject=p.calledUp?league.players.find(x=>x.id===p.id)||p:p,range=youthReadiness(c,league,subject),factor=p.primary===pos?1:.8;return {id:p.id,low:Math.round(range.low*factor),high:Math.round(range.high*factor),calledUp:!!p.calledUp};}).sort((a,b)=>b.low-a.low||b.high-a.high||a.id.localeCompare(b.id));
  const reference=now.find(p=>!p.academy)||permanent[0]||null;
  return {pos,need,currentGap,futureGap,renewalGap,reference:reference?.id||null,departures:losses,renewals,ageWatch:older,
   senior:permanent.map(p=>({id:p.id,effective:effective(p,pos),renewal:renewalIds.has(p.id)})),
   returning:sorted(returning,pos).map(p=>({id:p.id,effective:effective(p,pos),end:c.loans[p.id].end||c.loans[p.id].season})),
   registration:sorted(held,pos).map(p=>({id:p.id,effective:effective(p,pos)})),
   arrivals:arrivals.filter(x=>suitsRole(x.p,pos)).map(x=>({id:x.p.id,date:x.deal.arrival})).sort((a,b)=>a.date.localeCompare(b.date)||a.id.localeCompare(b.id)),academy,
   priority:currentGap?3:futureGap?2:renewalGap||losses.length||renewals.length?1:older.length||secure.length<=need? .5:0};
 }).sort((a,b)=>b.priority-a.priority||slots.indexOf(a.pos)-slots.indexOf(b.pos));
 return {opening,currentXI,retainedXI,renewalRiskXI,departures,renewalIds:[...renewalIds],rows,registrationPlaces:Math.max(0,30-actual.length)};
}
