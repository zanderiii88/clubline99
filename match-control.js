// Restore a watched match without running the clock before the manager is ready.
export function restoreMatchControl(match){
 if(match?.phase!=='live')return match;
 match.paused=true;
 if(!['red','injury','half'].includes(match.pauseReason))match.pauseReason='restored';
 if(['red','injury','half'].includes(match.pauseReason))match.drawerOpen=true;
 match.pendingSubIndex=null;
 return match;
}
export function validLiveMatch(match,ids){
 if(match?.phase!=='live')return true;
 const selection=a=>Array.isArray(a)&&a.every(id=>id===null||ids.has(id));
 if(!selection(match.lineup)||match.lineup.length!==11||!selection(match.bench)||match.bench.length>7||!selection(match.oppLineup)||match.oppLineup.length!==11)return false;
 const chosen=[...match.lineup,...match.bench].filter(Boolean);
 if(new Set(chosen).size!==chosen.length||!Number.isInteger(match.subCount)||match.subCount<0||match.subCount>3||!Number.isInteger(match.minute)||match.minute<0||match.minute>120||![match.homeGoals,match.awayGoals].every(x=>Number.isInteger(x)&&x>=0)||!Array.isArray(match.events)||typeof match.paused!=='boolean')return false;
 return true;
}
