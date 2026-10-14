import {divisionOf} from './divisions.js?v=1.74.0';
import {cupAfter as after,insertCupFixture as insert} from './cup-scheduling.js?v=1.74.0';
export const CUP_ID='league-cup';
export const CUP_ROUNDS=[{name:'First round',month:'08-11',legs:2,prize:10000},{name:'Second round',month:'09-15',legs:2,prize:20000},{name:'Third round',month:'10-27',legs:1,prize:30000},{name:'Fourth round',month:'11-10',legs:1,prize:50000},{name:'Quarter-finals',month:'12-01',legs:1,prize:75000},{name:'Semi-finals',month:'01-26',legs:2,prize:125000},{name:'Final',month:'03-21',legs:1,prize:250000,neutral:true}];
const rng=seed=>{let v=2166136261;for(const ch of seed)v=Math.imul(v^ch.charCodeAt(0),16777619);return()=>{v^=v<<13;v^=v>>>17;v^=v<<5;return (v>>>0)/4294967296;}};
const shuffled=(ids,random)=>{const a=[...ids];for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
export const cupComplete=c=>!c.leagueCup||['complete','deferred'].includes(c.leagueCup.status);
export const cupFixtures=c=>c.schedule.flatMap(r=>r.fixtures.filter(f=>f.competition===CUP_ID).map(f=>({...f,date:r.date})));
function drawRound(c,index,entrants,name){
 const cup=c.leagueCup,config=CUP_ROUNDS[index],year=Number(c.seasonStart.slice(0,4))+(index>=5?1:0),random=rng(cup.seed+':'+index),clubs=shuffled(entrants,random);
 if(clubs.length%2||new Set(clubs).size!==clubs.length)throw Error('Invalid cup draw entrants');
 const previous=cup.rounds.at(-1),previousEnd=previous?cupFixtures(c).filter(f=>f.cupRound===previous.index).map(f=>f.date).sort().at(-1):null;
 let date=year+'-'+config.month;for(const minimum of [after(c.date,1),previousEnd&&after(previousEnd,3)].filter(Boolean))if(date<minimum)date=minimum;
 const ties=[];for(let i=0;i<clubs.length;i+=2){const key=`LC-${cup.season}-${index}-${i/2}`,home=clubs[i],away=clubs[i+1];ties.push({id:key,home,away,winner:null});const fixture={home,away,competition:CUP_ID,kind:'cup',cupRound:index,tie:key,leg:1,legs:config.legs,neutral:!!config.neutral,kickoff:config.neutral?'15:00':'19:45',homeGoals:null,awayGoals:null};const first=insert(c,fixture,date);if(config.legs===2)insert(c,{...fixture,home:away,away:home,leg:2},after(first,index===5?21:7));}
 cup.rounds.push({index,name:config.name,entrants:[...entrants],ties,revealed:0,drawDate:index===0?after(c.seasonStart,1):c.date,completed:false});cup.current=index;
 const involved=entrants.includes(c.clubId);c.news.push({date:c.date,kind:'cup-draw',important:involved,text:`League Cup ${config.name.toLowerCase()} draw is ready.${involved?' Review your tie in Organiser → League Cup.':''}`,action:'league-cup'});
}
export function initialiseCup(c,league,name=id=>id){
 c.cupHistory??=[];if(c.leagueCup){if(!validCup(c,league))throw Error('Invalid League Cup save');return false;}
 c.cupHistory??=[];const first=c.seasonStart.slice(0,4)+'-08-11';
 if(c.date>first){c.leagueCup={edition:1,season:c.season,status:'deferred',rounds:[],current:-1,paid:[]};c.news.push({date:c.date,kind:'cup',text:'League Cup added: this existing season keeps its fixtures. Your club enters the cup from next season.',action:'league-cup'});return false;}
 const premier=league.clubs.filter(x=>divisionOf(c,x.id)==='premier').sort((a,b)=>(b.attack+b.defence)-(a.attack+a.defence)||a.id.localeCompare(b.id));
 c.leagueCup={edition:1,season:c.season,status:'active',seed:`${c.clubId}:${c.season}:${c.cupSeed??(c.cupSeed=Math.random().toString(36).slice(2))}`,late:premier.slice(0,8).map(x=>x.id),second:[...league.clubs.filter(x=>divisionOf(c,x.id)==='first').map(x=>x.id),...premier.slice(8).map(x=>x.id)],rounds:[],current:-1,paid:[],winner:null};
 const entry=c.leagueCup.late.includes(c.clubId)?'third round':c.leagueCup.second.includes(c.clubId)?'second round':'first round';c.news.push({date:c.date,kind:'cup',important:true,text:`League Cup: your club enter in the ${entry}. This 68-club adaptation uses First Division byes and eight seeded Premier late entrants.`,action:'league-cup'});
 drawRound(c,0,league.clubs.filter(x=>divisionOf(c,x.id)==='second').map(x=>x.id),name);return true;
}
export function resolveCup(c,f,score,random=Math.random){
 if(f.competition!==CUP_ID||f.kind!=='cup'||f.homeGoals===null||f.winner||f.legs===2&&f.leg===1)return;
 let h=f.homeGoals,a=f.awayGoals,awayH=0,awayA=f.awayGoals;
 if(f.legs===2){const first=c.schedule.flatMap(r=>r.fixtures).find(x=>x.tie===f.tie&&x.competition===CUP_ID&&x.leg===1);if(!first||first.homeGoals===null)return;h+=first.awayGoals;a+=first.homeGoals;awayH=first.awayGoals;}
 if(h===a){const [eh,ea]=score(f.home,f.away);f.extraTime={home:Math.min(2,Math.floor(eh/2)),away:Math.min(2,Math.floor(ea/2))};f.homeGoals+=f.extraTime.home;f.awayGoals+=f.extraTime.away;h+=f.extraTime.home;a+=f.extraTime.away;awayA+=f.extraTime.away;}
 if(h!==a)f.winner=h>a?f.home:f.away;
 else if(f.legs===2&&awayH!==awayA){f.winner=awayH>awayA?f.home:f.away;f.decision='away goals';}
 else{const win=random()<.5;f.penalties={home:win?5:4,away:win?4:5};f.winner=win?f.home:f.away;f.decision='penalties';}
 f.decision??=f.extraTime?'extra time':f.legs===2?'aggregate':'full time';
}
export function progressCup(c,league,name=id=>id){
 const cup=c.leagueCup;if(!cup||cup.status!=='active')return;
 const round=cup.rounds.at(-1),all=c.schedule.flatMap(r=>r.fixtures);
 for(const tie of round.ties){const f=all.find(f=>f.competition===CUP_ID&&f.tie===tie.id&&f.leg===CUP_ROUNDS[round.index].legs);if(!f?.winner)continue;tie.winner=f.winner;
  if(!cup.paid.includes(tie.id)){if(tie.winner===c.clubId){const amount=CUP_ROUNDS[round.index].prize;c.balance+=amount;c.news.push({date:c.date,kind:'cup-prize',amount,text:`League Cup ${round.name.toLowerCase()}: ${name(c.clubId)} progress${round.index===6?' and win the trophy':''}; ${'£'+amount.toLocaleString('en-GB')} prize received.`,action:'league-cup'});}else if(round.index===6&&[tie.home,tie.away].includes(c.clubId)){c.balance+=100000;c.news.push({date:c.date,kind:'cup-prize',amount:100000,text:'League Cup runners-up prize: £100,000.',action:'league-cup'});}cup.paid.push(tie.id);}
 }
 if(!round.ties.every(t=>t.winner))return;round.completed=true;
 if(round.index===6){cup.status='complete';cup.winner=round.ties[0].winner;c.news.push({date:c.date,kind:'cup-winner',important:true,text:`${name(cup.winner)} win the League Cup. European qualification will be added in a later release.`,action:'league-cup'});return;}
 let entrants=round.ties.map(t=>t.winner);if(round.index===0)entrants.push(...cup.second);if(round.index===1)entrants.push(...cup.late);drawRound(c,round.index+1,entrants,name);
}
export function rolloverCup(c,league,name){if(c.leagueCup&&!cupComplete(c))throw Error('Complete the League Cup first');if(c.leagueCup)c.cupHistory.push(structuredClone(c.leagueCup));delete c.leagueCup;initialiseCup(c,league,name);}
export function validCup(c,league){const p=c.leagueCup;if(!p)return true;const ids=new Set(league.clubs.map(x=>x.id));if(p.edition!==1||p.season!==c.season||!['active','complete','deferred'].includes(p.status)||!Array.isArray(p.rounds)||!Array.isArray(p.paid))return false;if(p.status==='deferred')return p.rounds.length===0;if(!Array.isArray(p.late)||p.late.length!==8||!Array.isArray(p.second)||p.second.length!==36||!p.late.every(x=>ids.has(x))||!p.second.every(x=>ids.has(x))||new Set([...p.late,...p.second]).size!==44||typeof p.seed!=='string')return false;const sizes=[24,48,32,16,8,4,2],fixtures=c.schedule.flatMap(r=>r.fixtures).filter(f=>f.competition===CUP_ID),ties=p.rounds.flatMap(r=>r.ties||[]);if(new Set(ties.map(t=>t.id)).size!==ties.length||new Set(p.paid).size!==p.paid.length||p.paid.some(id=>!ties.some(t=>t.id===id)))return false;if(fixtures.length!==p.rounds.reduce((n,r)=>n+(r.ties?.length||0)*CUP_ROUNDS[r.index]?.legs,0)||fixtures.some(f=>!CUP_ROUNDS[f.cupRound]||f.kind!=='cup'||f.legs!==CUP_ROUNDS[f.cupRound].legs||!Number.isInteger(f.leg)||f.leg<1||f.leg>f.legs||!p.rounds[f.cupRound]?.ties.some(t=>t.id===f.tie&&(f.leg===1?t.home===f.home&&t.away===f.away:t.away===f.home&&t.home===f.away))||(f.winner!==undefined&&![f.home,f.away].includes(f.winner))))return false;return p.rounds.length>=1&&p.rounds.length<=7&&p.current===p.rounds.length-1&&p.rounds.every((r,i)=>r.index===i&&Array.isArray(r.entrants)&&r.entrants.length===sizes[i]&&new Set(r.entrants).size===sizes[i]&&r.entrants.every(x=>ids.has(x))&&Array.isArray(r.ties)&&r.ties.length===sizes[i]/2&&new Set(r.ties.flatMap(t=>[t.home,t.away])).size===sizes[i]&&r.ties.every(t=>r.entrants.includes(t.home)&&r.entrants.includes(t.away)&&(t.winner===null||[t.home,t.away].includes(t.winner)))&&Number.isInteger(r.revealed)&&r.revealed>=0&&r.revealed<=r.ties.length)&&(p.status!=='complete'||p.winner===p.rounds[6]?.ties[0]?.winner);}
