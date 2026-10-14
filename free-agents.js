import {initialiseNationalities} from './nationalities.js?v=1.74.0';
// Supplemental fictional free agents are saved with each career, leaving the base roster unchanged.
export function initialiseFreeAgents(c,league){
 if(c.freeAgentSeason===c.season)return;c.generatedPlayers??=[];c.owners??={};
 const names=['Jamie Lennox','Rhys Calder','Cian Mercer','Owen Radford','Euan Kerrigan','Finn Beckett','Lewis Morrow','Rory Ashford','Dylan Keating','Iwan Harcourt','Callum Devlin','Nico Wardle'];
 const roles=['GK','LB','CB','RB','DM','CM','AM','LW','RW','ST','CB','ST'];
 roles.forEach((primary,i)=>{const id=`FREE-${c.clubId}-${c.season}-${i}`;if(league.players.some(p=>p.id===id))return;const template=league.players.find(p=>p.primary===primary&&!p.freeAgent),overall=62+(i*7+c.season*3)%17,age=27+(i*3)%9,p={...structuredClone(template),id,name:names[(i+c.season-1)%names.length].split(' ')[0]+' '+names[(i+Math.floor((c.season-1)/names.length)+2*(c.season-1))%names.length].split(' ')[1],age,birthDate:`${Number(c.date.slice(0,4))-age}-02-15`,overall,potential:Math.min(80,overall+Math.max(0,29-age)),positions:Object.fromEntries(Object.keys(template.positions).map(pos=>[pos,pos===primary?overall:Math.round(overall*(template.positions[pos]/template.overall))])),wage:Math.ceil((500+(overall-55)**2*15)/50)*50,fitness:95,contract:2,freeAgent:true,academy:false};
 c.generatedPlayers.push(structuredClone(p));league.players.push(p);c.owners[id]='FREE';c.players[id]={fitness:95,form:[],happiness:70,instruction:'Standard',reason:'Available as a free agent.'};});
 initialiseNationalities(c,league);const notable=league.players.filter(p=>p.freeAgent&&(c.owners[p.id]||p.clubId)==='FREE'&&!c.players[p.id]?.retired).sort((a,b)=>b.overall-a.overall).slice(0,3);if(notable.length)c.news.push({date:c.date,kind:'free-agents',important:true,text:'Free-agent watch: '+notable.map(p=>p.name+' ('+p.primary+', '+p.age+') — £'+p.wage.toLocaleString('en-GB')+'/week').join('; ')+'. No transfer fee; wages still apply.'});
 c.freeAgentSeason=c.season;
}
