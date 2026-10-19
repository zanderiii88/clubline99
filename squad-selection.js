// Maximum-weight assignment: choose a team as a whole, rather than filling
// the first role with a versatile player needed elsewhere. Null places are
// deliberate when there are too few eligible players for the requested roles.
export function assignSquad(pool, slots, score) {
 const players=[...new Map(pool.filter(Boolean).map(p=>[p.id,p])).values()];
 const n=slots.length,m=players.length+n;
 const weights=slots.map(pos=>[...players.map(p=>{
  if((pos==='GK')!==(p.primary==='GK'))return -1e6;
  return score(p,pos);
 }),...Array(n).fill(-1e4)]);
 const u=Array(n+1).fill(0),v=Array(m+1).fill(0),p=Array(m+1).fill(0),way=Array(m+1).fill(0);
 for(let i=1;i<=n;i++){
  p[0]=i;let j0=0;
  const min=Array(m+1).fill(Infinity),used=Array(m+1).fill(false);
  do{
   used[j0]=true;const i0=p[j0];let delta=Infinity,j1=0;
   for(let j=1;j<=m;j++)if(!used[j]){
    const cur=-weights[i0-1][j-1]-u[i0]-v[j];
    if(cur<min[j]){min[j]=cur;way[j]=j0;}
    if(min[j]<delta){delta=min[j];j1=j;}
   }
   for(let j=0;j<=m;j++)if(used[j]){u[p[j]]+=delta;v[j]-=delta;}else min[j]-=delta;
   j0=j1;
  }while(p[j0]!==0);
  do{const j1=way[j0];p[j0]=p[j1];j0=j1;}while(j0);
 }
 const lineup=Array(n).fill(null);
 for(let j=1;j<=players.length;j++)if(p[j]&&weights[p[j]-1][j-1]>-1e4)lineup[p[j]-1]=players[j-1].id;
 return lineup;
}
