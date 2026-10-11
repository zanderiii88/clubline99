// Small original vector kit presets; detailed period kits remain a later art task.
export function europeanKit(c,keeper=false,away=false){
 const a=keeper?'#609052':away?c.secondary:c.colour,b=keeper?'#e9bd45':away?c.colour:c.secondary,p=c.kits?.[0]?.[2]||'plain';
 const stripes=p==='stripes'?Array.from({length:5},(_,i)=>`<rect x="${32+i*14}" y="15" width="7" height="95" fill="${b}"/>`).join(''):p==='hoops'?Array.from({length:5},(_,i)=>`<rect x="20" y="${25+i*16}" width="90" height="8" fill="${b}"/>`).join(''):p==='halves'?`<rect x="60" y="15" width="50" height="95" fill="${b}"/>`:p==='panel'?`<rect x="48" y="15" width="24" height="95" fill="${b}"/>`:'';
 const path='M32 20L46 15Q60 27 74 15L88 20L108 34L99 58L85 52L84 104Q60 110 36 104L35 52L21 58L12 34Z';
 return 'data:image/svg+xml,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 112"><defs><clipPath id="shirt"><path d="${path}"/></clipPath></defs><path d="${path}" fill="${a}" stroke="#102338" stroke-width="2"/><g clip-path="url(#shirt)">${keeper?'':stripes}</g><path d="M46 15L51 29L60 23L69 29L74 15" fill="${b}" stroke="#102338"/><path d="M37 103Q60 108 83 103" fill="none" stroke="${b}" stroke-width="3"/><circle cx="76" cy="40" r="5" fill="${b}"/></svg>`);
}
