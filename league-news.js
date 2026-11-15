import {clubRivals} from './manager-media.js?v=1.106.0';
import {divisionOf} from './divisions.js?v=1.93.0';
export const NEWS_CATEGORIES={all:'All news',results:'Results & rivalries',transfers:'Transfers',managers:'Managers & press',development:'Youth & development',finance:'Finance',club:'Club life'};
const category=k=>['world-transfer','transfer','offer','contract-renewal','free-agents'].includes(k)?'transfers':['manager-change','manager-media','board-review'].includes(k)?'managers':['world-development','youth','development','milestone','retirement','training'].includes(k)?'development':['world-finance','wages','commercial','prize','finance'].includes(k)?'finance':k==='result'?'results':'club';
// A derived feed: no new stories are saved, no time advances and no reactions apply.
export function leagueNews(c,league,{category:filter='all',scope='all',days=30,query='',limit=40}={},name=id=>league.clubs.find(x=>x.id===id)?.name||id){
 const players=new Map(league.players.map(p=>[p.id,p])),clubs=new Set(league.clubs.map(x=>x.id)),rows=[],seen=new Set(),oldest=days?new Date(Date.parse(c.date+'T12:00:00Z')-(days-1)*86400000).toISOString().slice(0,10):null;
 for(const n of c.news||[]){if(!n.date||n.date>c.date||oldest&&n.date<oldest)continue;const p=players.get(n.playerId),event=n.mediaKey&&c.managerMedia?.events.find(e=>e.key===n.mediaKey),ids=[n.clubId,(['wages','commercial','training','youth','development','retirement','milestone','club-story','stadium','stadium-booking','board-review','result'].includes(n.kind)?c.clubId:null),event?.opponentId,p&&(c.owners?.[p.id]||p.clubId)].filter(id=>clubs.has(id));rows.push({...n,category:category(n.kind),clubIds:[...new Set(ids)],playerId:p?.id||null});}
 for(const round of c.schedule||[])for(const f of round.fixtures){
  if(round.date>c.date||oldest&&round.date<oldest||f.friendly||!Number.isFinite(f.homeGoals)||!Number.isFinite(f.awayGoals))continue;
  const derby=clubRivals(f.home,f.away),big=Math.abs(f.homeGoals-f.awayGoals)>=4;if(!derby&&!big)continue;
  const text=`${derby?'Rivalry result':'Big result'}: ${name(f.home)} ${f.homeGoals}–${f.awayGoals} ${name(f.away)}${f.penalties&&f.winner?'. '+name(f.winner)+' advance on penalties':''}.`;
  rows.push({date:round.date,kind:'league-result',category:'results',clubIds:[f.home,f.away],text,competition:f.competition,generated:true});
 }
 rows.forEach((row,i)=>{row.order=i});
 const q=query.trim().toLocaleLowerCase(),own=divisionOf(c),filtered=rows.filter(n=>{
  const key=[n.date,n.kind,n.text,n.competition||''].join(':');if(seen.has(key))return false;seen.add(key);
  if(filter!=='all'&&n.category!==filter)return false;
  if(scope==='club'&&!n.clubIds.includes(c.clubId)||scope==='division'&&!n.clubIds.some(id=>divisionOf(c,id)===own))return false;
  return !q||[n.text,...n.clubIds.map(name),players.get(n.playerId)?.name||''].join(' ').toLocaleLowerCase().includes(q);
 }).sort((a,b)=>b.date.localeCompare(a.date)||b.order-a.order);
 return {total:filtered.length,items:filtered.slice(0,Math.max(1,Math.min(1000,limit)))};
}
