import {scottishClub,scottishCareer} from './scottish-world.js?v=1.89.0';
import {insertCupFixture,cupAfter} from './cup-scheduling.js?v=1.93.0';
import {divisionTable,domesticClub} from './divisions.js?v=1.93.0';
import {clQualified} from './champions-league.js?v=1.93.0';
export const UC_ID='uefa-cup';
export const UC_OPENING_ENGLISH=['C02','C03','C09','C11','EU001','SC01','SC05','EU052'];
export const ucFixtures=c=>c.schedule.flatMap(r=>r.fixtures.filter(f=>f.competition===UC_ID).map(f=>({...f,date:r.date})));
const yearOf=c=>Number(c.seasonStart.slice(0,4));
const nation=(league,id)=>league.clubs.find(x=>x.id===id)?.country||'England';
const strength=(league,id)=>{const t=league.clubs.find(x=>x.id===id);return t.attack+t.defence;};
const randomFor=seed=>{let v=2166136261;for(const ch of seed)v=Math.imul(v^ch.charCodeAt(0),16777619);return()=>{v^=v<<13;v^=v>>>17;v^=v<<5;return(v>>>0)/4294967296;};};
const shuffle=(a,r)=>[...a].map(x=>({x,key:r()})).sort((a,b)=>a.key-b.key).map(x=>x.x);
// England's period base allocation: one league place and one place for each domestic cup.
// A CL-qualified FA winner passes its place to the non-CL finalist; duplicate places go down the league.
export function ucQualified(c,league,year=yearOf(c)+1,cl=clQualified(c,league,year)){
 const selected=[],routes={},add=(id,route)=>{if(!id||!(domesticClub(id)||scottishClub(id))||cl.includes(id)||selected.includes(id))return false;selected.push(id);routes[id]=route;return true;};
 for(const [division,slots,nation]of [['premier',3,'England'],['scot-premier',2,'Scotland']]){
  const rows=divisionTable(c,league,division).map(r=>r.id),same=id=>scottishClub(id)===(nation==='Scotland'),next=route=>{const id=rows.find(id=>!cl.includes(id)&&!selected.includes(id));if(!add(id,route))throw Error('No '+nation+' UEFA place available');};
  next('League position');
  const cups=nation==='Scotland'?[[c.faCup,'Scottish Cup']]:[[c.faCup,'FA Cup'],[c.leagueCup,'League Cup']];
  for(const [cup,title]of cups){
   const played=cup?.status==='complete'&&(cup.country==='Scotland')===(nation==='Scotland');
   if(played&&same(cup.winner)&&add(cup.winner,title+' winner'))continue;
   if(played&&title!=='League Cup'&&cl.includes(cup.winner)){const final=cup.rounds.at(-1).ties[0],runner=[final.home,final.away].find(id=>id!==cup.winner);if(add(runner,title+' runner-up'))continue;}
   next(title+' place passed to league');
  }
 }
 if(c.uefaCup?.status==='complete')add(c.uefaCup.winner,'UEFA Cup title holder');return {clubs:selected,routes};
}
export function selectUCEntrants(c,league){
 const count=yearOf(c)===1998?64:96,cl=new Set(c.championsLeague?.entrants||[]),english=yearOf(c)===1998?UC_OPENING_ENGLISH:c.ucQualified?.clubs||ucQualified(c,league,yearOf(c),[...cl].filter(domesticClub)).clubs;
 const selected=english.filter(id=>!cl.has(id)),pool=league.clubs.filter(x=>x.foreign&&!cl.has(x.id));const rng=randomFor(c.ucSeed+':entries:'+c.season);
 const holder=c.ucHistory?.at(-1)?.winner;if(holder&&pool.some(x=>x.id===holder)&&!selected.includes(holder))selected.push(holder);
 const ranked=pool.filter(x=>!selected.includes(x.id)).map(x=>({x,key:Math.pow(rng(),1/Math.max(1,(x.attack+x.defence)/2-55))})).sort((a,b)=>b.key-a.key);
 // Country weights choose a changing field; no complete foreign domestic leagues are simulated.
 selected.push(...ranked.slice(0,count-selected.length).map(x=>x.x.id));
 if(selected.length!==count||new Set(selected).size!==count)throw Error('UEFA Cup period pool cannot fill the field');return selected;
}
const sizes=c=>c.uefaCup.format==='1998'?[64,32,16,8,4,2]:[96,48,32,16,8,4,2];
const names=c=>c.uefaCup.format==='1998'?['First round','Second round','Third round','Quarter-finals','Semi-finals','Final']:['First round','Second round','Third round','Fourth round','Quarter-finals','Semi-finals','Final'];
function periodDate(c,mmdd){const year=yearOf(c)+(Number(mmdd.slice(0,2))<8?1:0);let date=year+'-'+mmdd;if(yearOf(c)>1998){const weekday=new Date(date+'T12:00:00Z').getUTCDay(),target=mmdd==='05-17'?3:4;date=cupAfter(date,(target-weekday+10)%7-3);}return date;}
function addRound(c,league,entrants){
 const uc=c.uefaCup,index=uc.rounds.length,n=entrants.length,rng=randomFor(uc.seed+':draw:'+index),early=index<3,sorted=[...entrants].sort((a,b)=>strength(league,b)-strength(league,a)||a.localeCompare(b));let pairs=[];
 if(early){
  // CL third-place transfers are seeded apart and cannot draw a club from their old CL group.
  const transfers=index===2?uc.transfers:[],seeded=[...transfers,...sorted.filter(id=>!transfers.includes(id))].slice(0,n/2),unseeded=entrants.filter(id=>!seeded.includes(id));
  const group=id=>c.championsLeague?.stages?.[0]?.groups?.find(g=>g.clubs.includes(id))?.name;
  let nodes=0;const fill=(i,available)=>{if(++nodes>500000)return false;if(i===seeded.length)return true;const h=seeded[i];for(const a of shuffle(available,rng)){if(nation(league,h)===nation(league,a)||transfers.includes(h)&&group(h)&&group(h)===group(a))continue;pairs.push([h,a]);if(fill(i+1,available.filter(id=>id!==a)))return true;pairs.pop();}return false;};
  if(!fill(0,unseeded))throw Error('Cannot create UEFA Cup country-separated draw');
  pairs=pairs.map(([h,a])=>rng()<.5?[h,a]:[a,h]);
 }else{const ids=shuffle(entrants,rng);for(let i=0;i<n;i+=2)pairs.push([ids[i],ids[i+1]]);}
 const final=n===2,legs=final?1:2,dates=uc.format==='1998'?['09-15','10-20','11-24','03-02','04-06','05-12']:['09-16','10-21','11-25','03-02','03-16','04-06','05-17'];
 let preferred=periodDate(c,dates[index]);if(preferred<=c.date)preferred=cupAfter(c.date,3);
 const ties=pairs.map(([home,away],i)=>({id:`UC-${c.season}-${index}-${i}`,home,away,winner:null}));const drawDate=index===0?periodDate(c,'08-28'):c.date;
 const round={index,name:names(c)[index],type:'knockout',entrants:[...entrants],ties,selections:ties.map(t=>({home:t.home,away:t.away})),revealed:0,drawDate,eventSeen:false,completed:false};uc.rounds.push(round);uc.current=index;uc.awaitingTransfers=false;
 for(const t of ties){const f={competition:UC_ID,kind:'cup',ucRound:index,tie:t.id,leg:1,legs,home:t.home,away:t.away,neutral:final,kickoff:'19:45',homeGoals:null,awayGoals:null};if(final)f.venueId=['EU025','EU032','EU014'].filter(id=>![t.home,t.away].includes(id))[(yearOf(c)-1998)%['EU025','EU032','EU014'].filter(id=>![t.home,t.away].includes(id)).length];const first=insertCupFixture(c,f,preferred);if(legs===2)insertCupFixture(c,{...f,home:t.away,away:t.home,leg:2},cupAfter(first,uc.format==='1998'&&index===1?14:uc.format==='1998'&&index===2?14:index>=3&&index<sizes(c).length-1?7:14));}
 if(drawDate<=c.date)announce(c,round);
}
function announce(c,r){c.news.push({date:r.drawDate,kind:'cup-draw',important:r.entrants.includes(c.clubId),text:`UEFA Cup ${r.name.toLowerCase()} draw is ready.${r.entrants.includes(c.clubId)?' Your club are taking part.':''}`,action:UC_ID});r.announced=true;}
export function initialiseUC(c,league){
 c.ucHistory??=[];c.ucStats??={};c.ucPlayedFor??={};c.ucSeed??=Math.random().toString(36).slice(2);
 if(c.uefaCup){if(!validUC(c,league))throw Error('Invalid UEFA Cup save');return false;}
 if(c.date>yearOf(c)+'-08-28'||c.championsLeague?.status==='deferred'){
  c.uefaCup={edition:1,season:c.season,status:'deferred',rounds:[],paid:[]};c.news.push({date:c.date,kind:'cup',text:'UEFA Cup begins next season in this existing career; existing dates and results are retained.',action:UC_ID});return false;
 }
 const entrants=selectUCEntrants(c,league);c.uefaCup={edition:1,season:c.season,status:'active',format:yearOf(c)===1998?'1998':'1999',seed:c.ucSeed+':'+c.season,entrants,rounds:[],current:-1,transfers:[],awaitingTransfers:false,paid:[],winner:null};addRound(c,league,entrants);
 if(yearOf(c)===1999)c.news.push({date:c.date,kind:'competition-format',important:true,text:'UEFA Cup format update: 96 clubs enter the first round. The 24 second-round winners join eight Champions League third-place clubs in the third round. Domestic cup winners now enter this competition. It remains a knockout tournament with a single neutral final; this period format is retained in future seasons.',action:UC_ID});return true;
}
export function resolveUC(c,f,score,random=Math.random){
 if(f.competition!==UC_ID||f.homeGoals===null||f.winner||f.legs===2&&f.leg===1)return;
 let h=f.homeGoals,a=f.awayGoals,awayH=0,awayA=f.awayGoals;
 if(f.legs===2){const first=ucFixtures(c).find(x=>x.tie===f.tie&&x.leg===1);if(!first||first.homeGoals===null)return;h+=first.awayGoals;a+=first.homeGoals;awayH=first.awayGoals;}
 if(h===a&&f.legs===2&&awayH!==awayA){f.winner=awayH>awayA?f.home:f.away;f.decision='away goals';return;}
 if(h===a){const [eh,ea]=score(f.home,f.away);f.extraTime={home:Math.min(2,Math.floor(eh/2)),away:Math.min(2,Math.floor(ea/2))};f.homeGoals+=f.extraTime.home;f.awayGoals+=f.extraTime.away;h+=f.extraTime.home;a+=f.extraTime.away;awayA+=f.extraTime.away;}
 if(h!==a)f.winner=h>a?f.home:f.away;else if(f.legs===2&&awayH!==awayA){f.winner=awayH>awayA?f.home:f.away;f.decision='away goals';}else{const win=random()<.5;f.penalties={home:win?5:4,away:win?4:5};f.winner=win?f.home:f.away;f.decision='penalties';}
 f.decision??=f.extraTime?'extra time':f.legs===2?'aggregate':'full time';
}
export function progressUC(c,league,name=id=>id){
 const uc=c.uefaCup;if(uc?.status!=='active')return;const r=uc.rounds.at(-1),fs=ucFixtures(c).filter(f=>f.ucRound===r.index);if(fs.some(f=>f.homeGoals===null))return;
 for(const t of r.ties){t.winner=fs.find(f=>f.tie===t.id&&f.leg===f.legs)?.winner||null;if(!t.winner)return;}
 if(!r.completed){r.completed=true;const won=r.ties.some(t=>t.winner===c.clubId),key='round-'+r.index;if(won&&!uc.paid.includes(key)){const amount=r.ties.length===1?750000:50000*(r.index+1);c.balance+=amount;uc.paid.push(key);c.news.push({date:c.date,kind:'cup-prize',amount,text:`UEFA Cup ${r.name.toLowerCase()} payment: £${amount.toLocaleString('en-GB')} (game estimate).`,action:UC_ID});}}
 if(r.ties.length===1){uc.status='complete';uc.winner=r.ties[0].winner;c.news.push({date:c.date,kind:'cup-winner',important:true,text:`${name(uc.winner)} win the UEFA Cup.`,action:UC_ID});return;}
 let entrants=r.ties.map(t=>t.winner);
 if(uc.format==='1999'&&r.index===1){const cl=c.championsLeague;if(!cl?.stages?.[0]?.completed||cl.uefaTransfers?.length!==8){uc.awaitingTransfers=true;return;}
  uc.transfers=[...cl.uefaTransfers];entrants.push(...uc.transfers);if(new Set(entrants).size!==32||uc.transfers.some(id=>uc.entrants.includes(id)))throw Error('Invalid Champions League transfers');uc.entrants.push(...uc.transfers);c.news.push({date:c.date,kind:'cup',important:uc.transfers.includes(c.clubId),text:`Eight Champions League third-place clubs enter the UEFA Cup third round: ${uc.transfers.map(name).join(', ')}.`,action:UC_ID});
 }
 addRound(c,league,entrants);
}
export function rolloverUC(c,league){if(c.uefaCup?.status==='active')throw Error('Complete UEFA Cup first');if(c.uefaCup)c.ucHistory.push(structuredClone(c.uefaCup));delete c.uefaCup;c.ucStats={};c.ucPlayedFor={};initialiseUC(c,league);}
export function validUC(c,league){
 const uc=c.uefaCup,fs=ucFixtures(c);if(!uc)return !fs.length;const ids=new Set(league.clubs.map(x=>x.id));if(uc.edition!==1||uc.season!==c.season||!['active','complete','deferred'].includes(uc.status)||!Array.isArray(uc.rounds)||!Array.isArray(uc.paid)||new Set(uc.paid).size!==uc.paid.length)return false;if(uc.status==='deferred')return !uc.rounds.length&&!fs.length;
 const expected=uc.format==='1998'?[64,32,16,8,4,2]:uc.format==='1999'?[96,48,32,16,8,4,2]:null;if(!expected||typeof uc.seed!=='string'||!Array.isArray(uc.entrants)||new Set(uc.entrants).size!==uc.entrants.length||uc.entrants.some(id=>!ids.has(id))||!Array.isArray(uc.transfers)||![0,8].includes(uc.transfers.length)||new Set(uc.transfers).size!==uc.transfers.length||uc.entrants.length!==expected[0]+uc.transfers.length||uc.current!==uc.rounds.length-1||!uc.rounds.length||uc.rounds.length>expected.length||uc.status==='complete'&&uc.rounds.length!==expected.length||uc.format==='1998'&&uc.transfers.length)return false;
 const opening=uc.rounds[0].entrants;if(opening.some(id=>c.championsLeague?.entrants?.includes(id))||uc.transfers.some(id=>opening.includes(id)||!c.championsLeague?.uefaTransfers?.includes(id)))return false;
 if(uc.transfers.length&&uc.rounds.length<3||uc.status==='active'&&uc.rounds.at(-1).completed&&!uc.awaitingTransfers)return false;
 if(uc.awaitingTransfers&&!(uc.format==='1999'&&uc.rounds.length===2&&uc.rounds[1].completed&&!uc.transfers.length))return false;
 for(const [i,r]of uc.rounds.entries()){
  if(r.index!==i||r.type!=='knockout'||r.entrants?.length!==expected[i]||new Set(r.entrants).size!==r.entrants.length||r.entrants.some(id=>!uc.entrants.includes(id))||r.ties?.length!==r.entrants.length/2||new Set(r.ties.map(t=>t.id)).size!==r.ties.length||new Set(r.ties.flatMap(t=>[t.home,t.away])).size!==r.entrants.length||r.ties.some(t=>!r.entrants.includes(t.home)||!r.entrants.includes(t.away)||t.winner!==null&&![t.home,t.away].includes(t.winner))||r.selections?.length!==r.ties.length||r.selections.some((t,j)=>t.home!==r.ties[j].home||t.away!==r.ties[j].away)||!Number.isInteger(r.revealed)||r.revealed<0||r.revealed>r.selections.length||!/^\d{4}-\d{2}-\d{2}$/.test(r.drawDate)||i<uc.rounds.length-1&&!r.completed)return false;
  if(i>0){const from=uc.rounds[i-1].ties.map(t=>t.winner),wanted=i===2&&uc.format==='1999'?[...from,...uc.transfers]:from;if(wanted.length!==r.entrants.length||wanted.some(id=>!r.entrants.includes(id)))return false;}
  const rf=fs.filter(f=>f.ucRound===i),legs=expected[i]===2?1:2;if(rf.length!==r.ties.length*legs||r.completed&&rf.some(f=>f.homeGoals===null)||r.completed&&r.ties.some(t=>!t.winner))return false;
  if(i<3&&r.ties.some(t=>nation(league,t.home)===nation(league,t.away)||i===2&&uc.transfers.includes(t.home)&&uc.transfers.includes(t.away)))return false;
  for(const t of r.ties){const tf=rf.filter(f=>f.tie===t.id);if(tf.length!==legs||new Set(tf.map(f=>f.leg)).size!==legs||tf.some(f=>f.legs!==legs||f.leg<1||f.leg>legs||f.leg===1&&(f.home!==t.home||f.away!==t.away)||f.leg===2&&(f.home!==t.away||f.away!==t.home))||t.winner&&tf.find(f=>f.leg===legs)?.winner!==t.winner)return false;}
 }
 return fs.every(f=>Number.isInteger(f.ucRound)&&uc.rounds[f.ucRound]&&f.kind==='cup'&&(f.homeGoals===null)===(f.awayGoals===null)&&[f.homeGoals,f.awayGoals].every(g=>g===null||Number.isInteger(g)&&g>=0)&&(!f.winner||[f.home,f.away].includes(f.winner)))&&(uc.status!=='complete'||uc.winner===uc.rounds.at(-1).ties[0].winner);
}
