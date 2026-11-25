const OBSERVATION_WINDOW = 12 * 60;

// The same match events that drive commentary also supply the evidence here.
export function matchObservation(sim, shown) {
 if (sim.time < OBSERVATION_WINDOW) return null;

 const plan = sim.teams[0].plan;
 const halfStart = sim.fullMatch?.half === 2 ? sim.duration - 2700 : 0;
 const start = Math.max(halfStart, sim.time - OBSERVATION_WINDOW);
 const windowText = halfStart > 0 && start === halfStart ? 'since half-time' : 'in the last 12 minutes';
 const recent = sim.events.slice(sim.events.findLastIndex(event => event.second < start) + 1);
 const wide = recent.filter(event => event.team === 1 && ['cross', 'cutback'].includes(event.type)
  && event.delivery !== 'corner' && event.start?.x < 26 && Math.abs(event.start.y - 34) > 15
  && event.end?.x <= 18 && Math.abs(event.end.y - 34) <= 20).length;
 if (!shown.has('wide') && wide >= 3 && plan.fullbacks === 'attack') {
  return {id:'wide', text:`They’ve sent ${wide} balls in from wide ${windowText}. Keeping our full-backs back could close the space.`,
   action:'Keep full-backs back', key:'fullbacks', value:'stay'};
 }

 const tiring = sim.players.filter(player => player.team === 0 && player.role !== 'GK' && !player.bench
  && !player.sentOff && !player.injuredOff && !player.subbedOff && player.energy < 65).length;
 if (!shown.has('fatigue') && tiring >= 3 && plan.press === 'high') {
  return {id:'fatigue', text:`${tiring} outfield players are tiring. Ease off the high press to save their legs.`,
   action:'Ease off pressing', key:'press', value:'normal'};
 }

 const forwardPasses = recent.filter(event => event.team === 0 && event.type === 'pass' && event.start?.x > 52.5).length;
 const shots = recent.filter(event => event.team === 0 && event.type === 'shot').length;
 if (!shown.has('tempo') && forwardPasses >= 8 && shots === 0 && plan.tempo !== 'quick') {
  return {id:'tempo', text:`We’ve played ${forwardPasses} passes in their half ${windowText} without a shot. A quicker tempo could help.`,
   action:'Raise the tempo', key:'tempo', value:'quick'};
 }
 return null;
}
