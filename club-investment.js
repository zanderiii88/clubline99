const after=(date,days)=>new Date(Date.parse(date+'T12:00:00Z')+days*86400000).toISOString().slice(0,10);
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const TYPES={
 youth:{field:'youthFunding',base:'youth',title:'Youth academy',stages:['Youth programme','Academy foundation','Youth academy','Advanced academy','Elite academy'],basePrice:100000,stepPrice:35000},
 training:{field:'trainingFunding',base:'facilities',title:'Training facilities',stages:['Basic training ground','Club training centre','Modern training centre','Advanced training centre','Elite training centre'],basePrice:180000,stepPrice:50000}
};
export function facilityLevel(c,league){return investmentStatus(c,league,'training').level}
export function investmentStatus(c,league,kind){
 const type=TYPES[kind];if(!type)throw new Error('Unknown club investment');
 const club=league.clubs.find(x=>x.id===c.clubId),base=clamp(Number(club?.[type.base])||1,1,5),funding=c[type.field]||0,level=clamp(base+funding*.5,1,5),target=Math.min(5,level+.5),complete=level>=5;
 const scale=clamp(.8+(club?.budget||0)/10000000,.8,1.25),cost=complete?0:Math.round((type.basePrice+target*target*type.stepPrice)*scale/10000)*10000;
 const pending=c.clubInvestment?.pending,waiting=c.clubInvestment?.nextAvailable>c.date,unavailableReason=pending?'Work in progress until '+pending.completion+'.':waiting?'Next club upgrade available from '+c.clubInvestment.nextAvailable+'.':'';
 return {completion:after(c.date,84),unavailableReason,pending,kind,field:type.field,title:type.title,base,level,target,complete,cost,stage:type.stages[Math.floor(level)-1],nextStage:type.stages[Math.floor(target)-1],remaining:Math.ceil((5-level)*2),affordable:!complete&&!unavailableReason&&c.balance>=cost};
}
export function investInClub(c,league,kind){
 const q=investmentStatus(c,league,kind);if(q.complete)return {error:'Already at the five-star limit.'};if(!q.affordable)return {error:q.unavailableReason||'Insufficient club funds.'};
 c.balance-=q.cost;c.clubInvestment={pending:{kind,field:q.field,title:q.title,target:q.target,completion:q.completion},nextAvailable:after(q.completion,180)};c.news??=[];c.news.push({date:c.date,kind:'funding',action:'finances',text:`${q.title} works approved for £${q.cost.toLocaleString('en-GB')}. Completion ${q.completion}. Existing facilities remain available during the 12-week project.`});
 return {quote:q};
}
export function advanceClubInvestments(c){const p=c.clubInvestment?.pending;if(!p||c.date<p.completion)return false;c[p.field]=(c[p.field]||0)+1;c.clubInvestment.pending=null;c.news??=[];c.news.push({date:c.date,kind:'funding',important:true,action:'finances',text:`${p.title} upgrade completed: ${p.target.toFixed(1)} stars. Player development remains gradual; facilities do not guarantee elite talent.`});return true;}
