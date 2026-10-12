const fs=require('fs'),cp=require('child_process'),path=require('path');
const exe='C:/Users/ciril/OneDrive/Desktop/Manikanta-Files/Personal-Tools/Draw.io/Application/draw.io.exe';
function run(args){const r=cp.spawnSync(exe,['--disable-gpu','--export',...args],{cwd:process.cwd(),windowsHide:true,encoding:'utf8',timeout:90000});if(r.status!==0)throw Error((r.stderr||r.stdout||r.error||'Export failed').toString());console.log((r.stdout||'Exported '+args.join(' ')).trim());}
fs.mkdirSync('review',{recursive:true});
const selected=process.argv.slice(2).map(Number);const indices=selected.length?selected:Array.from({length:14},(_,i)=>i+1);
for(const i of indices)run(['--format','png','--page-index',String(i),'--width','1600','--border','15','--output',i===1?'final-version-preview.png':`review/page-${String(i).padStart(2,'0')}.png`,'final-version.drawio']);
run(['--format','pdf','--all-pages','--embed-diagram','--border','15','--output','final-version.pdf','final-version.drawio']);
