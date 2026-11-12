import assert from 'node:assert/strict';
import path from 'node:path';
import {createGame} from './vm-game-harness.mjs';
const {g,mods,dir,store}=await createGame(1101),funding=mods.get(path.join(dir,'ai-transfer-funding.js')).namespace;
for(const mode of ['streamlined','in-depth']){
 g.setup('C01',mode);g.newCareer();g.click('close-owner-welcome');let {career:c,source}=g.get();c.balance=50000000;
 const p=source.players.find(p=>p.clubId!==c.clubId&&!p.freeAgent&&!p.academy&&!g.sellingPosition(p).blocked&&g.sellingPosition(p).multiplier>1);assert(p);const seller=c.owners[p.id]||p.clubId,balance=c.balance,sellerFunds=c.aiBudgets?.[seller]??source.clubs.find(x=>x.id===seller).budget;
 g.click('bid',{id:p.id});assert.equal(g.review().fee,mods.get(path.join(dir,'transfer-search.js')).namespace.transferFee(p,c),'Opening bid uses career contract discount');assert(g.transferReviewPanel().includes('Permanent registered cover'));g.click('agree-personal-terms');assert(g.review().personalTerms);assert.equal(c.balance,balance);g.click('submit-bid',{id:p.id});let offer=c.offers.find(x=>x.id===p.id&&x.incoming);assert(offer);assert.equal(offer.status,'counter');
 const pool=source.players.filter(x=>(c.owners[x.id]||x.clubId)===seller&&x.id!==p.id&&!c.players[x.id]?.unregistered&&!x.academy&&!c.loans[x.id]);const changed=pool.slice(0,pool.length-17);assert(changed.length);for(const x of changed)c.players[x.id].unregistered=true;assert(g.sellingPosition(p).blocked);g.click('accept-offer',{id:p.id,club:seller,confirm:'true'});assert.equal(c.balance,balance);assert.equal(c.owners[p.id]||p.clubId,seller,'Stale squad-cover approval must not complete');for(const x of changed)c.players[x.id].unregistered=false;
 assert(!g.sellingPosition(p).blocked);const ask=g.sellingPosition(p).askingPrice;offer.fee=ask-10000;g.click('accept-offer',{id:p.id,club:seller,confirm:'true'});assert.equal(offer.fee,ask);assert.equal(c.balance,balance,'Revised fee needs a further confirmation');g.checkpointSave();assert(g.load());({career:c,source}=g.get());g.parse(g.backup());g.click('review-offer',{id:p.id,club:seller});g.click('accept-offer',{id:p.id,club:seller,confirm:'true'});assert.equal(c.owners[p.id],c.clubId);assert.equal(c.balance,balance-ask);assert.equal(c.aiBudgets[seller],sellerFunds+ask);
 g.checkpointSave();assert(g.load());g.parse(g.backup());
 console.log('PASS seller app:',mode,'club explanation, no-spend personal terms/counter, changed-cover refusal, requote/reconfirmation, purchase credit and save/backup');
}
// New summer agreement counts already committed departures before taking money.
g.setup('C01','in-depth');g.newCareer();g.click('close-owner-welcome');{
 const {career:c,source}=g.get();c.balance=50000000;const p=source.players.find(p=>p.clubId!==c.clubId&&p.primary==='ST'&&!p.freeAgent&&!g.sellingPosition(p).blocked);assert(p);const seller=c.owners[p.id]||p.clubId;c.contracts[p.id]={end:'1999-06-30'};g.click('bid',{id:p.id});g.click('agree-personal-terms');assert(g.review().personalTerms);
 const pool=source.players.filter(x=>(c.owners[x.id]||x.clubId)===seller&&!x.academy&&!c.players[x.id].unregistered),others=pool.filter(x=>x.id!==p.id).sort((a,b)=>a.overall-b.overall);for(const x of others.slice(0,pool.length-19))c.players[x.id].unregistered=true;const retirement=others.find(x=>!c.players[x.id].unregistered);c.players[retirement.id].retirementAfterSeason=c.season;
 const before=c.balance;assert(g.sellingPosition(p,{future:true}).blocked);g.click('agree-future-transfer',{id:p.id});assert.equal(c.balance,before);assert.equal((c.futureTransfers||[]).length,0);assert(g.transferReviewPanel().includes('Summer plan:'));
}
// Baseline legacy saves at their present season without a retrospective grant.
g.setup('C01','in-depth');g.newCareer();g.click('close-owner-welcome');{
 let {career:c,source}=g.get();delete c.aiFunding;g.save();assert(g.load());({career:c,source}=g.get());assert.equal(c.aiFunding.season,c.season);assert.equal(c.aiFunding.allocated,0);const balance=c.balance;c.aiFunding.allocated=250000;c.aiBudgets??={};c.aiBudgets.C02=250000;const budget=JSON.stringify(c.aiBudgets);g.checkpointSave();assert(g.load());({career:c,source}=g.get());assert.equal(c.aiFunding.allocated,250000);assert.equal(funding.refreshAIFunding(c,source).total,0);assert.equal(c.balance,balance);assert.equal(JSON.stringify(c.aiBudgets),budget);g.parse(g.backup());
 const b=g.backup();b.save.career.aiFunding.season=c.season+1;assert.throws(()=>g.parse(b));const b2=g.backup();b2.save.career.aiFunding.allocated=-1;assert.throws(()=>g.parse(b2));
}
console.log('PASS future-cover safeguard and legacy funding baseline/reload/backup validation');
