const fs=require('fs'),z=require('zlib');
const s=fs.readFileSync('ciril_crm_detail.pdf').toString('latin1');
const objs=new Map([...s.matchAll(/(\d+) 0 obj\s*([\s\S]*?)endobj/g)].map(m=>[m[1],m[2]]));
function stream(b){const q=b.match(/stream\r?\n([\s\S]*?)\r?\n?endstream/);return z.inflateSync(Buffer.from(q[1],'latin1')).toString();}
const maps={};
for(const [id,b] of objs){const u=b.match(/\/ToUnicode (\d+) 0 R/);if(!u)continue;const c=stream(objs.get(u[1])),map={};
 for(const block of c.matchAll(/beginbfchar([\s\S]*?)endbfchar/g))for(const m of block[1].matchAll(/<([A-Fa-f0-9]+)>\s*<([A-Fa-f0-9]+)>/g))map[parseInt(m[1],16)]=String.fromCodePoint(parseInt(m[2],16));
 for(const block of c.matchAll(/beginbfrange([\s\S]*?)endbfrange/g))for(const m of block[1].matchAll(/<([A-Fa-f0-9]+)>\s*<([A-Fa-f0-9]+)>\s*<([A-Fa-f0-9]+)>/g))for(let i=parseInt(m[1],16);i<=parseInt(m[2],16);i++)map[i]=String.fromCodePoint(parseInt(m[3],16)+i-parseInt(m[1],16));maps[id]=map;
}
let output=[],p=0;
for(const [id,b] of objs){if(!/\/Type \/Page\b/.test(b))continue;const content=stream(objs.get(b.match(/\/Contents (\d+) 0 R/)[1]));let lines=[],lastY=null,line='';
for(const t of content.matchAll(/BT([\s\S]*?)ET/g)){const f=t[1].match(/\/F(\d+)\s+[\d.]+ Tf/),tm=t[1].match(/([\d.-]+) ([\d.-]+) Tm/),td=t[1].match(/([\d.-]+) ([\d.-]+) Td/);const y=(tm?+tm[2]:0)-(td?+td[2]:0);if(lastY!==null&&Math.abs(y-lastY)>2){lines.push(line);line='';}lastY=y;for(const h of t[1].matchAll(/<([0-9A-Fa-f]+)>/g))for(let i=0;i<h[1].length;i+=4)line+=maps[f?.[1]]?.[parseInt(h[1].slice(i,i+4),16)]||'�';}if(line)lines.push(line);output.push('=== PDF PAGE '+(++p)+' ===\n'+lines.join('\n'));}
fs.writeFileSync('company-extracted.txt',output.join('\n\n'));
console.log('Extracted '+p+' pages.');
