import {insertCupFixture,cupAfter} from './cup-scheduling.js?v=1.89.0';
import {scottishClub,scottishPlayable,HAMPDEN_ID,domesticCupName} from './scottish-world.js?v=1.89.0';
export const SCOTTISH_LC_ROUNDS=[['First round','08-08',5000],['Second round','08-18',10000],['Third round','09-15',15000],['Quarter-finals','10-14',25000],['Semi-finals','11-10',50000],['Final','11-29',150000]].map(([name,month,prize],i)=>({name,month,prize,legs:1,neutral:i>=4}));
export const SCOTTISH_FA_ROUNDS=[['First round','11-21',3000],['Second round','12-12',5000],['Third round','01-02',10000],['Fourth round','01-23',20000],['Quarter-finals','03-06',60000],['Semi-finals','04-10',100000],['Final','05-29',300000]].map(([name,month,prize],i)=>({name,month,prize,legs:1,neutral:i>=5}));
export const scottishCupRounds=id=>id==='fa-cup'?SCOTTISH_FA_ROUNDS:SCOTTISH_LC_ROUNDS;
const field=id=>id==='fa-cup'?'faCup':'leagueCup';
const shuffle=(ids,seed)=>{let n=2166136261;for(const ch of seed)n=Math.imul(n^ch.charCodeAt(0),16777619);return [...ids].map(id=>{n^=n<<13;n^=n>>>17;n^=n<<5;return {id,n:n>>>0}}).sort((a,b)=>a.n-b.n).map(x=>x.id);};
function draw(c,id,index,entrants){
 const cup=c[field(id)],cfg=scottishCupRounds(id)[index],ids=shuffle(entrants,cup.seed+index);if(ids.length%2||new Set(ids).size!==ids.length)throw Error('Invalid Scottish cup field');
 const year=Number(c.seasonStart.slice(0,4))+(id==='fa-cup'&&index>=2?1:0),prior=c.schedule.filter(r=>r.fixtures.some(f=>f.competition===id&&f.cupRound===index-1)).at(-1)?.date;
 let date=year+'-'+cfg.month;for(const min of [cupAfter(c.date,1),prior&&cupAfter(prior,4)].filter(Boolean))if(date<min)date=min;
 const ties=[];for(let n=0;n<ids.length;n+=2){const tie=`SCO-${id}-${c.season}-${index}-${n/2}`,home=ids[n],away=ids[n+1];ties.push({id:tie,home,away,winner:null});insertCupFixture(c,{home,away,competition:id,kind:'cup',cupRound:index,tie,leg:1,legs:1,homeGoals:null,awayGoals:null,kickoff:'15:00',neutral:!!cfg.neutral,venueId:cfg.neutral?HAMPDEN_ID:undefined,scottishCup:true,replay:false},date);}
 const drawDate=index===0?cupAfter(date,-7):c.date;cup.rounds.push({index,name:cfg.name,entrants:[...entrants],byes:[],ties,revealed:0,drawDate,eventSeen:false,completed:false});cup.current=index;
 c.news.push({date:drawDate,kind:'cup-draw',important:entrants.includes(c.clubId),text:domesticCupName(c,id)+' '+cfg.name.toLowerCase()+' draw is ready.',action:id});
}
export function initialiseScottishCup(c,league,id){
 c.cupHistory??=[];c.faHistory??=[];const key=field(id);if(c[key]){if(!validScottishCup(c,league,id))throw Error('Invalid Scottish cup save');return false;}
 const all=league.clubs.filter(x=>scottishClub(x.id)&&!(id==='league-cup'&&x.id.startsWith('SC')&&Number(x.id.slice(2))>40)),top=all.filter(x=>scottishPlayable(x.id)).map(x=>x.id),lower=all.filter(x=>!scottishPlayable(x.id)).map(x=>x.id),late=top.concat(lower.slice(0,4)),early=lower.slice(4);
 c[key]={edition:1,country:'Scotland',season:c.season,status:'active',seed:`SCO:${id}:${c.season}:${c.clubId}`,late:id==='fa-cup'?late:[],second:id==='league-cup'?late:[],rounds:[],current:-1,paid:[],winner:null};
 c.news.push({date:c.date,kind:'cup',text:`${domesticCupName(c,id)}: ${all.length}-club period-inspired field. Seeded byes keep the draw balanced; ties use extra time and penalties without replays.`,action:id});draw(c,id,0,early);return true;
}
export function resolveScottishCup(c,f,score,random=Math.random){
 if(f.kind!=='cup'||f.homeGoals===null||f.winner)return;let h=f.homeGoals,a=f.awayGoals;
 if(h===a){const [x,y]=score(f.home,f.away);f.extraTime={home:Math.min(2,Math.floor(x/2)),away:Math.min(2,Math.floor(y/2))};f.homeGoals+=f.extraTime.home;f.awayGoals+=f.extraTime.away;h=f.homeGoals;a=f.awayGoals;}
 if(h===a){const home=random()<.5;f.penalties={home:home?5:4,away:home?4:5};f.winner=home?f.home:f.away;f.decision='penalties';}else{f.winner=h>a?f.home:f.away;f.decision=f.extraTime?'extra time':'full time';}
}
export function progressScottishCup(c,league,id,name=x=>x){
 const cup=c[field(id)];if(cup?.status!=='active')return;const r=cup.rounds.at(-1),config=scottishCupRounds(id),all=c.schedule.flatMap(r=>r.fixtures);
 for(const t of r.ties){const f=all.find(f=>f.competition===id&&f.tie===t.id&&f.winner);if(!f)continue;t.winner=f.winner;if(!cup.paid.includes(t.id)){if(t.winner===c.clubId){const amount=config[r.index].prize;c.balance+=amount;c.news.push({date:c.date,kind:'cup-prize',amount,text:`${domesticCupName(c,id)} ${r.name}: £${amount.toLocaleString('en-GB')} prize received.`,action:id});}cup.paid.push(t.id);}}
 if(!r.ties.every(t=>t.winner))return;r.completed=true;
 if(r.index===config.length-1){cup.winner=r.ties[0].winner;cup.status='complete';c.news.push({date:c.date,kind:'cup-winner',text:`${name(cup.winner)} win the ${domesticCupName(c,id)}.`,action:id});return;}
 let entrants=r.ties.map(t=>t.winner);if(id==='league-cup'&&r.index===0)entrants.push(...cup.second);if(id==='fa-cup'&&r.index===1)entrants.push(...cup.late);draw(c,id,r.index+1,entrants);
}
export function validScottishCup(c,league,id){
 const cup=c[field(id)],ids=new Set(league.clubs.filter(x=>scottishClub(x.id)).map(x=>x.id));if(!cup||cup.country!=='Scotland'||cup.season!==c.season||!['active','complete'].includes(cup.status)||!Array.isArray(cup.rounds)||!cup.rounds.length||!Array.isArray(cup.paid))return false;
 const config=scottishCupRounds(id);if(cup.rounds.length>config.length||cup.current!==cup.rounds.length-1)return false;
 for(let i=0;i<cup.rounds.length;i++){const r=cup.rounds[i];if(r.index!==i||r.name!==config[i].name||!Array.isArray(r.entrants)||new Set(r.entrants).size!==r.entrants.length||r.entrants.some(x=>!ids.has(x))||r.ties.length*2!==r.entrants.length||new Set(r.ties.flatMap(t=>[t.home,t.away])).size!==r.entrants.length||r.ties.some(t=>!r.entrants.includes(t.home)||!r.entrants.includes(t.away)||t.winner&&!([t.home,t.away].includes(t.winner)))||!Number.isInteger(r.revealed)||r.revealed<0||r.revealed>r.ties.length)return false;}
 return cup.status!=='complete'||cup.rounds.length===config.length&&cup.winner===cup.rounds.at(-1).ties[0].winner;
}
