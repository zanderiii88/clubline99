import assert from 'node:assert/strict';
import path from 'node:path';
import {createGame} from './vm-game-harness.mjs';
const {g,mods,dir}=await createGame(1100),policy=mods.get(path.join(dir,'transfer-interest.js')).namespace;
for(const mode of ['streamlined','in-depth']){
 g.setup('C01',mode);g.newCareer();g.click('close-owner-welcome');let {career:c,source}=g.get();
 const p=source.players.filter(p=>p.clubId===c.clubId&&!p.academy).sort((a,b)=>b.overall-a.overall)[0];
 let buyer=source.clubs.find(b=>{const a=policy.buyerAssessment(c,source,p,b.id);return a.interested&&a.maxFee>=a.openingFee+1000;});assert(buyer,'At least one sensible bidder for an elite player');
 let a=policy.buyerAssessment(c,source,p,buyer.id),fee=a.openingFee,balance=c.balance,budget=policy.clubTransferFunds(c,source,buyer.id),weekly=g.weeklyWages();
 c.offers.push({id:p.id,clubId:buyer.id,fee,status:'new'});g.click('review-offer',{id:p.id,club:buyer.id});const markup=g.transferReviewPanel();assert(markup.includes('Buying club assessment')&&markup.includes('Review succession plan'));assert.equal(c.balance,balance);assert.equal(policy.clubTransferFunds(c,source,buyer.id),budget);
 g.click('sale-succession');assert.equal(g.review(),null);assert.equal(g.routeSnapshot().sub,'succession');g.click('review-offer',{id:p.id,club:buyer.id});g.fields('[data-counter-fee]',fee+1000);g.click('counter-offer',{id:p.id,club:buyer.id});assert.equal(c.offers.at(-1).status,'pending');policy.transferOfferDay(c,source,()=>.99,false);assert.equal(c.offers.at(-1).status,'new');fee+=1000;
 g.checkpointSave();assert(g.load());({career:c,source}=g.get());const offer=c.offers.find(o=>o.id===p.id);assert(offer.feedback);g.parse(g.backup());
 g.click('review-offer',{id:p.id,club:buyer.id});g.click('accept-offer',{id:p.id,club:buyer.id});assert.equal(c.owners[p.id],buyer.id);assert.equal(c.balance,balance+fee);assert.equal(c.aiBudgets[buyer.id],budget-fee);assert(g.weeklyWages()<weekly);assert.equal(c.offers.some(o=>o.id===p.id),false);assert(c.playerChanges[p.id].contract===3);const after=JSON.stringify(c.aiBudgets),cash=c.balance;g.click('accept-offer',{id:p.id,club:buyer.id});assert.equal(JSON.stringify(c.aiBudgets),after);assert.equal(c.balance,cash);
 g.checkpointSave();assert(g.load());({career:c,source}=g.get());assert.equal(c.aiBudgets[buyer.id],budget-fee);g.parse(g.backup());
 // A competing purchase can make an old offer unaffordable. Acceptance must
 // recheck without changing ownership or granting cash to the managed club.
 const next=source.players.find(x=>(c.owners[x.id]||x.clubId)===c.clubId&&!x.academy&&source.clubs.some(b=>policy.buyerAssessment(c,source,x,b.id).interested));assert(next);
 buyer=source.clubs.find(b=>policy.buyerAssessment(c,source,next,b.id).interested);a=policy.buyerAssessment(c,source,next,buyer.id);c.offers.push({id:next.id,clubId:buyer.id,fee:a.openingFee,status:'new'});c.aiBudgets[buyer.id]=0;const before=c.balance;g.click('accept-offer',{id:next.id,club:buyer.id});assert.equal(c.balance,before);assert.equal(c.owners[next.id]||next.clubId,c.clubId);assert.equal(c.offers.at(-1).status,'rejected');
 // Seller proceeds from a managed-club purchase join the same ledger.
 const target=source.players.find(x=>(c.owners[x.id]||x.clubId)!==c.clubId&&!x.academy&&!x.freeAgent&&!c.players[x.id].unregistered&&!c.loans[x.id]&&!g.sellingPosition(x).blocked);const seller=c.owners[target.id]||target.clubId,sellerFunds=policy.clubTransferFunds(c,source,seller),purchaseFee=g.sellingPosition(target).askingPrice;c.balance=50000000;g.resolveTransfer(target.id,c.clubId,purchaseFee,{wage:target.wage,years:2});assert.equal(c.aiBudgets[seller],sellerFunds+purchaseFee);
 g.checkpointSave();assert(g.load());g.parse(g.backup());
 console.log('PASS transfer app:',mode,'review, counter, saved response, sale, budget/payroll settlement, repeat protection, stale buyer withdrawal, purchase credit and backup');
}
// Refund only the ledger entries introduced by this build. Legacy agreements
// did not credit the seller, so cancelling them must not debit that seller.
for(const ledgerPaid of [true,false]){
 g.setup('C01','in-depth');g.newCareer();g.click('close-owner-welcome');const {career:c,source}=g.get(),p=source.players.find(x=>x.clubId==='C02');const funds=policy.clubTransferFunds(c,source,'C02'),balance=c.balance;
 c.futureTransfers=[{id:p.id,from:'C02',to:c.clubId,fee:100000,wage:1000,years:2,arrival:c.date,status:'agreed',...(ledgerPaid?{ledgerPaid:true}:{})}];c.balance-=100000;if(ledgerPaid)policy.settleClubFee(c,source,'C02',c.clubId,100000);c.players[p.id].retired=true;g.settleFutureTransfers();assert.equal(c.balance,balance);assert.equal(policy.clubTransferFunds(c,source,'C02'),funds);g.settleFutureTransfers();assert.equal(c.balance,balance);
}
g.setup('C01','in-depth');g.newCareer();let backup=g.backup();backup.save.career.aiBudgets={C02:NaN};assert.throws(()=>g.parse(backup));backup=g.backup();backup.save.career.aiBudgets={UNKNOWN:500};assert.throws(()=>g.parse(backup));console.log('PASS transfer ledger validation and legacy/new future-transfer refunds');

backup=g.backup();const legacyTarget=g.get().source.players.find(p=>p.clubId==='C02');backup.save.career.futureTransfers=[{id:legacyTarget.id,from:'C02',to:'C01',fee:1000,arrival:'1999-07-01',status:'agreed',ledgerPaid:'yes'}];assert.throws(()=>g.parse(backup));
