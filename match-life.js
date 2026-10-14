// One persistent controller per mounted match SVG. UI updates never reset its clock.
let active=null;
function pitchNodes(svg,hide){return hide?[]:[...svg.querySelectorAll('[data-player-route]')].map(el=>({el,route:JSON.parse(el.dataset.playerRoute),corner:JSON.parse(el.dataset.corner),team:Number(el.dataset.team),index:Number(el.dataset.index)}));}
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
function schedule(){if(active&&!active.frame&&!document.hidden&&(!active.state.paused||active.celebration||active.action)&&!reducedMotion.matches)active.frame=requestAnimationFrame(frame)}
document.addEventListener('visibilitychange',()=>{if(!active)return;if(document.hidden){cancelAnimationFrame(active.frame);active.frame=null;active.last=null;active.svg.pauseAnimations?.()}else{if(!active.state.paused)active.svg.unpauseAnimations?.();schedule()}});
reducedMotion.addEventListener('change',()=>{if(!active)return;if(reducedMotion.matches){cancelAnimationFrame(active.frame);active.frame=null;active.celebration=null;active.action=null;active.svg.classList.remove('celebrating-home');active.svg.pauseAnimations?.()}else schedule()});
const lerp=(a,b,t)=>({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t});
const position=(route,time,offset=0)=>{const step=((time+offset)%24)/24*(route.length-1),i=Math.floor(step);return lerp(route[i],route[i+1],step-i)};
export function disposeStadiumLife(){if(active){cancelAnimationFrame(active.frame);active=null}}
export function syncStadiumLife(svg,state){
 if(active?.svg!==svg){disposeStadiumLife();active={svg,state,time:0,last:null,frame:null,goalKey:null,celebration:null,players:pitchNodes(svg,state.hidePitch),ball:state.hidePitch?null:svg.querySelector('.visible-match-ball'),hidePitch:state.hidePitch,actionKey:null,action:null};schedule()}
 if(active.hidePitch!==state.hidePitch){active.hidePitch=state.hidePitch;active.players=pitchNodes(svg,state.hidePitch);active.ball=state.hidePitch?null:svg.querySelector('.visible-match-ball');active.celebration=null;active.action=null;}
 active.state=state;
 if(!reducedMotion.matches&&state.action&&state.action.key!==active.actionKey){active.actionKey=state.action.key;active.action={...state.action,elapsed:0};}
 svg.dataset.matchAction=state.action?.type||'play';
 for(const p of active.players)p.el.style.display=p.index<(p.team?state.awayCount:state.homeCount)?'':'none';
 if(state.goal&&active.goalKey!==state.goal.key){active.goalKey=state.goal.key;if(!reducedMotion.matches)active.celebration={elapsed:0,team:state.goal.team,starts:new Map(active.players.map(p=>[p,position(p.route,active.time,p.index*.13)]))}}
 if(!state.goal&&active.celebration?.elapsed>=3.4)active.celebration=null;
 const celebrating=!!active.celebration&&active.celebration.team===0;
 svg.classList.toggle('celebrating-home',celebrating);
 const pause=state.paused&&!active.celebration&&!active.action;svg.dataset.matchPaused=String(pause);
 if(pause||document.hidden||reducedMotion.matches)svg.pauseAnimations?.();else svg.unpauseAnimations?.();
 if(pause){cancelAnimationFrame(active.frame);active.frame=null;active.last=null}else schedule();
}
function frame(now){const a=active;if(!a||!a.svg.isConnected){disposeStadiumLife();return}a.frame=null;if(document.hidden)return;if(a.last!==null&&now-a.last<1000/20){schedule();return}const dt=a.last===null?0:Math.min(.05,(now-a.last)/1000);a.last=now;const reduced=reducedMotion.matches;
 if(reduced){a.celebration=null;a.action=null;a.svg.pauseAnimations?.();a.svg.classList.remove('celebrating-home')}
 if(!a.state.paused&&!reduced)a.time+=dt*(2/a.state.speed);
 if(a.celebration&&!reduced)a.celebration.elapsed+=dt;
 if(a.action&&!reduced)a.action.elapsed+=dt;
 if(a.action?.elapsed>=2.4){a.action=null;if(a.state.paused&&!a.celebration)a.svg.pauseAnimations?.();}
 const c=a.celebration;
 for(const p of a.players){let q=position(p.route,a.time,p.index*.13);
  if(c&&p.team===c.team&&p.index!==0){const t=Math.min(1,c.elapsed/1.6),start=c.starts.get(p),target={x:p.corner.x+(p.index%3)*3,y:p.corner.y+Math.floor(p.index/3)*2};q=c.elapsed<2.5?lerp(start,target,t):lerp(target,position(p.route,a.time,p.index*.13),Math.min(1,(c.elapsed-2.5)/.9))}
  const transform=`translate(${q.x.toFixed(2)} ${q.y.toFixed(2)})`;if(p.transform!==transform){p.el.setAttribute('transform',transform);p.transform=transform;}
 }
 if(a.ball&&a.players.length){
  const field=a.players.filter(p=>p.index>0&&p.el.style.display!=='none'),plan=[0,3,6,8,14,12,18,15,5,9,2,17,11,16],step=a.time/4,slot=Math.floor(step),phase=step%1;
  const carrier=field[plan[slot%plan.length]%field.length],receiver=field[plan[(slot+1)%plan.length]%field.length],offset=Number(a.ball.dataset.footOffset)||0;
  const foot=p=>{const q=position(p.route,a.time,p.index*.13);return {x:q.x+offset*.2,y:q.y+offset}};
  for(const p of a.players)p.el.classList.toggle('kicking-ball',p===carrier&&phase>.50&&phase<.78&&!c);
  if(carrier&&receiver){const from=foot(carrier),to=foot(receiver),pass=Math.max(0,Math.min(1,(phase-.55)/.24));const q=lerp(from,to,pass);if(!c||a.action){let ball=q;const action=a.action;if(action&&['goal','chance'].includes(action.type)){const keeper=a.players.find(p=>p.team!==action.team&&p.index===0),shooter=[...field].reverse().find(p=>p.team===action.team);if(keeper&&shooter){const target=foot(keeper),from=foot(shooter),t=Math.min(1,action.elapsed/1.2);if(action.type==='chance'&&!action.onTarget)target.y+=12;ball=lerp(from,target,t);}}a.ball.setAttribute('transform',`translate(${ball.x.toFixed(2)} ${ball.y.toFixed(2)})`);}a.ball.dataset.action=phase<.55?'carry':phase<.79?'pass':'receive'}
 }

 if(c?.elapsed>=3.4){a.svg.classList.remove('celebrating-home');a.celebration=null;if(a.state.paused&&!a.action)a.svg.pauseAnimations?.()}
 schedule();
}
