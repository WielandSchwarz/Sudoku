const fs=require('fs');eval(fs.readFileSync('../ham2/pipelogic.js','utf8')+fs.readFileSync('levels.js','utf8')+';global.PL=PL;global.RP_LEVELS=RP_LEVELS;');
process.argv.slice(2).map(Number).forEach(i=>{const L=RP_LEVELS[i-1];const t=Date.now();const r=PL.solve(L);console.log(i,L.name,'par',r.n,(Date.now()-t)+'ms',r.sol&&r.sol.map(p=>p.t+'@'+p.c+','+p.r+':'+p.o).join(' '));});
