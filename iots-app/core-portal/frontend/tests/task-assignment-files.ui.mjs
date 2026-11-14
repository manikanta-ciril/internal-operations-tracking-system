import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium} from 'playwright';
const fixture=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
assert.match(fixture.database,/^iots_tasks_browser_\d+$/);
const browser=await chromium.launch({channel:'msedge',headless:true});
const contexts=[];const errors=[];
async function account(name){const ctx=await browser.newContext({viewport:{width:1440,height:1000}});contexts.push(ctx);await ctx.addCookies([fixture.sessions[name].cookie]);const page=await ctx.newPage();page.on('pageerror',e=>errors.push(e.message));return page;}
async function fill(page,title){await page.goto(fixture.base+'/dashboard/general-manager/assign-work');const form=page.locator('.management-form');await form.locator('[name=title]').fill(title);await form.locator('[name=brief]').fill('Use the attached approved inputs to prepare the requested work.');await form.locator('[name=criteria]').fill('Use approved information');await form.locator('[name=deliverables]').fill('Prepared result and supporting evidence');await form.locator('[name=ownerId]').selectOption(String(fixture.sessions.deepthi.id));await form.locator('[name=reviewerId]').selectOption(String(fixture.sessions.secondmanager.id));await form.locator('[name=due]').fill('2027-02-01T17:00');return form;}
const text=name=>({name,mimeType:'text/plain',buffer:Buffer.from('Approved task input: '+name)});
try{
 const gm=await account('ipsheeta');let form=await fill(gm,'Assignment with input files');
 await form.locator('#assignment-reference-files').setInputFiles([text('brief.txt'),text('notes.txt'),text('remove.txt')]);
 await form.getByRole('button',{name:'Remove remove.txt',exact:true}).click();
 await form.getByRole('button',{name:'Save & assign',exact:true}).click();
 await gm.locator('.management-current strong').filter({hasText:'Assigned'}).waitFor();
 let snapshot=await gm.evaluate(()=>fetch('/api/auth/tasks').then(r=>r.json()));let task=snapshot.tasks.find(t=>t.title==='Assignment with input files');assert.equal(task.referenceFiles.length,2);
 const employee=await account('deepthi');await employee.goto(fixture.base+'/dashboard/creative-communication-associate/tasks/'+task.id);
 await employee.getByRole('button',{name:'Preview brief.txt',exact:true}).click();await employee.getByRole('dialog').getByText('Approved task input: brief.txt',{exact:true}).waitFor();await employee.getByRole('button',{name:'Close file preview',exact:true}).click();
 const dl=employee.waitForEvent('download');await employee.getByRole('button',{name:'Download notes.txt',exact:true}).click();assert.equal((await dl).suggestedFilename(),'notes.txt');
 form=await fill(gm,'Failed upload stays draft');let uploads=0;
 await gm.route('**/api/auth/tasks/*/files',async route=>{if(++uploads===2)await route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({message:'Upload temporarily unavailable.'})});else await route.continue();});
 await form.locator('#assignment-reference-files').setInputFiles([text('first.txt'),text('retry.txt')]);await form.getByRole('button',{name:'Save & assign',exact:true}).click();
 await gm.getByRole('alert').filter({hasText:'saved as a draft and was not assigned'}).waitFor();
 snapshot=await gm.evaluate(()=>fetch('/api/auth/tasks').then(r=>r.json()));task=snapshot.tasks.find(t=>t.title==='Failed upload stays draft');assert.equal(task.status,'Draft');assert.equal(task.referenceFiles.length,1);
 await gm.unroute('**/api/auth/tasks/*/files');
 await gm.setViewportSize({width:390,height:844});await gm.goto(fixture.base+'/dashboard/general-manager/assign-work');await gm.locator('#assignment-reference-files').waitFor({state:'attached'});assert(await gm.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 fs.mkdirSync('test-results/task-lifecycle',{recursive:true});await gm.screenshot({path:'test-results/task-lifecycle/assignment-files-mobile.png',fullPage:true});
 assert.deepEqual(errors,[]);console.log('PASS: form attachments, remove selection, upload-before-assignment, employee preview/download, partial-upload failure retains draft without assignment, mobile width.');
}finally{await Promise.all(contexts.map(c=>c.close()));await browser.close();}
