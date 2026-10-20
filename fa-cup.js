import {scottishCareer} from './scottish-world.js?v=1.89.0';
import {initialiseScottishCup,resolveScottishCup,progressScottishCup,validScottishCup} from './scottish-cups.js?v=1.93.0';
import {divisionOf} from './divisions.js?v=1.93.0';
import {cupAfter,insertCupFixture} from './cup-scheduling.js?v=1.93.0';
export const FA_ID='fa-cup';
export const FA_ROUNDS=[
 {name:'First round',month:'11-14',byes:8,prize:10000},
 {name:'Second round',month:'12-05',byes:0,prize:15000},
 {name:'Third round',month:'01-02',byes:12,prize:30000},
 {name:'Fourth round',month:'01-23',byes:0,prize:50000},
 {name:'Fifth round',month:'02-13',byes:0,prize:75000},
 {name:'Quarter-finals',month:'03-06',byes:0,prize:125000},
 {name:'Semi-finals',month:'04-11',byes:0,prize:250000,neutral:true},
 {name:'Final',month:'05-22',byes:0,prize:500000,neutral:true}
];
const shuffle=(ids,seed)=>{let n=2166136261;for(const ch of seed)n=Math.imul(n^ch.charCodeAt(0),16777619);const a=[...ids];for(let i=a.length-1;i>0;i--){n^=n<<13;n^=n>>>17;n^=n<<5;const j=(n>>>0)%(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;};
export const faFixtures=c=>c.schedule.flatMap(r=>r.fixtures.filter(f=>f.competition===FA_ID).map(f=>({...f,date:r.date})));
export const faComplete=c=>!c.faCup||c.faCup.status!=='active';
function draw(c,index,entrants){
 const cup=c.faCup,config=FA_ROUNDS[index],clubs=shuffle(entrants,cup.seed+':'+index),byes=clubs.splice(0,config.byes);
 const previousEnd=faFixtures(c).filter(f=>f.cupRound===index-1).map(f=>f.date).sort().at(-1);
 let date=(Number(c.seasonStart.slice(0,4))+(index>=2?1:0))+'-'+config.month;
 for(const minimum of [cupAfter(c.date,1),previousEnd&&cupAfter(previousEnd,3)].filter(Boolean))if(date<minimum)date=minimum;
 const ties=[];for(let i=0;i<clubs.length;i+=2){const id=`FA-${cup.season}-${index}-${i/2}`,home=clubs[i],away=clubs[i+1];ties.push({id,home,away,winner:null});insertCupFixture(c,{home,away,competition:FA_ID,kind:'cup',cupRound:index,tie:id,leg:1,legs:1,replay:false,neutral:!!config.neutral,venue:config.neutral?(index===7?'Wembley Fields':'Neutral cup venue'):null,kickoff:'15:00',homeGoals:null,awayGoals:null},date);}
 const drawDate=index===0?c.seasonStart.slice(0,4)+'-11-07':c.date;
 cup.rounds.push({index,name:config.name,entrants:[...entrants],byes,ties,revealed:0,drawDate,eventSeen:false,completed:false});cup.current=index;
 // The first draw is announced on its November date by the shared event flow.
 if(drawDate<=c.date)c.news.push({date:c.date,kind:'cup-draw',important:entrants.includes(c.clubId),text:`FA Cup ${config.name.toLowerCase()} draw is ready.`,action:FA_ID});
}
export function initialiseFA(c,league){
 if(scottishCareer(c))return initialiseScottishCup(c,league,FA_ID);
 c.faHistory??=[];if(c.faCup){if(!validFA(c,league))throw Error('Invalid FA Cup save');return false;}
 if(c.date>c.seasonStart.slice(0,4)+'-11-07'){c.faCup={edition:1,season:c.season,status:'deferred',rounds:[],current:-1,paid:[]};c.news.push({date:c.date,kind:'cup',text:'FA Cup added: your existing season keeps its fixtures. The cup starts next season.',action:FA_ID});return false;}
 c.faCup={edition:1,season:c.season,status:'active',seed:`FA:${c.clubId}:${c.season}:${c.cupSeed??(c.cupSeed=Math.random().toString(36).slice(2))}`,late:league.clubs.filter(x=>['premier','first'].includes(divisionOf(c,x.id))).map(x=>x.id),rounds:[],current:-1,paid:[],winner:null};
 c.news.push({date:c.date,kind:'cup',text:`FA Cup: your club enter in the ${divisionOf(c)==='second'?'first':'third'} round. The 68-club field uses random byes in rounds one and three.`,action:FA_ID});draw(c,0,league.clubs.filter(x=>divisionOf(c,x.id)==='second').map(x=>x.id));return true;
}
function extra(f,score){const [h,a]=score(f.home,f.away);f.extraTime={home:Math.min(2,Math.floor(h/2)),away:Math.min(2,Math.floor(a/2))};f.homeGoals+=f.extraTime.home;f.awayGoals+=f.extraTime.away;}
export function resolveFA(c,f,score,random=Math.random){
 if(f.competition===FA_ID&&f.scottishCup)return resolveScottishCup(c,f,score,random);
 if(f.competition!==FA_ID||f.homeGoals===null||f.winner||f.replayRequired)return;
 const semi=f.cupRound===6,year=Number(c.seasonStart.slice(0,4));
 if(f.homeGoals===f.awayGoals&&(f.replay||semi||f.cupRound===7))extra(f,score);
 if(f.homeGoals!==f.awayGoals){f.winner=f.homeGoals>f.awayGoals?f.home:f.away;f.decision=f.extraTime?'extra time':'full time';return;}
 if(!f.replay&&(f.cupRound<6||semi&&year===1998)){
  f.replayRequired=true;f.decision='replay';const date=c.schedule.find(r=>r.fixtures.includes(f)).date;
  f.replayDate=insertCupFixture(c,{home:f.neutral?f.home:f.away,away:f.neutral?f.away:f.home,competition:FA_ID,kind:'cup',cupRound:f.cupRound,tie:f.tie,leg:1,legs:1,replay:true,neutral:!!f.neutral,venue:f.venue,venueId:f.venueId,kickoff:f.neutral?'15:00':'19:45',homeGoals:null,awayGoals:null},cupAfter(date,semi?3:10));return;
 }
 const win=random()<.5;f.penalties={home:win?5:4,away:win?4:5};f.winner=win?f.home:f.away;f.decision='penalties';
}
export function progressFA(c,league,name=id=>id){
 if(scottishCareer(c))return progressScottishCup(c,league,FA_ID);
 const cup=c.faCup;if(!cup||cup.status!=='active')return;const round=cup.rounds.at(-1),all=c.schedule.flatMap(r=>r.fixtures);
 for(const t of round.ties){const f=all.find(f=>f.competition===FA_ID&&f.tie===t.id&&f.winner);if(!f)continue;t.winner=f.winner;
  if(!cup.paid.includes(t.id)){if(t.winner===c.clubId){const amount=FA_ROUNDS[round.index].prize;c.balance+=amount;c.news.push({date:c.date,kind:'cup-prize',amount,text:`FA Cup ${round.name.toLowerCase()}: ${name(c.clubId)} ${round.index===7?'win the trophy':'progress'}; £${amount.toLocaleString('en-GB')} prize received.`,action:FA_ID});}else if(round.index===7&&[t.home,t.away].includes(c.clubId)){c.balance+=250000;c.news.push({date:c.date,kind:'cup-prize',amount:250000,text:'FA Cup runners-up prize: £250,000.',action:FA_ID});}cup.paid.push(t.id);}
 }
 if(!round.ties.every(t=>t.winner))return;round.completed=true;
 if(round.index===7){cup.status='complete';cup.winner=round.ties[0].winner;c.news.push({date:c.date,kind:'cup-winner',important:true,text:`${name(cup.winner)} win the FA Cup. European qualification is confirmed in the season review.`,action:FA_ID});return;}
 const entrants=[...round.byes,...round.ties.map(t=>t.winner)];if(round.index===1)entrants.push(...cup.late);draw(c,round.index+1,entrants);
}
export function rolloverFA(c,league){if(!faComplete(c))throw Error('Complete the FA Cup first');if(c.faCup)(c.faHistory??=[]).push(structuredClone(c.faCup));delete c.faCup;initialiseFA(c,league);}
export function validFA(c,league){if(scottishCareer(c))return validScottishCup(c,league,FA_ID);try{
 const p=c.faCup;if(!p)return !c.schedule.some(r=>r.fixtures.some(f=>f.competition===FA_ID));
 const ids=new Set(league.clubs.map(x=>x.id)),sizes=[24,16,52,32,16,8,4,2],all=c.schedule.flatMap(r=>r.fixtures).filter(f=>f.competition===FA_ID);
 if(p.edition!==1||p.season!==c.season||!['active','complete','deferred'].includes(p.status)||!Array.isArray(p.rounds)||!Array.isArray(p.paid))return false;
 if(p.status==='deferred')return p.rounds.length===0&&all.length===0&&p.current===-1;
 if(typeof p.seed!=='string'||!Array.isArray(p.late)||p.late.length!==44||new Set(p.late).size!==44||p.late.some(id=>!ids.has(id))||p.rounds.length<1||p.rounds.length>8||p.current!==p.rounds.length-1)return false;
 const tieIds=new Set();for(const [i,r]of p.rounds.entries()){
  if(r.index!==i||!Array.isArray(r.entrants)||r.entrants.length!==sizes[i]||new Set(r.entrants).size!==sizes[i]||r.entrants.some(id=>!ids.has(id))||!Array.isArray(r.byes)||r.byes.length!==FA_ROUNDS[i].byes||!Array.isArray(r.ties)||r.ties.length!==(sizes[i]-r.byes.length)/2||!Number.isInteger(r.revealed)||r.revealed<0||r.revealed>r.ties.length||!/^\d{4}-\d{2}-\d{2}$/.test(r.drawDate))return false;
  const field=[...r.byes,...r.ties.flatMap(t=>[t.home,t.away])];if(new Set(field).size!==sizes[i]||field.some(id=>!r.entrants.includes(id)))return false;
  if(i>0){const prev=p.rounds[i-1],expected=[...prev.byes,...prev.ties.map(t=>t.winner),...(i===2?p.late:[])];if(!prev.completed||new Set(expected).size!==sizes[i]||expected.some(id=>!r.entrants.includes(id)))return false;}
  for(const t of r.ties){if(tieIds.has(t.id)||typeof t.id!=='string'||t.winner!==null&&![t.home,t.away].includes(t.winner))return false;tieIds.add(t.id);const fs=all.filter(f=>f.tie===t.id),original=fs.find(f=>f.replay===false),replay=fs.find(f=>f.replay===true);if(fs.length!==(original?.replayRequired?2:1)||!original||original.home!==t.home||original.away!==t.away)return false;
   if(replay&&(replay.home!==(original.neutral?t.home:t.away)||replay.away!==(original.neutral?t.away:t.home)||original.replayDate!==c.schedule.find(x=>x.fixtures.includes(replay)).date))return false;
   for(const f of fs)if(f.kind!=='cup'||f.cupRound!==i||f.legs!==1||f.leg!==1||f.neutral!==!!FA_ROUNDS[i].neutral||f.winner!==undefined&&![f.home,f.away].includes(f.winner)||f.replayRequired&&(f.homeGoals!==f.awayGoals||f.winner))return false;
   if(t.winner&&!fs.some(f=>f.winner===t.winner))return false;
  }
  if(r.completed&&!r.ties.every(t=>t.winner))return false;
 }
 return all.every(f=>tieIds.has(f.tie))&&new Set(p.paid).size===p.paid.length&&p.paid.every(id=>tieIds.has(id))&&(p.status!=='complete'||p.rounds.length===8&&p.winner===p.rounds[7].ties[0].winner&&p.rounds[7].completed);
}catch{return false;}}
