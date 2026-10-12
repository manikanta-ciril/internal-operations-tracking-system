const cp=require('child_process');
const exe='C:/Users/ciril/OneDrive/Desktop/Manikanta-Files/Personal-Tools/Draw.io/Application/draw.io.exe';
for(const args of [
 ['--format','png','--width','3400','--border','20','--output','review/new-final-full.png','new_final-version.drawio'],
 ['--format','svg','--embed-diagram','--border','20','--output','new_final-version.drawio.svg','new_final-version.drawio']
]){const r=cp.spawnSync(exe,['--disable-gpu','--export',...args],{windowsHide:true,encoding:'utf8',timeout:90000});if(r.status!==0)throw Error(r.stderr||r.stdout||String(r.error));console.log(r.stdout.trim());}
