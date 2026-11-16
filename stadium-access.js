import {SECTIONS} from './stadium-model.js';
import {groundsStand} from './grounds-geometry.js';

// Decorative paths use the complete built/future envelope, including roofs and
// rear blocks. They never reserve land or change construction/capacity rules.
export function stadiumAccess(layout,works=[],reserve){
 if(!reserve)return [];
 const depths={N:0,E:0,S:0,W:0};
 for(const s of SECTIONS){
  const configs=[layout.sections[s.id],...works.filter(j=>j.sections?.[s.id]).map(j=>j.sections[s.id])];
  for(const cfg of configs){
   const spec=groundsStand(cfg?.stand);if(!spec)continue;
   const rear=cfg.stand==='grass'?0:({compact:0,concourse:1.2,amenities:2,hospitality:2.6}[cfg.rear]||0);
   const depth=Math.max(spec.depth||0,spec.roofRearV||0)+rear;
   for(const side of s.corner?s.id.split(''):[s.side])depths[side]=Math.max(depths[side],depth);
  }
 }
 const envelope={left:20-depths.W,right:52+depths.E,top:20-depths.N,bottom:40+depths.S};
 const {left:l,right:r,top:t,bottom:b}=envelope,x=reserve.x,y=reserve.y,x2=x+reserve.w,y2=y+reserve.d;
 // Invalid design previews should not paint paths over a stand outside its site.
 if(l<x||r>x2||t<y||b>y2)return [];
 const outer={left:Math.max(x,l-1.15),right:Math.min(x2,r+1.15),top:Math.max(y,t-1.15),bottom:Math.min(y2,b+1.15)};
 const paths=[];
 const add=(id,x,y,w,d)=>{if(w>.05&&d>.05)paths.push({id,x,y,w,d});};
 add('north-walk',outer.left,outer.top,outer.right-outer.left,t-.2-outer.top);
 add('south-walk',outer.left,b+.2,outer.right-outer.left,outer.bottom-b-.2);
 add('west-walk',outer.left,outer.top,l-.2-outer.left,outer.bottom-outer.top);
 add('east-walk',r+.2,outer.top,outer.right-r-.2,outer.bottom-outer.top);
 add('north-approach',35.2,y,1.6,outer.top-y);
 add('south-approach',35.2,outer.bottom,1.6,y2-outer.bottom);
 add('west-approach',x,29.2,outer.left-x,1.6);
 add('east-approach',outer.right,29.2,x2-outer.right,1.6);
 return paths;
}
