import assert from 'node:assert/strict';import fs from 'node:fs';
import {createSimulation,stepSimulation,setTactic,STEP} from '../possession-sim.js';
function run(seed,scenario='open',tactic=null){const s=createSimulation({seed,scenario});if(tactic)setTactic(s,0,tactic);while(s.phase!=='ended')stepSimulation(s);return s;}
const a=run(99),b=run(99);assert.deepEqual(a,b,'Replay with identical input must be deterministic');
// A save-style JSON round trip at an arbitrary tick preserves the RNG, flight and future.
const original=createSimulation({seed:112});for(let i=0;i<417;i++)stepSimulation(original);const restored=JSON.parse(JSON.stringify(original));while(original.phase!=='ended')stepSimulation(original);while(restored.phase!=='ended')stepSimulation(restored);assert.deepEqual(restored,original);
// Renderer batching/speed has no influence on the event stream.
const chunked=createSimulation({seed:99});while(chunked.phase!=='ended')for(let i=0;i<8&&chunked.phase!=='ended';i++)stepSimulation(chunked);assert.deepEqual(chunked,a);
const records=[],kinds=new Set();
for(const scenario of ['open','counter','wide'])for(let seed=99;seed<109;seed++){
 const s=createSimulation({seed,scenario});let prior=structuredClone(s);
 while(s.phase!=='ended'){
  stepSimulation(s);assert(s.ball.owner===null||s.players.some(p=>p.id===s.ball.owner));assert(Number.isFinite(s.ball.x)&&Number.isFinite(s.ball.y));
  for(let i=0;i<s.players.length;i++){const p=s.players[i],q=prior.players[i];assert(p.x>=1&&p.x<=104&&p.y>=1&&p.y<=67);if(s.phase==='play'&&prior.phase==='play')assert(Math.hypot(p.x-q.x,p.y-q.y)<=p.pace*STEP+.001,'No live-play teleport');}
  assert.equal(s.score.reduce((n,x)=>n+x,0),s.events.filter(e=>e.type==='goal').length);prior={phase:s.phase,players:s.players.map(p=>({...p}))};
 }
 assert.equal(s.time,s.duration);assert.equal(s.players.length,22);assert(s.stats.every(x=>x.completed<=x.passes));assert(s.stats.reduce((n,x)=>n+x.shots,0)>=s.score.reduce((n,x)=>n+x,0));
 for(const e of s.events){kinds.add(e.type);assert(e.actorId===null||s.players.some(p=>p.id===e.actorId));if(e.receiverId)assert(s.players.some(p=>p.id===e.receiverId));}
 const ended=JSON.stringify(s);stepSimulation(s);assert.equal(JSON.stringify(s),ended,'A finished passage cannot generate more incidents');
 records.push({seed,scenario,score:s.score,shots:s.stats.map(x=>x.shots),passes:s.stats.map(x=>x.completed)});
}
for(const kind of ['pass','complete','interception','tackle','shot','save','goal','miss','recovery','cross'])assert(kinds.has(kind),kind);
assert.notDeepEqual(run(99,'open','wide').events,a.events,'Tactical input must affect choices');
// An in-flight opponent contact changes ownership; moving that defender away does not.
function passingCase(block){const s=createSimulation({seed:77});s.phase='play';s.time=10;s.immunity=99;s.ball={x:50,y:34,owner:null};s.possession=0;s.flight={kind:'pass',team:0,actorId:'0-7',receiverId:'0-10',target:{x:70,y:34},vx:15,vy:0,age:.5,contacted:[]};for(const p of s.players){p.x=p.team?85:20;p.y=5;p.vx=p.vy=0;}const defender=s.players.find(p=>p.id==='1-3');defender.x=block?51:85;defender.y=34;defender.tackle=100;stepSimulation(s);return s;}
assert.equal(passingCase(true).ball.owner,'1-3');assert.equal(passingCase(false).ball.owner,null);
// Drawing/recorded-audio randomness is absent from the model.
const source=fs.readFileSync(new URL('../possession-sim.js',import.meta.url),'utf8');assert(!/Math\.random|localStorage|document\.|window\./.test(source));
fs.writeFileSync(new URL('../review/possession-sim-1.128.json',import.meta.url),JSON.stringify({passed:true,passages:records.length,checks:['deterministic replay','JSON state restoration','speed-independent batching','bounded player motion','one goal per score update','active actors and receivers','contact-driven interception','tactical input changes actions','no events after end'],scope:'Short experimental passages, not season calibration or real-device performance',records},null,2));
console.log('PASS 30 spatial passages, deterministic replay/restore, bounded motion, score ledger and contact-driven interception');
