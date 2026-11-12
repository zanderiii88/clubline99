// Run after the full-season suite, while its private checkpoints are available.
import fs from 'node:fs';
import assert from 'node:assert/strict';
const ids=['C45','C01','EU051','SC11'],summaries=[];
for(const id of ids){
 const evidence=JSON.parse(fs.readFileSync(new URL(`../review/season-reliability-1.96-${id}.json`,import.meta.url)));
 const checkpoint=JSON.parse(fs.readFileSync(new URL(`../review/checkpoints/${id}.json`,import.meta.url)));
 assert(evidence.passed);const s=evidence.summaries[0],c=checkpoint.backup.save.career;
 assert.equal(c.season,2);const reports=c.archives.find(a=>a.season===1).reports;
 assert.equal(reports.length,s.matches);
 const key=r=>[r.date,r.competition,r.home,r.opponent].join(':');assert.equal(new Set(reports.map(key)).size,reports.length,'No duplicate managed match reports');
 assert.equal(reports.filter(r=>r.kind==='league').length,id==='C45'?46:id==='C01'?38:36);
 const payrollDates=c.news.filter(n=>n.kind==='wages').map(n=>n.date);assert.equal(new Set(payrollDates).size,payrollDates.length,'No duplicate payroll');
 assert.equal(checkpoint.counts.matches,s.matches);assert.equal(c.balance,s.balance);summaries.push(s);
}
fs.writeFileSync(new URL('../review/season-reliability-1.96.json',import.meta.url),JSON.stringify({passed:true,environment:'Node VM with DOM/timer stubs and seeded RNG; real game handlers; routine saves use plain JSON, actual codec at each checkpoint',policy:'Decline transfers/bookings; no-spend club choices or ordinary expiry; acknowledge required notices',archiveAndPayrollAudit:true,totalMatches:summaries.reduce((n,s)=>n+s.matches,0),totalCheckpoints:summaries.reduce((n,s)=>n+s.checkpoints,0),summaries},null,2));
console.log('PASS completed season evidence: all managed league fixtures, unique match reports/payrolls, archived season one and valid season-two checkpoints');
