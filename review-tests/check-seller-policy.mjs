import assert from 'node:assert/strict';
import {sellerAssessment} from '../seller-assessment.js';
const player=(id,pos,rating=70)=>({id,clubId:'S',name:id,primary:pos,positions:{[pos]:rating},overall:rating,potential:rating,age:25,wage:1000,contract:3});
function fixture(){const roles={GK:3,LB:2,CB:3,RB:2,CM:3,LW:2,RW:2,ST:4},players=Object.entries(roles).flatMap(([pos,count])=>Array.from({length:count},(_,i)=>player(pos+i,pos)));const c={clubId:'M',season:1,seasonStart:'1998-08-03',date:'1998-08-03',owners:{},players:{},loans:{},contracts:{},futureTransfers:[],transferList:[]},league={clubs:[{id:'M',formation:'4-4-2'},{id:'S',formation:'4-4-2'}],players};return {c,league,p:players.find(p=>p.id==='ST0')};}
{
 const {c,league,p}=fixture(),before=JSON.stringify({c,league}),a=sellerAssessment(c,league,p,'M');assert(!a.blocked);assert(a.askingPrice>0);assert.equal(JSON.stringify({c,league}),before);
 league.players=league.players.filter(x=>!['ST2','ST3','CM2'].includes(x.id));assert(sellerAssessment(c,league,p,'M').blocked,'18 cannot sell to 17');
}
{
 const {c,league}=fixture(),lb=league.players.find(x=>x.id==='LB0');league.players=league.players.filter(x=>x.id!=='LB1');assert(sellerAssessment(c,league,lb,'M').blocked,'Only structural left-back');c.transferList.push(lb.id);c.contracts[lb.id]={end:'1998-09-01'};assert(sellerAssessment(c,league,lb,'M').blocked,'Listing/expiry never overrides cover');
}
{
 const {c,league}=fixture(),lb=league.players.find(x=>x.id==='LB0'),other=league.players.find(x=>x.id==='LB1');
 c.futureTransfers.push({id:other.id,from:'S',to:'M',arrival:'1999-07-01',status:'agreed'});assert(sellerAssessment(c,league,lb,'M').blocked,'Reserved summer departure');c.futureTransfers=[];c.players[other.id]={retirementAfterSeason:1};assert(sellerAssessment(c,league,lb,'M').blocked,'Announced retirement');
 c.players[other.id]={injuryDays:30,suspensionMatches:3};const a=sellerAssessment(c,league,lb,'M');assert(!a.blocked);assert(a.thin.includes('LB'));assert.equal(a.multiplier,1.15,'Thin-cover premium; current fitness is temporary');
 c.players[other.id]={};c.loans[other.id]={parent:'S',to:'M'};assert(sellerAssessment(c,league,lb,'M').blocked,'Loaned cover is not retained cover');delete c.loans[other.id];other.academy=true;assert(sellerAssessment(c,league,lb,'M').blocked,'No exact academy assumptions');
}
{
 const {c,league}=fixture(),keeper=league.players.find(x=>x.id==='GK0');assert(!sellerAssessment(c,league,keeper,'M').blocked);league.players=league.players.filter(x=>x.id!=='GK2');assert(sellerAssessment(c,league,keeper,'M').blocked,'Retain two permanent keepers');
}
{
 const {c,league,p}=fixture();league.players=league.players.filter(x=>!['ST3','CM2'].includes(x.id));c.players.GK2={retirementAfterSeason:1};assert(!sellerAssessment(c,league,p,'M').blocked);assert(sellerAssessment(c,league,p,'M',{future:true}).blocked,'Future agreements reserve an 18-player permanent squad');
}
{
 const {c,league,p}=fixture();for(const x of league.players)x.clubId='C01';league.clubs[1].id='C01';p.overall=90;p.positions.ST=90;assert(sellerAssessment(c,league,p,'C18').blocked,'Key player to rival');c.transferList.push(p.id);assert(!sellerAssessment(c,league,p,'C18').blocked,'Listed key player can leave if cover is retained');assert.equal(sellerAssessment(c,league,p,'C18').multiplier,1);
 c.transferList=[];assert.equal(sellerAssessment(c,league,p,'M',{challenger:true}).multiplier,1.2);c.contracts[p.id]={end:'1998-12-01'};assert.equal(sellerAssessment(c,league,p,'M',{challenger:true}).multiplier,1);
}
{
 // Two CB slots share the same versatile alternatives. Having a name under
 // each role is insufficient if the whole XI needs that player elsewhere.
 const {c,league}=fixture();league.players=league.players.filter(x=>!['LB1','RB1','CB1','CB2'].includes(x.id));while(league.players.length<21)league.players.push(player('extra'+league.players.length,'ST'));
 const cb=league.players.find(x=>x.id==='CB0'),lb=league.players.find(x=>x.id==='LB0'),rb=league.players.find(x=>x.id==='RB0');lb.positions.CB=70;rb.positions.CB=70;assert(sellerAssessment(c,league,cb,'M').blocked,'Distinct-player whole-formation coverage');
}
console.log('PASS seller policy: minimum squad, joint formation cover, two keepers, committed departures/retirements, loans/academy exclusion, future commitments, premiums and read-only assessments');
