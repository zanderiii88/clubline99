import fs from 'node:fs';
import assert from 'node:assert/strict';
import path from 'node:path';
import {createGame} from './vm-game-harness.mjs';
const build=JSON.parse(fs.readFileSync(new URL('../version.json',import.meta.url))).version,tag=build.split('.').slice(0,2).join('.'),results=[];
for(const id of ['C45','C01','SC11']){
 const url=new URL('../review/varied-careers-'+tag+'-final-'+id+'.json',import.meta.url),e=JSON.parse(fs.readFileSync(url));assert(e.passed);assert.equal(e.summaries.length,2);
 // Keep each season's cumulative activity bounded to that completed season.
 // Older harness snapshots held the same activity array until final output.
 e.summaries.forEach((s,i)=>{s.policy.actions=s.policy.actions.filter(a=>a.season<=i+1);});fs.writeFileSync(url,JSON.stringify(e,null,2));
 const checkpoint=JSON.parse(fs.readFileSync(new URL('../review/checkpoints/varied116/'+id+'.json',import.meta.url))),{g,store,mods,dir}=await createGame(1116);store.set('clubline-career-98-r1',JSON.stringify(checkpoint.backup.save));assert(g.load());const {career:c,source}=g.get(),last=e.summaries.at(-1),policy=last.policy;
 assert.equal(c.season,3);assert.equal(c.aiFunding.season,3);assert.equal(c.intakeSeason,3);assert.equal(c.balance,last.balance);assert.equal(g.weeklyWages(),last.weeklyWages);g.parse(g.backup());
 const funding=mods.get(path.join(dir,'transfer-interest.js')).namespace,aiNet=source.clubs.filter(t=>t.id!==c.clubId).reduce((sum,t)=>sum+funding.clubTransferFunds(c,source,t.id)-t.budget,0);assert.equal(aiNet,c.aiFunding.allocated+policy.managedFeeNet);
 for(const archive of c.archives){const reports=archive.reports;assert.equal(new Set(reports.map(r=>[r.date,r.competition,r.home,r.opponent].join(':'))).size,reports.length);const s=e.summaries[archive.season-1];assert.equal(reports.length,s.matches);assert(reports.every(r=>r.tacticalRecord?.ended));}
 const payrollDates=c.news.filter(n=>n.kind==='wages').map(n=>n.date);assert.equal(new Set(payrollDates).size,payrollDates.length);assert.equal(c.news.filter(n=>n.kind==='world-finance').length,2);
 assert.equal(Object.keys(c.loans).length,0,'Short/season loans end before season three');assert(c.loanHistory.length>=2);assert.equal(new Set(source.players.map(p=>p.id)).size,source.players.length);assert(c.generatedPlayers.every(p=>!/^(FREE-|WORLD-)/.test(p.id)||!p.realName&&!p.parodyName));
 for(const s of Object.values(policy.seasons)){assert(s.loans>=1&&s.callups>=1&&s.promotions>=1&&s.buys>=1&&s.renewals>=1&&s.future>=1,'Each season exercises the intended optional choices');if(policy.style==='trading')assert(s.sales>=1);else assert(s.recalls>=1);}
 const owned=source.players.filter(p=>(c.owners[p.id]||p.clubId)===c.clubId&&!c.players[p.id].retired&&!c.players[p.id].academyOnly&&!c.players[p.id].unregistered);assert(owned.length<=30);
 results.push({id,club:source.clubs.find(t=>t.id===id).name,mode:last.mode,style:policy.style,seasonsCompleted:2,matches:e.summaries.reduce((n,s)=>n+s.matches,0),checkpoints:e.summaries.reduce((n,s)=>n+s.checkpoints,0),seasonThreeDate:c.date,balance:c.balance,minimumObservedCash:policy.minCash,maximumObservedPayroll:policy.maxPayroll,weeklyPayroll:g.weeklyWages(),managedFeeNet:policy.managedFeeNet,annualAIAllocation:c.aiFunding.allocated,aiLedgerNet:aiNet,actions:policy.actions,retiredPlayers:Object.values(c.players).filter(p=>p.retired).length,worldReplacements:c.generatedPlayers.filter(p=>p.id.startsWith('WORLD-')).length,loanReturns:c.loanHistory.length,registeredSquad:owned.length});
 console.log('PASS varied career audit:',id,'two seasons,',results.at(-1).matches,'matches, ledger/loans/contracts/youth/retirement/registration/save checks');
}
const totals={seasons:results.length*2,matches:results.reduce((n,r)=>n+r.matches,0),checkpoints:results.reduce((n,r)=>n+r.checkpoints,0)};
fs.writeFileSync(new URL('../review/career-balance-'+tag+'.json',import.meta.url),JSON.stringify({passed:true,build,environment:'Seeded Node VM with real application handlers and DOM/timer stubs; monthly compressed reload and portable backups; no injected money or offers',scope:'Three clubs, two conservative optional-management policies, two full seasons each. Accounting and interaction reliability; not proof of realistic balance for every strategy or a full browser playthrough.',totals,results},null,2));console.log('PASS combined',JSON.stringify(totals));
