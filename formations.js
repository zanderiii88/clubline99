export const FORMATIONS={
 '4-3-3':[['LW','ST','RW'],['CM','DM','CM'],['LB','CB','CB','RB'],['GK']],
 '4-2-3-1':[['ST'],['LW','AM','RW'],['DM','DM'],['LB','CB','CB','RB'],['GK']],
 '4-5-1':[['ST'],['LW','CM','DM','CM','RW'],['LB','CB','CB','RB'],['GK']],
 '4-4-2':[['ST','ST'],['LW','CM','CM','RW'],['LB','CB','CB','RB'],['GK']],
 '3-5-2':[['ST','ST'],['LB','CM','DM','CM','RB'],['CB','CB','CB'],['GK']],
 '4-1-4-1':[['ST'],['LW','CM','CM','RW'],['DM'],['LB','CB','CB','RB'],['GK']],
 '4-3-2-1':[['ST'],['AM','AM'],['CM','DM','CM'],['LB','CB','CB','RB'],['GK']],
 '3-4-3':[['LW','ST','RW'],['LB','CM','CM','RB'],['CB','CB','CB'],['GK']],
 '5-3-2':[['ST','ST'],['CM','DM','CM'],['LB','CB','CB','CB','RB'],['GK']],
 '4-1-2-1-2':[['ST','ST'],['AM'],['CM','CM'],['DM'],['LB','CB','CB','RB'],['GK']]
};
export const formationSlots=shape=>(FORMATIONS[shape]||FORMATIONS['4-4-2']).flat();
