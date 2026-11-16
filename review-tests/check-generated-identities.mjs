import assert from 'node:assert/strict';
import path from 'node:path';
import {createGame} from './vm-game-harness.mjs';
for(const mode of ['streamlined','in-depth']){
 const {g,mods,dir}=await createGame(1116);const api=name=>mods.get(path.join(dir,name+'.js')).namespace;
 g.setup('C01',mode);g.newCareer();g.click('close-owner-welcome');let {career:c,source}=g.get();
 const generated=source.players.filter(p=>p.id.startsWith('FREE-'));assert.equal(generated.length,12);assert(generated.every(p=>!p.realName&&!p.parodyName));const names=new Map(generated.map(p=>[p.id,p.name]));
 api('real-names').applyRealNames(source,false);api('real-names').applyRealNames(source,true);for(const p of generated)assert.equal(p.name,names.get(p.id));
 const veteran=source.players.find(p=>p.clubId==='C02'&&p.primary==='GK');c.players[veteran.id].retired=true;api('world-development').worldRollover(c,source,'1999-08-03');const world=source.players.filter(p=>p.id.startsWith('WORLD-'));assert(world.length);assert(world.every(p=>!p.realName&&!p.parodyName));const worldNames=world.map(p=>p.name);api('real-names').applyRealNames(source,true);assert.deepEqual(world.map(p=>p.name),worldNames);
 // Emulate pre-fix saved template aliases, preserving a recoverable name in one
 // entry and an already overwritten real identity in another.
 const good=c.generatedPlayers.find(p=>p.id===generated[0].id),lost=c.generatedPlayers.find(p=>p.id===generated[1].id);good.realName='David Seaman';good.parodyName='Template Keeper';lost.realName='Lee Dixon';lost.parodyName='Template Defender';lost.name='Lee Dixon';const id=lost.id,skills=JSON.stringify({wage:lost.wage,overall:lost.overall,positions:lost.positions});
 g.checkpointSave();assert(g.load());({career:c,source}=g.get());let restored=c.generatedPlayers.find(p=>p.id===id);assert.notEqual(restored.name,'Lee Dixon');assert.equal(c.generatedPlayers.find(p=>p.id===good.id).name,names.get(good.id));assert.equal(JSON.stringify({wage:restored.wage,overall:restored.overall,positions:restored.positions}),skills);const recovered=restored.name;assert(!restored.realName&&!restored.parodyName);assert.equal(source.players.find(p=>p.id===id).name,recovered);
 g.checkpointSave();assert(g.load());restored=g.get().career.generatedPlayers.find(p=>p.id===id);assert.equal(restored.name,recovered);g.parse(g.backup());
 console.log('PASS generated identities:',mode,'free agents, world replacements, naming toggle, legacy repair, unchanged attributes, repeated compressed reload and backup');
}
