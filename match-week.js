import {contractStatus} from './contracts.js?v=1.90.0';
import {bookingWindow} from './club-events.js';
const plus=(d,n)=>new Date(Date.parse(d+'T12:00:00Z')+n*86400000).toISOString().slice(0,10);
const days=(a,b)=>Math.round((Date.parse(b+'T12:00:00Z')-Date.parse(a+'T12:00:00Z'))/86400000);
export function matchWeek(c,league,horizon=14){
 horizon=horizon===30?30:14;const until=plus(c.date,horizon-1),inside=d=>typeof d==='string'&&d>=c.date&&d<=until,known=new Map(league.players.map(p=>[p.id,p])),all=(c.schedule||[]).flatMap(r=>r.fixtures.filter(f=>[f.home,f.away].includes(c.clubId)).map(f=>({...f,date:r.date}))).sort((a,b)=>a.date.localeCompare(b.date)),seen=new Set();
 let previous=all.filter(f=>f.homeGoals!==null&&f.date<=c.date).at(-1)||null;
 const fixtures=all.filter(f=>f.homeGoals===null&&inside(f.date)).filter(f=>{const k=[f.date,f.home,f.away,f.competition,f.tie,f.leg].join(':');if(seen.has(k))return false;seen.add(k);return true}).map(f=>{const gap=previous?days(previous.date,f.date):null;previous=f;return {...f,gap,shortGap:gap!==null&&gap<=3,opponent:f.home===c.clubId?f.away:f.home,location:f.neutral?'Neutral':f.home===c.clubId?'Home':'Away'}});
 const agenda=[],add=(date,kind,title,extra={})=>{if(inside(date))agenda.push({date,kind,title,...extra})};
 for(const p of league.players){if(p.academy||c.players?.[p.id]?.retired||((c.loans?.[p.id]?.parent||c.owners?.[p.id]||p.clubId)!==c.clubId))continue;const status=contractStatus(c,p);if(status.days<0)add(c.date,'contracts',p.name+' · rolling contract terms',{playerId:p.id});else add(status.end,'contracts',p.name+' · contract end',{playerId:p.id});}
 for(const [id,l]of Object.entries(c.loans||{}))if([l.parent,l.to].includes(c.clubId))add(l.end||l.season,'loans',(known.get(id)?.name||'Player')+' · scheduled loan return',{playerId:id});
 for(const job of c.construction||[])add(job.opens,'stadium','Stadium sections expected to reopen');
 if(c.clubInvestment?.pending)add(c.clubInvestment.pending.completion,'facilities',c.clubInvestment.pending.title+' · expected completion');
 for(const b of c.clubLife?.bookings||[])if(['accepted','completed'].includes(b.status)){const w=bookingWindow(b);add(w.start,'events',(b.title||'Stadium booking')+' · setup starts');add(b.date,'events',(b.title||'Stadium booking')+' · event');add(w.end,'events',(b.title||'Stadium booking')+' · recovery ends');}
 for(const r of c.managerReviewState?.reports||[])if(!r.read&&r.date<=c.date)add(c.date,'board','Unread board report',{id:r.id});
 if(c.managerMedia?.enabled)for(const e of c.managerMedia.events||[]){const deadline=e.phase==='post'?e.deadline:e.matchDate;const parts=e.key.split(':'),unplayed=all.some(f=>f.homeGoals===null&&f.date===e.matchDate&&[f.home,f.away].includes(e.opponentId)&&(parts.length<5||f.home===parts[2]&&f.away===parts[3]&&(f.competition||'league')===parts[4]));if((e.phase==='post'||unplayed)&&e.status==='pending'&&e.season===c.season&&deadline>=c.date&&(e.phase==='post'||c.managerWorld?.jobs?.[e.opponentId]===e.managerId))add(deadline,'press','Press response window · '+e.managerName,{key:e.key});}
 agenda.sort((a,b)=>a.date.localeCompare(b.date)||a.kind.localeCompare(b.kind));
 return {until,horizon,fixtures,agenda};
}
