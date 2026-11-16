// Presentation-only passages. No random calls, score changes or invented shot statistics.
export function passageOfPlay({minute,team,opponent,players=[],defenders=[],name=x=>x}){
 if(!players.length)return null;
 const pick=(list,offset)=>list[(minute*7+offset)%list.length],p=pick(players.filter(p=>p.primary!=='GK').length?players.filter(p=>p.primary!=='GK'):players,0),mate=pick(players.filter(x=>x.id!==p.id).length?players.filter(x=>x.id!==p.id):players,3),def=defenders.filter(p=>p.primary!=='GK');
 const defender=def.length?pick(def,2):null,kind=Math.floor(minute/2)%6;
 const text=[`${p.name} finds ${mate.name} with an excellent pass between the lines. ${name(team)} move into the attacking third.`,defender?`${defender.name} reads the move and makes a well-timed tackle on ${p.name}. ${name(opponent)} win possession back.`:`${p.name} carries the ball into midfield.`,`${p.name} switches play towards ${mate.name}, opening space on the far side.`,`${mate.name} makes a run beyond the defence. ${p.name} looks to slide the ball into the channel.`,defender?`${p.name} delivers from wide, but ${defender.name} gets across to cut out the cross.`:`${p.name} looks for a crossing opportunity.`,`${p.name} shields the ball under pressure and combines with ${mate.name}. ${name(team)} keep the attack alive.`][kind];
 return {minute,type:'info',action:['pass','tackle','switch','run','cross','link'][kind],team:kind===1&&defender?opponent:team,playerId:kind===1&&defender?defender.id:p.id,text};
}
