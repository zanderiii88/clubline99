// Supplemental fictional free agents are saved with each career, leaving the base roster unchanged.
export function initialiseFreeAgents(c,league){
 if(c.freeAgentSeason===c.season)return;c.generatedPlayers??=[];c.owners??={};
 const names=['Jamie Lennox','Rhys Calder','Cian Mercer','Owen Radford','Euan Kerrigan','Finn Beckett','Lewis Morrow','Rory Ashford','Dylan Keating','Iwan Harcourt','Callum Devlin','Nico Wardle'];
 const roles=['GK','LB','CB','RB','DM','CM','AM','LW','RW','ST','CB','ST'];
 roles.forEach((primary,i)=>{const id=`FREE-${c.clubId}-${c.season}-${i}`;if(league.players.some(p=>p.id===id))return;const template=league.players.find(p=>p.primary===primary&&!p.freeAgent),overall=55+(i*7+c.season*3)%16,age=22+(i*3)%12,p={...structuredClone(template),id,name:names[i]+(c.season>1?' '+String(c.season):''),age,overall,potential:Math.min(80,overall+Math.max(0,29-age)),positions:Object.fromEntries(Object.keys(template.positions).map(pos=>[pos,pos===primary?overall:Math.round(overall*(template.positions[pos]/template.overall))])),wage:Math.ceil((400+(overall-50)*85)/50)*50,fitness:95,contract:2,freeAgent:true,academy:false};
 c.generatedPlayers.push(structuredClone(p));league.players.push(p);c.owners[id]='FREE';c.players[id]={fitness:95,form:[],happiness:70,instruction:'Standard',reason:'Available as a free agent.'};});
 c.freeAgentSeason=c.season;
}
