import assert from 'node:assert/strict';
import fs from 'node:fs';
const clubs=new Map(['league','scotland','europe-cl','europe-uc'].flatMap(name=>JSON.parse(fs.readFileSync(new URL(`../data/${name}.json`,import.meta.url))).clubs).map(c=>[c.id,c]));
const summaries=[];
for(const id of ['C01','SC11']){
 const result=JSON.parse(fs.readFileSync(new URL(`../review/season-reliability-1.100-${id}.json`,import.meta.url))),checkpoint=JSON.parse(fs.readFileSync(new URL(`../review/checkpoints/${id}.json`,import.meta.url)));
 assert(result.passed);assert.equal(checkpoint.backup.appVersion,'1.100.0');const c=checkpoint.backup.save.career,s=result.summaries[0],reports=c.archives.find(x=>x.season===1).reports;assert.equal(c.season,2);assert.equal(reports.length,s.matches);assert.equal(reports.filter(r=>r.kind==='league').length,id==='C01'?38:36);assert.equal(new Set(reports.map(r=>[r.date,r.competition,r.home,r.opponent].join(':'))).size,reports.length);assert.equal(c.balance,s.balance);assert.equal(checkpoint.counts.matches,s.matches);
 let net=0;for(const [team,funds]of Object.entries(c.aiBudgets||{})){assert(clubs.has(team));assert(team!==c.clubId);assert(Number.isFinite(funds)&&funds>=0);net+=funds-clubs.get(team).budget;}
 assert(Math.abs(net)<.01,'AI transfer ledger conserves fees when the managed club declines every offer');
 const payroll=c.news.filter(n=>n.kind==='wages').map(n=>n.date);assert.equal(new Set(payroll).size,payroll.length);const worldDeals=c.news.filter(n=>n.kind==='world-transfer');assert(worldDeals.length>0);assert.equal(new Set(worldDeals.map(n=>n.date.slice(0,7))).size,worldDeals.length,'At most one monthly world transfer');
 summaries.push({...s,worldDeals:worldDeals.length,aiLedgerClubs:Object.keys(c.aiBudgets||{}).length,aiLedgerNet:net});
}
fs.writeFileSync(new URL('../review/transfers-season-audit-1.100.json',import.meta.url),JSON.stringify({passed:true,scope:'Full-season runs with no managed transfer spending; AI ledger conservation, unique reports/payrolls, monthly world transfers and season-two rollover',totalMatches:summaries.reduce((n,x)=>n+x.matches,0),totalCheckpoints:summaries.reduce((n,x)=>n+x.checkpoints,0),summaries},null,2)+'\n');
console.log('PASS transfer season audit:',summaries.reduce((n,x)=>n+x.matches,0),'matches; conserved AI transfer fees, unique reports/payrolls and season-two rollover');
