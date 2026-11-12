import assert from 'node:assert/strict';
import {assessSeason,updateExpectations} from '../season-board.js';
import {boardReviewDay} from '../managers.js';
import {financeWeek} from '../finance-model.js';

const team={id:'C01',attack:70,defence:70,commercialWeekly:1000,runningCostsWeekly:3000};
const league={clubs:[team,...['C02','C03','C04'].map(id=>({...team,id}))],players:[{id:'p',clubId:'C01',wage:2000}]};
const table=league.clubs.map(t=>({id:t.id,P:0,Pts:0}));
const base=()=>({clubId:'C01',season:1,date:'1998-08-31',balance:10000,players:{p:{}},loans:{},news:[],reports:[],schedule:[],clubInvestment:{upkeepWeekly:500},managerReviewState:{anchor:'1998-08-03',lastMonth:'',reports:[],monthly:false}});
let c=base(),a=assessSeason(c,league,table);
assert.equal(a.forecast,-8000);assert.equal(a.weekly,2000);assert.equal(a.runningCosts,3500);assert.equal(a.commercial,1000);assert.equal(a.weeklyNet,-4500);assert.equal(a.board,55);
assert(a.boardReasons.at(-1).includes('does not cover'));
updateExpectations(c,league,table);assert(c.news.some(n=>n.kind==='board'&&n.text.includes('running costs')));
const report=boardReviewDay(c,a,{weekly:a.weekly});assert(report.urgent);assert.equal(report.forecast,a.forecast);assert.equal(report.confidence,a.board);assert(report.improvements.some(s=>s.includes('running costs')));
// Mirror four Mondays of actual payroll/income/cost settlement; no match income.
const projected=structuredClone(c);for(let i=0;i<4;i++)projected.balance+=financeWeek(projected,team,2000).net;assert.equal(projected.balance,a.forecast);
// A healthy reserve removes the cash penalty; assessing must not spend money.
c=base();c.balance=50000;const cash=c.balance;a=assessSeason(c,league,table);assert.equal(a.board,65);assert.equal(a.forecast,32000);assert.equal(c.balance,cash);
// Promotion/relegation uses current division commercial income.
c=base();c.divisions={C01:'first'};a=assessSeason(c,league,table);assert.equal(a.commercial,500);assert.equal(a.forecast,-10000);
const lower={...team,id:'C21'};const lowerLeague={clubs:[lower,...league.clubs.slice(1)],players:[{id:'p',clubId:'C21',wage:2000}]};c=base();c.clubId='C21';c.divisions={C21:'premier'};a=assessSeason(c,lowerLeague,table.map((r,i)=>i===0?{...r,id:'C21'}:r));assert.equal(a.commercial,2100);assert.equal(a.forecast,-3600);
// Loan wage shares and academy-only payroll exclusions stay in the assessment.
c=base();c.owners={p:'C02'};c.loans={p:{parent:'C01',to:'C02',contribution:50}};a=assessSeason(c,league,table);assert.equal(a.weekly,1000);assert.equal(a.forecast,-4000);
c=base();c.players.p.academyOnly=true;a=assessSeason(c,league,table);assert.equal(a.weekly,0);assert.equal(a.forecast,0);
c=base();c.balance=-1;a=assessSeason(c,league,table);assert.equal(a.board,40);assert(a.boardReasons.at(-1).includes('below zero'));
console.log('PASS board finances: true four-week cash, upkeep, current division income, confidence/report agreement, loans, academy payroll and negative balances');
