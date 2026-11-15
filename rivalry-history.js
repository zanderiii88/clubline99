// Club meetings and personal press exchanges are distinct histories. Read only.
export function rivalryHistory(c,opponentId,managerId,before){
 const seen=new Set(),reports=[...(c.archives||[]).flatMap(a=>a.reports||[]),...(c.reports||[])].filter(r=>!r.friendly&&r.date<before&&(!c.date||r.date<=c.date)&&r.opponent===opponentId&&[r.homeId,r.awayId].includes(c.clubId)).sort((a,b)=>a.date.localeCompare(b.date)).filter(r=>{const key=[r.date,r.homeId,r.awayId,r.competition].join(':');if(seen.has(key))return false;seen.add(key);return true});
 const counts={win:0,draw:0,loss:0};
 for(const r of reports){const result=r.us>r.them?'win':r.us<r.them?'loss':r.penalties&&r.winner?(r.winner===c.clubId?'win':'loss'):'draw';counts[result]++;}
 const last=reports.at(-1),exchange=(c.managerMedia?.events||[]).filter(e=>e.managerId===managerId&&e.clubId===c.clubId&&e.status==='responded'&&e.matchDate<before&&(!c.date||(e.responseDate||e.date)<=c.date)&&e.choice!=='none').sort((a,b)=>(a.responseDate||a.date).localeCompare(b.responseDate||b.date)).at(-1);
 const club=last?`Recorded competitive meetings: ${reports.length}; ${counts.win} wins, ${counts.draw} draws, ${counts.loss} losses. Last meeting (your club first): ${last.date}, ${last.us}–${last.them}${last.penalties?' (penalties decided the tie)':''}.`:'No earlier competitive meeting is recorded in this career.';
 const personal=exchange?`Last retained substantive exchange with this manager (${exchange.responseDate||exchange.date}): ${exchange.choice==='provoke'?'you challenged their assessment':exchange.choice==='respect'?'you showed respect':exchange.choice==='confident'?'you backed your players':'you focused on your team'}.`:'No earlier substantive exchange with this manager is retained.';
 const lastOutcome=!last?null:last.us>last.them?'win':last.us<last.them?'loss':last.penalties&&last.winner?(last.winner===c.clubId?'win':'loss'):'draw';
 return {meetings:reports.length,counts,lastOutcome,lastChoice:exchange?.choice||null,text:club+' '+personal};
}

export function rivalryQuestion(history,derby=false){
 if(history.lastChoice==='provoke')return 'You challenged this manager in earlier press comments. Will you take the same approach this time?';
 if(history.lastChoice==='respect')return 'You previously showed respect for this manager. Does that remain your view ahead of this meeting?';
 if(history.lastOutcome==='loss')return 'Your club lost the last recorded competitive meeting. What is your message before facing them again?';
 if(history.lastOutcome==='win')return 'Your club won the last recorded competitive meeting. How do you approach the next contest?';
 if(history.lastOutcome==='draw')return 'The last recorded competitive meeting ended in a draw. What do you expect from this encounter?';
 return derby?'The supporters know this rivalry well. What is your message ahead of the match?':'What is your assessment of the opposing manager and the contest ahead?';
}
