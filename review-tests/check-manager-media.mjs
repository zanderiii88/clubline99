import assert from 'node:assert/strict';
import {initialiseMedia,mediaDay,respondMedia,settleMediaResults,validMedia,mediaChoices,clubRivals} from '../manager-media.js';
const league={clubs:[{id:'C01'},{id:'C18'},{id:'C02'}]};
const base=()=>({season:1,date:'1998-08-12',clubId:'C01',balance:10000,schedule:[{date:'1998-08-15',fixtures:[{home:'C01',away:'C18',competition:'premier',kind:'league',homeGoals:null,awayGoals:null}]}],news:[],clubLife:{morale:50,supporters:50},managerWorld:{people:{M18:{id:'M18',name:'Alex Test',clubId:'C18'},M2:{id:'M2',name:'New Manager',clubId:'C02'}},jobs:{C18:'M18',C02:'M2'}}});
assert(clubRivals('C01','C18')&&clubRivals('C18','C01'));assert(!clubRivals('C01','C01'));assert(!clubRivals('C01','C02'));
let c=base(),e=mediaDay(c,league);assert(e.derby);assert.equal(c.clubLife.morale,50);assert.equal(c.balance,10000);assert.equal(mediaDay(c,league),null);assert(validMedia(c,league));
assert.equal(mediaChoices(e).length,5);
const matchdayOnly=base();matchdayOnly.date='1998-08-15';assert.equal(mediaDay(matchdayOnly,league),null);assert.equal(matchdayOnly.managerMedia.events.length,0);
for(const choice of mediaChoices(e)){
 const trial=structuredClone(c),r=respondMedia(trial,e.key,choice.id);assert(!r.error);assert(validMedia(trial,league));assert.equal(trial.balance,10000);
 const before=JSON.stringify(trial);assert(respondMedia(trial,e.key,choice.id).error);assert.equal(JSON.stringify(trial),before);
 if(choice.id==='none'||choice.id==='neutral')assert.deepEqual(trial.clubLife,{morale:50,supporters:50});
 if(choice.id==='provoke')assert.equal(trial.managerMedia.relationships.M18,-3);
}
// A bold claim is followed up once on defeat, with the actual capped effects.
respondMedia(c,e.key,'provoke');c.schedule[0].fixtures[0].homeGoals=0;c.schedule[0].fixtures[0].awayGoals=1;c.date='1998-08-15';settleMediaResults(c);
assert.equal(c.clubLife.morale,49);assert.equal(c.clubLife.supporters,50);assert.equal(e.followUp.morale,-2);assert.equal(e.followUp.supporters,-1);assert(validMedia(c,league));const after=JSON.stringify(c);settleMediaResults(c);assert.equal(JSON.stringify(c),after);
c=base();e=mediaDay(c,league);respondMedia(c,e.key,'confident');Object.assign(c.schedule[0].fixtures[0],{homeGoals:1,awayGoals:1,penalties:{home:3,away:4},winner:'C18'});c.date='1998-08-15';settleMediaResults(c);assert.equal(e.followUp.morale,-1);assert(validMedia(c,league));
c=base();e=mediaDay(c,league);Object.assign(c.schedule[0].fixtures[0],{homeGoals:0,awayGoals:0});c.date='1998-08-15';settleMediaResults(c);assert.equal(e.status,'expired');assert.deepEqual(c.clubLife,{morale:50,supporters:50});assert(validMedia(c,league));
// A draw, win or no-comment defeat never creates an extra result penalty.
for(const [home,away,choice] of [[1,1,'confident'],[2,1,'provoke'],[0,2,'none']]){c=base();e=mediaDay(c,league);respondMedia(c,e.key,choice);const reaction=structuredClone(c.clubLife);Object.assign(c.schedule[0].fixtures[0],{homeGoals:home,awayGoals:away});c.date='1998-08-15';settleMediaResults(c);assert.deepEqual(c.clubLife,reaction);assert(validMedia(c,league));}
// Effects do not create unlimited morale or goodwill through repeat interviews.
c=base();e=mediaDay(c,league);c.managerMedia.totals={morale:3,supporters:3};const response=respondMedia(c,e.key,'confident');assert.equal(response.event.changes.morale,0);assert.equal(response.event.changes.supporters,0);
c=base();e=mediaDay(c,league);c.clubLife={morale:100,supporters:100};respondMedia(c,e.key,'provoke');assert.deepEqual(e.changes,{morale:0,supporters:0,relationship:-3});
// Expiry, opt-out, manager replacement and load idempotence.
for(const reason of ['late','played','disabled','manager']){c=base();e=mediaDay(c,league);if(reason==='late')c.date='1998-08-16';if(reason==='played')c.schedule[0].fixtures[0].homeGoals=1;if(reason==='disabled')c.managerMedia.enabled=false;if(reason==='manager'){c.managerWorld.jobs.C18='M2';c.managerWorld.people.M2.clubId='C18';}mediaDay(c,league);assert.equal(e.status,'expired');assert(respondMedia(c,e.key,'respect').error);assert.deepEqual(c.clubLife,{morale:50,supporters:50});assert(validMedia(c,league));}
c=base();e=mediaDay(c,league);e.deferred=true;c=JSON.parse(JSON.stringify(c));assert.equal(mediaDay(c,league),null);assert.equal(c.managerMedia.events.length,1);assert(c.managerMedia.events[0].deferred);
// Stable manager IDs carry the relationship through a change of club.
respondMedia(c,e.key,'provoke');c.managerMedia.relationships.M18=-5;c.date='1998-09-12';c.managerWorld.jobs={C18:'M2',C02:'M18'};c.managerWorld.people.M18.clubId='C02';c.managerWorld.people.M2.clubId='C18';c.schedule=[{date:'1998-09-15',fixtures:[{home:'C01',away:'C02',competition:'premier',homeGoals:null,awayGoals:null}]}];e=mediaDay(c,league);assert(e);assert.equal(e.managerId,'M18');assert.equal(e.type,'comment');assert(e.quote.includes('enough talk'));assert(validMedia(c,league));
const bad=mutate=>{const x=structuredClone(c);mutate(x.managerMedia);assert.equal(validMedia(x,league),false);};
bad(s=>s.relationships.M18=11);bad(s=>s.totals.morale=4);bad(s=>s.events.push(structuredClone(s.events[0])));bad(s=>s.events.at(-1).managerId='missing');bad(s=>s.events.at(-1).settled=true);bad(s=>s.enabled='yes');bad(s=>s.events.at(-1).choice='provoke');
assert(validMedia({...base(),managerMedia:undefined},league));
console.log('PASS manager media: rivalry sharing, five responses, no automatic effects/spending, duplicate protection, result follow-ups, capped reactions, opt-out, expiry, replacement, persistent manager relationships and invalid saves');
