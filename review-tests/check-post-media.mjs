import assert from 'node:assert/strict';
import {mediaDay,refreshMedia,respondMedia,settleMediaResults,postMatchMedia,validMedia,mediaChoices,managerPersonality,PERSONALITIES} from '../manager-media.js';
const league={clubs:[{id:'C01'},{id:'C18'},{id:'C02'}]};
function scenario(us,them,penalties=false){
 const c={season:1,date:'1998-08-12',clubId:'C01',balance:10000,schedule:[{date:'1998-08-15',fixtures:[{home:'C01',away:'C18',competition:'premier',homeGoals:null,awayGoals:null}]}],news:[],clubLife:{morale:50,supporters:50},managerWorld:{people:{M18:{id:'M18',name:'Alex Test',clubId:'C18'},M2:{id:'M2',name:'New Coach',clubId:'C02'}},jobs:{C18:'M18',C02:'M2'}}};
 const pre=mediaDay(c,league);respondMedia(c,pre.key,'respect');c.date='1998-08-15';Object.assign(c.schedule[0].fixtures[0],{homeGoals:us,awayGoals:them});
 const r={date:c.date,competition:'premier',homeId:'C01',awayId:'C18',opponent:'C18',us,them,friendly:false,...(penalties?{penalties:{home:3,away:4},winner:'C18'}:{})};
 settleMediaResults(c);return {c,r};
}
for(const [us,them,outcome] of [[2,0,'win'],[1,1,'draw'],[0,2,'loss']]){
 const {c,r}=scenario(us,them),before=JSON.stringify(c.clubLife),e=postMatchMedia(c,league,r);assert(e);assert.equal(e.result.outcome,outcome);assert.equal(JSON.stringify(c.clubLife),before);assert(validMedia(c,league));
 assert.equal(postMatchMedia(c,league,r),null,'Reload/render cannot create a duplicate follow-up');assert.equal(mediaChoices(e).length,5);
 for(const o of mediaChoices(e)){
  const trial=structuredClone(c),response=respondMedia(trial,e.key,o.id);assert(!response.error);assert.equal(response.event.settled,true);assert(validMedia(trial,league));assert.equal(trial.balance,10000);
  const snapshot=JSON.stringify(trial);settleMediaResults(trial);assert.equal(JSON.stringify(trial),snapshot,'No second result penalty after post-match answer');assert(respondMedia(trial,e.key,o.id).error);
  if(o.id==='none'||o.id==='neutral')assert.equal(JSON.stringify(trial.clubLife),before);
 }
 const nextDay=structuredClone(c);nextDay.date='1998-08-16';assert(!respondMedia(nextDay,e.key,'respect').error);assert(validMedia(nextDay,league));
 const late=structuredClone(c);late.date='1998-08-18';mediaDay(late,league);assert.equal(late.managerMedia.events.at(-1).status,'expired');assert(respondMedia(late,e.key,'respect').error);
 const rolled=structuredClone(c);rolled.season=2;refreshMedia(rolled,league);assert.equal(rolled.managerMedia.events.at(-1).status,'expired');assert.equal(JSON.stringify(rolled.clubLife),before);
 const disabled=structuredClone(c);disabled.managerMedia.enabled=false;mediaDay(disabled,league);assert.equal(disabled.managerMedia.events.at(-1).status,'expired');assert.equal(JSON.stringify(disabled.clubLife),before);
 const moved=structuredClone(c);moved.managerWorld.jobs.C18='M2';moved.managerWorld.people.M18.clubId='C02';moved.managerWorld.people.M2.clubId='C18';moved.managerWorld.jobs.C02='M18';assert(!respondMedia(moved,e.key,'respect').error,'Comments concern the manager who coached the match');assert.equal(moved.managerMedia.events.at(-1).managerId,'M18');
 for(const mutate of [e=>e.deadline='1998-09-15',e=>e.result.outcome='other',e=>e.result.us=-1,e=>e.personality='unknown',e=>e.key=e.key.slice(0,-5)]){const bad=structuredClone(c);mutate(bad.managerMedia.events.at(-1));assert.equal(validMedia(bad,league),false);}
}
let {c,r}=scenario(1,1,true);let e=postMatchMedia(c,league,r);assert.equal(e.result.outcome,'loss');assert(e.result.penalties);
({c,r}=scenario(2,0));c.managerMedia.events[0].choice='none';assert.equal(postMatchMedia(c,league,r),null,'No comment avoids the follow-up for that match');
({c,r}=scenario(2,0));c.managerMedia.enabled=false;assert.equal(postMatchMedia(c,league,r),null);
({c,r}=scenario(2,0));r.friendly=true;assert.equal(postMatchMedia(c,league,r),null);
({c,r}=scenario(2,0));c.managerMedia.lastPostCreated='1998-08-12';assert.equal(postMatchMedia(c,league,r),null,'Post questions have their own seven-day cooldown');
assert.equal(new Set(Array.from({length:40},(_,i)=>managerPersonality('M'+i))).size,4);for(const id of ['M18','M2','M3']){assert(PERSONALITIES.includes(managerPersonality(id)));assert.equal(managerPersonality(id),managerPersonality(id));}
console.log('PASS post-match media: win/draw/loss/penalties, five responses, no duplicate result effects, neutral choices, deadline/opt-out, stable coach identity, cooldown, malformed saves and four stable press styles');
