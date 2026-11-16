import assert from 'node:assert/strict';
import path from 'node:path';

// Bounded optional management choices using existing handlers and natural cash.
// No injected budgets, players, offers, abilities or season dates.
export function createPolicy(g,mods,dir,style){
 const api=name=>mods.get(path.join(dir,name+'.js')).namespace;
 const loans=api('loans'),terms=api('negotiations'),contracts=api('contracts'),funds=api('transfer-interest');
 const actions=[],seasons=new Map(),refunded=new Set();let managedFeeNet=0,minCash=Infinity,maxPayroll=0;
 const current=()=>g.get(),owner=(c,p)=>c.owners[p.id]||p.clubId;
 const state=()=>{const c=current().career;if(!seasons.has(c.season))seasons.set(c.season,{loans:0,recalls:0,buys:0,future:0,sales:0,renewals:0,callups:0,promotions:0});return seasons.get(c.season);};
 const pool=()=>{const {career:c,source}=current();return source.players.filter(p=>owner(c,p)===c.clubId&&!c.players[p.id]?.retired&&!c.players[p.id]?.academyOnly&&!c.players[p.id]?.unregistered);};
 const aiNet=()=>{const {career:c,source}=current();return source.clubs.filter(t=>t.id!==c.clubId).reduce((n,t)=>n+funds.clubTransferFunds(c,source,t.id)-t.budget,0);};
 function market(action){const c=current().career,cash=c.balance,net=aiNet();action();const delta=aiNet()-net;assert.equal(c.balance-cash+delta,0,'Managed transfer and AI fee ledgers reconcile');managedFeeNet+=delta;}
 function observe(){const {career:c,source}=current();for(const d of c.futureTransfers||[])if(d.status==='cancelled'&&d.ledgerPaid&&!refunded.has(d.id)){managedFeeNet-=d.fee;refunded.add(d.id);}
  assert(Number.isFinite(c.balance));minCash=Math.min(minCash,c.balance);maxPayroll=Math.max(maxPayroll,g.weeklyWages());for(const p of source.players)if(/^(FREE-|WORLD-)/.test(p.id))assert(!p.realName&&!p.parodyName,'Generated player keeps fictional identity');assert.equal(aiNet(),c.aiFunding.allocated+managedFeeNet,'AI budgets reconcile after managed activity, world trades and grants');
  assert(source.clubs.filter(t=>t.id!==c.clubId).every(t=>Number.isFinite(funds.clubTransferFunds(c,source,t.id))&&funds.clubTransferFunds(c,source,t.id)>=0));
  const weekly=g.weeklyWages(),marker='data-weekly-payroll>£'+weekly.toLocaleString('en-GB');assert(g.wagePlanningPanel().includes(marker),'Planning payroll equals payable wages');
 }
 function record(kind,details={}){const c=current().career;actions.push({season:c.season,date:c.date,kind,...details});}
 function recall(){const {career:c,source}=current();if(current().match)return;const ready=Object.entries(c.loans).find(([,l])=>l.recall&&c.date>=l.recallDate&&state().recalls===0);if(!ready)return;const [id,l]=ready,p=source.players.find(p=>p.id===id),before=g.weeklyWages();g.click('recall-loan',{id});assert(!c.loans[id]);assert.equal(g.weeklyWages(),Math.round(before+p.wage*l.contribution/100));state().recalls++;record('recall',{id});}
 function renew(){const {career:c,source}=current(),s=state();if(s.renewals>=3)return;
  const p=pool().filter(p=>!p.academy&&contracts.contractStatus(c,p).days<=183&&!c.players[p.id].retirementAfterSeason&&!terms.negotiationStatus(c,p.id).blocked).sort((a,b)=>contracts.contractStatus(c,a).days-contracts.contractStatus(c,b).days)[0];if(!p)return;
  const role=terms.expectedRole(c,source,p),wage=terms.termsDemand(c,source,p,2,role,'renewal');if(c.balance<4*(g.weeklyWages()+wage-p.wage))return;const before=g.weeklyWages(),old=p.wage,cash=c.balance;
  g.click('renew-player',{id:p.id});g.fields('[data-renew-wage]',wage);g.fields('[data-renew-years]',2);g.fields('[data-renew-role]',role);g.click('submit-renewal');assert.equal(p.wage,wage);assert.equal(c.balance,cash);assert.equal(g.weeklyWages(),before+wage-old);s.renewals++;record('renewal',{id:p.id,old,wage,end:c.contracts[p.id].end});g.click('outcome-close');
 }
 function loan(){const {career:c,source}=current(),s=state();if(s.loans||pool().length<=20)return;const p=loans.loanCandidates(c,source).find(p=>p.primary!=='GK'&&p.age<=25&&loans.loanDestinations(c,source,p).length);if(!p)return;
  const to=loans.loanDestinations(c,source,p)[0].club.id,months=style==='development'?3:12,share=style==='development'?50:75,before=g.weeklyWages();g.fields('[data-loan-club]',to);g.fields('[data-loan-months]',months);g.fields('[data-loan-share]',share);g.fieldNode('[data-loan-recall]',{checked:style==='development'});g.click('confirm-loan',{id:p.id});assert(c.loans[p.id]);assert.equal(g.weeklyWages(),Math.round(before-p.wage*share/100));s.loans++;record('loan',{id:p.id,to,share,end:c.loans[p.id].end});
 }
 function youth(){const {career:c,source}=current(),s=state();if(!s.callups){const p=c.prospects.find(p=>!p.promoted&&!p.calledUp&&p.age>=17);if(p&&pool().length<28){const before=g.weeklyWages();g.click('call-up-youth',{id:p.id});assert(p.calledUp);const wage=source.players.find(x=>x.id===p.id).wage;assert.equal(g.weeklyWages(),before+wage);s.callups++;record('call-up',{id:p.id});}}
  if(c.date.slice(5)>='01-01'&&c.date.slice(5)<'07-01'&&!s.promotions){const p=c.prospects.find(p=>p.calledUp&&!p.promoted);if(p){const before=g.weeklyWages();g.click('permanent-youth',{id:p.id});assert(p.promoted);assert.equal(g.weeklyWages(),before);s.promotions++;record('promotion',{id:p.id});}}
 }
 function purchase(future=false){const {career:c,source}=current(),s=state();if(pool().length>=27||(future?s.future>=1:s.buys>=(style==='trading'?2:1)))return;
  if(future&&!c.date.includes('-01-'))return;
  const weekly=g.weeklyWages(),maxFee=Math.max(0,Math.min(c.balance*.18,c.balance-weekly*8));
  const candidates=source.players.filter(p=>owner(c,p)!==c.clubId&&!p.academy&&!c.players[p.id]?.retired&&!c.players[p.id]?.unregistered&&!c.loans[p.id]&&p.age<=27&&(!future||!p.freeAgent&&contracts.contractStatus(c,p).days<=366)&&!c.futureTransfers?.some(d=>d.id===p.id&&d.status==='agreed')).map(p=>({p,stance:g.sellingPosition(p,{future}),wage:terms.termsDemand(c,source,p,2,terms.expectedRole(c,source,p),'signing')})).filter(x=>!x.stance.blocked&&x.stance.askingPrice<=maxFee&&c.balance-x.stance.askingPrice>=4*(weekly+x.wage)).sort((a,b)=>future?a.stance.askingPrice-b.stance.askingPrice:(style==='development'?Number(!a.p.freeAgent)-Number(!b.p.freeAgent):Number(a.p.freeAgent)-Number(b.p.freeAgent))||a.stance.askingPrice-b.stance.askingPrice);
  const item=candidates.find(x=>x.p.overall>=Math.min(...pool().filter(p=>p.primary===x.p.primary).map(p=>p.overall),60));if(!item)return;const {p}=item;
  g.click('bid',{id:p.id});g.click('agree-personal-terms');if(!g.review()?.personalTerms){g.click('close-transfer-review');return;}
  const before=g.weeklyWages(),cash=c.balance;
  if(future){market(()=>g.click('agree-future-transfer',{id:p.id}));if(!c.futureTransfers?.some(d=>d.id===p.id&&d.status==='agreed'))market(()=>g.click('agree-future-transfer',{id:p.id}));if(c.futureTransfers?.some(d=>d.id===p.id&&d.status==='agreed')){assert.equal(g.weeklyWages(),before);s.future++;record('summer-agreement',{id:p.id,fee:cash-c.balance});}}
  else {market(()=>g.click('submit-bid',{id:p.id}));if(owner(c,p)!==c.clubId){const o=c.offers.find(o=>o.id===p.id&&o.incoming&&o.status==='counter');if(o)market(()=>g.click('accept-offer',{id:p.id,club:o.clubId,confirm:'true'}));}if(owner(c,p)===c.clubId){assert.equal(g.weeklyWages(),before+p.wage);s.buys++;record('purchase',{id:p.id,fee:cash-c.balance,wage:p.wage});}}
  g.click('close-transfer-review');g.click('outcome-close');
 }
 function offer(o){const {career:c,source}=current(),s=state(),p=source.players.find(p=>p.id===o.id),peers=p?pool().filter(x=>x.id!==p.id&&x.primary===p.primary):[];
  if(o.incoming||style!=='trading'||s.sales>=2||!p||pool().length<=20||peers.length<(p.primary==='GK'?2:1))return false;
  market(()=>g.click('accept-offer',{id:o.id,club:o.clubId}));if(owner(c,p)!==c.clubId){s.sales++;record('sale',{id:p.id,fee:o.fee});g.click('outcome-close');return true;}return o.status==='rejected';
 }
 function monthly(){observe();loan();youth();renew();purchase();purchase(true);g.click('outcome-close');observe();}
 return {monthly,recall,offer,observe,actions,summary:()=>structuredClone({style,managedFeeNet,minCash,maxPayroll,actions,seasons:Object.fromEntries(seasons)})};
}
