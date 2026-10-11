import {SECTIONS} from './stadium-model.js';
export const WEMBLEY_SITE={id:'fixed-wembley',name:'Wembley Way and exhibition estate',limit:80000,artWidth:1100,artHeight:1400,origin:[550,640],east:[10.8,6.3],south:[-11.025,6.3],scale:1.5,background:null,reserve:{x:8,y:8,w:56,d:50},box:[-1400,-950,3900,3300],assetStem:'wembley',assetExtension:'svg'};
export const WEMBLEY_CLUB={id:'wembley-fields',name:'National venue',ground:'Wembley Fields',capacity:80000,colour:'#c63839',seatTiers:['#c63839','#285382'],venueStyle:'old-wembley',stadium:{name:'Twin Towers national bowl',baseCapacity:80000,sections:Object.fromEntries(SECTIONS.map(s=>[s.id,{stand:'d1',roof:'full',rear:'concourse',finish:'metal',frontage:'artdeco'}]))}};
const pt=(x,y,z=0)=>({x,y,z});
export function wembleyFrontage(project){
 const P=(x,y,z=0)=>{const p=project(pt(x,y,z));return `${p.x.toFixed(2)},${p.y.toFixed(2)}`;};
 const face=(v,c)=>`<polygon points="${v.map(a=>P(...a)).join(' ')}" fill="${c}"/>`;
 const box=(x,y,w,d,h,c='#e0d7bb',z=0)=>face([[x,y,z],[x+w,y,z],[x+w,y,z+h],[x,y,z+h]],'#aaa58e')+face([[x+w,y,z],[x+w,y+d,z],[x+w,y+d,z+h],[x+w,y,z+h]],'#c0b99e')+face([[x,y+d,z],[x+w,y+d,z],[x+w,y+d,z+h],[x,y+d,z+h]],c)+face([[x,y,z+h],[x+w,y,z+h],[x+w,y+d,z+h],[x,y+d,z+h]],'#ece6d2');
 let s=box(22,50.9,28,2,8.8);
 // Terraced entrance steps, bridge parapet, central arch and stone arcade.
 for(let i=0;i<6;i++)s+=box(24,53+i*.7,24,.7,Math.max(.25,2.3-i*.35),'#c5bfaa');
 s+=box(24,54,24,.18,3.5,'#ded6bd');
 for(let x=23;x<50;x+=1.6){s+=face([[x,52.92,1],[x+.65,52.92,1],[x+.65,52.92,3.8],[x+.48,52.92,4.2],[x+.18,52.92,4.2],[x,52.92,3.8]],'#32434a');s+=box(x-.12,52.94,.14,.09,5.7);}
 s+=face([[34.8,54.2,0],[37.2,54.2,0],[37.2,54.2,1.5],[36.9,54.2,2.2],[36,54.2,2.5],[35.1,54.2,2.2],[34.8,54.2,1.5]],'#34454a');
 s+=face([[27,52.96,6.1],[45,52.96,6.1],[45,52.96,7.65],[27,52.96,7.65]],'#24374c');
 const label=project(pt(36,52.99,6.6));s+=`<text x="${label.x}" y="${label.y}" text-anchor="middle" font-family="sans-serif" font-size="9" font-weight="bold" fill="#eee8ce" transform="rotate(30 ${label.x} ${label.y})">WEMBLEY FIELDS</text>`;
 for(const x of [24.5,44.5]){
  s+=box(x,50.8,3.8,3.6,23.5,'#e7dfc9');
  for(const z of [7,13,19]){s+=box(x-.15,50.65,4.1,3.9,.55,'#f1ebd9',z);for(const u of [.6,2.3])s+=face([[x+u,54.43,z+1.3],[x+u+.7,54.43,z+1.3],[x+u+.7,54.43,z+3.8],[x+u+.35,54.43,z+4.2],[x+u,54.43,z+3.8]],'#3d5051');}
  // Octagonal lantern and faceted dome. Ground axes remain shared; no skewed verticals.
  const cx=x+1.9,cy=52.6,r=2.15,ring=(rad,z)=>Array.from({length:16},(_,i)=>[cx+Math.cos(i*Math.PI/8)*rad,cy+Math.sin(i*Math.PI/8)*rad,z]);
  for(const [ra,rb,za,zb] of [[r,r,23.5,26.5],[r,r*.93,26.5,27.2],[r*.93,r*.64,27.2,29],[r*.64,.18,29,30]]){
   const a=ring(ra,za),b=ring(rb,zb);for(let i=0;i<16;i++){const j=(i+1)%16;s+=face([a[i],a[j],b[j],b[i]],i<8?'#ede7d6':'#c9c2af');}
  }
  for(const u of [.6,2.3])s+=face([[x+u,54.46,24],[x+u+.7,54.46,24],[x+u+.7,54.46,25.8],[x+u,54.46,25.8]],'#58615b');
  const a=project(pt(cx,cy,29.8)),b=project(pt(cx,cy,33));s+=`<path d="M${a.x} ${a.y}L${b.x} ${b.y}" stroke="#d6ceaf" stroke-width="1.8"/>`;s+=face([[cx,cy,32.6],[cx+1.4,cy,32.6],[cx+1.4,cy,31.6],[cx,cy,31.6]],'#e7e1d2');
 }
 return `<g data-venue-frontage="twin-towers">${s}</g>`;
}

