const fs=require('fs');eval(fs.readFileSync('../ham2/pipelogic.js','utf8')+fs.readFileSync('levels2.js','utf8')+';global.PL=PL;global.RP_LEVELS=RP_LEVELS;');
const idx=process.argv.slice(2).map(Number); const out={};
(idx.length?idx:[1,2,3,4,5,6,7,8]).forEach(i=>{const L=RP_LEVELS[i-1];const t=Date.now();const r=PL.solve(L);out[i]=r;console.log(i,L.name,'par',r.n,(Date.now()-t)+'ms',r.sol&&r.sol.map(p=>p.t+'@'+p.c+','+p.r+':'+p.o).join(' '));});
