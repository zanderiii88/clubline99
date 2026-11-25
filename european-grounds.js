import {SECTIONS} from './stadium-model.js';

// Rounded stadium capacities where the source describes a period or a later
// survey of the pre-redevelopment ground. Unverified clubs keep database sizes.
const capacities={
 EU002:99000, EU004:75000, EU007:85700, EU009:85700, EU010:69300, EU011:82900, EU013:63000, EU014:54000,
 EU018:34700, EU019:41200, EU020:41000, EU021:60000, EU022:18500, EU023:47900,
 EU024:51300, EU025:51100, EU026:14000, EU028:14500, EU029:78000, EU031:55000, EU044:13300, EU064:82900,
 EU066:63000, EU067:62000, EU074:37900, EU076:26600
};
// Separate operating limits for European fixtures, where there is evidence
// for a reduced football or all-seater configuration.
const europeanMatchCapacities={EU025:47500,EU044:11200,EU067:55900};
const profiles={
 EU002:'campNou', EU004:'bernabeu', EU007:'sanSiro', EU009:'sanSiro',
 EU010:'delleAlpi', EU011:'olimpico', EU013:'munich', EU014:'westfalen', EU021:'velodrome', EU024:'amsterdam',
 EU025:'deKuip', EU029:'oldLuz', EU031:'antas', EU044:'molde', EU064:'olimpico', EU066:'munich', EU067:'parkstadion'
};
const venueStyles={sanSiro:'san-siro',westfalen:'westfalen',amsterdam:'amsterdam',munich:'munich',oldLuz:'old-luz'};
const tracks={
 delleAlpi:{surface:'#ad6251',pitchScale:.62},
 olimpico:{surface:'#a65043',pitchScale:.65},
 parkstadion:{surface:'#a95e4d',pitchScale:.63},
 munich:{surface:'#b16451',pitchScale:.64}
};
const standard=(stand,roof,finish)=>({
 stand,roof,finish,rear:'compact',frontage:'plain'
});

export function europeanGround(club){
 const capacity=capacities[club.id]??club.capacity;
 const profile=profiles[club.id];
 const layout=section=>{
  const side=section.side,corner=section.corner;
  if(profile==='campNou'){
   return standard(side==='N'?'d5':'t1',side==='N'?'cantilever':'none','metal');
  }
  if(profile==='bernabeu'){
   return standard(side==='N'?'d6':'t2','continuous','metal');
  }
  if(profile==='sanSiro'){
   return standard(side==='N'?'d6':'t2','boxtruss','metal');
  }
  if(profile==='delleAlpi')return standard('t2','boxtruss','metal');
  if(profile==='olimpico')return standard('d5','continuous','metal');
  if(profile==='munich')return standard(side==='N'?'d1':'l1',side==='N'?'cantilever':'none','metal');
  if(profile==='westfalen'){
   if(corner)return standard('empty','none','metal');
   return standard(side==='N'||side==='S'?'d6':side==='E'?'l2':'l1','truss','metal');
  }
  if(profile==='velodrome'){
   if(corner)return standard('l1','none','metal');
   const longSide=side==='N'||side==='S';
   const middle=section.i>=2&&section.i<=5;
   // The 1998 rebuild left three sides uncovered and part of the main stand sheltered.
   return standard(longSide?(middle?'d5':'l2'):'l2',side==='N'&&middle?'full':'none','metal');
  }
  if(profile==='amsterdam'){
   return standard('d5',corner?'continuous':'boxtruss','metal');
  }
  if(profile==='deKuip')return standard('d6','continuous','metal');
  if(profile==='oldLuz')return standard('t1','none','metal');
  if(profile==='antas')return standard(side==='N'||side==='S'?'t2':'d6',side==='N'?'full':'none','metal');
  if(profile==='molde'){
   return standard(corner?'empty':side==='N'||side==='S'?'d1':'s1',corner?'none':'full','metal');
  }
  if(profile==='parkstadion')return standard(corner?'l1':'l2',side==='N'?'cantilever':'none','metal');
  if(capacity>=50000)return standard(corner?'d1':'d6','continuous','metal');
  if(capacity>=33000)return standard(corner?'s1':side==='N'||side==='S'?'d2':'l2',
   corner?'none':'truss','metal');
  if(capacity>=22000)return standard(corner?'empty':side==='N'?'d1':'l1',
   corner?'none':'full','brick');
  if(capacity>=15000)return standard(corner?'empty':side==='N'?'l2':'l1',
   side==='N'||side==='S'?'full':'none','brick');
  return standard(corner?'empty':'s1',side==='N'?'full':'none','brick');
 };
 const venueStyle=venueStyles[profile];
 const europeanMatchCapacity=europeanMatchCapacities[club.id];
 return {capacity,...(europeanMatchCapacity?{europeanMatchCapacity}:{}),
  ...(venueStyle?{venueStyle}:{}),...(tracks[profile]?{athleticsTrack:tracks[profile]}:{}),
  stadium:{name:profile?'Period stadium approximation':'Generated European ground',
  baseCapacity:capacity,sections:Object.fromEntries(SECTIONS.map(section=>[section.id,layout(section)]))}};
}
