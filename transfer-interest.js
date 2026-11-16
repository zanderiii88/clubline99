import {clubPayroll as payroll} from './wage-planning.js?v=1.116.0';
import {formationSlots} from './formations.js?v=1.100.0';
import {assignSquad} from './squad-selection.js?v=1.87.0';
import {suitsRole} from './recruitment.js?v=1.93.0';
import {playerValue} from './transfer-search.js?v=1.93.0';
import {termsDemand} from './negotiations.js?v=1.90.0';

const owner=(c,p)=>c.owners?.[p.id]||p.clubId;
const active=(c,p)=>!c.players?.[p.id]?.retired&&!c.players?.[p.id]?.academyOnly;
const effective=(p,pos)=>pos===p.primary?p.overall:p.positions?.[pos]||0;
const thousand=n=>Math.floor(Math.max(0,n)/1000)*1000;
export function clubTransferFunds(c,league,id){const saved=c.aiBudgets?.[id];return Number.isFinite(saved)?saved:league.clubs.find(x=>x.id===id)?.budget||0;}
// A transfer ledger, not simulated weekly AI accounts. Protect four enlarged
// payrolls, but do not invent future income or replenish funds on reload.
export function settleClubFee(c,league,from,to,fee){
 if(!Number.isFinite(fee)||fee<0||from===to)return;
 c.aiBudgets??={};
 if(from!==c.clubId&&league.clubs.some(x=>x.id===from))c.aiBudgets[from]=clubTransferFunds(c,league,from)+fee;
 if(to!==c.clubId&&league.clubs.some(x=>x.id===to))c.aiBudgets[to]=clubTransferFunds(c,league,to)-fee;
}

function lineup(pool,slots){const picks=assignSquad([...pool].sort((a,b)=>a.id.localeCompare(b.id)),slots,(p,pos)=>suitsRole(p,pos)?10000+effective(p,pos):-1e6),byId=new Map(pool.map(p=>[p.id,p]));return {filled:picks.filter(Boolean).length,quality:picks.reduce((n,id,i)=>n+(id?effective(byId.get(id),slots[i]):0),0)};}
export function buyerAssessment(c,league,p,buyerId,fee=0){
 const buyer=league.clubs.find(x=>x.id===buyerId),no=reason=>({interested:false,acceptable:false,reason,maxFee:0,openingFee:0});
 if(!buyer||buyerId===c.clubId||!p||owner(c,p)===buyerId)return no('The player is no longer a transfer target for this club.');
 if(!active(c,p)||p.academy||(c.players?.[p.id]?.retirementAfterSeason||Infinity)<=c.season||c.players?.[p.id]?.unregistered||c.loans?.[p.id]||c.futureTransfers?.some(t=>t.id===p.id&&t.status==='agreed'))return no('The player is unavailable for a permanent transfer.');
 const registered=league.players.filter(x=>owner(c,x)===buyerId&&active(c,x)&&!c.players?.[x.id]?.unregistered);
 if(registered.length>=26)return no('The buying club has reached its recruitment squad limit.');
 const leaving=x=>(c.players?.[x.id]?.retirementAfterSeason||Infinity)<=c.season||c.futureTransfers?.some(t=>t.id===x.id&&t.status==='agreed'&&t.to!==buyerId);
 const pool=registered.filter(x=>!x.academy&&!c.loans?.[x.id]&&!leaving(x)),slots=formationSlots(buyer.formation),before=lineup(pool,slots),after=lineup([...pool,p],slots),gain=after.quality-before.quality;
 let role=null,depth=false;
 for(const pos of [...new Set(slots)]){if(!suitsRole(p,pos))continue;const need=slots.filter(x=>x===pos).length,peers=pool.filter(x=>suitsRole(x,pos)).sort((a,b)=>effective(b,pos)-effective(a,pos)),reference=peers[Math.min(need,peers.length)-1];if(peers.length<=need&&effective(p,pos)>=Math.max(40,(reference?effective(reference,pos):0)-8)){depth=true;role??=pos;}}
 const upgrade=after.filled>before.filled||gain>=3;
 if(!upgrade&&!depth)return no('The club already has sufficient options of this standard in its formation.');
 role??=slots.find(pos=>suitsRole(p,pos));
 const reason=after.filled>before.filled?'The player fills a formation shortage.':upgrade?'The player improves the club’s strongest formation.':'The player adds cover in '+role+'.';
 const wage=termsDemand({...c,clubId:buyerId},league,p,3,undefined,'signing'),reserve=4*(payroll(c,league,buyerId)+wage),funds=clubTransferFunds(c,league,buyerId),value=playerValue(p),maxFee=thousand(Math.min(value*(upgrade?1.2:1.05),funds-reserve));
 if(maxFee<1000&&!p.freeAgent||funds<reserve)return no('The club cannot protect four weekly payrolls after this signing.');
 if(!p.freeAgent&&maxFee<value*.75)return no('The player is beyond the club’s realistic transfer spending range.');
 const openingFee=p.freeAgent?0:Math.min(maxFee,Math.max(1000,thousand(value*((c.transferList||[]).includes(p.id)?1:.9))));
 const acceptable=Number.isFinite(fee)&&fee>=0&&fee<=maxFee;
 return {interested:true,acceptable,reason:acceptable?reason:'The fee exceeds the club’s current valuation or wage-reserve limit.',role,upgrade,wage,reserve,funds,maxFee,openingFee};
}
export function transferOfferDay(c,league,random=Math.random,generate=true){
 for(const o of (c.offers||[]).filter(x=>!x.incoming&&x.status==='pending')){
  const p=league.players.find(x=>x.id===o.id),assessment=p&&owner(c,p)===c.clubId?buyerAssessment(c,league,p,o.clubId,o.fee):null;
  o.status=assessment?.acceptable?'new':'rejected';o.feedback=assessment?.reason||'The player is no longer available from your club.';
  c.news.push({date:c.date,kind:'offer',playerId:o.id,clubId:c.clubId,buyerId:o.clubId,text:`${league.clubs.find(x=>x.id===o.clubId)?.name||'Buying club'} ${o.status==='new'?'accepted':'declined'} your counter proposal for ${p?.name||'the player'}. ${o.feedback}`});
 }
 if(!generate||random()>=(c.managementMode==='streamlined'?.025:.10)||(c.offers||[]).filter(o=>['new','counter'].includes(o.status)).length>=2)return;
 const candidates=league.players.filter(p=>owner(c,p)===c.clubId&&active(c,p)&&!p.academy&&!c.players?.[p.id]?.unregistered&&!c.loans?.[p.id]&&!c.futureTransfers?.some(t=>t.id===p.id&&t.status==='agreed')&&!c.offers.some(o=>o.id===p.id&&['new','pending','counter'].includes(o.status)));
 if(!candidates.length)return;
 const start=Math.floor(random()*candidates.length);
 for(let n=0;n<candidates.length;n++){
  const p=candidates[(start+n)%candidates.length],buyers=league.clubs.map(b=>({id:b.id,a:buyerAssessment(c,league,p,b.id)})).filter(x=>x.a.interested);
  if(!buyers.length)continue;const pick=buyers[Math.floor(random()*buyers.length)];
  c.offers.push({id:p.id,clubId:pick.id,fee:pick.a.openingFee,status:'new',feedback:pick.a.reason});
  c.news.push({date:c.date,kind:'offer',playerId:p.id,clubId:c.clubId,buyerId:pick.id,text:`${league.clubs.find(x=>x.id===pick.id).name} offered for ${p.name}. ${pick.a.reason} Review the proposal in Squad → Transfers.`});break;
 }
}
