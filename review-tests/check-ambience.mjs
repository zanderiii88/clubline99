import assert from 'node:assert/strict';import fs from 'node:fs';
import {createAmbience,ambienceForGame,AMBIENCE_CATALOGUE} from '../ambience.js';
import {createMatchSoundBridge} from '../match-audio.js';
const career={date:'1998-08-01',season:1,clubId:'home'},base={view:'career',career,panelOpen:false};
assert.equal(ambienceForGame({view:'title',career}),'off');assert.equal(ambienceForGame({...base,fixture:{date:career.date,homeGoals:null}}),'quiet');
for(const sub of ['training','youth','development'])assert.equal(ambienceForGame({...base,panelOpen:true,section:'squad',sub}),'training');
assert.equal(ambienceForGame({...base,panelOpen:true,section:'squad',sub:'training',trainingFocus:'Fitness'}),'gym');
for(const section of ['finances','club','inbox','organiser'])assert.equal(ambienceForGame({...base,panelOpen:true,section}),'office');
assert.equal(ambienceForGame({...base,panelOpen:true,section:'facilities'}),'quiet');
function harness(){
 let now=0,serial=0,seed=123;const pending=new Map(),players=[],starts=[];
 const later=(fn,delay)=>{const id=++serial;pending.set(id,{fn,at:now+delay});return id;},cancel=id=>pending.delete(id);
 class Player{constructor(){this.paused=true;this.src='';this.volume=0;this.listeners={};this.end=null;players.push(this);}addEventListener(t,f){this.listeners[t]=f;}pause(){this.paused=true;if(this.end)cancel(this.end);this.end=null;}play(){this.paused=false;starts.push({at:now,src:this.src,volume:this.volume,player:players.indexOf(this)});if(!this.loop)this.end=later(()=>{this.end=null;this.paused=true;this.listeners.ended?.();},3000);return Promise.resolve();}}
 const engine=createAmbience({makeAudio:()=>new Player(),later,cancel,random:()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;},asset:n=>n});
 function advance(ms){const end=now+ms;let count=0;while(true){const next=[...pending].sort((a,b)=>a[1].at-b[1].at)[0];if(!next||next[1].at>end)break;assert(++count<100000);pending.delete(next[0]);now=next[1].at;next[1].fn();}now=end;}
 return {engine,players,starts,pending,advance,now:()=>now};
}
const h=harness();h.engine.setContext('quiet');h.advance(120000);assert.equal(h.starts.length,0);h.engine.unlock();h.advance(600000);
assert(h.engine.state().floorPlaying);assert.equal(h.starts.filter(s=>s.player===3).length,1);
const ordinary=h.starts.filter(s=>s.player===1);assert(ordinary.length>=7&&ordinary.length<20);assert(ordinary.every(s=>AMBIENCE_CATALOGUE.quiet.includes(s.src)));assert.equal(h.starts.filter(s=>s.player===0).length,0);
for(let i=1;i<ordinary.length;i++){assert(ordinary[i].at-ordinary[i-1].at>=28000);assert(ordinary[i].at-ordinary[i-1].at<=68000);assert.notEqual(ordinary[i].src,ordinary[i-1].src);}
const timers=h.pending.size;for(let i=0;i<500;i++){h.engine.setContext('quiet');h.engine.configure({volume:.25,effectsVolume:.65});h.engine.unlock();}assert.equal(h.pending.size,timers);assert.equal(h.players.length,4);
assert(!h.engine.react({type:'goal',key:'outside',gain:.5}));
const bridge=createMatchSoundBridge(),m={fixtureDate:career.date,home:'home',away:'away',homeGoals:0,awayGoals:0,phase:'confirm',minute:0,events:[]};
const sync=()=>{const p=bridge.observe({...base,match:m});h.engine.setContext(p.mode);p.cues.forEach(c=>h.engine.react(c));return p;};
sync();m.phase='live';let p=sync();assert.deepEqual(p.cues.map(c=>c.type),['kickoff']);h.advance(4000);assert(!h.players[0].paused);
const bedStarts=()=>h.starts.filter(s=>s.player===0).length,once=bedStarts();for(let i=0;i<100;i++)sync();assert.equal(bedStarts(),once);
m.minute=10;m.homeGoals=1;m.paused=true;m.pauseReason='goal';m.events.push({type:'goal',minute:10,team:'home',playerId:'h1'});p=sync();assert.equal(p.cues[0].type,'goal');const homeGain=p.cues[0].gain;assert(h.engine.state().cuePlaying);const count=h.starts.length;sync();assert.equal(h.starts.length,count);
m.paused=false;m.minute=20;m.awayGoals=1;m.events.push({type:'goal',minute:20,team:'away',playerId:'a1'});p=sync();assert(p.cues[0].gain<homeGain);assert.equal(h.starts.filter(s=>s.player===2).at(-1).src.startsWith('goal-'),true);
m.paused=true;m.pauseReason='manual';sync();h.advance(200);assert(h.players.every(x=>x.paused));assert.equal(h.pending.size,0);
m.paused=false;sync();m.minute=30;m.events.push({type:'chance',onTarget:true,minute:30,team:'away'});p=sync();assert.equal(p.cues[0].type,'save');assert(h.starts.at(-1).src.startsWith('applause'));
m.minute=31;m.events.push({type:'chance',onTarget:false,minute:31,team:'home'});assert.equal(sync().cues.length,0);
m.minute=45;m.paused=true;m.pauseReason='half';p=sync();assert.equal(p.mode,'interval');assert.equal(p.cues[0].type,'half');assert.equal(h.starts.at(-1).src,'whistle-half');h.advance(5000);assert(h.players[0].paused);
m.paused=false;m.pauseReason=null;p=sync();assert.equal(p.cues[0].type,'restart');
// Fast forward reveals only the current moment, never a queue of earlier goals.
m.events.push({type:'goal',minute:51,team:'home'},{type:'goal',minute:60,team:'away'},{type:'goal',minute:75,team:'home',playerId:'h2'});m.minute=75;m.homeGoals=3;m.awayGoals=2;m.paused=true;m.pauseReason='skip';p=sync();assert.equal(p.cues.length,1);assert.equal(p.cues[0].type,'goal');
m.minute=94;m.phase='report';p=sync();assert.equal(p.mode,'changing');assert.deepEqual(p.cues.map(c=>c.type),['full']);assert.equal(h.starts.at(-1).src,'whistle-full');assert.equal(sync().cues.length,0);
// Restoring an earlier match baseline clears old audio identity without replay.
const rewind=createMatchSoundBridge(),history={...m,phase:'live',minute:10,events:[{type:'goal',minute:10,team:'home',playerId:'h1'}]};rewind.observe({...base,match:history});history.minute=11;history.events.push({type:'goal',minute:11,team:'home',playerId:'h2'});const oldKey=rewind.observe({...base,match:history}).cues[0].key;history.minute=10;history.events=history.events.slice(0,1);let reset=rewind.observe({...base,match:history});assert(reset.fresh&&reset.cues.length===0);history.minute=11;history.events.push({type:'goal',minute:11,team:'home',playerId:'h2'});assert.notEqual(rewind.observe({...base,match:history}).cues[0].key,oldKey);
const reloaded=createMatchSoundBridge();assert.equal(reloaded.observe({...base,match:m}).cues.length,0);m.phase='live';m.minute=80;const loadedLive=createMatchSoundBridge();assert.equal(loadedLive.observe({...base,match:m}).cues.length,0);
// A newly instant-simulated match has no retrospective goals or full-time cue.
const instant=createMatchSoundBridge();m.phase='confirm';instant.observe({...base,match:m});m.phase='report';assert.equal(instant.observe({...base,match:m}).cues.length,0);
h.engine.setContext('quiet');h.advance(5000);assert(h.players[0].paused&&h.players[2].paused);
for(const mode of ['training','gym','changing','office','prematch']){h.engine.setContext(mode);const at=h.now();h.advance(120000);assert(h.starts.filter(s=>s.at>=at&&s.player===1).every(s=>AMBIENCE_CATALOGUE[mode].includes(s.src)));assert(h.players[0].paused);}
h.engine.setContext('match');h.engine.configure({muted:true,volume:.25,effectsMuted:false,effectsVolume:.65});assert(h.engine.react({type:'goal',key:'fx-only',gain:.5}));assert(h.players[0].paused);h.engine.configure({muted:false,effectsMuted:true,volume:.25,effectsVolume:.65});assert(!h.engine.react({type:'goal',key:'muted-fx',gain:.5}));assert(h.players[2].paused);h.advance(3000);assert(!h.players[0].paused);
h.engine.configure({hidden:true});assert(h.players.every(p=>p.paused));assert.equal(h.pending.size,0);h.engine.configure({hidden:false,volume:.25});h.advance(3000);assert(!h.players[0].paused);h.engine.setContext('off');h.advance(200);assert(h.players.every(p=>p.paused));assert.equal(h.pending.size,0);
const report={passed:true,ordinaryVirtualMinutes:10,ordinaryClips:ordinary.length,ambientPlayers:4,checks:['screen contexts','no crowd from fixture date alone','single schedule through 500 renders','continuous low-level recorded traffic floor','kickoff/half/restart/full','home/away goal balance','save vs off-target chance','manual pause silence','skip highlights without queues','instant simulation silence','reload no replay','independent ambience/FX mute','hidden/page exit stop']};
fs.writeFileSync(new URL('../review/ambience-1.125.json',import.meta.url),JSON.stringify(report,null,2));console.log('PASS contextual recorded ambience',JSON.stringify(report));
