import assert from 'node:assert/strict';import fs from 'node:fs';import {createGame} from './vm-game-harness.mjs';import {createMatchSoundBridge} from '../match-audio.js';
let matches=0,goals=0,saves=0;
for(const [mode,seed] of [['streamlined',1231],['in-depth',1232]]){
 const {g}=await createGame(seed);g.setup('C01',mode);g.newCareer();g.click('close-owner-welcome');const f=g.nextFixture();g.get().career.date=f.date;g.startScheduledMatch(f);g.auto();g.beginMatch('watch');
 const bridge=createMatchSoundBridge(),observe=()=>bridge.observe({view:'career',...g.get()});observe();g.confirmSelectedLineup();assert.equal(observe().cues[0].type,'kickoff');
 for(let i=0;i<110&&g.get().match.phase==='live';i++){
  const m=g.get().match;if(m.paused)g.resumeLiveMatch();observe();const count=m.events.length;g.simulateMinute();const plan=observe();
  for(const cue of plan.cues){if(cue.type==='goal'){goals++;assert(m.events.slice(count).some(e=>e.type==='goal'&&e.minute===m.minute));}if(cue.type==='save'){saves++;assert(m.events.slice(count).some(e=>e.type==='chance'&&e.onTarget&&e.minute===m.minute));}}
  assert.equal(observe().cues.length,0);
 }
 assert.equal(g.get().match.phase,'report');assert.equal(new Set(g.get().match.events.filter(e=>e.type==='goal').map(e=>e.minute+':'+e.playerId)).size,g.get().match.events.filter(e=>e.type==='goal').length);matches++;
 g.checkpointSave();g.load();const restored=createMatchSoundBridge();assert.equal(restored.observe({view:'career',...g.get()}).cues.length,0);
 // Instant simulation never becomes a sound queue.
 g.newCareer();g.click('close-owner-welcome');const next=g.nextFixture();g.get().career.date=next.date;g.startScheduledMatch(next);g.auto();const quick=createMatchSoundBridge();quick.observe({view:'career',...g.get()});g.beginMatch('simulate');assert.equal(quick.observe({view:'career',...g.get()}).cues.length,0);
 console.log('PASS real match sound events',mode);
}
assert(goals>0&&saves>0);const report={passed:true,watchedMatches:matches,goalCues:goals,saveCues:saves,instantSimulations:2,scope:'Actual match engine events fed to the sound bridge; no browser listening claim.'};fs.writeFileSync(new URL('../review/match-audio-app-1.123.json',import.meta.url),JSON.stringify(report,null,2));console.log(JSON.stringify(report));
