// Advisory season allowance. Payroll processing remains owned by the career engine.
export const weeklyPayroll=pool=>pool.reduce((sum,p)=>sum+(Number(p.wage)||0),0);
// Registration affects eligibility, not a senior player's wage obligation.
// Loan ownership sits with the borrower; each club pays its agreed share.
export function clubPayroll(c,league,clubId=c.clubId){
 return Math.round(league.players.reduce((sum,p)=>{
  if(c.players?.[p.id]?.retired||c.players?.[p.id]?.academyOnly)return sum;
  const wage=Number(p.wage)||0,loan=c.loans?.[p.id];
  if(loan){const share=(loan.contribution??100)/100;return sum+(loan.parent===clubId?wage*(1-share):0)+(loan.to===clubId?wage*share:0);}
  return sum+((c.owners?.[p.id]||p.clubId)===clubId?wage:0);
 },0));
}
export function clubWageOutlook(c,league,adjustment=0){return wageOutlook(c,[{wage:clubPayroll(c,league)}],adjustment);}
export function payrollsAfter(date,end){
 const start=Date.parse(date+'T12:00:00Z'),finish=Date.parse(end+'T12:00:00Z');
 if(!Number.isFinite(start)||!Number.isFinite(finish)||finish<=start)return 0;
 const day=new Date(start).getUTCDay(),first=start+((8-day)%7||7)*86400000;
 return first>finish?0:Math.floor((finish-first)/604800000)+1;
}
export function initialiseWagePlan(c,pool){
 const key=c.seasonStart;
 if(c.wagePlan?.seasonStart===key&&Number.isFinite(c.wagePlan.weeklyAllowance))return c.wagePlan;
 const opening=weeklyPayroll(pool);
 c.wagePlan={seasonStart:key,setOn:c.date,openingPayroll:opening,weeklyAllowance:Math.ceil(opening*1.1/100)*100};
 return c.wagePlan;
}
export function wageOutlook(c,pool,adjustment=0){
 const plan=initialiseWagePlan(c,pool),end=(Number(c.seasonStart.slice(0,4))+1)+'-06-30';
 const weeks=payrollsAfter(c.date,end),seasonWeeks=payrollsAfter(c.seasonStart,end),weekly=weeklyPayroll(pool)+adjustment;
 return {...plan,end,weeks,seasonWeeks,weekly,headroom:plan.weeklyAllowance-weekly,projected:weekly*weeks,remainingAllowance:plan.weeklyAllowance*weeks,seasonAllowance:plan.weeklyAllowance*seasonWeeks};
}
