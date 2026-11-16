import {clubTransferFunds} from './transfer-interest.js?v=1.116.0';
import {commercialIncome} from './finance-model.js?v=1.124.0';

// Legacy saves start at their current season: no backdated allocations on load.
export function initialiseAIFunding(c){c.aiFunding??={season:c.season,allocated:0};return c.aiFunding;}
export function refreshAIFunding(c,league){
 const funding=initialiseAIFunding(c);if(c.season<=funding.season)return {clubs:0,total:0};
 let clubs=0,total=0;c.aiBudgets??={};
 for(const club of league.clubs){
  if(club.id===c.clubId)continue;
  const factor=club.commercialWeekly>0?commercialIncome(c,club)/club.commercialWeekly:1,reference=Math.max(0,club.budget||0)*Math.max(.25,Math.min(4,factor)),funds=clubTransferFunds(c,league,club.id),allowance=Math.floor(Math.max(0,Math.min(reference*.25,reference*2-funds))/1000)*1000;
  if(!allowance)continue;c.aiBudgets[club.id]=funds+allowance;total+=allowance;clubs++;
 }
 funding.season=c.season;funding.allocated+=total;
 if(total)c.news.push({date:c.date,kind:'world-finance',text:`Other clubs' annual transfer budgets reviewed: ${clubs} clubs receive a combined £${total.toLocaleString('en-GB')} in new board allocations. Existing transfer balances carry forward.`});
 return {clubs,total};
}
