import assert from 'node:assert/strict';
import {successionPlan} from '../succession-planning.js';
const roles=['GK','LB','CB','RB','DM','CM','AM','LW','RW','ST'];
const player=(id,primary,extra={})=>({id,name:id,clubId:'A',primary,age:25,overall:70,potential:90,contract:3,positions:Object.fromEntries(roles.map(pos=>[pos,pos===primary?70:extra[pos]||10])),wage:1000});
const pool=[player('g','GK'),player('cb1','CB'),player('utility','CB',{LB:65}),player('lb','LB'),player('cm1','CM'),player('cm2','CM'),player('st','ST')];
const slots=['GK','CB','CB','LB','CM','CM','ST'];
const state=()=>({clubId:'A',season:1,seasonStart:'1998-08-03',date:'1998-08-03',players:{},owners:{},loans:{},contracts:{},prospects:[],futureTransfers:[]});
const league={clubs:[{id:'A',youth:3}],players:pool};
let c=state(),p=successionPlan(c,league,slots);assert.equal(p.currentXI.filled,7);assert.equal(p.retainedXI.filled,7);
c.players.cb1={retirementAfterSeason:1};c.players.lb={retirementAfterSeason:1};const before=JSON.stringify({c,league});p=successionPlan(c,league,slots);
assert.equal(p.retainedXI.filled,5);assert.equal(p.rows.reduce((n,r)=>n+r.futureGap,0),2);assert.equal(new Set(p.retainedXI.lineup.filter(Boolean)).size,5,'Versatile player fills one place');assert.equal(JSON.stringify({c,league}),before,'Planning is read-only');
c.contracts.cm1={end:'1999-06-30'};p=successionPlan(c,league,slots);assert.equal(p.retainedXI.filled,5);assert.equal(p.renewalRiskXI.filled,4);assert(p.renewalIds.includes('cm1'));
c.contracts.cm1={end:'1998-06-30'};p=successionPlan(c,league,slots);assert.equal(p.retainedXI.filled,5,'Rolling terms are not an automatic departure');
c.players.cm1={injuryDays:10};p=successionPlan(c,league,slots);assert.equal(p.currentXI.filled,6);assert.equal(p.retainedXI.filled,5,'Future scenarios do not project present fitness');
c.players.cb1.retirementAfterSeason=2;p=successionPlan(c,league,slots);assert.equal(p.retainedXI.filled,6,'A next-season retirement still leaves the player at next opening');
// Loans, registration and arrivals are separate possibilities, not promised XI places.
const loan=player('loan','CB'),held=player('held','LB'),arrival={...player('arrival','CB'),clubId:'B'},prospect={...player('young','CB'),age:17,potential:99,academy:true};
const extended={...league,players:[...pool,loan,held,arrival]};c=state();c.players.cb1={retirementAfterSeason:1};c.players.lb={retirementAfterSeason:1};c.owners.loan='B';c.loans.loan={parent:'A',to:'B',end:'1999-06-30'};c.players.held={unregistered:true};c.prospects=[prospect];c.futureTransfers=[{id:'arrival',from:'B',to:'A',arrival:'1999-07-01',status:'agreed'}];
p=successionPlan(c,extended,slots);let cb=p.rows.find(r=>r.pos==='CB');assert.equal(p.retainedXI.filled,5);assert(cb.returning.some(x=>x.id==='loan'));assert(cb.arrivals.some(x=>x.id==='arrival'));assert(p.rows.find(r=>r.pos==='LB').registration.some(x=>x.id==='held'));assert(cb.academy.some(x=>x.id==='young'));assert(!('overall' in cb.academy[0])&&!('potential' in cb.academy[0]));assert.deepEqual(Object.keys(cb.arrivals[0]).sort(),['date','id']);
c.loans.loan.end='2000-06-30';assert.equal(successionPlan(c,extended,slots).rows.find(r=>r.pos==='CB').returning.length,0);
c.futureTransfers.push({id:'utility',from:'A',to:'B',arrival:'1999-07-01',status:'agreed'});p=successionPlan(c,extended,slots);assert.equal(p.retainedXI.filled,4);assert(p.departures.some(x=>x.id==='utility'&&x.transfer));c.futureTransfers.at(-1).status='cancelled';assert.equal(successionPlan(c,extended,slots).retainedXI.filled,5);
c.seasonStart='1998-07-27';assert.equal(successionPlan(c,extended,slots).opening,'1999-07-27');
// A temporary call-up can fill today's team without becoming a permanent successor.
c=state();const call={...prospect,calledUp:true};c.prospects=[call];const callLeague={clubs:league.clubs,players:[call]};p=successionPlan(c,callLeague,['CB']);assert.equal(p.currentXI.filled,1);assert.equal(p.retainedXI.filled,0);assert(p.rows[0].academy[0].calledUp);assert.equal(p.rows[0].senior.length,0);
c=state();const oddGK=player('keeper','GK',{ST:90}),oddST=player('forward','ST',{GK:90});p=successionPlan(c,{clubs:league.clubs,players:[oddGK,oddST]},['GK','GK','ST','ST']);assert.equal(p.currentXI.filled,2);assert.equal(p.currentXI.lineup.filter(x=>x==='keeper').length,1);assert.equal(p.currentXI.lineup.filter(x=>x==='forward').length,1);
c=state();pool[1].age=36;p=successionPlan(c,league,slots);assert.equal(p.retainedXI.filled,7,'Age watch does not invent a retirement');assert(p.rows.find(r=>r.pos==='CB').ageWatch.includes('cb1'));
console.log('PASS succession: distinct-player formation coverage, joint departures, contract scenarios and rolling terms, loans/arrivals/registration, academy privacy, temporary call-ups, fitness separation, age watch, goalkeeper roles, opening dates and no mutation');
