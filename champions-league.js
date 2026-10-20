import {scottishClub,scottishPlayable} from './scottish-world.js?v=1.89.0';
import {insertCupFixture,cupAfter} from './cup-scheduling.js?v=1.93.0';
import {divisionTable} from './divisions.js?v=1.93.0';
export const CL_ID='champions-league';
export const clSlots=year=>year<1999?2:year<2002?3:4;
export const clFixtures=c=>c.schedule.flatMap(r=>r.fixtures.filter(f=>f.competition===CL_ID).map(f=>({...f,date:r.date})));
const randomFor=seed=>{let v=2166136261;for(const ch of seed)v=Math.imul(v^ch.charCodeAt(0),16777619);return()=>{v^=v<<13;v^=v>>>17;v^=v<<5;return (v>>>0)/4294967296;}};
const shuffle=(a,r)=>[...a].map(x=>({x,k:r()})).sort((a,b)=>a.k-b.k).map(o=>o.x);
const country=(league,id)=>league.clubs.find(c=>c.id===id)?.country||'England';
const strength=(league,id)=>{const c=league.clubs.find(c=>c.id===id);return c.attack+c.defence;};
const firstEntrants=['C01','C12','EU004','EU002','EU006','EU010','EU009','EU017','EU013','EU019','EU024','EU027','EU031','EU029','EU033','EU034','EU036','EU038','EU039','EU040','EU043','EU045','EU046','EU050'];
export function clQualified(c,league,year=Number(c.seasonStart.slice(0,4))+1){const english=divisionTable(c,league,'premier').slice(0,clSlots(year)).map(r=>r.id),scottish=divisionTable(c,league,'scot-premier').slice(0,1).map(r=>r.id),ids=[...english,...scottish],holder=c.championsLeague?.status==='complete'?c.championsLeague.winner:null;if(holder&&(/^C\d{2}$/.test(holder)||scottishPlayable(holder))&&!ids.includes(holder)){if(scottishClub(holder))ids[ids.length-1]=holder;else ids[english.length-1]=holder;}return ids;}
export function selectCLEntrants(c,league){
 const year=Number(c.seasonStart.slice(0,4));if(year===1998)return [...firstEntrants];
 const rng=randomFor(c.clSeed+':entrants:'+c.season),english=c.clQualified||[],selected=[...english],pool=league.clubs.filter(x=>x.foreign&&x.clEligible);const holder=c.clHistory?.at(-1)?.winner;if(holder?.startsWith('EU')&&pool.some(x=>x.id===holder))selected.push(holder);
 const take=(nation,count)=>{const options=pool.filter(x=>x.country===nation&&!selected.includes(x.id)).map(x=>({x,key:Math.pow(rng(),1/Math.max(1,(x.attack+x.defence)/2-55))})).sort((a,b)=>b.key-a.key);selected.push(...options.slice(0,Math.max(0,count-selected.filter(id=>country(league,id)===nation).length)).map(o=>o.x.id));};
 for(const [nation,n]of Object.entries({Spain:4,Italy:4,Germany:3,France:3,Netherlands:2,Portugal:2}))take(nation,n);
 while(selected.length<32){const candidates=pool.filter(x=>!selected.includes(x.id)&&selected.filter(id=>country(league,id)===x.country).length<( ['Spain','Italy','Germany'].includes(x.country)?4:['France','Netherlands','Portugal'].includes(x.country)?3:2));const weights=candidates.map(x=>Math.max(1,(x.attack+x.defence)/2-55));let roll=rng()*weights.reduce((a,b)=>a+b,0),i=0;while(i<weights.length-1&&(roll-=weights[i])>0)i++;if(!candidates[i])throw Error('European pool exhausted');selected.push(candidates[i].id);}
 return selected;
}
function allocateGroups(entrants,count,league,rng,previous=null){
 const sorted=[...entrants].sort((a,b)=>strength(league,b)-strength(league,a)||a.localeCompare(b));
 let pots=Array.from({length:4},(_,i)=>sorted.slice(i*count,(i+1)*count));
 if(previous){const winners=previous.map(g=>clGroupTable(previous.career,g).at(0).id),runners=previous.map(g=>clGroupTable(previous.career,g)[1].id);pots=[winners.slice(0,count),winners.slice(count),runners.slice(0,count),runners.slice(count)];}
 const original=id=>previous?.find(g=>g.clubs.includes(id))?.name;
 for(let attempt=0;attempt<500;attempt++){
  const groups=Array.from({length:count},(_,i)=>({name:String.fromCharCode(65+i),clubs:[]}));let nodes=0;
  const fill=(pot,index,remaining)=>{if(++nodes>20000)return false;if(pot===4)return true;if(index===count)return fill(pot+1,0,shuffle(pots[pot+1]||[],rng));
   for(const id of remaining){if(groups[index].clubs.some(x=>country(league,x)===country(league,id)||previous&&original(x)===original(id)))continue;groups[index].clubs.push(id);if(fill(pot,index+1,remaining.filter(x=>x!==id)))return true;groups[index].clubs.pop();}return false;};
  if(fill(0,0,shuffle(pots[0],rng)))return groups;
 }
 throw Error('Could not create a valid European group draw');
}
function announce(c,stage){const involved=stage.entrants.includes(c.clubId);c.news.push({date:stage.drawDate,kind:'cup-draw',important:involved,text:`Champions League ${stage.name.toLowerCase()} draw is ready.${involved?' Your club are taking part.':''}`,action:CL_ID});stage.announced=true;}
const stageDate=(c,month)=>{const year=Number(c.seasonStart.slice(0,4))+(Number(month.slice(0,2))<8?1:0);let date=year+'-'+month;if(Number(c.seasonStart.slice(0,4))>1998&&!['08-28','02-29'].includes(month)){const weekday=new Date(date+'T12:00:00Z').getUTCDay(),target=month==='05-24'?3:2,delta=(target-weekday+10)%7-3;date=cupAfter(date,delta);}return date;};
function addGroups(c,league,index,entrants,previous=null){
 const cl=c.championsLeague,count=index===0?(cl.format==='1998'?6:8):4,rng=randomFor(cl.seed+':groups:'+index),groups=allocateGroups(entrants,count,league,rng,previous);
 const dates=index===1?['11-23','12-07','02-29','03-07','03-14','03-21']:cl.format!=='1999'?['09-16','09-30','10-21','11-04','11-25','12-09']:['09-14','09-21','09-28','10-19','10-26','11-02'];
 // Later fictional years retain the period matchweek spacing; leap-day becomes 28 February.
 if(index===1&&new Date(stageDate(c,'02-29')+'T12:00:00Z').getUTCMonth()!==1)dates[2]='02-28';
 const drawDate=index===0?stageDate(c,'08-28'):c.date;
 const stage={index,name:index===0?'Group stage':'Second group stage',type:'groups',entrants:[...entrants],groups,selections:groups.flatMap(g=>g.clubs.map(id=>({group:g.name,id}))),revealed:0,drawDate,eventSeen:false,completed:false};
 cl.stages.push(stage);cl.current=index;
 const pairings=[[[0,3],[1,2]],[[3,1],[2,0]],[[0,1],[2,3]],[[1,0],[3,2]],[[3,0],[2,1]],[[1,3],[0,2]]];
 for(let day=0;day<6;day++)for(const group of groups)for(const [h,a]of pairings[day]){let preferred=stageDate(c,dates[day]);if(preferred<=c.date)preferred=cupAfter(c.date,3);insertCupFixture(c,{home:group.clubs[h],away:group.clubs[a],competition:CL_ID,kind:'cup',clStage:index,group:group.name,matchday:day+1,kickoff:'19:45',homeGoals:null,awayGoals:null},preferred);}
 if(drawDate<=c.date)announce(c,stage);
}
export function initialiseCL(c,league){
 c.clHistory??=[];c.clStats??={};c.clPlayedFor??={};c.clSeed??=Math.random().toString(36).slice(2);
 if(c.championsLeague){if(!validCL(c,league))throw Error('Invalid Champions League save');return false;}
 const year=Number(c.seasonStart.slice(0,4));
 if(c.date>year+'-08-28'){c.championsLeague={edition:1,season:c.season,status:'deferred',stages:[],paid:[]};c.news.push({date:c.date,kind:'cup',text:'Champions League begins next season in this existing career; this season’s fixtures and results are retained.',action:CL_ID});return false;}
 if(year!==1998&&!c.clQualified)c.clQualified=divisionTable(c,league,'premier').slice(0,clSlots(year)).map(r=>r.id);
 const entrants=selectCLEntrants(c,league);c.championsLeague={edition:1,season:c.season,status:'active',format:year===1998?'1998':year<2003?'1999':'2003',seed:c.clSeed+':'+c.season,entrants,stages:[],current:-1,paid:[],winner:null,uefaTransfers:[]};addGroups(c,league,0,entrants);if(year===1999||year===2003)c.news.push({date:c.date,kind:'competition-format',important:true,text:year===1999?'Champions League format update: 32 clubs in eight groups. The top two enter a second group stage; the top two from each of those four groups reach the quarter-finals. Third place in the first stage transfers into the UEFA Cup third round.':'Champions League format update: the second group stage is replaced by a two-legged round of 16. The top two from each of eight groups progress.',action:CL_ID});return true;
}
export function clGroupTable(c,group,stageIndex=c.championsLeague.current){
 const rows=Object.fromEntries(group.clubs.map(id=>[id,{id,P:0,W:0,D:0,L:0,GF:0,GA:0,Pts:0}])),fixtures=clFixtures(c).filter(f=>f.clStage===stageIndex&&f.group===group.name&&f.homeGoals!==null);
 const apply=(rs,f)=>{const h=rs[f.home],a=rs[f.away];h.P++;a.P++;h.GF+=f.homeGoals;h.GA+=f.awayGoals;a.GF+=f.awayGoals;a.GA+=f.homeGoals;if(f.homeGoals>f.awayGoals){h.W++;a.L++;h.Pts+=3;}else if(f.homeGoals<f.awayGoals){a.W++;h.L++;a.Pts+=3;}else{h.D++;a.D++;h.Pts++;a.Pts++;}};
 fixtures.forEach(f=>apply(rows,f));
 const tied=pts=>Object.values(rows).filter(r=>r.Pts===pts).map(r=>r.id),mini=pts=>{const ids=tied(pts),rs=Object.fromEntries(ids.map(id=>[id,{id,P:0,W:0,D:0,L:0,GF:0,GA:0,Pts:0,away:0}]));for(const f of fixtures.filter(f=>ids.includes(f.home)&&ids.includes(f.away))){apply(rs,f);rs[f.away].away+=f.awayGoals;}return rs;};
 return Object.values(rows).sort((a,b)=>{if(a.Pts!==b.Pts)return b.Pts-a.Pts;const m=mini(a.Pts),h=m[a.id],j=m[b.id];return j.Pts-h.Pts||(j.GF-j.GA)-(h.GF-h.GA)||j.away-h.away||(b.GF-b.GA)-(a.GF-a.GA)||b.GF-a.GF||a.id.localeCompare(b.id);});
}
function addKnockout(c,league,entrants,previous){
 const cl=c.championsLeague,n=entrants.length,index=cl.stages.length,rng=randomFor(cl.seed+':knockout:'+n);let pairs=[];
 if(previous?.groups){const tables=previous.groups.map(g=>clGroupTable(c,g,previous.index)),origin=id=>previous.groups.find(g=>g.clubs.includes(id))?.name,winners=tables.map(t=>t[0].id),runners=entrants.filter(id=>!winners.includes(id));
  const fill=remaining=>{if(!remaining.length)return true;const h=remaining[0];for(const a of shuffle(remaining.slice(1),rng)){if(origin(h)===origin(a)||n===16&&country(league,h)===country(league,a)||cl.format==='1998'&&runners.includes(h)&&runners.includes(a)||cl.format!=='1998'&&winners.includes(h)===winners.includes(a))continue;pairs.push([h,a]);if(fill(remaining.filter(id=>id!==h&&id!==a)))return true;pairs.pop();}return false;};if(!fill(shuffle(entrants,rng)))throw Error('Invalid quarter-final draw');
 }else{const ids=shuffle(entrants,rng);for(let i=0;i<n;i+=2)pairs.push([ids[i],ids[i+1]]);}
 if(previous?.groups&&cl.format!=='1998'){const winners=previous.groups.map(g=>clGroupTable(c,g,previous.index)[0].id);pairs=pairs.map(([h,a])=>winners.includes(h)?[a,h]:[h,a]);}
 const name=n===16?'Round of 16':n===8?'Quarter-finals':n===4?'Semi-finals':'Final',legs=n===2?1:2,month=n===16?'02-24':n===8?(cl.format==='1998'?'03-03':'04-04'):n===4?(cl.format==='1998'?'04-07':'05-02'):(cl.format==='1998'?'05-26':'05-24');let preferred=stageDate(c,month);if(preferred<=c.date)preferred=cupAfter(c.date,3);
 const ties=pairs.map(([home,away],i)=>({id:`CL-${c.season}-${index}-${i}`,home,away,winner:null})),stage={index,name,type:'knockout',entrants:[...entrants],ties,selections:ties.map(t=>({home:t.home,away:t.away})),revealed:0,drawDate:c.date,eventSeen:false,completed:false};cl.stages.push(stage);cl.current=index;
 for(const t of ties){const f={home:t.home,away:t.away,competition:CL_ID,kind:'cup',clStage:index,tie:t.id,leg:1,legs,neutral:n===2,kickoff:'19:45',homeGoals:null,awayGoals:null};if(n===2)f.venueId=['EU002','EU023','EU013'][(Number(c.seasonStart.slice(0,4))-1998)%3];const first=insertCupFixture(c,f,preferred);if(legs===2)insertCupFixture(c,{...f,home:t.away,away:t.home,leg:2},cupAfter(first,n===8?14:14));}announce(c,stage);
}
export function resolveCL(c,f,score,random=Math.random){
 if(f.competition!==CL_ID||!f.tie||f.homeGoals===null||f.winner||f.legs===2&&f.leg===1)return;
 let h=f.homeGoals,a=f.awayGoals,awayH=0,awayA=f.awayGoals;
 if(f.legs===2){const first=clFixtures(c).find(x=>x.tie===f.tie&&x.leg===1);if(!first||first.homeGoals===null)return;h+=first.awayGoals;a+=first.homeGoals;awayH=first.awayGoals;}
 if(h===a&&f.legs===2&&awayH!==awayA){f.winner=awayH>awayA?f.home:f.away;f.decision='away goals';return;}
 if(h===a){const [eh,ea]=score(f.home,f.away);f.extraTime={home:Math.min(2,Math.floor(eh/2)),away:Math.min(2,Math.floor(ea/2))};f.homeGoals+=f.extraTime.home;f.awayGoals+=f.extraTime.away;h+=f.extraTime.home;a+=f.extraTime.away;awayA+=f.extraTime.away;}
 if(h!==a)f.winner=h>a?f.home:f.away;
 else if(f.legs===2&&awayH!==awayA){f.winner=awayH>awayA?f.home:f.away;f.decision='away goals';}
 else{const win=random()<.5;f.penalties={home:win?5:4,away:win?4:5};f.winner=win?f.home:f.away;f.decision='penalties';}
 f.decision??=f.extraTime?'extra time':f.legs===2?'aggregate':'full time';
}
export function progressCL(c,league,name=id=>id){
 const cl=c.championsLeague;if(cl?.status!=='active')return;for(const f of clFixtures(c).filter(f=>f.homeGoals!==null&&f.group&&[f.home,f.away].includes(c.clubId))){const key=`group-${f.clStage}-${f.group}-${f.matchday}-${f.home}`;if(!cl.paid.includes(key)){const us=f.home===c.clubId?f.homeGoals:f.awayGoals,them=f.home===c.clubId?f.awayGoals:f.homeGoals,amount=us>them?200000:us===them?100000:0;c.balance+=amount;cl.paid.push(key);if(amount)c.news.push({date:c.date,kind:'cup-prize',amount,text:`Champions League group performance payment: £${amount.toLocaleString('en-GB')} (game estimate).`,action:CL_ID});}}
 const stage=cl.stages.at(-1),fixtures=clFixtures(c).filter(f=>f.clStage===stage.index);if(!fixtures.length||fixtures.some(f=>f.homeGoals===null))return;
 if(stage.type==='groups'){
  const tables=stage.groups.map(g=>clGroupTable(c,g,stage.index));stage.completed=true;
  if(stage.index===0&&cl.format==='1999'){cl.uefaTransfers=tables.map(t=>t[2].id);const previous=stage.groups;previous.career=c;addGroups(c,league,1,tables.flatMap(t=>[t[0].id,t[1].id]),previous);delete previous.career;return;}
  if(stage.index===0&&cl.format==='2003')cl.uefaTransfers=tables.map(t=>t[2].id);
  const qualifiers=cl.format==='1998'?[...tables.map(t=>t[0].id),...tables.map(t=>t[1]).sort((a,b)=>b.Pts-a.Pts||(b.GF-b.GA)-(a.GF-a.GA)||b.GF-a.GF||a.id.localeCompare(b.id)).slice(0,2).map(t=>t.id)]:tables.flatMap(t=>[t[0].id,t[1].id]);addKnockout(c,league,qualifiers,stage);
 }else{
  for(const t of stage.ties){t.winner=fixtures.find(f=>f.tie===t.id&&f.leg===f.legs)?.winner||null;if(!t.winner)return;}
  stage.completed=true;if(stage.ties.length===1){cl.status='complete';cl.winner=stage.ties[0].winner;c.news.push({date:c.date,kind:'cup-winner',important:true,text:`${name(cl.winner)} win the Champions League.`,action:CL_ID});if(cl.winner===c.clubId&&!cl.paid.includes('champion')){c.balance+=2000000;cl.paid.push('champion');c.news.push({date:c.date,kind:'cup-prize',amount:2000000,text:'Champions League winners’ prize: £2,000,000 (game estimate).',action:CL_ID});}}else addKnockout(c,league,stage.ties.map(t=>t.winner),stage);
 }
}
export function rolloverCL(c,league){if(c.championsLeague?.status==='active')throw Error('Complete Europe first');if(c.championsLeague)c.clHistory.push(structuredClone(c.championsLeague));delete c.championsLeague;c.clStats={};c.clPlayedFor={};initialiseCL(c,league);}
export function validCL(c,league){
 const cl=c.championsLeague;if(!cl)return !clFixtures(c).length;const ids=new Set(league.clubs.filter(x=>!x.foreign||x.clEligible).map(x=>x.id));if(cl.edition!==1||cl.season!==c.season||!['active','complete','deferred'].includes(cl.status)||!Array.isArray(cl.stages)||!Array.isArray(cl.paid))return false;if(cl.status==='deferred')return !cl.stages.length&&!clFixtures(c).length;
 const size=cl.format==='1998'?24:['1999','2003'].includes(cl.format)?32:0;if(!size||cl.entrants?.length!==size||new Set(cl.entrants).size!==size||cl.entrants.some(id=>!ids.has(id))||cl.current!==cl.stages.length-1||cl.stages.length<1||cl.stages.length>5||typeof cl.seed!=='string')return false;
 const types=cl.format==='1999'?['groups','groups','knockout','knockout','knockout']:['groups','knockout','knockout','knockout',...(cl.format==='2003'?['knockout']:[])],sizes=cl.format==='1998'?[24,8,4,2]:cl.format==='1999'?[32,16,8,4,2]:[32,16,8,4,2];if(new Set(cl.paid).size!==cl.paid.length||cl.stages.length>types.length||cl.status==='complete'&&cl.stages.length!==types.length)return false;
 const fs=clFixtures(c);for(const [i,s]of cl.stages.entries()){
  if(s.type!==types[i]||s.entrants?.length!==sizes[i]||s.index!==i||!Array.isArray(s.entrants)||new Set(s.entrants).size!==s.entrants.length||s.entrants.some(id=>!cl.entrants.includes(id))||!Array.isArray(s.selections)||!Number.isInteger(s.revealed)||s.revealed<0||s.revealed>s.selections.length||!/^\d{4}-\d{2}-\d{2}$/.test(s.drawDate))return false;
  const fixtures=fs.filter(f=>f.clStage===i);if(i<cl.stages.length-1&&!s.completed||s.completed&&fixtures.some(f=>f.homeGoals===null))return false;
  if(s.type==='groups'){if(!Array.isArray(s.groups)||s.groups.length!==(i===0?size/4:4)||new Set(s.groups.flatMap(g=>g.clubs)).size!==s.entrants.length||new Set(s.groups.map(g=>g.name)).size!==s.groups.length||s.groups.some(g=>new Set(g.clubs.map(id=>country(league,id))).size!==4||g.clubs.length!==4||new Set(g.clubs).size!==4||g.clubs.some(id=>!s.entrants.includes(id)))||s.selections.length!==s.entrants.length||s.selections.some((x,j)=>x.id!==s.groups.flatMap(g=>g.clubs)[j]||x.group!==s.groups[Math.floor(j/4)].name)||fixtures.some(f=>!Number.isInteger(f.matchday)||f.matchday<1||f.matchday>6)||fixtures.length!==s.groups.length*12)return false;for(const g of s.groups)for(const h of g.clubs)for(const a of g.clubs)if(h!==a&&fixtures.filter(f=>f.group===g.name&&f.home===h&&f.away===a).length!==1)return false;
  }else if(s.type==='knockout'){if(!Array.isArray(s.ties)||s.selections.length!==s.ties.length||s.selections.some((x,j)=>x.home!==s.ties[j].home||x.away!==s.ties[j].away)||s.ties.length!==s.entrants.length/2||new Set(s.ties.flatMap(t=>[t.home,t.away])).size!==s.entrants.length||s.ties.some(t=>!s.entrants.includes(t.home)||!s.entrants.includes(t.away)||t.winner!==null&&![t.home,t.away].includes(t.winner)))return false;for(const t of s.ties){const legs=s.entrants.length===2?1:2,tf=fixtures.filter(f=>f.tie===t.id);if(tf.length!==legs||tf.some(f=>f.legs!==legs||!Number.isInteger(f.leg)||f.leg<1||f.leg>legs)||new Set(tf.map(f=>f.leg)).size!==legs||tf.some(f=>f.leg===1?f.home!==t.home||f.away!==t.away:f.home!==t.away||f.away!==t.home))return false;}
  }else return false;
 }
 return fs.every(f=>Number.isInteger(f.clStage)&&cl.stages[f.clStage]&&f.kind==='cup'&&(f.homeGoals===null)===(f.awayGoals===null)&&[f.homeGoals,f.awayGoals].every(g=>g===null||Number.isInteger(g)&&g>=0)&&(!f.winner||[f.home,f.away].includes(f.winner)))&&(cl.status!=='complete'||cl.winner===cl.stages.at(-1)?.ties?.[0]?.winner);
}
