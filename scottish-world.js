export const SCOTTISH_EXISTING=['EU001','EU051','EU052','EU053'];
export const scottishClub=id=>SCOTTISH_EXISTING.includes(id)||/^SC\d{2}$/.test(id);
export const scottishPlayable=id=>SCOTTISH_EXISTING.includes(id)||/^SC(0[1-6]|1[1-9]|20)$/.test(id);
export const scottishCareer=c=>scottishClub(c?.clubId);
export const domesticCupName=(c,id)=>id==='fa-cup'?(scottishCareer(c)?'Scottish Cup':'FA Cup'):(scottishCareer(c)?'Scottish League Cup':'League Cup');
export const HAMPDEN_ID='hampstead-park';
export function mergeScotland(league,data){
 const clubs=new Set(data.clubs.map(c=>c.id)),players=new Set(data.players.map(p=>p.id));
 league.clubs=league.clubs.filter(c=>!clubs.has(c.id)).concat(data.clubs);
 league.players=league.players.filter(p=>!clubs.has(p.clubId)&&!players.has(p.id)).concat(data.players);
 league.rosterEdition=(league.rosterEdition||'1998')+'-scotland-v1';return league;
}
const after=(s,n)=>new Date(Date.parse(s+'T12:00:00Z')+n*86400000).toISOString().slice(0,10);
export function scottishSchedule(ids,year){
 if(ids.length!==10||new Set(ids).size!==10)throw Error('Scottish division requires ten clubs');
 const rotation=[...ids],rounds=[];for(let r=0;r<9;r++){rounds.push(Array.from({length:5},(_,i)=>r%2?[rotation[9-i],rotation[i]]:[rotation[i],rotation[9-i]]));rotation.splice(1,0,rotation.pop());}
 let start=year+'-08-01';start=after(start,(6-new Date(start+'T12:00:00Z').getUTCDay()+7)%7);
 const offsets=[];for(let week=0;offsets.length<36;week++){if([5,10,16,23,29,34].includes(week))continue;offsets.push(week*7);if([7,18,27].includes(week)&&offsets.length<36)offsets.push(week*7+4);}
 return offsets.map((d,r)=>({date:after(start,d),fixtures:rounds[r%9].map(([a,b])=>({home:Math.floor(r/9)%2?b:a,away:Math.floor(r/9)%2?a:b,kickoff:d%7?'19:45':'15:00',homeGoals:null,awayGoals:null}))}));
}

export const HAMPDEN_CLUB={id:HAMPDEN_ID,name:'Scottish national venue',ground:'Hampstead Park',town:'Glasgow',country:'Scotland',surroundings:'city',capacity:52000,colour:'#286f95',stadium:{name:'Scottish national bowl',baseCapacity:52000,sections:Object.fromEntries([...Array.from({length:8},(_,i)=>'N'+(i+1)),...Array.from({length:8},(_,i)=>'S'+(i+1)),...Array.from({length:4},(_,i)=>'E'+(i+1)),...Array.from({length:4},(_,i)=>'W'+(i+1)),'NW','NE','SW','SE'].map(id=>[id,{stand:id.startsWith('S')?'d2':'l1',roof:'full',rear:'compact',finish:'metal',frontage:'plain'}]))}};
