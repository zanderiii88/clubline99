import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildDistrict,project} from '../tools/build-scottish-surroundings.mjs';
import {fixedSurroundings,surroundingsLayer} from '../fixed-surroundings.js';
const root=new URL('../',import.meta.url);
const intersects=(a,b)=>Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x)>1e-7&&Math.min(a.y+a.d,b.y+b.d)-Math.max(a.y,b.y)>1e-7;
let total=0;
for(const style of ['city','town','industrial','harbour','edge']){
 const r=buildDistrict(style),m=r.manifest;
 assert.deepEqual(r,buildDistrict(style));
 for(const layer of ['back','front'])assert.equal(fs.readFileSync(new URL(`assets/surroundings/scotland-${style}-${layer}.svg`,root),'utf8'),r[layer]);
 for(const road of m.roads)assert(!intersects(road,m.reserve));
 for(const mark of m.markings){assert(!intersects(mark,m.reserve));assert(m.roads.some(r=>mark.x>=r.x+.89&&mark.y>=r.y&&mark.x+mark.w<=r.x+r.w-.89&&mark.y+mark.d<=r.y+r.d||mark.x>=r.x&&mark.y>=r.y+.89&&mark.x+mark.w<=r.x+r.w&&mark.y+mark.d<=r.y+r.d-.89));}
 for(const [i,b] of m.buildings.entries()){
  const p=b.plot;assert(b.x>=p.x&&b.y>=p.y&&b.x+b.w<=p.x+p.w&&b.y+b.d<=p.y+p.d);
  for(const road of m.roads)assert(!intersects(b,road));
  assert(!intersects(b,m.reserve));if(m.water)assert(!intersects(b,m.water));
  for(const other of m.buildings.slice(i+1))assert(!intersects(b,other));
 }
 total+=m.buildings.length;console.log(style,m.buildings.length,'building footprints clear');
}
assert.deepEqual(project(36,30),[900,710]);
const clubs=JSON.parse(fs.readFileSync(new URL('data/scotland.json',root))).clubs;
for(const club of clubs){
 const s=fixedSurroundings(club.id);assert(s.assetStem.startsWith('scotland-'));
 assert.deepEqual(s.reserve,{x:4,y:4,w:66,d:58});
 for(const layer of ['back','front'])assert(surroundingsLayer(s,layer).includes('.svg?v=1.120.0'));
 for(const [x,y,z] of [[0,0,0],[70,62,0],[36,30,8]]){
  const expected=[s.origin[0]+(x-36)*s.east[0]+(y-30)*s.south[0],s.origin[1]+(x-36)*s.east[1]+(y-30)*s.south[1]-z*2.55*s.scale];
  project(x,y,z).forEach((v,i)=>assert(Math.abs(v-expected[i])<1e-6));
 }
}
assert.equal(fixedSurroundings('EU051').assetStem,'scotland-harbour');
assert(surroundingsLayer(fixedSurroundings('C01'),'back').includes('.webp?v=1.74.0'));
assert.equal(total,2025);console.log('PASS',total,'footprints;',clubs.length,'Scottish club mappings; projection and English URLs preserved');
