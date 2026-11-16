import {successionPlan} from './succession-planning.js?v=1.116.0';
import {youthAdvice,progressSummary} from './player-progress.js?v=1.116.0';
// Read-only current-season evidence. Academy estimates never expose exact ability.
export function youthOpportunities(c,league,slots){
 const plan=successionPlan(c,league,slots),pool=new Map();
 for(const p of league.players)if((c.loans?.[p.id]?.parent||c.owners?.[p.id]||p.clubId)===c.clubId&&p.age<=21&&!c.players?.[p.id]?.retired)pool.set(p.id,p);
 for(const p of c.prospects||[])if(!p.promoted&&!c.players?.[p.id]?.retired)pool.set(p.id,p.calledUp?league.players.find(x=>x.id===p.id)||p:p);
 return [...pool.values()].map(p=>{
  const academy=!!p.academy&&!p.promoted,loan=c.loans?.[p.id]?.parent===c.clubId,records=(c.playerProgress?.records||[]).filter(r=>r.id===p.id&&r.season===c.season&&r.clubId===c.clubId),apps=records.reduce((n,r)=>n+r.apps,0),minutes=records.reduce((n,r)=>n+r.minutes,0),progress=academy?null:progressSummary(c,p),roles=plan.rows.filter(r=>r.pos===p.primary||p.primary!=='GK'&&r.pos!=='GK'&&p.secondary===r.pos),needs=roles.filter(r=>r.priority>0).map(r=>({pos:r.pos,reason:r.currentGap?'Available XI gap':r.futureGap?'Confirmed summer gap':r.renewalGap||r.departures.length||r.renewals.length?'Contract or departure risk':'Limited permanent cover'})),advice=youthAdvice(c,league,p);
  let next=loan?'Review the loan playing-time report; parent-club totals exclude loan appearances.':c.players?.[p.id]?.unregistered?'Registration is required before senior selection.':c.players?.[p.id]?.suspensionMatches?'Suspended: review availability before selecting.':advice.reason;
  if(!loan&&!academy&&['call-up','blocked'].includes(advice.action)&&!c.players?.[p.id]?.unregistered&&!c.players?.[p.id]?.injuryDays&&!c.players?.[p.id]?.suspensionMatches)next='Compare this player with your available senior cover. Consider first-team minutes when readiness, condition and the match situation allow.';
  if(!loan&&!academy&&!c.players?.[p.id]?.unregistered&&!c.players?.[p.id]?.injuryDays&&!c.players?.[p.id]?.suspensionMatches&&apps===0)next+=' No competitive appearance for your club is recorded this season.';
  return {id:p.id,name:p.name,age:p.age,position:p.primary,academy,loan,apps,minutes,change:progress?.seasonChange??null,trackedFrom:progress?.seasonSince||null,needs,next};
 }).sort((a,b)=>Number(b.needs.length>0)-Number(a.needs.length>0)||a.minutes-b.minutes||a.age-b.age||a.id.localeCompare(b.id));
}
