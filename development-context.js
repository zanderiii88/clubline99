import {facilityLevel} from './club-investment.js?v=1.91.0';
import {trainingDevelopmentFactor} from './training.js?v=1.91.0';
export function developmentAssessment(c,league,p,next){
 const state=c.players?.[p.id]||{},form=(state.form||[]).slice(-5),average=form.length?form.reduce((n,v)=>n+v,0)/form.length:6.5,facilities=facilityLevel(c,league),focus=trainingDevelopmentFactor(c,league,next),headroom=Math.max(0,p.potential-p.overall);
 let change=0,reason='At this age, overall ability is usually stable; positional practice can still help.';
 if(p.age<=24&&headroom>0){
  if(state.injuryDays||state.unregistered)reason=state.injuryDays?'Injury is pausing overall development. Reassess after recovery.':'Not registered for the senior squad: overall development is paused.';
  else{change=(.04+facilities*.01+Math.max(0,average-6.4)*.055+(form.length?.025:0))*focus;reason=`${facilities.toFixed(1)}-star training supports gradual progress. ${form.length?'Recent match experience contributes.':'No recent senior match form: coaching is doing most of the work.'} ${focus>1.05?'Development focus increases the pace.':focus<.95?'Fitness focus slows overall growth while helping condition.':''}`;}
 }else if(p.age>=32){change=-.055-Math.max(0,6-average)*.035;reason='Age-related decline is gradual; recent form also affects its pace. Better facilities do not reverse ageing.';}
 else if(!headroom)reason='At the current potential ceiling. More minutes or better facilities will not raise that ceiling.';
 return {change,reason,headroom,facilities,focus};
}
