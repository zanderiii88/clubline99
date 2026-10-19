// Values are game estimates in 1998 pounds, not audited historical accounts.
const originalDivision=t=>t.id.startsWith('SC')?Number(t.id.slice(2))<10?'scot-premier':Number(t.id.slice(2))<=20?'scot-first':'scot-lower':['EU001','EU051','EU052','EU053'].includes(t.id)?'scot-premier':Number(t.id.slice(1))<=20?'premier':Number(t.id.slice(1))<=44?'first':'second';
const tier=id=>({'premier':1,'first':.48,'second':.25,'scot-premier':1,'scot-first':.48,'scot-lower':.25}[id]||1);
export function commercialIncome(c,t){const start=originalDivision(t),now=c.divisions?.[t.id]||start;return Math.round((t.commercialWeekly||0)*tier(now)/tier(start)/100)*100;}
export const runningCosts=t=>t.runningCostsWeekly||0;
export const transferFunds=(balance,payroll)=>Math.max(0,balance-4*payroll);
export function attendanceShare(t,rng=Math.random){const average=Math.min(.96,Math.max(.20,(t.averageAttendance||t.capacity*.685)/t.capacity));return Math.min(.99,Math.max(.12,average+(rng()-.5)*.18));}
export function financeWeek(c,t,payroll){const income=commercialIncome(c,t),costs=runningCosts(t),net=income-payroll-costs;return {income,costs,payroll,net};}
