import assert from 'node:assert/strict';
import fs from 'node:fs';
import {stadiumAccess} from '../stadium-access.js';
import {defaultLayout,SECTIONS,STANDS} from '../stadium-model.js';
import {groundsStand} from '../grounds-geometry.js';
import {fixedSurroundings,fixedSiteError} from '../fixed-surroundings.js';
import {sceneSvg} from '../scene.js';

const clubs=JSON.parse(fs.readFileSync(new URL('../data/scotland.json',import.meta.url))).clubs;
const overlap=(a,b)=>Math.min(a.x+a.w,b.x+b.w)>Math.max(a.x,b.x)+1e-7&&Math.min(a.y+a.d,b.y+b.d)>Math.max(a.y,b.y)+1e-7;
// Independent section rectangles conservatively enclose curved corner modules.
function footprint(s,cfg){
 const spec=groundsStand(cfg?.stand);if(!spec)return null;
 const rear=cfg.stand==='grass'?0:({compact:0,concourse:1.2,amenities:2,hospitality:2.6}[cfg.rear]||0);
 const d=Math.max(spec.depth||0,spec.roofRearV||0)+rear;
 if(s.corner)return {x:s.id.includes('W')?20-d:52,y:s.id.includes('N')?20-d:40,w:d,d};
 const start=s.i*s.bays;
 return s.side==='N'?{x:20+start,y:20-d,w:s.bays,d}:s.side==='S'?{x:20+start,y:40,w:s.bays,d}:s.side==='W'?{x:20-d,y:20+start,w:d,d:s.bays}:{x:52,y:20+start,w:d,d:s.bays};
}
let layouts=0,scenes=0,active=0;
function check(club,layout,works=[]){
 const site=fixedSurroundings(club.id),r=site.reserve,before=JSON.stringify({layout,works});
 assert.equal(fixedSiteError(club,layout),null);
 const paths=stadiumAccess(layout,works,r);assert(paths.length>=4);
 for(const p of paths){
  assert(p.w>0&&p.d>0);assert(p.x>=r.x&&p.y>=r.y&&p.x+p.w<=r.x+r.w+1e-7&&p.y+p.d<=r.y+r.d+1e-7);
  for(const s of SECTIONS)for(const cfg of [layout.sections[s.id],...works.filter(w=>w.sections?.[s.id]).map(w=>w.sections[s.id])]){
   const box=footprint(s,cfg);if(box)assert(!overlap(p,box),`${club.id} ${p.id} crosses ${s.id}`);
  }
 }
 assert(paths.some(p=>['north-approach','north-walk'].includes(p.id)&&p.y===r.y));
 assert(paths.some(p=>['south-approach','south-walk'].includes(p.id)&&Math.abs(p.y+p.d-r.y-r.d)<1e-7));
 assert(paths.some(p=>['west-approach','west-walk'].includes(p.id)&&p.x===r.x));
 assert(paths.some(p=>['east-approach','east-walk'].includes(p.id)&&Math.abs(p.x+p.w-r.x-r.w)<1e-7));
 // Walks form one continuous route; approaches meet it without grass gaps.
 const touching=(a,b)=>Math.min(a.x+a.w,b.x+b.w)>=Math.max(a.x,b.x)-1e-7&&Math.min(a.y+a.d,b.y+b.d)>=Math.max(a.y,b.y)-1e-7;
 const reached=new Set([0]);let previous=-1;
 while(previous!==reached.size){previous=reached.size;paths.forEach((p,i)=>{if(paths.some((q,j)=>reached.has(j)&&touching(p,q)))reached.add(i);});}
 assert.equal(reached.size,paths.length,'All access paths form a connected network');
 for(const frame of ['career','designer','menu','menu-mobile','match']){
  const svg=sceneSvg(club,'aberdeen',false,frame==='match',frame,layout,null,{ambient:false,phase:'idle'},works);
  const vb=svg.match(/viewBox="([^"]+)"/)[1].split(' ').map(Number);
  assert(vb.every(Number.isFinite)&&vb[2]>0&&vb[3]>0);assert(!svg.includes('NaN'));
  assert(svg.includes('data-stadium-access="north-walk"'));
  assert.equal((svg.match(/data-stadium-light=/g)||[]).length,4);
  if(works.length){
   assert(svg.includes('data-construction-panel="front"'));
   for(const panel of svg.matchAll(/<polygon points="([^"]+)"[^>]*data-construction-panel="(?:front|rear|end)"/g)){
    const pts=panel[1].split(' ').map(p=>p.split(',').map(Number));
    assert(Math.abs(pts[0][0]-pts[3][0])<.02&&Math.abs(pts[1][0]-pts[2][0])<.02,'Scaffold faces must rise vertically');
   }
  }
  if(frame==='career'||frame==='designer'){
   // The camera's ordinary fit must contain the complete floodlight poles.
   for(const light of svg.matchAll(/<g data-stadium-light="\d+"><path d="M([\d.-]+),([\d.-]+)L([\d.-]+),([\d.-]+)"/g)){
    for(const [x,y] of [[+light[1],+light[2]],[+light[3],+light[4]]])assert(x>=vb[0]-1&&x<=vb[0]+vb[2]+1&&y>=vb[1]-1&&y<=vb[1]+vb[3]+1);
   }
  }
  scenes++;
 }
 assert.equal(JSON.stringify({layout,works}),before);layouts++;if(works.length)active++;
 return paths;
}
for(const club of clubs){
 const layout=defaultLayout(club);check(club,layout);
 const future={...layout.sections.N1,stand:'d2',rear:'hospitality'};
 check(club,layout,[{sections:{N1:future},opens:'1998-09-01'}]);
}
const club=clubs.find(c=>c.id==='EU051');
for(const stand of Object.keys(STANDS)){
 const layout=defaultLayout(club);for(const cfg of Object.values(layout.sections))Object.assign(cfg,{stand,roof:stand==='empty'?'none':'full',rear:'compact'});
 if(!fixedSiteError(club,layout))check(club,layout);
}
const compact=defaultLayout(club);for(const cfg of Object.values(compact.sections))Object.assign(cfg,{stand:'terrace3',rear:'compact',roof:'none'});
const built=check(club,compact),works=[{sections:{N1:{...compact.sections.N1,stand:'d3',rear:'hospitality'}},opens:'1998-09-01'}],expanded=check(club,compact,works);
assert(expanded.find(p=>p.id==='north-walk').y<built.find(p=>p.id==='north-walk').y,'Approach ring moves outward for active work');
check(club,compact,[{sections:{NW:{...compact.sections.NW,stand:'d2',rear:'compact'}},opens:'1998-09-01'}]);
assert.deepEqual(stadiumAccess(compact,[],null),[]);
assert.deepEqual(stadiumAccess(compact,[{sections:{N1:{...compact.sections.N1,stand:'d5',rear:'hospitality'}}}],fixedSurroundings(club.id).reserve),[],'Invalid over-site future layout omits decorative paths');
assert(!sceneSvg({id:'C01',capacity:30000,colour:'#ff0000'},'aberdeen',false,false,'career').includes('data-stadium-access='));
const report={passed:true,clubs:clubs.length,layouts,scenes,activeWorksLayouts:active,checks:['paths inside site','built and future section clearances','connected approaches reach site edges','finite camera frames','floodlight mast framing','vertical scaffold faces including corners','input immutability','Scottish-only access art']};
fs.writeFileSync(new URL('../review/stadium-access-1.120.json',import.meta.url),JSON.stringify(report,null,2));
console.log('PASS Scottish stadium access:',JSON.stringify(report));
