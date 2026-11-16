import assert from 'node:assert/strict';
import fs from 'node:fs';
import {cashOutlook,financeWeek,commercialIncome,transferFunds} from '../finance-model.js';
import {createGame} from './vm-game-harness.mjs';
const team={id:'SC20',commercialWeekly:1000,runningCostsWeekly:3000};
const c={balance:10000,clubInvestment:{upkeepWeekly:500},divisions:{SC20:'scot-first'}};
let q=cashOutlook(c,team,2000);
assert.equal(q.forecast,-8000);assert.equal(q.net,-4500);assert.equal(q.weeksCovered,2);
let settled=c.balance;for(let i=0;i<4;i++)settled+=financeWeek(c,team,2000).net;
assert.equal(q.forecast,settled);assert.equal(c.balance,10000,'Forecast cannot spend money');
assert.equal(transferFunds(c.balance,2000),2000,'Payroll allowance remains distinct from the cash forecast');
assert.equal(cashOutlook(c,team,2000,{balance:18000}).forecast,0);
assert.equal(cashOutlook(c,team,2000,{balance:18000}).weeksCovered,4);
assert.equal(cashOutlook(c,team,2000,{balance:-1}).weeksCovered,0);
assert.equal(cashOutlook(c,team,2000,{balance:0}).weeksCovered,0);
const healthy={...team,commercialWeekly:10000};assert.equal(cashOutlook(c,healthy,2000).weeksCovered,null);
const rows=[];
for(const [id,mode] of [['SC20','streamlined'],['EU051','in-depth']]){
 const {g}=await createGame(124);g.setup(id,mode);g.newCareer();g.click('close-owner-welcome');
 const {career:c,source}=g.get(),club=source.clubs.find(t=>t.id===id),weekly=g.weeklyWages();
 // A comfortable-looking four-payroll allowance can still hide operating losses.
 c.balance=weekly*4+1000;club.runningCostsWeekly=100000;club.commercialWeekly=0;c.clubInvestment={upkeepWeekly:500};
 const q=cashOutlook(c,club,weekly),money=n=>'£'+Math.round(n).toLocaleString('en-GB');
 assert(q.forecast<0);assert(g.cashForecastMarkup().includes(money(q.forecast)));
 assert(g.financesSection().includes('paid players awaiting registration'));
 assert(g.financesSection().includes(money(q.forecast)));
 assert(!g.financesSection().includes('subtracts wages only'));
 if(mode==='streamlined'){g.click('stream-budget');assert(g.streamlinedBudgetPanel().includes(money(q.forecast)));}
 const p=source.players.find(p=>(c.owners[p.id]||p.clubId)!==id&&!c.players[p.id]?.retired);
 const o={incoming:true,fee:500,personalTerms:{wage:1000}},after=cashOutlook(c,club,weekly+1000,{balance:c.balance-500});
 const html=g.transferFinance(o,p);assert(html.includes(money(after.forecast)));assert(html.includes('negative four-week balance'));
 // Rendering may update UI but must not change the balance or wage obligation.
 assert.equal(c.balance,weekly*4+1000);assert.equal(g.weeklyWages(),weekly);
 const oldDate=c.date,newStart=new Date(Date.parse(oldDate+'T12:00:00Z')+28*86400000).toISOString().slice(0,10);
 g.settleOffSeason(newStart);assert.equal(c.balance,q.forecast,'Actual four-week off-season settlement equals forecast');assert.equal(c.date,oldDate,'Settlement leaves season transition in control of the date');
 const ledger=c.news.findLast(n=>n.kind==='offseason-finance');assert.equal(ledger.balance,q.forecast);assert.equal(ledger.weeks,4);assert.equal(ledger.payroll,weekly*4);assert.equal(ledger.runningCosts,100500*4);assert.equal(ledger.amount,ledger.payroll+ledger.runningCosts);
 assert(!g.financeOutlook().includes('NaN'));delete ledger.balance;assert(!g.financeOutlook().includes('NaN'),'Legacy entries without a saved balance stay readable');
 rows.push({id,mode,weekly,fourWeek:q.forecast,dealFourWeek:after.forecast,offseasonLedger:true});
}
// Commercial income follows both Scottish promotion and relegation at actual club rates.
const promoted={...c,divisions:{SC20:'scot-premier'}};assert(commercialIncome(promoted,team)>commercialIncome(c,team));
const premier={...team,id:'EU051'};assert(commercialIncome({divisions:{EU051:'scot-first'}},premier)<commercialIncome({divisions:{EU051:'scot-premier'}},premier));
fs.writeFileSync(new URL('../review/cash-outlook-1.124.json',import.meta.url),JSON.stringify({passed:true,scope:'Shared arithmetic and real financial-screen/transfer rendering in Node VM; no physical device UI',rows},null,2));
console.log('PASS cash outlook: four settlements, exact boundaries, operating losses, upkeep, Scottish division income, both modes and transfer previews');
