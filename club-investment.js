const after=(date,days)=>new Date(Date.parse(date+'T12:00:00Z')+days*86400000).toISOString().slice(0,10);
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const TYPES={
 youth:{field:'youthFunding',base:'youth',title:'Youth academy',stages:['Youth programme','Academy foundation','Youth academy','Advanced academy','Elite academy']},
 training:{field:'trainingFunding',base:'facilities',title:'Training facilities',stages:['Basic training ground','Club training centre','Modern training centre','Advanced training centre','Elite training centre']}
};
export function facilityLevel(c,league){return investmentStatus(c,league,'training').level}
export function investmentStatus(c,league,kind){
 const type=TYPES[kind];if(!type)throw new Error('Unknown club investment');
 const club=league.clubs.find(x=>x.id===c.clubId),base=clamp(Number(club?.[type.base])||1,1,5),funding=c[type.field]||0,level=clamp(base+funding*.5,1,5),target=Math.min(5,level+.5),complete=level>=5;
 const scale=clamp(.30+(club?.budget||0)/8000000,.30,1.5),cost=complete?0:Math.round(((kind==='youth'?25000:40000)+target*target*(kind==='youth'?22000:30000))*scale/1000)*1000,weeklyCost=complete?0:Math.max(75,Math.round(cost*(kind==='youth'?.004:.003)/25)*25),days=target<=2.5?42:target<4?84:126;
 const pending=c.clubInvestment?.pending,waiting=c.clubInvestment?.nextAvailable>c.date,unavailableReason=pending?'Work in progress until '+pending.completion+'.':waiting?'Next club upgrade available from '+c.clubInvestment.nextAvailable+'.':'';
 return {days,weeklyCost,upkeepWeekly:c.clubInvestment?.upkeepWeekly||0,description:level>base?`Improved from the opening ${base.toFixed(1)}-star standard. ${kind==='youth'?'The youth pathway has expanded.':'Training provision has improved.'}`:club?.[kind==='youth'?'youthNote':'trainingNote']||'Period assessment estimated for the game.',completion:after(c.date,days),unavailableReason,pending,kind,field:type.field,title:type.title,base,level,target,complete,cost,stage:type.stages[Math.floor(level)-1],nextStage:type.stages[Math.floor(target)-1],remaining:Math.ceil((5-level)*2),affordable:!complete&&!unavailableReason&&c.balance>=cost};
}
export function investInClub(c,league,kind){
 const q=investmentStatus(c,league,kind);if(q.complete)return {error:'Already at the five-star limit.'};if(!q.affordable)return {error:q.unavailableReason||'Insufficient club funds.'};
 c.balance-=q.cost;c.clubInvestment={upkeepWeekly:c.clubInvestment?.upkeepWeekly||0,pending:{kind,field:q.field,title:q.title,target:q.target,weeklyCost:q.weeklyCost,completion:q.completion},nextAvailable:after(q.completion,180)};c.news??=[];c.news.push({date:c.date,kind:'funding',action:'finances',text:`${q.title} works approved for £${q.cost.toLocaleString('en-GB')}. Completion ${q.completion}. Existing facilities remain available during the ${q.days}-day project. Additional upkeep of £${q.weeklyCost.toLocaleString('en-GB')}/week starts only on completion.`});
 return {quote:q};
}
export function advanceClubInvestments(c){const p=c.clubInvestment?.pending;if(!p||c.date<p.completion)return false;c[p.field]=(c[p.field]||0)+1;c.clubInvestment.upkeepWeekly=(c.clubInvestment.upkeepWeekly||0)+(p.weeklyCost||0);c.clubInvestment.pending=null;c.news??=[];c.news.push({date:c.date,kind:'funding',important:true,action:'finances',text:`${p.title} upgrade completed: ${p.target.toFixed(1)} stars. Additional weekly upkeep: £${(p.weeklyCost||0).toLocaleString('en-GB')}. Player development remains gradual; facilities do not guarantee elite talent.`});return true;}

export function investmentAdvice(c,league){
 const club=league.clubs.find(t=>t.id===c.clubId),pool=league.players.filter(p=>(c.owners?.[p.id]||p.clubId)===c.clubId&&!c.players?.[p.id]?.retired&&!c.players?.[p.id]?.unregistered&&!c.players?.[p.id]?.academyOnly&&!c.loans?.[p.id]),available=pool.filter(p=>!c.players?.[p.id]?.injuryDays&&!c.players?.[p.id]?.suspensionMatches),payroll=pool.reduce((n,p)=>n+p.wage,0),young=pool.filter(p=>p.age<=24&&p.overall<p.potential).length;
 if(c.clubInvestment?.pending)return {kind:null,title:'Finish the current project',reason:'Wait for the completion report before committing to another facility upgrade.'};
 if(available.length<16||!available.some(p=>p.primary==='GK'))return {kind:null,title:'Prioritise the playing squad',reason:'Available senior cover is thin. Review injuries, loans and affordable signings before spending on facilities.'};
 const training=investmentStatus(c,league,'training'),youth=investmentStatus(c,league,'youth'),kind=young>=3&&training.level<=youth.level?'training':youth.level<training.level||c.prospects?.filter(p=>!p.promoted).length>=3?'youth':young>=3?'training':null;
 if(!kind)return {kind:null,title:'Plan the next squad refresh',reason:'Few senior players have immediate growth headroom. Review future replacements before expanding facilities.'};
 const q=kind==='training'?training:youth;
 if(q.complete)return {kind:null,title:'Use the current facilities',reason:'This area has reached five stars. Review playing time and squad needs before further investment.'};
 if(q.unavailableReason)return {kind:null,title:'Plan before the next project',reason:q.unavailableReason};
 if(c.balance-q.cost<4*payroll+13*((club?.runningCostsWeekly||0)+(c.clubInvestment?.upkeepWeekly||0)+q.weeklyCost))return {kind:null,title:'Protect the cash reserve',reason:'This project would leave limited room for payroll and running costs. Hold funds while reviewing upcoming income and squad needs.'};
 return {kind,title:kind==='training'?'Improve daily training provision':'Strengthen the youth pathway',reason:kind==='training'?`${young} senior players aged 24 or under have growth headroom. Better training conditions can support gradual progress.`:'Youth coaching is worth considering for the next intake and ongoing academy development. Existing potential is unchanged.'};
}
