import assert from 'node:assert/strict';
import {initialiseAIFunding,refreshAIFunding} from '../ai-transfer-funding.js';
const fixture=()=>({c:{clubId:'C01',season:5,date:'2002-08-03',aiBudgets:{C02:0,C21:3000000,C03:-100000},news:[],divisions:{C21:'first'}},league:{clubs:[{id:'C01',budget:10000000,commercialWeekly:100000},{id:'C02',budget:1000000,commercialWeekly:10000},{id:'C21',budget:1000000,commercialWeekly:10000},{id:'C03',budget:1000000,commercialWeekly:10000}]}});
{
 const {c,league}=fixture(),balance=c.balance;initialiseAIFunding(c);assert.deepEqual(c.aiFunding,{season:5,allocated:0});assert.deepEqual(refreshAIFunding(c,league),{clubs:0,total:0});assert.equal(c.aiBudgets.C02,0,'No backdated funding');c.season=6;let x=refreshAIFunding(c,league);assert.equal(x.total,500000);assert.equal(c.aiBudgets.C02,250000);assert.equal(c.aiBudgets.C21,3000000,'No removal of sale proceeds and no allowance above cap');assert.equal(c.aiBudgets.C03,150000,'Refund debt repaid first');assert(!Object.hasOwn(c.aiBudgets,'C01'));assert.equal(c.balance,balance);
 const before=JSON.stringify(c);assert.deepEqual(refreshAIFunding(c,league),{clubs:0,total:0});assert.equal(JSON.stringify(c),before,'Repeat rollover is free of duplicate funding');const restored=JSON.parse(JSON.stringify(c));initialiseAIFunding(restored);refreshAIFunding(restored,league);assert.equal(JSON.stringify(restored),before,'Reload never replenishes');
 c.season=7;assert.equal(refreshAIFunding(c,league).total,500000);assert.equal(c.aiFunding.allocated,1000000);
}
{
 const {c,league}=fixture();initialiseAIFunding(c);c.aiBudgets.C02=1900000;c.aiBudgets.C03=2000000;c.season++;const x=refreshAIFunding(c,league);assert.equal(x.total,100000);assert.equal(c.aiBudgets.C02,2000000,'New allocations stop at twice the reference budget');
}
{
 const {c,league}=fixture();initialiseAIFunding(c);c.aiBudgets.C21=0;c.divisions.C21='premier';c.season++;refreshAIFunding(c,league);assert.equal(c.aiBudgets.C21,520000,'Promotion scales the annual reference using current division income');
}
console.log('PASS annual AI funding: legacy baseline, once per season/reload, carryover/cap, debts, promotion scaling and no managed-club payment');
