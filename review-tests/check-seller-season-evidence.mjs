import assert from 'node:assert/strict';
import fs from 'node:fs';
const evidence=JSON.parse(fs.readFileSync(new URL('../review/season-reliability-1.101-SC11.json',import.meta.url))),checkpoint=JSON.parse(fs.readFileSync(new URL('../review/checkpoints/SC11.json',import.meta.url))),c=checkpoint.backup.save.career,s=evidence.summaries[0];
assert(evidence.passed);assert.equal(checkpoint.backup.appVersion,'1.101.0');assert.equal(c.season,2);assert.equal(c.aiFunding.season,2);assert(c.aiFunding.allocated>0);assert.equal(c.news.filter(n=>n.kind==='world-finance').length,1,'One annual review at actual rollover');
const reports=c.archives.find(a=>a.season===1).reports;assert.equal(reports.length,s.matches);assert.equal(reports.filter(r=>r.kind==='league').length,36);assert.equal(new Set(reports.map(r=>[r.date,r.competition,r.home,r.opponent].join(':'))).size,reports.length);assert.equal(c.balance,s.balance);
const clubs=new Map(['league','europe-cl','europe-uc','scotland'].flatMap(name=>JSON.parse(fs.readFileSync(new URL(`../data/${name}.json`,import.meta.url))).clubs).map(c=>[c.id,c]));let net=0;
for(const [id,funds]of Object.entries(c.aiBudgets)){assert(id!==c.clubId);assert(clubs.has(id)&&Number.isFinite(funds)&&funds>=0);net+=funds-clubs.get(id).budget;}
assert.equal(net,c.aiFunding.allocated,'AI ledger increase equals board allocations when every managed transfer is declined');
const payroll=c.news.filter(n=>n.kind==='wages').map(n=>n.date);assert.equal(new Set(payroll).size,payroll.length);
fs.writeFileSync(new URL('../review/seller-funding-season-1.101.json',import.meta.url),JSON.stringify({passed:true,scope:'Scottish Streamlined full season, no optional managed transfers; real rollover, funding conservation, unique reports/payrolls and monthly save/backup checks',summary:s,annualFunding:c.aiFunding,aiLedgerNet:net,aiLedgerClubs:Object.keys(c.aiBudgets).length},null,2)+'\n');
console.log('PASS seller/funding season:',s.matches,'matches,',s.checkpoints,'checkpoints; actual season-two allocation applied once and fully accounted for');
