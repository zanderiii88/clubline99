const owner=(c,p)=>c.loans?.[p.id]?.parent||c.owners?.[p.id]||p.clubId;
const active=(c,p)=>!c.players?.[p.id]?.retired&&!c.players?.[p.id]?.academyOnly&&!p.academy;
const ability=(p,pos)=>pos===p.primary?p.overall:(p.positions?.[pos]||0);

// Advice only: never assign retirement dates or change selection/ownership.
export function retirementOutlook(c,league){
 const pool=league.players.filter(p=>owner(c,p)===c.clubId&&active(c,p));
 const horizon=c.season+1;
 const leaving=new Set((c.futureTransfers||[]).filter(t=>t.status==='agreed'&&t.to!==c.clubId).map(t=>t.id));
 const rows=pool.filter(p=>c.players?.[p.id]?.retirementAfterSeason||p.age>=(p.primary==='GK'?36:33)).map(p=>{
  const planned=c.players?.[p.id]?.retirementAfterSeason||null;
  const cover=pool.filter(x=>x.id!==p.id&&!leaving.has(x.id)&&!c.players?.[x.id]?.unregistered&&!c.loans?.[x.id]&&(!c.players?.[x.id]?.retirementAfterSeason||c.players[x.id].retirementAfterSeason>horizon)&&ability(x,p.primary)>=x.overall*.75).sort((a,b)=>ability(b,p.primary)-ability(a,p.primary));
  const ready=cover.filter(x=>!c.players?.[x.id]?.injuryDays&&!c.players?.[x.id]?.suspensionMatches);
  return {id:p.id,position:p.primary,age:p.age,planned,remaining:planned===null?null:Math.max(0,planned-c.season),cover:cover.map(x=>x.id),available:ready.map(x=>x.id),onLoan:!!c.loans?.[p.id]};
 });
 return rows.sort((a,b)=>(a.planned??Infinity)-(b.planned??Infinity)||a.cover.length-b.cover.length||b.age-a.age||a.id.localeCompare(b.id));
}
