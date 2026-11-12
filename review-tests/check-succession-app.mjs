import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createGame} from './vm-game-harness.mjs';
const {g,mods,dir}=await createGame(199);
const invariants=c=>JSON.stringify({balance:c.balance,lineup:c.lineup,bench:c.bench,players:c.players,owners:c.owners,loans:c.loans,contracts:c.contracts,prospects:c.prospects,futureTransfers:c.futureTransfers,generatedPlayers:c.generatedPlayers});
for(const mode of ['streamlined','in-depth']){
 g.setup('C01',mode);g.newCareer();g.click('close-owner-welcome');let c=g.get().career;
 const before=invariants(c),plan=g.plan(),markup=g.successionSection();assert(markup.includes('Squad succession'));assert(markup.includes('Without renewal-risk options'));assert.equal(invariants(c),before);
 g.click('route',{section:'squad',sub:'succession'});assert.equal(g.routeSnapshot().sub,'succession');assert((mode==='streamlined'?g.streamlinedWorkspace():g.squadSection()).includes('Formation roles'));
 const prospect=c.prospects.find(p=>!p.promoted);assert(prospect);const academy=markup.split('Academy pathway').slice(1).join('Academy pathway');assert(!academy.includes('Current ability: '+prospect.overall));
 const senior=plan.rows.find(r=>r.senior.length>1);assert(senior);const candidate=senior.senior.find(x=>x.id!==senior.reference)||senior.senior[0];
 g.click('succession-compare',{player:candidate.id,reference:senior.reference});assert.equal(g.routeSnapshot().comparisonOther,candidate.id===senior.reference?null:candidate.id);assert(g.comparisonPanel().includes('Player comparison'));g.click('comparison-close');
 g.click('succession-search',{role:'CB'});assert.equal(g.routeSnapshot().transferFilters.position,'CB');assert.equal(g.routeSnapshot().sub,mode==='streamlined'?'stream-market':'transfers');assert.equal(invariants(c),before,'Review actions must not spend or change squads');
 g.click('succession-search',{role:'invalid'});assert.equal(g.routeSnapshot().transferFilters.position,'CB');
 g.checkpointSave();assert(g.load());c=g.get().career;assert.deepEqual(JSON.parse(JSON.stringify(g.plan())),JSON.parse(JSON.stringify(plan)));g.parse(g.backup());
 const youth=c.prospects.find(p=>!p.promoted&&!p.calledUp),dev=mods.get(path.join(dir,'development.js')).namespace;assert.equal(dev.callUpProspect(c,g.get().source,youth.id),null);const youthBefore=invariants(c);g.successionSection();g.click('succession-compare',{player:youth.id,reference:senior.reference});assert.equal(g.routeSnapshot().comparisonPlayer,null,'A succession link must not expose an unpromoted academy profile');assert.equal(invariants(c),youthBefore);g.checkpointSave();g.parse(g.backup());assert(g.load());
 console.log('PASS succession app:',mode,'entry route, plan rendering, comparisons, position-filtered recruitment, unchanged squad/finance state and save/reload');
}
// The same model handles every English and Scottish data club, including the
// lower clubs not selectable for a managed career.
const data=['league','scotland'].map(name=>JSON.parse(fs.readFileSync(new URL(`../data/${name}.json`,import.meta.url))));
const league={clubs:data.flatMap(d=>d.clubs),players:data.flatMap(d=>d.players)};
const {successionPlan}=await import('../succession-planning.js');
for(const club of league.clubs){const c={clubId:club.id,season:1,seasonStart:club.id.startsWith('SC')||club.id.startsWith('EU')?'1998-07-27':'1998-08-03',date:'1998-08-03',players:{},owners:{},loans:{},contracts:{},prospects:[]},before=JSON.stringify(c);const p=successionPlan(c,league,['GK','LB','CB','CB','RB','CM','CM','LW','RW','ST','ST']);assert.equal(new Set(p.retainedXI.lineup.filter(Boolean)).size,p.retainedXI.filled);assert(p.retainedXI.filled<=11);assert.equal(JSON.stringify(c),before);}
console.log('PASS succession data coverage:',league.clubs.length,'English/Scottish clubs');
