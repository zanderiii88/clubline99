import {formationSlots} from './formations.js?v=1.100.0';
import {assignSquad} from './squad-selection.js?v=1.87.0';
import {suitsRole} from './recruitment.js?v=1.93.0';
import {contractStatus} from './contracts.js?v=1.90.0';
import {transferFee} from './transfer-search.js?v=1.93.0';
import {clubRivals} from './manager-media.js?v=1.98.0';

const owner=(c,p)=>c.owners?.[p.id]||p.clubId;
const effective=(p,pos)=>p.primary===pos?p.overall:p.positions?.[pos]||0;
function coverage(pool,slots){const ids=assignSquad([...pool].sort((a,b)=>a.id.localeCompare(b.id)),slots,(p,pos)=>suitsRole(p,pos)?10000+effective(p,pos):-1e6);return {filled:ids.filter(Boolean).length,total:slots.length};}
// Structural cover ignores today's fitness. Loans and temporary academy players
// cannot justify selling permanent cover; agreed departures reserve it already.
export function sellerAssessment(c,league,p,buyerId,{future=false,challenger=false}={}){
 const blocked=reason=>({blocked:true,multiplier:1,askingPrice:null,reason});
 if(!p||c.players?.[p.id]?.retired||p.academy||c.players?.[p.id]?.academyOnly||c.players?.[p.id]?.unregistered||c.loans?.[p.id]||(c.players?.[p.id]?.retirementAfterSeason||Infinity)<=c.season)return blocked('The player is unavailable for a permanent transfer.');
 if(c.futureTransfers?.some(t=>t.id===p.id&&t.status==='agreed'))return blocked('The player already has an agreed future move.');
 if(p.freeAgent)return {blocked:false,multiplier:1,askingPrice:0,reason:'Free agent: no transfer fee.'};
 const seller=owner(c,p),club=league.clubs.find(x=>x.id===seller);
 if(!club||seller===buyerId)return blocked('The player is no longer available from this selling club.');
 const opening=`${Number(c.seasonStart.slice(0,4))+1}${c.seasonStart.slice(4)}`,slots=formationSlots(club.formation);
 const permanent=league.players.filter(x=>owner(c,x)===seller&&!x.academy&&!c.players?.[x.id]?.retired&&!c.players?.[x.id]?.academyOnly&&!c.players?.[x.id]?.unregistered&&!c.loans?.[x.id]);
 const committed=x=>c.futureTransfers?.some(t=>t.id===x.id&&t.status==='agreed'&&t.from===seller&&t.to!==seller&&t.arrival<=opening);
 const retained=permanent.filter(x=>!committed(x)&&(c.players?.[x.id]?.retirementAfterSeason||Infinity)>c.season);
 const pool=future?retained:permanent,remaining=pool.filter(x=>x.id!==p.id),nextRemaining=retained.filter(x=>x.id!==p.id);
 if(remaining.length<18)return blocked(future?'The club would have fewer than 18 permanent players after its confirmed summer departures.':'The club needs to retain at least 18 permanent registered players.');
 const before=coverage(pool,slots),after=coverage(remaining,slots),nextBefore=coverage(retained,slots),nextAfter=coverage(nextRemaining,slots);
 if(after.filled<before.filled||nextAfter.filled<nextBefore.filled)return blocked('The sale would remove essential formation cover, including cover reserved for confirmed departures.');
 if(p.primary==='GK'&&nextRemaining.filter(x=>x.primary==='GK').length<2)return blocked('The club wants to retain two permanent goalkeepers.');
 const affected=[...new Set(slots)].filter(pos=>suitsRole(p,pos));
 const thin=affected.filter(pos=>nextRemaining.filter(x=>suitsRole(x,pos)).length<=slots.filter(x=>x===pos).length);
 const listed=(c.transferList||[]).includes(p.id),days=contractStatus(c,p).days,key=permanent.filter(x=>x.overall>p.overall).length<5,rivals=clubRivals(seller,buyerId),pressure=listed||days<=183;
 if(rivals&&key&&days>366&&!listed)return blocked('The club refuses to sell a key player on a long contract to a rival.');
 const contextPremium=pressure?0:rivals?.30:challenger&&key?.20:key&&days>366?.10:0,coverPremium=thin.length?.15:0,multiplier=1+Math.max(contextPremium,coverPremium),askingPrice=Math.round(transferFee(p,c)*multiplier/10000)*10000;
 const reasons=[];
 if(thin.length)reasons.push('Limited spare cover in '+thin.join(', ')+': the club wants a 15% squad-cover premium.');
 if(contextPremium>coverPremium)reasons.push(rivals?'The club wants a 30% premium for strengthening a rival.':challenger&&key?'The club wants a 20% premium for strengthening a nearby league challenger.':'A key player on a long contract: the club wants a 10% premium.');
 if(pressure)reasons.push(listed?'The player is listed, but squad-cover safeguards still apply.':'The contract is running down, but squad-cover safeguards still apply.');
 if(!reasons.length)reasons.push('The club has retained cover and is open to the estimated fee.');
 return {blocked:false,multiplier,askingPrice,reason:reasons.join(' '),thin,before,after,nextBefore,nextAfter,permanentAfter:remaining.length};
}
