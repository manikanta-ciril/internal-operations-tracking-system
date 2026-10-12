const fs=require('fs');
const C={navy:['#19344A','#19344A'],blue:['#EAF3F9','#32749A'],orange:['#FFF1E4','#C66B17'],green:['#E8F5EF','#2D7B5C'],purple:['#F0EBFA','#70529D'],red:['#FBEDED','#B35C65'],gray:['#F5F7FA','#6B7B8D']};
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const pages=[];let p,seq=0;
function page(id,title,subtitle,h=1350){p={id,title,h,cells:[],nodes:[]};pages.push(p);box(title,40,25,1520,55,'navy','bar');box(subtitle,40,90,1520,45,'gray','note');if(id!=='overview')box('← OVERVIEW',1350,145,210,36,'purple','link','overview');return p;}
function box(label,x,y,w=240,h=74,color='blue',kind='box',link,parent='1'){
 const id=p.id+'-n'+(++seq),cc=C[color];let style='whiteSpace=wrap;html=1;fontFamily=Arial;fontSize=14;spacing=10;strokeWidth=1.3;shadow=0;';
 style+=(kind==='decision'?'rhombus;':kind==='data'?'shape=cylinder3;size=12;':kind==='note'?'rounded=0;strokeOpacity=0;align=left;':kind==='bar'?'rounded=1;fontStyle=1;fontSize=19;':'rounded=1;arcSize=12;');
 style+=`fillColor=${cc[0]};strokeColor=${cc[1]};fontColor=${color==='navy'?'#FFFFFF':'#1B2935'};`;
 if(kind==='link')style+='fontStyle=1;dashed=1;';
 const attrs=`label="${esc(label.replace(/\n/g,'<br>'))}"${link?` link="data:page/id,${link}"`:''}`;
 p.cells.push(`<object id="${id}" ${attrs}><mxCell style="${style}" vertex="1" parent="${parent}"><mxGeometry x="${x}" y="${y}" width="${w}" height="${h}" as="geometry"/></mxCell></object>`);
 p.nodes.push({id,label,x,y,w,h,parent});return id;
}
function edge(a,b,label='',color='gray',style=''){const id=p.id+'-e'+(++seq);if(!style.includes('exitX')){const na=p.nodes.find(n=>n.id===a),nb=p.nodes.find(n=>n.id===b);if(nb.y>na.y+30)style+='exitX=0.5;exitY=1;entryX=0.5;entryY=0;';else if(nb.y<na.y-30)style+='exitX=0.5;exitY=0;entryX=0.5;entryY=1;';else if(nb.x>na.x)style+='exitX=1;exitY=0.5;entryX=0;entryY=0.5;';else style+='exitX=0;exitY=0.5;entryX=1;entryY=0.5;';}p.cells.push(`<mxCell id="${id}" value="${esc(label)}" style="edgeStyle=orthogonalEdgeStyle;rounded=1;html=1;endArrow=block;endFill=1;fontFamily=Arial;fontSize=12;labelBackgroundColor=#FFFFFF;strokeColor=${C[color][1]};strokeWidth=1.4;${style}" edge="1" parent="1" source="${a}" target="${b}"><mxGeometry relative="1" as="geometry"/></mxCell>`);}
function chain(nodes,color='gray'){for(let i=1;i<nodes.length;i++)edge(nodes[i-1],nodes[i],'',color);return nodes;}
function relabel(a,b,label){p.cells=p.cells.map(s=>s.includes(`source="${a}" target="${b}"`)?s.replace('value=""',`value="${esc(label)}"`):s);}
function decisionNode(id,label){p.cells=p.cells.map(s=>s.includes(`<object id="${id}"`)?s.replace(/label="[^"]*"/,`label="${esc(label)}"`).replace('rounded=1;arcSize=12;','rhombus;'):s);p.nodes.find(n=>n.id===id).label=label;}
function bar(text,y,color='navy'){return box(text,40,y,1520,40,color,'bar');}
function flow(title,x,y,steps,color='blue',w=325,gap=112,links={}){box(title,x,y,w,46,color,'bar');return chain(steps.map((t,i)=>box(t,x+12,y+72+i*gap,w-24,78,color,links[i]?'link':'box',links[i])),color);}
function note(t,y,h=55){return box(t,40,y,1520,h,'gray','note');}
function go(t,x,y,id,color='purple',w=300){return box(t,x,y,w,60,color,'link',id);}

page('overview','CIRIL • INTERNAL OPERATIONS TRACKING SYSTEM','01 / Start here • Follow the arrows downward. Open linked boxes for detail. Blue: administration | Orange: management | Green: execution | Purple: intelligence',1610);
bar('LAYER 1  •  AUTHENTICATION & AUTHORIZATION',155);
const start=box('START • Corporate login',680,215,240,58,'navy');
const access=box('Validate identity, account & location\nRecord login context',630,310,340,76,'blue','link','access');edge(start,access);
const workspace=box('Load authorised roles\nOpen primary workspace / switch role',590,425,420,76,'purple','link','roles');edge(access,workspace);
bar('LAYER 2  •  MANAGEMENT, OPERATIONS & EXECUTION',540);
const ah=box('ADMINISTRATIVE FUNCTIONS\nAdmin • Super Admin • IT Analyst',70,615,430,74,'blue','link','admin');
const mh=box('MANAGEMENT FUNCTIONS\nGeneral • Senior • Lead Manager',585,615,430,74,'orange','link','managers');
const eh=box('EXECUTION FUNCTIONS\nExecutive • BDE • Creatives Associate',1100,615,430,74,'green','link','execution');
edge(workspace,ah,'','blue','exitX=0;exitY=0.5;entryX=0.5;entryY=0;');edge(workspace,mh,'','orange');edge(workspace,eh,'','green','exitX=1;exitY=0.5;entryX=0.5;entryY=0;');
const a1=box('Provision accounts • set office rules\nMonitor services • publish notices',90,735,390,78,'blue','link','admin');edge(ah,a1,'','blue');
const m1=box('Plan work • check capacity\nAssign owner, deliverables & deadline',605,735,390,78,'orange','link','tasks');edge(mh,m1,'','orange');
const e1=box('Execute work • record time & progress\nAttach evidence • submit for review',1120,735,390,78,'green','link','tasks');edge(eh,e1,'','green');edge(m1,e1,'Assign / notify','orange');
const m2=box('Review submission\nApprove or return with corrections',605,865,390,78,'orange','link','tasks');edge(e1,m2,'Submit','green');
const e2=box('Corrections, blockers or overdue?\nResolve / revise / escalate [06]',1120,865,390,78,'red','link','exceptions');edge(m2,e2,'Changes / issues','red');
edge(e2,e1,'Resume / revise','green','exitX=1;exitY=0.5;entryX=1;entryY=0.5;');
const a2=box('Attendance • availability • requests\nMessages • personal account [07]',90,865,390,78,'blue','link','people');edge(a1,a2,'Shared services','blue');
const closed=box('Approved work completed & closed\nDecision and delivery history retained',605,987,390,78,'green');edge(m2,closed,'Approved','green');
const data=box('OPERATIONAL RECORDS\nWork, evidence, attendance, requests, decisions, audit & linked CRM updates',370,1110,860,80,'purple','data');edge(closed,data);edge(a2,data,'Record outcomes','blue','exitX=0.5;exitY=1;entryX=0;entryY=0.5;');edge(e2,data,'Record interventions','red','exitX=0.5;exitY=1;entryX=1;entryY=0.5;');
bar('LAYER 3  •  INTELLIGENCE & ANALYTICS',1230,'purple');
const insight=box('Metrics • trends • risks\nDaily / weekly / monthly reports [12]',80,1310,440,85,'purple','link','analytics');
const chair=box('CHAIRMAN • Vijay Sir\nOperational health • royalty • attention items\nAppraisal exports • announcements [13]',580,1310,440,85,'purple','link','chairman');
const action=box('Authorised action & recognition\nManagers resolve risks; Chairman reviews\n3-month excellence nominations [13]',1080,1310,440,85,'purple','link','chairman');
edge(data,insight,'','purple','exitX=0.15;exitY=1;entryX=0.5;entryY=0;');edge(insight,chair);edge(chair,action);
go('BUSINESS FLOWS [09–11]\nMembership • deals • content & research',70,1450,'membership','green',450);
go('ROLE MAP [03]\nTen roles, three functional lanes',575,1450,'roles','purple',450);
go('SOURCES & DESIGN DECISIONS [14]',1080,1450,'basis','gray',450);
note('Proposed IOTS design • HYD coordinates work across member offices. External member firms, accounts, legal teams and vendors are linked work participants; this chart does not grant them IOTS accounts.',1540,45);

page('access','02 • Secure entry & workspace selection','LAYER 1 • Retains the foundation: login → credentials → location → audit → role routing. Small additions cover account status, missing location and multiple roles.',1530);
const login=box('Enter corporate credentials\nNo public registration',650,175,300,70,'blue');
const valid=box('Credentials valid?',650,280,300,100,'orange','decision');edge(login,valid);
const err=box('Show invalid login message\nOffer authorised password recovery',160,292,330,78,'red');edge(valid,err,'No','red');edge(err,login,'Retry','red');
const active=box('Account active?',650,430,300,100,'orange','decision');edge(valid,active,'Yes');
const disabled=box('Access unavailable\nContact authorised administrator',1120,442,350,78,'red');edge(active,disabled,'No','red');
const loc=box('Request location\nCompare coordinates with office boundary',650,580,300,80,'blue');edge(active,loc,'Yes');
const locq=box('Location result?',650,710,300,100,'orange','decision');edge(loc,locq);
const office=box('Inside approved boundary\nOffice / on-site context',120,870,340,78,'green');
const remote=box('Outside approved boundary\nRemote / off-site context + optional reason',630,870,340,78,'orange');
const unknown=box('Denied / unavailable / inaccurate\nUnknown location + reason for review',1140,870,340,78,'red');
edge(locq,office,'Inside');edge(locq,remote,'Outside');edge(locq,unknown,'Unavailable');
const audit=box('Record login time & location result\nKnown coordinates where available; keep exceptions',550,1005,500,78,'blue');[office,remote,unknown].forEach(x=>edge(x,audit));
const roles=box('Any authorised role?',650,1125,300,100,'purple','decision');edge(audit,roles);
const none=box('No workspace access\nAsk Admin to resolve role assignment',150,1137,340,78,'red');edge(roles,none,'No');
const primary=go('Open primary role workspace [03]',640,1290,'roles','purple',320);edge(roles,primary,'Yes');
note('Location exceptions continue to the permitted workspace and remain available for attendance review. A remote label does not itself approve remote work or prove absence.',1390,55);
note('Recommended refinements: credential recovery uses authorised identity checks; permissions are checked on every action; expiry/logout ends the session. Attendance checkout is handled separately [07].',1450,55);

page('roles','03 • One identity, ten roles, three functional lanes','LAYER 1 → LAYER 2 • Roles, designations and reporting relationships are configurable. A person may hold several roles; every action uses the active role and permitted data scope.',1510);
const identity=box('Single employee identity',60,185,270,65,'navy');const assigned=box('Assigned roles + primary role\nOffice / department / reporting manager',400,185,360,65,'blue');const current=box('Primary workspace\nOnly permitted sections appear',830,185,300,65,'purple');const sw=box('Choose another\nauthorised workspace',1200,185,330,65,'purple');chain([identity,assigned,current,sw]);
const reevaluate=box('Recheck selected role & scope\nRefresh workspace permissions\nAudit identity + active role',1200,300,330,85,'purple');edge(sw,reevaluate);edge(reevaluate,current,'Switch applied','purple','exitX=0;exitY=0.5;entryX=0.5;entryY=1;');
bar('FUNCTIONAL ARCHITECTURE • The lane is a category; the role determines authority',430);
flow('ADMINISTRATIVE',70,510,[
'ADMIN\nInternal profiles, geofences, attendance exceptions, global oversight & notices [04]',
'SUPER ADMIN\nMaster organisation, roles, permissions, high-level accounts, audit & export policy [04]',
'IT SYSTEM ANALYST\nEqual platform privileges to Super Admin; technical health, incidents & deployments [08]',
'Business approval requires an explicit business mandate, even with full platform privileges.'
],'blue',450,140);
flow('MANAGEMENT',575,510,[
'GENERAL MANAGER\nOperations, Board, finance, legal, audits, events, membership & office coordination [09]',
'SENIOR MANAGER\nCross-team capacity, deadline risk, escalated decisions & comparative performance [09]',
'LEAD MANAGER • Manasa\nOperational team delivery; member deals, royalty follow-up, calls & reports [09–11]',
'CHAIRMAN • Vijay Sir\nExecutive oversight, attention items, all reports, announcements & award sign-off [13]'
],'orange',450,140);
flow('EXECUTION',1080,510,[
'EXECUTIVE\nAssigned operational work, activity, evidence, blockers, revisions & personal services [05, 07]',
'BUSINESS DEVELOPMENT EXECUTIVE\nBroker research, outreach, portals, campaigns, follow-ups & meeting records [10]',
'CREATIVES COMMUNICATION ASSOCIATE\nSocial media + design; content, proofreading, Office calls & conference assets [11]',
'Shared personal workspace: attendance, availability, requests, feedback, profile & security [07]'
],'green',450,140);
bar('PERMISSION RULES',1200,'purple');
box('Chairman: broad visibility and strategic review. Routine password resets and task reassignment stay with authorised administrators/managers.',70,1270,450,100,'purple');
box('Harshitha example: Creatives Associate + Executive. One account; switch context; work and audit remain attributable to the same person.',575,1270,450,100,'purple');
box('New roles or additional staff extend assigned capabilities. Roles do not fix headcount, automatically establish rank, or combine permissions across inactive workspaces.',1080,1270,450,100,'purple');
note('Deployment context supplied by the requester: 1 Chairman; 3 BDEs; 2 IT Analysts; 1 Social Media Manager and 1 Graphic Designer; 1 GM / Assistant GM context. Creative functions share a role profile; people remain separate accounts.',1410,65);

page('admin','04 • Administrative control & governance','LAYER 2 • Retains the original six Admin branches. Admin handles delegated routine controls; Super Admin and IT Analyst hold equal platform authority.',1420);
const columns=[
['USER MANAGEMENT',['Create internal profile\nID, designation & contact details','Assign permitted role(s)\nChoose primary role','Set department, office\n& reporting manager','Activate account\nNotify user of access','Maintain profile / reset access\nDeactivate where authorised','Record change & actor\nHigh-level accounts: SA / IT']],
['LOCATION & ATTENDANCE',['Configure office coordinates\n& permitted radius','Define hours, grace\n& attendance rules','Monitor daily records\nLate / incomplete / off-site','Review exception evidence\nRequest clarification','Record attendance resolution\nRefer leave decisions to manager','Keep original record\nAudit the correction']],
['GLOBAL TASK OVERSIGHT',['Monitor organisational work\nFind abandoned / ageing tasks','Open task & history\nCheck intervention authority','Update instructions / owner\nStop work where authorised','Business approval only with\nexplicit approval permission','Archive eligible records\nRetain task and audit history','Notify affected users\nRecord reason & outcome']],
['SYSTEM SETTINGS',['SA / IT: departments, roles\n& permission definitions','Configure delegated\nAdmin capabilities','Configure report timing\n& notification templates','Set export policy\n& retention configuration','Save approved configuration\nApply access changes','Audit before / after values\nRefresh affected sessions']],
['SECURITY & AUDIT',['Open permitted activity logs\nSA / IT: full audit view','Filter date, user, action\n& active role context','Review login / network\n& location events','Review task, account\n& configuration changes','Investigate / refer incident\nExport authorised evidence','Read-only audit history\nNo role edits audit entries']],
['ANNOUNCEMENTS',['Create official notice\nAdmin / authorised publisher','Select person / role / team\nor organisation audience','Set schedule\n& display duration','Publish to permitted\ndashboards / notifications','Recipients see notice\nwithin active access scope','Retain publication history\nRecord changes & expiry']]
];
columns.forEach((col,i)=>flow(col[0],45+i*253,210,col[1],'blue',245,132));
bar('EVERY CHANGE HAS AN OWNER, A REASON AND A HISTORY',1130,'purple');
box('Audit record\nEmployee identity • active role • timestamp • action • object • before/after values • reason • source (person/system)',90,1200,690,100,'purple','data');
box('Escalation boundaries\nAdmin sends technical faults to IT [08]; operational decisions to the designated manager [09]. Platform access alone never grants commercial or leave approval.',835,1200,680,100,'purple');
note('SA = Super Admin. Role changes, account deactivation and delegated interventions preserve existing work history and notify the responsible owner.',1340,50);

page('tasks','05 • Shared work lifecycle: plan → deliver → review → close','LAYER 2 • Applies to all operational work: member coordination, outreach, events, creative assets, IT incidents and internal assignments.',1630);
box('MANAGER • allocation & review',50,190,465,45,'orange','bar');box('EXECUTION • assigned employee',565,190,465,45,'green','bar');box('CONTROLS • exceptions & history',1080,190,465,45,'blue','bar');
const create=box('Create task\nPurpose, deliverables & acceptance criteria',90,270,385,80,'orange');
const define=box('Set priority & due date\nLink member / event / CRM record if relevant',90,400,385,80,'orange');
const cap=box('Check workload, skills & availability\nChoose employee and designated reviewer',90,530,385,80,'orange');
const assign=box('Assign task → notify employee\nStatus: Assigned / Pending',90,660,385,80,'orange');chain([create,define,cap,assign],'orange');
const queue=box('View own task queue & details\nConfirm deliverables and deadline',605,660,385,80,'green');edge(assign,queue,'Assignment','orange');
const work=box('Start / continue work\nStatus: In Progress',605,790,385,80,'green');edge(queue,work);
const activity=box('Log progress, notes and effort\nAttach versioned evidence',605,920,385,80,'green');edge(work,activity);
const submit=box('Submit deliverables\nStatus: Waiting for Review',605,1050,385,80,'green');edge(activity,submit);
const review=box('Review against deliverables\nStatus: Under Review',90,1050,385,80,'orange');edge(submit,review,'Notify reviewer');
const decision=box('Approved?',145,1190,270,95,'orange','decision');edge(review,decision);
const complete=box('Complete & close\nStore approval and final evidence',90,1390,385,80,'green');edge(decision,complete,'Yes','green');
const feedback=box('Return with specific corrections\nStatus: Changes Requested\nNotify employee',605,1190,385,95,'red');edge(decision,feedback,'No','red');
const revise=box('Revise • preserve earlier versions\nResubmit for manager review',605,1390,385,80,'green');edge(feedback,revise);edge(revise,submit,'Resubmission','green','exitX=1;exitY=0.5;entryX=1;entryY=0.5;');
const blocker=go('Issue / blocker → resolution [06]',1120,790,'exceptions','red',385);edge(work,blocker,'Blocked','red');
const delay=go('Deadline / reassignment intervention [06]',1120,920,'exceptions','red',385);edge(activity,delay,'At risk / overdue','red');
box('Activity entries are historical records.\nProgress %, notes, files and time entries do not create extra task states.',1120,1050,385,95,'blue');
box('One task ID throughout\nRetain assignment, deadline, submission, review and cancellation history.',1120,1200,385,95,'blue');
const results=go('Operational records → analytics [12]',1120,1390,'analytics','purple',385);edge(complete,results,'Approved outcome','purple','exitX=0.5;exitY=1;entryX=0.5;entryY=1;');
note('Cancellation is a separately authorised outcome with a recorded reason; it is never counted as completed work. Review delay remains visible. Reassignment is an event, and overdue is an exception overlay on an unfinished task.',1540,65);

page('exceptions','06 • Keep work moving: overdue, reassignment & blockers','LAYER 2 • Every exception retains a task owner, a decision owner and a next review date. No task disappears when its deadline passes.',1500);
const overdue=flow('OVERDUE / DEADLINE RISK',65,205,[
'Deadline reached while unfinished\nRecord overdue age, priority and owner',
'Notify responsible manager\nInclude review / external waiting context',
'Manager reviews evidence\nSelect authorised intervention',
'Extend: save reason + new due date\nRetain original due date and overdue history',
'Notify affected people\nContinue work and monitor resolution'
],'orange',455,135);
const reassign=flow('CONTROLLED REASSIGNMENT',575,205,[
'Reassignment requested\nKeep the existing task ID',
'Check capacity, availability & skills\nChoose a new responsible employee',
'Record transfer reason\nHandover completed work + remaining work',
'Update owner; preserve previous owner\nNotify new owner and affected parties',
'Continue task in current workflow\nRetain reassignment event history'
],'orange',455,135);
edge(overdue[2],reassign[0],'Reassign','orange','exitX=1;exitY=0.5;entryX=0;entryY=0.5;');
const issue=flow('ISSUE / BLOCKER',1085,205,[
'Employee raises linked issue\nRecord severity, evidence and impact',
'Manager assesses responsible resolver\nTechnical issue → IT [08]',
'Can responsible manager resolve?\nYes: record solution; verify with employee',
'If unresolved: escalate to configured\nSenior / General Manager or specialist',
'Keep follow-up owner & review date\nVerify resolution, then resume work'
],'red',455,135);
decisionNode(issue[2],'Resolved by manager?');relabel(issue[2],issue[3],'No');edge(issue[2],issue[4],'Yes','green','exitX=1;exitY=0.5;entryX=1;entryY=0.5;');
const escn=box('ESCALATION & FOLLOW-UP\nManager records impact, action required, receiving authority and next review date. High-impact business matters reach executive attention; technical faults reach IT.',180,1050,1230,105,'red');
edge(overdue[2],escn,'Escalate','red','exitX=0;exitY=0.5;entryX=0;entryY=0.5;');edge(issue[3],escn,'Track escalation','red');
const resolved=box('Resolution confirmed?\nYES: record outcome and notify owner\nNO: retain open case and re-escalate at review date',520,1210,560,95,'orange');edge(escn,resolved);edge(resolved,escn,'No / review due','red','exitX=1;exitY=0.5;entryX=1;entryY=0.5;sourceJettySize=380;targetJettySize=50;');
decisionNode(resolved,'Resolution confirmed?');
const resume=go('Resume execution / review [05]',590,1370,'tasks','green',420);edge(resolved,resume,'Yes');
note('Reassignment, approved extensions and issue resolution all append history. Escalation paths follow configured responsibility and authority; role names alone do not establish a reporting hierarchy.',1430,55);

page('people','07 • Attendance, availability & employee services','LAYER 2 • Shared personal services remain available to authorised employees across role workspaces. Attendance, online sessions and task effort have separate records.',1560);
const att=flow('ATTENDANCE & AVAILABILITY',60,205,[
'Check in\nCapture time and location context [02]',
'Record attendance\nApply configured shift / grace / leave rules',
'Set availability; update while working\nManagers use it to assess capacity',
'Check out\nCapture end time and recorded breaks',
'Complete timestamps?\nIf yes: calculate policy-based work hours',
'Store attendance history\nEmployee sees own; manager sees team'
],'green',450,135);
relabel(att[4],att[5],'Complete');
const req=flow('REQUEST & SELF-SERVICE',575,205,[
'Create request\nLeave / permission / scheduled remote work',
'Or request guidance / resources\nAdd dates, reason and supporting details',
'Submit to designated authority\nNotify reviewer; status Pending',
'Review and record decision\nApproved / Rejected / Returned for detail',
'Notify employee; store decision history\nApproved absence adjusts availability',
'Manager adjusts workload if needed\nPending decisions remain in attention queue'
],'orange',450,135);
const comm=flow('COMMUNICATION & PROFILE',1090,205,[
'Operational event occurs\nAssignment, deadline, feedback or decision',
'Generate scoped notification\nTask, reassignment, overdue or escalation',
'Employee opens linked item\nReads instructions, responds or acts',
'View personal activity & performance\nCompletion, attendance, feedback history',
'View profile / account details\nRequest controlled account changes',
'Change password / review active sessions\nLog out or end selected session'
],'blue',450,135);
box('Availability options\nAvailable • Busy • In Meeting • On Break • In Training • Do Not Disturb • Working Remotely • On Leave • Absent • Offline\n\nLeave / absence labels follow approved records and attendance rules.',75,1150,430,175,'green');
box('Exceptions\nMissing checkout or inconsistent hours → correction request → authorised review → audit correction.\n\nReturned request → add details → resubmit. Rejection keeps reason and history.',590,1150,430,175,'red');
box('Announcements\nAdmin / Chairman: permitted organisation audience. Manager: team audience.\n\nSchedule → publish → display to recipients → keep publication history.',1105,1150,430,175,'blue');
bar('POLICY & RECORD QUALITY',1390,'purple');
note('Recommended: checkout is explicit; session expiry or a closed browser does not silently declare a full day worked. Geolocation failure is an exception for review. Shift times, grace limits, breaks and remote-work approval remain configurable.',1450,70);

page('technical','08 • IT reliability & technical intervention','LAYER 2 • IT System Analyst has the same platform privileges as Super Admin, with a technical workspace. Business approval still follows the designated business authority.',1350);
const monitor=flow('MONITOR & DIAGNOSE',70,210,[
'Monitor application and services\nUptime, database latency, frontend response',
'Inspect external service health\nGeocoding, mail, storage & rate limits',
'Review security events\nUnusual logins, location jumps, timeouts',
'Identify incident or reported bug\nCapture impact, severity and evidence',
'Assign technical incident owner\nSet response / update expectations'
],'blue',450,130);
const incident=flow('RESOLVE & RESTORE',575,210,[
'Receive linked operational blocker\nor monitoring incident',
'Diagnose failure\nBug, deadlock, API or webhook delivery',
'Apply authorised technical fix\nTrack change and affected services',
'Verify restoration with affected user\nUnresolved → retain / escalate incident',
'Record resolution; notify manager\nEmployee resumes linked task [05]'
],'blue',450,130);
edge(monitor[4],incident[0],'Incident','blue','exitX=1;exitY=0.5;entryX=0;entryY=0.5;');
flow('CHANGE & GOVERNANCE',1080,210,[
'Record release / deployment request\nVersion, owner and reason',
'Record configuration changes\nEnvironment changes without secret values',
'Record schema migrations\nLink incident or planned work',
'Monitor after change\nRecord outcome and recovery if needed',
'Retain technical audit trail\nApply shared governance controls [04]'
],'blue',450,130);
box('Platform parity\nIT Analyst and Super Admin can manage master roles, departments, high-level accounts and full audit access. Their default dashboards emphasise different responsibilities.',80,1030,710,125,'purple');
box('Approval boundary\nCommercial fee splits, leave and business deliverable approvals require a separately assigned business mandate. Technical remediation does not close the related business task automatically.',835,1030,690,125,'purple');
go('Return to exception resolution [06]',80,1200,'exceptions','red',440);go('Administrative controls [04]',1080,1200,'admin','blue',445);

page('managers','09 • Operational management & CIRIL coordination','LAYER 2 • General / Lead Manager cards are independent work areas using lifecycle [05]. The centre column shows the Senior Manager review cycle.',1640);
const gm=flow('GENERAL MANAGER',60,205,[
'Receive organisational priorities\nCoordinate daily operations and teams',
'Board: agendas, meeting preparation\nMinutes, decisions and follow-up owners',
'Accounts: invoices, payments & expenses\nLegal: agreements, contracts and NDAs',
'Coordinate auditor and internal teams\nTrack compliance, filings & evidence',
'Annual / zonal conferences\nHotels, vendors, members and speakers',
'Membership discussions & virtual meetings\nCoordinate member-office requirements',
'Review outcomes, outstanding actions\n& cross-functional escalations'
],'orange',450,130);
flow('SENIOR MANAGER',575,205,[
'View cross-team work and capacity\nOperations, BD and creative teams',
'Identify overload & approaching deadlines\nCompare availability and priorities',
'Agree workload changes with owners\nUse controlled reassignment [06]',
'Review high-impact escalated decisions\nCheck evidence and approval authority',
'Compare team performance trends\nInvestigate recurring delays / blockers',
'Record decision, feedback or escalation\nNotify responsible managers',
'Monitor improvement and resolution\nKeep open actions visible'
],'orange',450,130);
flow('LEAD / OPERATIONS MANAGER',1090,205,[
'Manasa: coordinate members on deals\nConclusions and royalty follow-ups [10]',
'Retail / L&W / Land / Hotel calls\nCoordinate vertical and client calls',
'Office Space portal listings & enquiries\nRoute to member offices; follow up',
'Collect market data; prepare quarterly\nlead exchange and business statistics',
'Member performance ratings\nRaw zonal conference presentations',
'Bitra website updates; printers\nStationery, reports & annual event assets',
'Membership agreements & annual fees\nTrack signatures, payment follow-up'
],'orange',450,130);
bar('COMMON MANAGEMENT CYCLE • eight original branches retained',1280,'orange');
box('Task Management & Workflow [05]\nTeam Management: people → profile → assignments → workload → availability → progress\nWorkload Management: identify overload → balance → record transfer [06]',65,1350,475,175,'orange');
box('Performance Monitoring: completion → deadline adherence → concerns → feedback → improvement\nAttendance Management: late / absent / location exceptions → leave review → adjust work [07]',562,1350,475,175,'orange');
box('Team Communication: instructions, updates, messages, reminders\nFeedback & Evaluation: review → feedback → evaluation history\nIssues Management: severity → resolve / escalate → follow-up [06]',1060,1350,475,175,'orange');
note('Each business activity becomes assigned work with evidence and a designated reviewer [05]. External accounts, legal advisers, auditors and vendors provide inputs; their participation does not imply a new IOTS role.',1560,55);

page('membership','10 • Membership development & commercial follow-up','LAYER 2 • BDE outreach develops the member network. Member brokers transact in CIRIL CRM; IOTS records HYD coordination, evidence, deadlines and follow-up responsibility.',1780);
flow('BDE • MEMBERSHIP PIPELINE',60,205,[
'Research brokerage prospects\nRERA portals, directories and Google',
'Verify contact and source\nMaintain prospect research record',
'Cold calls, structured email\nProfessional WhatsApp campaigns',
'Operate Upturnly and 99acres\nLog call outcome and next follow-up',
'Interested prospect → schedule meeting\nGM presents membership proposition',
'Record discussion and agreed next step\nNot ready → dated follow-up queue',
'Coordinate agreement and annual fee\nLead Manager tracks required completion',
'Reviewer confirms membership task\nKeep documents and outcome history'
],'green',450,130);
const deal=flow('MEMBER DEAL • CRM MILESTONES',575,205,[
'Lead Giver records client requirement\nVertical, geography and agreed shares',
'Route to receiving member office\nReceiver accepts / rejects with reason',
'Accepted → proposals, site coordination\nand negotiation with supporting documents',
'Deal concluded → brokerage breakdown\nUse agreed financial terms',
'Authorised brokerage acceptance\nRecord accepted terms in CRM',
'Royalty follow-up & payment evidence\nResponsible finance / CRM authority confirms',
'CRM royalty paid / deal concluded\nPayment dates, remarks and notifications',
'IOTS reconciles latest verified status\nChairman sees due vs collected royalty'
],'orange',450,130);
const coordination=flow('HYD • IOTS COORDINATION',1090,205,[
'Link CRM lead / member reference\nAssign internal coordination task [05]',
'Rejected / unanswered?\nCapture reason; owner coordinates next step',
'Track member and client follow-ups\nRecord call outcomes and external waiting',
'Lead Manager follows concluded deals\nGM coordinates accounts and exceptions',
'Terms disputed / evidence missing?\nReturn to business authority for correction',
'Unpaid? Set follow-up date and owner\nAgeing balance remains open / escalate',
'Verify payment confirmation source\nNo completion from a promised payment',
'Close approved coordination task\nKeep CRM and task outcomes distinct'
],'orange',450,130);
edge(deal[1],coordination[1],'Rejected / no reply','red');relabel(deal[1],deal[2],'Accepted');edge(deal[5],coordination[5],'Not yet paid','red');relabel(deal[5],deal[6],'Verified paid');
bar('ROYALTY CONTEXT • validated against company PDF and CRM calculation code',1420,'purple');
box('Lease brokerage\nROUND(monthly rate × area × agreed lease days ÷ 30)\n\nSale brokerage\nROUND(1% × outright rate × area)',70,1485,455,160,'purple');
box('Agreed Lead Giver / Receiver shares\nRead each deal’s percentages, including custom shares.\n\nCIRIL royalty = ROUND(7.5% × LG share + 7.5% × LR share).',575,1485,455,160,'purple');
box('Traceability\nCRM owns lead, brokerage and payment facts. IOTS links verified records and tracks staff work.\n\nIntegration / import mechanism remains to be designed.',1080,1485,455,160,'purple');
note('Receipt evidence and accepted terms must be checked by the designated business authority. Member firms and CRM roles are not automatically mapped to IOTS Super Admin or IT privileges.',1685,60);

page('execution','11 • Creative communication, market reports & delivery','LAYER 2 • Creatives Communication Associate combines social media and design capabilities. Executive tasks can be added to the same employee through a second authorised role.',1660);
const creative=flow('CONTENT & DESIGN',60,205,[
'Receive creative brief / campaign task\nAudience, channel, output and deadline',
'Draft copy and visual assets\nLinkedIn, Instagram, YouTube, corporate',
'Save versioned draft\nv1.0 → v1.1 → v2.0 with change notes',
'Submit for internal review\nCheck content, accuracy and brand',
'Approved?\nNo → specific changes → revise → resubmit',
'Yes → Approved for release\nSchedule or publish to authorised channel',
'Store published link / final asset\nRecord delivery evidence and close [05]',
'Review campaign / delivery results\nUse role-specific targets and feedback'
],'green',450,130);
decisionNode(creative[4],'Approved for release?');relabel(creative[4],creative[5],'Yes');edge(creative[4],creative[1],'No: changes requested','red','exitX=0;exitY=0.5;entryX=0;entryY=0.5;');
flow('QUARTERLY MARKET REPORTS',575,205,[
'Lead Manager requests member data\nOffice, land and logistics / warehouse',
'Members supply research evidence\nTrends, major deals and upcoming supply',
'Consolidate period / city / vertical data\nMissing or inconsistent → follow up',
'Creatives Associate proofreads\nValidate content and brand alignment',
'Design and format report\nKeep source and revision references',
'Authorised manager reviews publication\nReturn corrections until approved',
'Release approved report / print artwork\nStore final version and distribution record',
'Record completed reporting work\nFeed quality and timeliness analytics'
],'green',450,130);
flow('EXECUTIVE & EVENT SUPPORT',1090,205,[
'Open assigned operational queue\nReview priority, deadline and evidence',
'Harshitha: Office Vertical support\nZone-wise calls and client updates',
'Record call outcomes and next actions\nRoute member queries to responsible owner',
'Conference presentation collaterals\nCoordinate slides and digital archives',
'Design IDs, banners and nameplates\nStationery and other event materials',
'Manager approves final versions\nLead Manager coordinates printers',
'Record received / delivered outputs\nResolve quality issues before closure',
'Submit task evidence for review [05]\nRequest help or report blockers [06]'
],'green',450,130);
box('Creative release gate\nBrief → Drafting → Internal Review → Changes Requested → Approved → Published. Changes loop back to drafting and review. A design approval alone does not mean the item has been published.',70,1450,710,130,'purple');
box('Work attribution\nHarshitha can switch between Creatives Associate and Executive. Separate employee accounts remain for separate people, including social media and graphic design staff.',825,1450,710,130,'purple');

page('analytics','12 • Operational records → intelligence → action','LAYER 3 • Analysis reads recorded work and preserves permission scope. Every indicator links to the records that explain it.',1640);
const records=box('Source records\nTasks & state history • activity & evidence • attendance & availability • requests & decisions • issues & escalations • audit • targets • verified CRM references',120,200,1360,100,'purple','data');
const metrics=box('Choose period and authorised scope\nAggregate once per task; preserve assignment and deadline history; apply versioned targets and rules',320,355,960,80,'purple');edge(records,metrics);
const centers=[
['PERFORMANCE',['Completion and on-time delivery','Elapsed completion vs active effort','Targets; quality and revision rate']],
['WORKLOAD',['Pending, overdue and blocked work','Capacity, priority and deadline pressure','Reassignment event frequency']],
['ATTENDANCE',['Lateness, absence and hours','Availability and remote / unknown trends','Approved leave and corrections visible']],
['TRENDS & RISKS',['Day / week / month comparisons','Low / medium / high configured rules','Reasons and linked evidence for each flag']]
];
const centerNodes=centers.map((a,i)=>box(a[0]+'\n'+a[1].join('\n'),50+i*385,500,365,130,'purple'));centerNodes.forEach(x=>edge(metrics,x));
const report=box('Generate scoped reports\nOn schedule or authorised request',580,705,440,80,'purple');centerNodes.forEach(x=>edge(x,report));
const daily=box('DAILY\nToday’s outcomes, open blockers, overdue work and next priorities',80,835,440,100,'purple');
const weekly=box('WEEKLY\nTeam delivery, workload balance, recurring delays and targets',580,835,440,100,'purple');
const monthly=box('MONTHLY\nTrends, appraisal inputs, royalty status and recognition standings',1080,835,440,100,'purple');[daily,weekly,monthly].forEach(x=>edge(report,x));
const scope=box('Apply recipient scope\nEmployee: own records • Lead Manager: team • Senior / GM: authorised teams\nChairman: enterprise reports • Admin / SA / IT: permitted administration and audit',250,1010,1100,100,'purple');[daily,weekly,monthly].forEach(x=>edge(x,scope));
const output=box('Deliver dashboard / PDF / Excel / authorised email\nChairman appraisal-format export uses configured template; log exports',320,1170,960,85,'purple');edge(scope,output);
const attention=go('Attention item → authorised intervention [06]\nDetected → Reviewed → Action taken → Resolved',70,1320,'exceptions','red',710);edge(output,attention);
const drill=box('Drill down within scope\nTeam → Employee → Task / Request / Attendance\nActivity → Evidence → Decision and audit history',830,1320,700,85,'purple');edge(output,drill);
note('Metric rules: show counts and denominators; cancelled tasks are excluded from completion where administrative; reassignment never creates another task count; zero denominators show N/A; missing targets show “Target not configured”.',1450,65);
note('On-time results use the applicable approved deadline and retain original-deadline / extension history. Prior overdue events stay visible. Workload warnings are configurable rules; approval and reassignment remain human decisions. Predictive models are a future option.',1520,65);

page('chairman','13 • Chairman oversight, appraisal & recognition','LAYER 3 → AUTHORISED ACTION • Vijay Sir sees the overall operational picture and can inspect underlying evidence.',1540);
const executive=flow('EXECUTIVE OPERATIONAL VIEW',65,205,[
'Review enterprise operational health\nTeams, delivery trends and major risks',
'Inspect commercial deal flow\nRoyalty due, collected and outstanding',
'Review attendance / location summaries\nRemote and unknown trends with context',
'Open Requires Attention\nOverdue clusters, reassignments, blockers',
'Inspect evidence and responsible owner\nDirect follow-up to authorised manager',
'Review outcome on next reporting cycle\nUnresolved items remain visible'
],'purple',450,135);
const award=flow('MONTHLY → QUARTERLY RECOGNITION',575,205,[
'Apply approved role-specific KPIs\nUse quality, delivery and verified records',
'Generate monthly performance standing\nShow rule version and evidence',
'Manager validates exceptions / context\nEmployee can request score review',
'Three consecutive qualifying months?\nNo: continue monthly evaluation',
'Yes: build quarterly excellence dossier\nInclude three-month history and evidence',
'Chairman reviews and signs off\nRecord decision and recognition outcome'
],'purple',450,135);
decisionNode(award[3],'Three consecutive qualifying months?');relabel(award[3],award[4],'Yes');edge(award[3],award[1],'No: next month','purple','exitX=1;exitY=0.5;entryX=1;entryY=0.5;');
const announce=flow('REPORTS & ANNOUNCEMENTS',1085,205,[
'Choose period, scope and report type\nEnterprise / team / individual appraisal',
'Generate configured appraisal format\nExport approved report with audit entry',
'Create Chairman announcement\nSelect enterprise audience and schedule',
'Publish official communication\nDisplay in authorised employee workspaces',
'Record publication and decision history\nKeep supporting documents accessible',
'Review acknowledgement where configured\nFollow up through responsible management'
],'purple',450,135);
box('Authority boundary\nChairman reviews intelligence, strategic attention and recognition. Routine task reassignment and employee password resets remain with authorised managers and administrators.',70,1190,710,130,'orange');
box('Recognition policy to approve\nSupporting document proposes 100-point scoring and Gold ≥90. Treat scoring weights, thresholds, incentives and qualifying periods as configurable policy pending CIRIL approval. Three consecutive qualifying months and Chairman sign-off are required.',830,1190,700,130,'purple');
note('Fair interpretation: approved leave, remote work, external blockers and review delays retain their context. Recorded hours alone do not prove output quality. Display the evidence behind each standing and keep score-review decisions.',1380,70);
go('Management action [09]',80,1470,'managers','orange',430);go('Reporting and metric rules [12]',1080,1470,'analytics','purple',450);

page('basis','14 • Source basis, refinements & implementation decisions','Reading guide • 01 overview; 02–03 entry and roles; 04–11 operations; 12–13 intelligence. This file is an operational design, not a claim that these IOTS features are implemented.',1510);
const sourceText=[
['AUTHORITATIVE REQUIREMENTS','gpt_prompt.txt\nTen roles and supplied responsibilities; multi-role context; three layers; Chairman visibility; equal SA / IT platform privilege; business approval boundaries.'],
['BUSINESS FOUNDATION','ciril_crm_detail.pdf, 20 pages\nMember network, lead giver / receiver, variable brokerage shares, lease-day calculation, 7.5% royalty, negotiation, proposals, payment and research context.'],
['PRESERVED DESIGN','../Flowchart/Actual-FlowChart.drawio\nLogin / location / audit sequence; three architectural lanes; six Admin branches; eight Manager branches. Complete employee and analytics flows from Construct.txt.'],
['SUPPORTING MATERIAL','claude_version.docx\nTask revision, audit principles, attendance, reporting and recognition concepts. Explicit prompt roles override section 2.2. Fixed share, scoring and shift examples are not binding company policy.'],
['VISUAL FOUNDATION','referential-flowchart.jpeg\nDark start/end; blue administrative controls; orange management; green execution; purple reporting; rounded process boxes, decision diamonds and orthogonal connectors.'],
['CRM CROSS-CHECK','Local code found at CRM/Updated/public_html/public_html\nReviewed routes, lead / assignment / brokerage / royalty controllers, key models and SQL schema. The requested CRM/Update/public_html location is absent.']
];sourceText.forEach((a,i)=>box(a[0]+'\n\n'+a[1],60+(i%2)*780,210+Math.floor(i/2)*215,740,180,'gray'));
bar('REFINEMENTS THAT COMPLETE THE FOUNDATION',890,'purple');
box('Entry and permissions\nPreserve the original login flow; add active-account / no-role cases, unknown location, primary role and context switch. Enforce active-role scope on actions and reporting.',65,955,475,160,'blue');
box('Work and accountability\nComplete submission / correction / approval loops; explicit owner and escalation follow-up; separate task state from activity; overdue is a flag; reassignment keeps one task identity.',562,955,475,160,'orange');
box('Records and insight\nSeparate checkout from session end; preserve corrections and history; role-scoped reporting; rules explain risks; Chairman appraisal and three-month recognition review.',1060,955,475,160,'purple');
bar('OPEN DESIGN CHOICES • configurable, with no invented company policy',1165,'navy');
note('Confirm approval and escalation matrix; working hours, grace periods and break rules; report schedules; appraisal template; recognition scoring; retention rules; designated financial authority; CRM linking / import mechanism.',1230,80);
note('CRM caution: current users.roleId is a single role field; IOTS multi-role assignment is a new requirement. CRM royalityStatus updates lead_status to 8 but inserts status_id 7 into lead_statuses. Mapping needs reconciliation before integration.',1320,75);
note('Historical chat_gpt_chats.pdf was not needed. Draw.io MCP is unavailable in this session; this artifact uses native editable Draw.io XML. Sources are local; no source document or CRM application was modified.',1405,70);

for(const q of pages){if(q.id==='roles'||q.id==='managers'){q.cells=q.cells.filter(s=>{const m=s.match(/source="([^"]+)"/);if(!m)return true;const n=q.nodes.find(n=>n.id===m[1]);if(q.id==='roles')return n.y<510;return !(n.y>250&&n.y<1200&&(n.x<500||n.x>1000));});}}
const xml=`<mxfile host="app.diagrams.net" agent="Codex" version="24.7.17" compressed="false">${pages.map(q=>`<diagram id="${q.id}" name="${esc(q.title)}"><mxGraphModel dx="1600" dy="${q.h}" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1600" pageHeight="${q.h}" math="0" shadow="0" background="#FFFFFF"><root><mxCell id="0"/><mxCell id="1" parent="0"/>${q.cells.filter(s=>s.startsWith('<mxCell')).join('')}${q.cells.filter(s=>s.startsWith('<object')).join('')}</root></mxGraphModel></diagram>`).join('')}</mxfile>`;
fs.writeFileSync('final-version.drawio',xml);
fs.writeFileSync('flowchart-manifest.json',JSON.stringify(pages.map(q=>({page:q.id,title:q.title,nodes:q.nodes.length,edges:q.cells.length-q.nodes.length})),null,2));
console.log(`Created final-version.drawio: ${pages.length} pages, ${pages.reduce((n,q)=>n+q.nodes.length,0)} shapes.`);
