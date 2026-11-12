import {commitTerms} from './negotiations.js?v=1.90.0';
import {buyerAssessment,settleClubFee} from './transfer-interest.js?v=1.100.0';
import {sellerAssessment} from './seller-assessment.js?v=1.101.0';
import {hash} from './player-attributes.js?v=1.74.0';
export function worldTransferDay(c,league){
 const key=c.date.slice(0,7);if(c.worldTransferMonth===key)return;c.worldTransferMonth=key;
 const owner=p=>c.owners[p.id]||p.clubId,active=p=>!c.players[p.id]?.retired&&!c.players[p.id]?.unregistered&&!c.players[p.id]?.academyOnly&&!c.loans?.[p.id],pools=new Map();
 for(const p of league.players.filter(active)){const id=owner(p);if(!pools.has(id))pools.set(id,[]);pools.get(id).push(p);}
 const candidates=league.players.filter(p=>active(p)&&owner(p)!==c.clubId&&!p.academy&&!c.futureTransfers?.some(t=>t.id===p.id&&t.status==='agreed')&&(p.freeAgent||(pools.get(owner(p))?.length||0)>18)).sort((a,b)=>hash(a.id+key)-hash(b.id+key));
 for(const p of candidates){
  const from=owner(p);if(sellerAssessment(c,league,p,null).blocked)continue;let dest=null;
  for(const club of league.clubs.filter(t=>t.id!==c.clubId&&t.id!==from).sort((a,b)=>hash(a.id+key)-hash(b.id+key))){const seller=sellerAssessment(c,league,p,club.id);if(seller.blocked)continue;const a=buyerAssessment(c,league,p,club.id,seller.askingPrice);if(a.acceptable){dest={club,a,fee:seller.askingPrice};break;}}
  if(!dest)continue;
  const fee=dest.fee;settleClubFee(c,league,from,dest.club.id,fee);c.owners[p.id]=dest.club.id;
  p.freeAgent=false;c.playerChanges[p.id]={...(c.playerChanges[p.id]||{}),freeAgent:false};const generated=c.generatedPlayers.find(x=>x.id===p.id);if(generated)generated.freeAgent=false;
  commitTerms(c,p,{wage:dest.a.wage,years:3});
  c.news.push({date:c.date,kind:'world-transfer',important:p.overall>=78||fee>=5000000,playerId:p.id,clubId:dest.club.id,text:`World transfer: ${p.name} joins ${dest.club.name} ${fee?'for £'+fee.toLocaleString('en-GB'):'on a free transfer'}. ${dest.a.reason}`});break;
 }
}
