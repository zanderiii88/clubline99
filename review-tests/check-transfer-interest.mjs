import assert from 'node:assert/strict';
import {buyerAssessment,clubTransferFunds,settleClubFee,transferOfferDay} from '../transfer-interest.js';
import {worldTransferDay} from '../world-transfers.js';
import {formationSlots,FORMATIONS} from '../formations.js';
const player=(id,team,pos,overall=70)=>({id,clubId:team,primary:pos,positions:{[pos]:overall},overall,potential:overall,age:25,wage:1000,contract:3,name:id});
function fixture(){const p=player('target','M','ST',86),players=[p,...formationSlots('4-4-2').map((pos,i)=>player('B'+i,'B',pos))],league={players,clubs:[{id:'M',name:'Managed',budget:10000000,formation:'4-4-2'},{id:'B',name:'Buyer',budget:10000000,formation:'4-4-2'},{id:'P',name:'Poor',budget:1000,formation:'4-4-2'}]},c={clubId:'M',date:'1998-08-03',seasonStart:'1998-08-03',season:1,owners:{},players:{},contracts:{},loans:{},offers:[],news:[],playerChanges:{},generatedPlayers:[],transferList:[],managementMode:'in-depth'};return {c,league,p};}
{
 const {c,league,p}=fixture(),before=JSON.stringify({c,league}),a=buyerAssessment(c,league,p,'B');assert(a.interested&&a.upgrade&&a.openingFee>0);assert(buyerAssessment(c,league,p,'B',a.maxFee).acceptable);assert(!buyerAssessment(c,league,p,'B',a.maxFee+1000).acceptable);assert(!buyerAssessment(c,league,p,'P').interested);assert(!buyerAssessment(c,league,p,'M').interested);assert.equal(JSON.stringify({c,league}),before);
 p.overall=40;p.positions.ST=40;assert(!buyerAssessment(c,league,p,'B').interested);
 p.overall=66;p.positions.ST=66;assert(buyerAssessment(c,league,p,'B').interested,'Useful spare cover');league.players.push(player('extra','B','ST',72));assert(!buyerAssessment(c,league,p,'B').interested,'No redundant weaker reserve');
 league.players.find(x=>x.id==='extra').overall=90;league.players.find(x=>x.id==='extra').positions.ST=90;c.players.extra={retirementAfterSeason:1};assert(buyerAssessment(c,league,p,'B').interested,'Announced retirement opens a pathway');
}
for(const flag of ['academy','retired','retirement','unregistered','loan','future']){const {c,league,p}=fixture();if(flag==='academy')p.academy=true;else if(flag==='retirement')c.players[p.id]={retirementAfterSeason:1};else if(flag==='loan')c.loans[p.id]={parent:'M',to:'B'};else if(flag==='future')c.futureTransfers=[{id:p.id,status:'agreed'}];else c.players[p.id]={[flag]:true};assert(!buyerAssessment(c,league,p,'B').interested,flag);}
{
 const {c,league,p}=fixture();for(let i=0;i<15;i++)league.players.push(player('extra'+i,'B','ST'));assert(!buyerAssessment(c,league,p,'B').interested,'26-player recruitment limit');
}
{
 const {c,league,p}=fixture(),a=buyerAssessment(c,league,p,'B');c.aiBudgets={B:a.reserve+a.openingFee-1000};assert(buyerAssessment(c,league,p,'B').maxFee<a.openingFee);c.aiBudgets.B=a.reserve-1;assert(!buyerAssessment(c,league,p,'B').interested);c.aiBudgets.B=10000000;
 c.aiBudgets.B=a.reserve+1000;assert(!buyerAssessment(c,league,p,'B').interested,'No token bids for unaffordable stars');c.aiBudgets.B=10000000;
 c.offers.push({id:p.id,clubId:'B',fee:a.openingFee,status:'pending'});transferOfferDay(c,league,()=>.99,false);assert.equal(c.offers[0].status,'new');assert.equal(c.owners[p.id],undefined);assert.equal(c.aiBudgets.B,10000000);assert.equal(c.balance,undefined);const count=c.news.length;transferOfferDay(c,league,()=>.99,false);assert.equal(c.news.length,count,'One response only');
 c.offers[0].status='pending';c.offers[0].fee=a.maxFee+1000;transferOfferDay(c,league,()=>.99,false);assert.equal(c.offers[0].status,'rejected');assert(c.news.at(-1).text.includes('valuation'));
}
{
 const {c,league,p}=fixture();transferOfferDay(c,league,()=>0);assert.equal(c.offers.length,1);const o=c.offers[0];assert(buyerAssessment(c,league,p,o.clubId,o.fee).acceptable);transferOfferDay(c,league,()=>0);assert.equal(c.offers.length,1,'No duplicate offer');
 settleClubFee(c,league,'M','B',o.fee);assert.equal(clubTransferFunds(c,league,'B'),10000000-o.fee);assert(!Object.hasOwn(c.aiBudgets,'M'));settleClubFee(c,league,'B','M',o.fee);assert.equal(clubTransferFunds(c,league,'B'),10000000);settleClubFee(c,league,'FREE','B',0);assert(!Object.hasOwn(c.aiBudgets,'FREE'));
}
{
 const {c,league,p}=fixture();c.owners[p.id]='FREE';p.freeAgent=true;worldTransferDay(c,league);assert.equal(c.owners[p.id],'B');assert(!p.freeAgent);assert.equal(c.aiBudgets.B,10000000);assert(c.contracts[p.id]);const before=JSON.stringify({c,league});worldTransferDay(c,league);assert.equal(JSON.stringify({c,league}),before,'Only one monthly transfer');assert(!Object.hasOwn(c.aiBudgets,'M'));
}
for(const [shape,rows]of Object.entries(FORMATIONS)){assert.equal(formationSlots(shape).length,11);assert.deepEqual(formationSlots(shape),rows.flat());}
console.log('PASS transfer interest: useful upgrades/cover, announced departures, valuation and payroll limits, squad cap, unavailability, read-only assessments, deterministic counters, duplicate protection, transfer ledger and monthly free-agent settlement');
