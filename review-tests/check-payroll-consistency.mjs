import assert from 'node:assert/strict';
import path from 'node:path';
import {createGame} from './vm-game-harness.mjs';
import {clubPayroll,clubWageOutlook} from '../wage-planning.js';
{
 const c={clubId:'C01',seasonStart:'1998-08-03',date:'1998-08-03',players:{a:{unregistered:true},d:{retired:true},e:{academyOnly:true}},owners:{b:'C02',c:'C01'},loans:{b:{parent:'C01',to:'C02',contribution:75},c:{parent:'C02',to:'C01',contribution:50}}},league={players:[{id:'a',clubId:'C01',wage:800},{id:'b',clubId:'C01',wage:3000},{id:'c',clubId:'C02',wage:1000},{id:'d',clubId:'C01',wage:500},{id:'e',clubId:'C01',wage:600}]};
 assert.equal(clubPayroll(c,league),2050);assert.equal(clubPayroll(c,league,'C02'),2750);assert.equal(clubWageOutlook(c,league).weekly,2050);assert.equal(c.wagePlan.openingPayroll,2050);assert.equal(c.wagePlan.weeklyAllowance,2300);assert.equal(clubWageOutlook(c,league,100).weekly,2150);assert.equal(c.wagePlan.weeklyAllowance,2300,'A preview never resets the allowance');
 console.log('PASS shared payroll: explicit parent/borrower sums, paid registration, retired/academy exclusions and stable allowance');
}
const money=n=>'£'+Math.round(n).toLocaleString('en-GB');
for(const mode of ['streamlined','in-depth']){
 const {g,mods,dir}=await createGame(1116);g.setup('C01',mode);g.newCareer();g.click('close-owner-welcome');
 let {career:c,source}=g.get();const loans=mods.get(path.join(dir,'loans.js')).namespace;
 const p=loans.loanCandidates(c,source).find(p=>p.primary!=='GK'&&loans.loanDestinations(c,source,p).length);assert(p);
 const dest=loans.loanDestinations(c,source,p)[0].club.id,opening=g.weeklyWages();
 g.fields('[data-loan-club]',dest);g.fields('[data-loan-months]',3);g.fields('[data-loan-share]',75);g.fieldNode('[data-loan-recall]',{checked:true});g.click('confirm-loan',{id:p.id});assert(c.loans[p.id]);assert.equal(g.weeklyWages(),Math.round(opening-p.wage*.75));
 let html=g.wagePlanningPanel();assert(html.includes('data-weekly-payroll>'+money(g.weeklyWages())),mode+' loan wage plan must equal actual payroll');
 const retained=source.players.find(x=>(c.owners[x.id]||x.clubId)===c.clubId&&!x.academy&&!c.players[x.id].unregistered);assert(retained);c.players[retained.id].unregistered=true;
 assert(g.wagePlanningPanel().includes('data-weekly-payroll>'+money(g.weeklyWages())),'Unregistered senior still paid');
 const fake={incoming:false,fee:100000};html=g.transferFinance(fake,retained);assert(html.includes(money(c.wagePlan.weeklyAllowance-(g.weeklyWages()-retained.wage))),'Sale headroom includes continuing loan and registration wages');
 const out={textContent:''};g.fieldNode('[data-renew-preview]',out);const budget={textContent:''};g.fieldNode('[data-renew-budget-preview]',budget);c.players[retained.id].unregistered=false;
 g.click('renew-player',{id:retained.id});g.fields('[data-renew-wage]',retained.wage+100);g.fields('[data-renew-years]',2);g.fields('[data-renew-role]','starter');g.updateRenewalPreview();assert(budget.textContent.includes(money(g.weeklyWages()+100)),'Renewal preview includes loan obligation');
 g.checkpointSave();assert(g.load());({career:c,source}=g.get());assert(g.wagePlanningPanel().includes('data-weekly-payroll>'+money(g.weeklyWages())));g.parse(g.backup());
 console.log('PASS payroll consistency:',mode,'partial loan, unregistered senior, sale/renewal previews, compressed reload and backup');
}