// Hand-authored districts and connected access routes; repeatable detail within each plot.
// Coordinates use stadium ground units. The entrance side is foreground for readability.
export function buildWembleyWorld(project){
 const props=[],footprints=[],ground=[];let seed=1998;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const p=(x,y,z=0)=>{const q=project(pt(x,y,z));return `${q.x.toFixed(2)},${q.y.toFixed(2)}`;};
 const poly=(v,c,a='')=>`<polygon points="${v.map(v=>p(...v)).join(' ')}" fill="${c}" ${a}/>`;
 const rect=(x,y,w,d,c,z=0,a='')=>poly([[x,y,z],[x+w,y,z],[x+w,y+d,z],[x,y+d,z]],c,a);
 const line=(v,c,w=.7,a='')=>`<path d="M${v.map(v=>p(...v)).join('L')}" fill="none" stroke="${c}" stroke-width="${w}" ${a}/>`;
 const box=(x,y,w,d,h,c,z=0)=>poly([[x,y,z],[x+w,y,z],[x+w,y,z+h],[x,y,z+h]],'#727b77')+poly([[x+w,y,z],[x+w,y+d,z],[x+w,y+d,z+h],[x+w,y,z+h]],c)+poly([[x,y+d,z],[x+w,y+d,z],[x+w,y+d,z+h],[x,y+d,z+h]],c)+rect(x,y,w,d,'#b6b7a4',z+h);
 const register=(type,x,y,w,d,s,h=0)=>{footprints.push({type,x,y,w,d,h});props.push({depth:x+y+(w+d)/2,s});};
 const slab=(x,y,w,d,c,type='paving')=>{footprints.push({type,x,y,w,d});ground.push(rect(x,y,w,d,c));};
 const road=(x,y,w,d)=>{slab(x,y,w,d,'#b6b2a3','pavement');ground.push(rect(x+.65,y+.65,w-1.3,d-1.3,'#626d70'));const along=w>d;ground.push(line(along?[[x+.8,y+d/2,.02],[x+w-.8,y+d/2,.02]]:[[x+w/2,y+.8,.02],[x+w/2,y+d-.8,.02]],'#c6c8b4',.8,'stroke-dasharray="5 6"'));};
 const tree=(x,y,r=1.1,h=4.5)=>{const q=project(pt(x,y,h)),a=project(pt(x,y));register('tree',x-r,y-r,r*2,r*2,`<ellipse cx="${a.x}" cy="${a.y}" rx="${r*10}" ry="${r*5}" fill="#2f4c3833"/><path d="M${a.x} ${a.y}L${q.x} ${q.y+4}" stroke="#655c3d" stroke-width="2.2"/><ellipse cx="${q.x}" cy="${q.y}" rx="${r*9}" ry="${r*10}" fill="#3d7045"/><ellipse cx="${q.x-r*2}" cy="${q.y-r*4}" rx="${r*6}" ry="${r*7}" fill="#58864b"/>`,h);};
 const vehicle=(x,y,kind='car',axis='x',colour='#a83e3d')=>{
  const long=kind==='coach'?4.4:kind==='truck'?4:1.7,short=kind==='coach'?1.15:kind==='truck'?1.15:.8,h=kind==='car'?.9:kind==='coach'?2.1:2.2;
  const w=axis==='x'?long:short,d=axis==='x'?short:long;
  let s=rect(x-.12,y-.1,w+.25,d+.2,'#263c3c55');
  s+=box(x,y,w,d,h,colour);s+=rect(x+.14,y+.14,w-.28,d-.28,kind==='car'?colour:'#d3d2bb',h+.01);
  const windows=kind==='coach'?6:kind==='car'?2:1;
  for(let i=0;i<windows;i++){const a=x+.18+(w-.36)/windows*i,b=a+(w-.36)/windows*.65;s+=poly([[a,y+d+.01,h*.53],[b,y+d+.01,h*.53],[b,y+d+.01,h*.88],[a,y+d+.01,h*.88]],'#263f4b');}
  if(kind==='truck')s+=rect(x+(axis==='x'?w*.65:.12),y+(axis==='x'?.12:d*.65),axis==='x'?w*.28:w-.24,axis==='x'?d-.24:d*.28,'#d5cbae',h+.03);
  for(const [u,v]of[[.3,d],[w-.3,d],[w,.25],[w,d-.25]]){const q=project(pt(x+u,y+v,.25));s+=`<ellipse cx="${q.x}" cy="${q.y}" rx="2.4" ry="3" fill="#243337"/>`;}
  register(kind,x,y,w,d,s,h);
 };
 const building=(x,y,w,d,h,type='warehouse',c='#b6ac91',roof='#777e79')=>{
  let s=rect(x+.5,y+.5,w+.3,d+.3,'#24383730')+box(x,y,w,d,h,c);
  if(type==='house'||type==='shops'){
   const rh=type==='house'?2.5:1.6;
   s+=poly([[x,y,h],[x+w/2,y,h+rh],[x+w/2,y+d,h+rh],[x,y+d,h]],roof)+poly([[x+w/2,y,h+rh],[x+w,y,h],[x+w,y+d,h],[x+w/2,y+d,h+rh]],'#626d69');
   s+=poly([[x,y+d,h],[x+w,y+d,h],[x+w/2,y+d,h+rh]],c);
   s+=box(x+w*.65,y+d*.3,.45,.45,1.5,'#9d7759',h+rh*.6);
  }else{
   s+=rect(x,y,w,d,roof,h+.05);
   if(type==='arena'){
    for(let u=0;u<w;u+=1.4){const v=Math.min(w,u+1.4),za=h+3.3*Math.sin(u/w*Math.PI),zb=h+3.3*Math.sin(v/w*Math.PI);s+=poly([[x+u,y,za],[x+v,y,zb],[x+v,y+d,zb],[x+u,y+d,za]],u<w*.5?'#cdd0be':'#a3aca0');s+=line([[x+u,y,za+.02],[x+u,y+d,za+.02]],'#8f9a91',.55);}
   }else if(type==='warehouse'){
    for(let u=1;u<w;u+=2.2)s+=line([[x+u,y,h+.1],[x+u,y+d,h+.1]],'#a2b0aa',.65);
    s+=box(x+w*.62,y+d*.3,1.1,1.2,.5,'#8b9590',h+.1);
   }else for(let u=2;u<w;u+=5)s+=box(x+u,y+2,1.2,2,.6,'#8f9b98',h+.1);
  }
  const levels=type==='house'||type==='arena'?2:type==='office'?Math.max(2,Math.floor(h/2.5)):1;
  for(let z=1.5;z<levels*2.5;z+=2.5)for(let u=.55;u<w-.6;u+=type==='house'?1.55:1.8){s+=poly([[x+u,y+d+.02,z],[x+u+.7,y+d+.02,z],[x+u+.7,y+d+.02,z+1.15],[x+u,y+d+.02,z+1.15]],'#365360');s+=line([[x+u,y+d+.03,z],[x+u+.7,y+d+.03,z]],'#eee4c9',.65);}
  if(type==='warehouse')for(let u=1;u<w-3;u+=5){s+=poly([[x+u,y+d+.02,0],[x+u+2.5,y+d+.02,0],[x+u+2.5,y+d+.02,3.8],[x+u,y+d+.02,3.8]],'#425c65');for(let z=.5;z<3.8;z+=.45)s+=line([[x+u,y+d+.03,z],[x+u+2.5,y+d+.03,z]],'#7f9296',.6);}
  if(type==='shops'){s+=poly([[x+.2,y+d+.05,.5],[x+w-.2,y+d+.05,.5],[x+w-.2,y+d+.05,2.9],[x+.2,y+d+.05,2.9]],'#294657');s+=poly([[x,y+d+.25,3],[x+w,y+d+.25,3],[x+w,y+d+.25,3.7],[x,y+d+.25,3.7]],'#9d4041');}
  register(type,x,y,w,d,s,h+(type==='house'?2.5:0));
 };
 const parking=(x,y,w,d,coach=false)=>{
  slab(x,y,w,d,'#aaa99a','parking');ground.push(rect(x+.5,y+.5,w-1,d-1,'#747e7c'));
  const stride=coach?3:2.3,bayD=coach?5.5:2.5;
  for(let yy=y+1;yy+bayD<y+d;yy+=bayD+3.2)for(let xx=x+1;xx+stride<x+w;xx+=stride){ground.push(line([[xx,yy],[xx,yy+bayD],[xx+stride,yy+bayD]],'#d3d0b9',.7));if(rand()<(coach?.68:.6))vehicle(xx+.3,yy+.3,coach?'coach':'car','y',['#ca463c','#467293','#e4d7b8','#8d9794','#31505e'][Math.floor(rand()*5)]);}
 };
 ground.push(rect(-100,-110,290,300,'#83936b'));
 // Small mottled ground marks give the limited-shading sprites a textured base.
 for(let i=0;i<1800;i++){const x=-95+rand()*280,y=-105+rand()*290;ground.push(rect(x,y,.2+rand()*.6,.2+rand()*.6,rand()<.5?'#91a177':'#778a60',0,'opacity=".35"'));}
 // Connected perimeter routes, railway and a deliberately broad pedestrian approach.
 road(-80,59,222,6);road(65,-80,6,139);road(-39,-80,6,139);road(-80,-29,222,5);
 road(-80,111,222,6);road(-77,65,5,46);road(112,65,5,46);road(65,83,47,5);
 slab(27,59,18,52,'#c1bfae','Wembley Way');slab(29,117,14,53,'#c1bfae','Wembley Way');
 // Entrances have their own apron, not a huge filled rectangle under the stadium.
 slab(9,52.1,55,6.8,'#b8b5a4','entrance forecourt');
 slab(2,8,5.8,44,'#b0b0a0');slab(64.2,8,1,44,'#b0b0a0');slab(8,2,56,5.8,'#b0b0a0');
 slab(-80,-12,222,7,'#8c8979','railway corridor');
 for(const yy of [-10.6,-8.3]){for(let x=-80;x<142;x+=1)ground.push(line([[x,yy-.65],[x,yy+.65]],'#6b6659',1.1));for(const v of [-.48,.48])ground.push(line([[-80,yy+v],[142,yy+v]],'#b1b3a5',1.4));}
 slab(4,-19,20,5,'#b7b8a7','station platform');building(6,-23,13,3,4,'office','#aa8e6a','#737b79');building(22,-23,2,3,3,'office');
 for(let x=5;x<24;x+=2)register('platform canopy',x,-17.5,1.7,1.8,box(x,-17.5,1.7,1.8,.3,'#83918d',2.8));
 // Railway cutting, hedges and the housing-side green belt; irregular clusters.
 for(let i=0;i<215;i++){const x=-79+rand()*216,y=-3.8+rand()*8;tree(x,y,.55+rand()*.7,3+rand()*3);}
 // Arena and conference/exhibition district, west of the pedestrian approach.
 slab(-31,66,53,37,'#b6b5a5','arena estate');building(-26,70,25,21,8,'arena','#c3bda6','#c4c6b6');building(-29,70,3,21,9,'office','#c5b699');
 building(-27,38,24,17,7,'office','#c1b79e','#9ca39a');building(-7,38,9,13,11,'office','#afac9c','#b7b8a7');
 parking(-31,23,30,12);parking(3,70,19,29);
 slab(-71,66,33,37,'#9eaa8e','exhibition estate');building(-67,69,25,11,6,'warehouse','#b6b9a9','#a1aea9');building(-67,85,18,14,8,'warehouse','#a5a99a','#859693');
 building(-69,43,24,12,6,'warehouse','#b4b4a1','#8a9a99');slab(-69,56,28,2,'#a8a594','loading apron');
 vehicle(-65,57,'truck','x','#759596');vehicle(-53,57,'truck','x','#ad4c43');
 // Coaches by the ground; east car parks break into service yards and small offices.
 parking(74,25,34,29,true);parking(74,67,34,14);parking(74,91,34,16);
 building(119,68,12,11,5,'warehouse','#a9b5b1','#87948c');building(119,87,12,16,9,'office','#b6a78e','#90978e');
 building(48,94,11,11,8,'office','#b99d80','#788682');building(48,77,9,11,5,'shops','#bbad90','#756d5c');
 // Industrial east/south: unequal shed sizes, loading docks and fenced container yards.
 for(const a of [[76,1,16,12,6],[96,0,12,18,9],[116,0,19,13,7],[74,-24,24,9,8],[105,-24,29,9,5]])building(...a,'warehouse',['#b5ad98','#a2aaa4','#b39a83'][Math.floor(rand()*3)],'#8b9b98');
 slab(76,15,16,6,'#ada99b','loading yard');slab(114,14,21,7,'#a4a396','container yard');
 for(let i=0;i<6;i++){const x=115+(i%3)*6.2,y=15+Math.floor(i/3)*2.3;let s=box(x,y,5.5,1.8,1.9,['#ae513e','#366a86','#b99548','#6a8272'][i%4]);for(let u=.2;u<5.5;u+=.4)s+=line([[x+u,y+1.82,.1],[x+u,y+1.82,1.8]],'#243e4255',.7);register('container',x,y,5.5,1.8,s,1.9);}
 vehicle(79,16,'truck','x','#4b7591');vehicle(85,19,'car','x','#cdbf95');
 // Housing beyond the tracks: varied short terraces, semis, side lanes and gardens.
 road(-80,-58,222,5);road(-80,-87,222,5);road(18,-82,5,53);road(96,-82,5,53);road(-10,-82,4,24);
 const colours=['#bfac8b','#c1b79a','#b59c7d','#d1c8ad','#ad8e6d'];
 for(const yy of [-78,-49])for(const start of [-75,-28,27,74,106]){
  const count=start===106?5:7;
  for(let i=0;i<count;i++){const x=start+i*3.5;if(x+3>18&&x<23||x+3>96&&x<101||x+3>-10&&x<-6)continue;
   const w=i===count-1?3.2:3.4;slab(x,yy+2,w,9,'#789158','garden');ground.push(line([[x,yy+2],[x,yy+11],[x+w,yy+11]],'#a39478',.7));ground.push(rect(x+w*.45,yy+16.6,.6,3.4,'#b9b5a4'));building(x,yy+11,w,5.6,4.8+(i%4===0?.7:0),'house',colours[(i+start+75)%5],i%3?'#7c7769':'#676f70');if(i%3===0)tree(x+w*.55,yy+5,.7,3.5);
  }
 }
 // Neighbouring west streets are less uniform: semis, garden plots, corner shops.
 road(-67,-24,5,83);road(-80,17,41,5);road(-80,38,41,5);
 for(const [x,y,w,d,h] of [[-59,-21,5,7,5],[-51,-21,5,7,5.5],[-59,-6,6,7,5],[-50,-6,5,7,5],[-59,24,5,8,5],[-50,24,5,7,6],[-60,45,8,9,7],[-49,45,5,8,5]]){slab(x,y+d,w,3,'#748853','garden');building(x,y,w,d,h,'house',colours[Math.floor(rand()*5)],'#777b6d');tree(x+w/2,y+d+1.5,.6,3.5);}
 building(-60,5,8,10,6,'shops','#bca382','#786857');building(-51,5,7,10,9,'office','#b3a184','#798478');
 // Outer approach: useful green spaces and street activity, not empty filler blocks.
 for(let i=0;i<60;i++){const x=-28+rand()*52,y=118+rand()*40;if(x>26)continue;tree(x,y,.65+rand()*.55,3.5+rand()*3);}
 parking(49,119,26,24);building(79,120,17,12,7,'shops','#b8a27f','#786f64');building(100,120,12,18,11,'office','#afbaa9','#8f9d96');
 for(const [x,y]of[[21,65],[23,82],[21,99],[48,66],[49,89],[60,96],[-33,66],[-34,83],[-35,99],[70,70],[69,94],[111,77],[111,102]])tree(x,y,.9,4.5);
 // Kiosks, lamps, bins, traffic islands, gates and short queue pens.
 for(const y of [67,82,98,123,140])for(const x of [28.5,43.5]){const a=project(pt(x,y)),b=project(pt(x,y,5));register('lamp',x-.2,y-.2,.4,.4,`<path d="M${a.x} ${a.y}L${b.x} ${b.y}" stroke="#667773" stroke-width="1.3"/><circle cx="${b.x}" cy="${b.y}" r="2.2" fill="#e0d8b5"/>`,5);}
 for(const [x,y]of[[17,66],[52,66],[24,74],[46,103]]){building(x,y,2.8,1.8,2.6,'shops','#d3c3a2','#925448');}
 for(const x of [13,20,52,59]){ground.push(rect(x,58.4,3,.5,'#73815e'));tree(x+1.5,58.6,.25,2.1);}
 for(let x=11;x<62;x+=4)ground.push(line([[x,58.4,.1],[x,58.4,1.2]],'#677673',1));
 for(const [x,y,w,d]of[[-31,23,30,12],[74,25,34,29],[114,14,21,7]]){for(let u=0;u<w;u+=2)register('fence',x+u,y,.15,.15,line([[x+u,y,0],[x+u,y,1.6]],'#60706c',.7),1.6);ground.push(line([[x,y,1.4],[x+w,y,1.4]],'#60706c',.6));}
 // Visitors, ticket kiosks and direction boards give the approach a purpose.
 for(let i=0;i<95;i++){const x=29+rand()*14,y=65+rand()*82,q=project(pt(x,y)),h=2.3;register('approach supporter',x-.16,y-.16,.32,.32,`<path d="M${q.x-.6} ${q.y}L${q.x-1} ${q.y-3}M${q.x+.6} ${q.y}L${q.x+1} ${q.y-3}" stroke="#263b3e" stroke-width=".8"/><rect x="${q.x-1.2}" y="${q.y-6}" width="2.4" height="3.5" fill="${['#b9403c','#325775','#c6b18a','#768b70'][i%4]}"/><circle cx="${q.x}" cy="${q.y-7}" r="1.1" fill="#dfba95"/>`,h);}
 for(const [x,y]of[[26,68],[46,91],[24,117]]){let s=box(x,y,.3,.3,4.4,'#5d6e68');s+=box(x-.5,y,3,.25,1.1,'#284b5a',3.3);register('wayfinding sign',x-.5,y,3,.3,s,4.4);}
 // A narrower belt along the outer railway bank, with gaps around the station.
 for(let i=0;i<80;i++){const x=-76+rand()*208,y=-22+rand()*8;if(x>1&&x<27)continue;tree(x,y,.6+rand()*.6,3+rand()*3);}
 props.sort((a,b)=>a.depth-b.depth);
 return {ground:ground.join(''),back:props.filter(a=>a.depth<80).map(a=>a.s).join(''),front:props.filter(a=>a.depth>=80).map(a=>a.s).join(''),footprints,counts:footprints.reduce((a,f)=>(a[f.type]=(a[f.type]||0)+1,a),{})};
}
