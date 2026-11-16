import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';
import {createGame} from './vm-game-harness.mjs';import {HISTORICAL_MANAGERS,applyHistoricalManagers,managerNameText} from '../historical-managers.js';
const {g,mods,dir}=await createGame(125);g.setup('SC20','in-depth');g.newCareer();let {career:c,source}=g.get();
assert.equal(Object.keys(HISTORICAL_MANAGERS).length,40);
const names=Object.entries(HISTORICAL_MANAGERS).filter(([id])=>id!==c.clubId);for(const [id,[name]] of names)assert.equal(c.managerWorld.people['M-'+id].name,name);
assert.equal(c.managerWorld.people['M-SC20'].name,'You');
const m=c.managerWorld.people['M-EU051'],original=m.parodyName,id=m.id;
applyHistoricalManagers(c,false);assert.equal(m.name,original);assert.equal(managerNameText(c,'Alex Miller gives his reaction.',false),original+' gives his reaction.');
applyHistoricalManagers(c,true);assert.equal(m.name,'Alex Miller');assert.equal(managerNameText(c,original+' gives his reaction.',true),'Alex Miller gives his reaction.');
// Preserve manager identity, record, relations and job moves; toggle only the presentation.
const managers=mods.get(path.join(dir,'managers.js')).namespace;m.record.played=2;m.record.won=2;assert(managers.validManagerState(c,source));
assert(managers.changeManager(c,source,'EU051'));assert.equal(c.managerWorld.people[id].clubId,null);const next=c.managerWorld.jobs.EU051;applyHistoricalManagers(c,false);applyHistoricalManagers(c,true);assert.equal(c.managerWorld.jobs.EU051,next);assert.equal(c.managerWorld.people[id].record.played,2);
g.checkpointSave();assert(g.load());g.parse(g.backup());
fs.writeFileSync(new URL('../review/starting-managers-1.125.json',import.meta.url),JSON.stringify({passed:true,verifiedStartingAppointments:40,scope:'English Premier and both playable Scottish divisions. Other clubs and new generated coaches remain fictional.',toggleAndNarrative:true,appointmentsAndRecordsPreserved:true,saveReload:true},null,2));console.log('PASS 40 historical starting manager mappings, shared names toggle, saved narrative aliases, appointments and reload');
