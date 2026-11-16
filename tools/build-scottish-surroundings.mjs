import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export const BOX=[-660,-175,3100,2070],RESERVE={x:4,y:4,w:66,d:58};
export const project=(x,y,z=0)=>[900+(x-36)*10.8-(y-30)*11.025,710+(x-36)*6.3+(y-30)*6.3-z*3.825];
const points=ps=>ps.map(p=>project(...p).map(n=>n.toFixed(2)).join(',')).join(' '),poly=(ps,fill,attrs='')=>`<polygon points="${points(ps)}" fill="${fill}" ${attrs}/>`;
const rect=(x,y,w,d,fill,z=0,attrs='')=>poly([[x,y,z],[x+w,y,z],[x+w,y+d,z],[x,y+d,z]],fill,attrs);
export const overlaps=(a,b)=>a.x<b.x+b.w-1e-7&&a.x+a.w>b.x+1e-7&&a.y<b.y+b.d-1e-7&&a.y+a.d>b.y+1e-7;
const hash=(x,y,n=0)=>Math.abs(Math.imul(Math.round(x*10)+19,73856093)^Math.imul(Math.round(y*10)+53,19349663)^n*83492791)>>>0;
const xs=[-130,-104,-78,-52,-26,0,74,100,126,152,178,204],ys=[-130,-104,-78,-52,-26,0,66,92,118,144,170,196];
const palettes={city:['#c0beb4','#aaa9a2','#cbc6b6'],town:['#c2bbac','#b7b6ae','#d0c5b0'],industrial:['#a4a9a5','#b4aaa0','#c0b7a6'],harbour:['#b6b8b3','#c5c3b6','#a9adaa'],edge:['#c9c1ac','#b9b8ab','#d1c9b8']};
export function buildDistrict(style){
 const harbour=style==='harbour',water=harbour?{x:116,y:-180,w:150,d:440}:null;
 const roads=[...xs.filter(x=>!harbour||x<=100).map(x=>({x:x-3,y:-160,w:6,d:390,axis:'y'})),...ys.map(y=>({x:-160,y:y-3,w:harbour?276:390,d:6,axis:'x'}))];
 const ground=[rect(-180,-180,450,450,style==='city'?'#89917c':'#8d9b78')],objects=[],buildings=[],plots=[],markings=[];
 if(harbour){ground.push(rect(116,-180,150,440,'#648c9b'),rect(106,-180,10,440,'#a9aaa0'));for(let y=-140;y<220;y+=8)ground.push(rect(121,y,95,.12,'#91b0b9'));}
 for(const r of roads){ground.push(rect(r.x,r.y,r.w,r.d,'#b9b9ae'));const k=.9;ground.push(rect(r.x+(r.axis==='y'?k:0),r.y+(r.axis==='x'?k:0),r.w-(r.axis==='y'?k*2:0),r.d-(r.axis==='x'?k*2:0),'#667277'));}
 // Quiet centre dashes on the four approach streets, with clear junctions.
 for(const road of roads){
  const vertical=road.axis==='y',centre=vertical?road.x+3:road.y+3;
  if(!(vertical?[0,74]:[0,66]).includes(centre))continue;
  const cross=vertical?ys:xs.filter(x=>!harbour||x<=100),end=vertical?road.y+road.d:road.x+road.w;
  for(let n=vertical?road.y:road.x;n+1.8<end;n+=5){
   if(cross.some(c=>n<c+4&&n+1.8>c-4))continue;
   const mark=vertical?{x:centre-.06,y:n,w:.12,d:1.8}:{x:n,y:centre-.06,w:1.8,d:.12};
   markings.push(mark);ground.push(rect(mark.x,mark.y,mark.w,mark.d,'#c0c1b3'));
  }
 }
 // The scene paints the current stadium and its access paths over this grass.
 // Keeping the reserve clear allows small grounds and future phases to coexist.
 ground.push(rect(4,4,66,58,'#829170'));
 for(const [x,y,w,d] of [[35.2,3,1.6,1],[35.2,62,1.6,1],[3,29.2,1,1.6],[70,29.2,1,1.6]])ground.push(rect(x,y,w,d,'#b5b5a6'));
 function legal(b,p){return b.x>=p.x&&b.y>=p.y&&b.x+b.w<=p.x+p.w&&b.y+b.d<=p.y+p.d&&!roads.some(r=>overlaps(b,r))&&!overlaps(b,RESERVE)&&(!water||!overlaps(b,water));}
 function emit(b,p,svg,type='building'){if(!legal(b,p))throw Error('Invalid '+style+' '+type+' parcel '+JSON.stringify(b));if(type==='building')buildings.push({...b,plot:{...p},type});objects.push({depth:b.x+b.y+(b.w+b.d)/2,svg});}
 function house(x,y,w,d,h,plot,seed,warehouse=false){
  const pad=.25,b={x:x-pad,y:y-pad,w:w+pad*2,d:d+pad*2},wall=palettes[style][seed%3],roof=['#4d5962','#625a54','#5a6265'][seed%3],rise=warehouse?.65:1.9;
  let svg=rect(x+.7,y+.8,w+.7,d+.6,'#4f5950',0,'opacity=".17"');
  svg+=poly([[x,y+d,0],[x+w,y+d,0],[x+w,y+d,h],[x,y+d,h]],wall)+poly([[x+w,y,0],[x+w,y+d,0],[x+w,y+d,h],[x+w,y,h]],'#929b97');
  svg+=poly([[x-pad,y-pad,h],[x+w+pad,y-pad,h],[x+w+pad,y+d/2,h+rise],[x-pad,y+d/2,h+rise]],roof)+poly([[x-pad,y+d/2,h+rise],[x+w+pad,y+d/2,h+rise],[x+w+pad,y+d+pad,h],[x-pad,y+d+pad,h]],'#46535b')+poly([[x+w,y,h],[x+w,y+d,h],[x+w,y+d/2,h+rise]],'#b0b3ab');
  for(let z=1.1;z<h-.4;z+=2.2)for(let u=.8;u<w-.6;u+=1.8)svg+=poly([[x+u,y+d+.01,z],[x+u+.65,y+d+.01,z],[x+u+.65,y+d+.01,z+.85],[x+u,y+d+.01,z+.85]],'#4f6872','stroke="#dad7c4" stroke-width=".45"');
  svg+=warehouse?poly([[x+w*.3,y+d+.02,0],[x+w*.75,y+d+.02,0],[x+w*.75,y+d+.02,2.8],[x+w*.3,y+d+.02,2.8]],'#727c7d'):poly([[x+w*.45,y+d+.02,0],[x+w*.61,y+d+.02,0],[x+w*.61,y+d+.02,1.9],[x+w*.45,y+d+.02,1.9]],seed%2?'#5c6c6a':'#714f47');
  emit(b,plot,`<g data-object="building">${svg}</g>`);
 }
 function tree(x,y,plot,seed){const b={x:x-1.2,y:y-1.2,w:2.4,d:2.4};if(!legal(b,plot))return;const [px,py]=project(x,y),[,top]=project(x,y,4);emit(b,plot,`<g data-object="tree"><ellipse cx="${px}" cy="${py}" rx="9" ry="4" fill="#415646" opacity=".18"/><path d="M${px},${py}V${top}" stroke="#6c6751" stroke-width="2.2"/><ellipse cx="${px}" cy="${top}" rx="7" ry="10" fill="${seed%2?'#557c57':'#63855b'}"/></g>`,'tree');}
 for(let ix=0;ix<xs.length-1;ix++)for(let iy=0;iy<ys.length-1;iy++){
  const plot={x:xs[ix]+4.5,y:ys[iy]+4.5,w:xs[ix+1]-xs[ix]-9,d:ys[iy+1]-ys[iy]-9};if(overlaps(plot,RESERVE)||harbour&&plot.x+plot.w>106)continue;
  const seed=hash(ix,iy),park=(style==='edge'&&(ix>7||iy>7||seed%3===0))||seed%13===0;plots.push(plot);ground.push(rect(plot.x-.7,plot.y-.7,plot.w+1.4,plot.d+1.4,park?'#81966f':style==='industrial'&&seed%3===0?'#a5a79b':'#99a183'));
  if(park){for(let x=plot.x+3;x<plot.x+plot.w-1;x+=5.5)for(let y=plot.y+3;y<plot.y+plot.d-1;y+=6)tree(x,y,plot,hash(x,y));continue;}
  if(style==='industrial'&&seed%3!==1||harbour&&plot.x>76){for(let x=plot.x+.6;x+11<plot.x+plot.w;x+=15)for(let y=plot.y+.6;y+9<plot.y+plot.d;y+=13)house(x,y,10,8,4.2,plot,hash(x,y),true);continue;}
  const w=style==='city'?4.8:5.8,d=6.1,gap=style==='city'?1.1:2.1,count=Math.max(1,Math.floor((plot.w-1)/(w+gap))),used=count*w+(count-1)*gap,start=plot.x+(plot.w-used)/2,rows=plot.d>=16?[plot.y+1.1,plot.y+plot.d-d-1.1]:[plot.y+(plot.d-d)/2];
  for(let i=0;i<count;i++)for(const y of rows)house(start+i*(w+gap),y,w,d,style==='city'?5.4:4.1,plot,seed+i);
  if(plot.d>22)for(let y=plot.y+12;y<plot.y+plot.d-8;y+=9)for(let x=plot.x+3;x<plot.x+plot.w-2;x+=7)tree(x,y,plot,hash(x,y));
 }
 if(harbour){for(let i=0;i<ys.length-1;i++){const plot={x:107,y:ys[i]+4.5,w:8,d:ys[i+1]-ys[i]-9};if(plot.d>=12)house(108,plot.y+2,5,8,3,plot,i,true);}for(let y=12;y<170;y+=34){ground.push(rect(116,y,10,1.8,'#a8aa9b'));objects.push({depth:135+y,svg:poly([[128,y-3,0],[134,y-2,0],[136,y+4,0],[130,y+5,0]],'#e4e1cf')+rect(129.5,y,3.5,2,'#5d7883',.6)});}}
 objects.sort((a,b)=>a.depth-b.depth);const wrap=body=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${BOX.join(' ')}">${body}</svg>`;
 return {back:wrap(ground.join('')+objects.filter(o=>o.depth<104).map(o=>o.svg).join('')),front:wrap(objects.filter(o=>o.depth>=104).map(o=>o.svg).join('')),manifest:{style,roads,reserve:RESERVE,water,plots,buildings,markings}};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){const layouts=[];for(const style of Object.keys(palettes)){const r=buildDistrict(style);for(const layer of ['back','front'])fs.writeFileSync(path.join(root,'assets','surroundings',`scotland-${style}-${layer}.svg`),r[layer]);layouts.push(r.manifest);console.log(style,r.manifest.buildings.length,'planned buildings');}fs.writeFileSync(path.join(root,'review','scottish-surroundings-1.120-layouts.json'),JSON.stringify(layouts));}
