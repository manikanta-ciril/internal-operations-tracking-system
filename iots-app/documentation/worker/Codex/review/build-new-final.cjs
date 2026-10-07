const fs=require('fs');
const X=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const palette={blue:['#EAF3F9','#32749A'],orange:['#FFF1E4','#C66B17'],green:['#E8F5EF','#2D7B5C'],purple:['#F0EBFA','#70529D'],red:['#FBEDED','#B35C65'],navy:['#19344A','#19344A'],gray:['#F5F7FA','#728294']};
let serial=0,background=[],vertices=[],edges=[],nodes=new Map(),container=null;
const W=6800,H=9560;
function box(label,x,y,w=400,h=78,color='blue',kind='box',id){id=id||'new-'+(++serial);const co=palette[color],parent=container||'1';let style='whiteSpace=wrap;html=1;fontFamily=Verdana;fontSize=17;spacing=10;strokeWidth=1.5;';style+=kind==='diamond'?'rhombus;':kind==='database'?'shape=cylinder3;size=24;':kind==='note'?'rounded=0;strokeOpacity=0;align=left;':kind==='header'?'rounded=1;fontStyle=1;fontSize=24;':'rounded=1;arcSize=10;';style+=`fillColor=${co[0]};strokeColor=${co[1]};fontColor=${color==='navy'?'#FFFFFF':'#152735'};`;
 const n={id,x,y,w,h,parent,label};nodes.set(id,n);vertices.push(`<mxCell id="${id}" value="${X(label.replace(/\n/g,'<br>'))}" style="${style}" vertex="1" parent="${parent}"><mxGeometry x="${x-(parent==='layer2'?100:0)}" y="${y-(parent==='layer2'?1200:0)}" width="${w}" height="${h}" as="geometry"/></mxCell>`);return id;}
function edge(a,b,label='',color='gray',opts=''){let na=nodes.get(a),nb=nodes.get(b);let parent=na?.parent===nb?.parent?na.parent:'1';if(!opts.includes('exitX')){if(nb.y>na.y+40)opts+='exitX=0.5;exitY=1;entryX=0.5;entryY=0;';else if(nb.y<na.y-40)opts+='exitX=0.5;exitY=0;entryX=0.5;entryY=1;';else if(nb.x>na.x)opts+='exitX=1;exitY=0.5;entryX=0;entryY=0.5;';else opts+='exitX=0;exitY=0.5;entryX=1;entryY=0.5;';}edges.push(`<mxCell id="edge-${++serial}" value="${X(label)}" edge="1" parent="${parent}" source="${a}" target="${b}" style="edgeStyle=orthogonalEdgeStyle;rounded=1;endArrow=block;endFill=1;html=1;fontFamily=Verdana;fontSize=15;labelBackgroundColor=#FFFFFF;strokeWidth=1.5;strokeColor=${palette[color][1]};${opts}"><mxGeometry relative="1" as="geometry"/></mxCell>`);}
function chain(a,color){for(let i=1;i<a.length;i++)edge(a[i-1],a[i],'',color);return a;}
function header(t,x,y,w,color='navy'){return box(t,x,y,w,64,color,'header');}
function branch(title,x,y,w,steps,color='blue',step=106){const head=header(title,x,y,w,color);const ns=steps.map((s,i)=>box(s,x+12,y+100+i*step,w-24,78,color));chain([head,...ns],color);return{head,ns};}
function relabel(a,b,label){edges=edges.map(e=>e.includes(`source="${a}" target="${b}"`)?e.replace('value=""',`value="${X(label)}"`):e);}
function diamond(id,text){const n=nodes.get(id);n.label=text;const nx=n.x+(n.w-560)/2,ny=n.y-16;vertices=vertices.map(v=>v.includes(`id="${id}"`)?v.replace(/value="[^"]*"/,`value="${X(text)}"`).replace('rounded=1;arcSize=10;','rhombus;').replace(/<mxGeometry[^>]+\/>/,`<mxGeometry x="${nx-(n.parent==='layer2'?100:0)}" y="${ny-(n.parent==='layer2'?1200:0)}" width="560" height="110" as="geometry"/>`):v);Object.assign(n,{x:nx,y:ny,w:560,h:110});}
header('CIRIL • INTERNAL OPERATIONS TRACKING SYSTEM — COMPLETE OPERATIONAL FLOW',100,35,6600);
box('Read from top to bottom • Layer 1: original login flow • Layer 2: every role and operational function • Shared records database • Layer 3: intelligence, reports and authorised action\nBlue = administration   Orange = management   Green = execution   Purple = records / intelligence   Red = exception or correction',100,115,6600,80,'gray','note');

// Original Layer 1 is retained verbatim within a translated group.
background.push('<mxCell id="original-auth" value="" style="group;" vertex="1" parent="1"><mxGeometry x="3400" y="190" width="3760" height="900" as="geometry"/></mxCell>');
const auth=JSON.parse(fs.readFileSync('review/retained-layer1.json','utf8').replace(/^\uFEFF/,''));
for(const c of auth)vertices.push(c.xml.replace('parent="1"','parent="original-auth"'));
nodes.set('zot1JTxo4ji1ywPOPgd8-26',{id:'zot1JTxo4ji1ywPOPgd8-26',x:3341,y:930,w:128.38,h:110,parent:'original-auth'});
nodes.set('zot1JTxo4ji1ywPOPgd8-22',{id:'zot1JTxo4ji1ywPOPgd8-22',x:3268,y:780,w:275,h:60,parent:'original-auth'});
box('LAYER 1 • RETAINED ORIGINAL\nCredentials → location → login audit → role decision\nOriginal shapes, wording, decisions and internal connectors retained.',350,380,1070,170,'gray','note');
const loginAudit=box('A • Login & location records\nIdentity, login time, coordinates and location result',180,790,850,86,'blue');edge('zot1JTxo4ji1ywPOPgd8-22',loginAudit,'Recorded input','blue','exitX=0;exitY=0.5;entryX=1;entryY=0.5;dashed=1;');
const route=box('Load authorised role assignments • open primary workspace • switch to another assigned role\nRefresh permissions and data scope; record employee identity + active role for every action',2700,1080,1400,88,'purple');edge('zot1JTxo4ji1ywPOPgd8-26',route);

background.push('<mxCell id="layer2" value="LAYER 2 • MANAGEMENT, OPERATIONS &amp; EXECUTION" style="swimlane;horizontal=1;startSize=75;rounded=1;fillColor=#19344A;swimlaneFillColor=#FFFFFF;strokeColor=#19344A;fontColor=#FFFFFF;fontFamily=Verdana;fontSize=28;fontStyle=1;" vertex="1" parent="1"><mxGeometry x="100" y="1200" width="6600" height="5140" as="geometry"/></mxCell>');nodes.set('layer2',{id:'layer2',x:100,y:1200,w:6600,h:5140,parent:'1'});container='layer2';
const admin=header('ADMINISTRATIVE FUNCTIONS',200,1320,2000,'blue');const manager=header('MANAGEMENT FUNCTIONS',2400,1320,2000,'orange');const employee=header('EMPLOYEE / EXECUTION FUNCTIONS',4600,1320,2000,'green');[admin,manager,employee].forEach(n=>edge(route,n,'Authorised workspace','purple'));
box('Roles below are separate workspaces. They do not establish a reporting hierarchy. Super Admin and IT Analyst have equal platform privileges.',200,1410,2000,72,'blue','note');
box('Chairman, General, Senior and Lead Managers use scoped management capabilities. Approval authority follows the configured business mandate.',2400,1410,2000,72,'orange','note');
box('Executive, BDE and Creatives Communication Associate share personal services. A person may hold multiple roles using one employee identity.',4600,1410,2000,72,'green','note');
const roles=[
['ADMIN',200,650,'blue',['Create internal employee accounts; no public registration','Assign permitted roles, primary workspace, office, department and reporting manager','Maintain users, authorised password resets and account activation / deactivation','Configure geofences; review attendance and off-site exceptions','Monitor organisational work; publish targeted or company announcements']],
['SUPER ADMIN',875,650,'blue',['Manage organisation, departments, role definitions and permission sets','Authorise high-level account changes and deactivation','Configure export policy, report rules and governance settings','Inspect full immutable audit history and security records','Delegate routine controls; business approvals require a separate mandate']],
['IT SYSTEM ANALYST',1550,650,'blue',['Equal platform privileges to Super Admin; technical workspace','Monitor uptime, database latency, frontend and external API health','Inspect unusual logins, location jumps, session timeouts and rate limits','Resolve bugs, deadlocks and webhook / mail / storage failures','Record deployments, environment changes and migrations; verify recovery']],
['CHAIRMAN • VIJAY SIR',2400,480,'orange',['Company-wide operational intelligence and deal / 7.5% royalty health','Attendance and remote / unknown-location summaries','Requires Attention: overdue clusters, repeated transfers and unresolved blockers','All authorised reports and appraisal-format exports','Enterprise announcements; three-month excellence sign-off; no routine resets or task reassignment']],
['GENERAL MANAGER',2905,480,'orange',['Daily operations and team monitoring; coordinate all member offices','Board agendas, minutes, decision tracking and governance','Accounts: invoices, payments, expenses; auditor and statutory filings','Legal agreements, contracts, NDAs; annual / zonal conference coordination','Membership presentations, prospective-member meetings and cross-functional escalations']],
['SENIOR MANAGER',3410,480,'orange',['Cross-team workload visibility: operations, BD and creatives','Balance capacity with responsible managers; retain transfer reasons','Mitigate deadline and service-level risks across teams','Review high-impact Lead Manager escalations within mandate','Compare productivity, provide feedback and track improvement']],
['LEAD MANAGER • MANASA',3915,485,'orange',['Member deals, conclusions and royalty follow-ups; agreement signatures and annual fees','Retail, L&W, Land and Hotel vertical / client calls; Office Space listings and enquiry follow-up','Collect market data; quarterly lead exchange and business statistics','Member performance ratings; raw zonal presentations','Bitra website updates; printers, stationery, reports and annual conference materials']],
['EXECUTIVE',4600,650,'green',['View assigned operational tasks, deliverables, priority and deadlines','Execute work; record progress, notes, time / effort and evidence','Raise linked blockers with severity and required help','Submit work, receive manager feedback, revise and resubmit','Use personal attendance, requests, communications, performance and security services']],
['BUSINESS DEVELOPMENT EXECUTIVE',5275,650,'green',['Research verified broker contacts through RERA, directories and Google','Daily cold calls and structured email outreach','Professional WhatsApp campaigns introducing the CIRIL network','Operate Upturnly and 99acres commercial portals','Log call outcomes, maintain dated follow-ups and meetings; coordinate membership discussions']],
['CREATIVES COMMUNICATION ASSOCIATE',5950,650,'green',['Social media and design functions: LinkedIn, Instagram, YouTube and corporate channels','Brief → draft → internal review → changes → approved → published','Proofread quarterly market reports; version design drafts v1.0 / v1.1 / v2.0','Office Vertical calls, client updates, conference slides and digital archives','Design reports, ID cards, banners and stationery; Harshitha can also use an Executive role']]
];
for(const [name,x,w,col,details]of roles){const r=header(name,x,1515,w,col);const cards=details.map((t,i)=>box(t,x+10,1610+i*123,w-20,96,col));edge(x<2400?admin:x<4600?manager:employee,r,'',col);box('Workspace actions feed the shared workflow and record stream below.',x+10,2240,w-20,66,col,'note');}

const adminFunctions=header('ADMIN • SIX FUNCTIONAL BRANCHES',200,2350,2000,'blue');
const managerFunctions=header('MANAGERS • EIGHT SHARED FUNCTIONS',2400,2350,2000,'orange');
const employeeFunctions=header('EVERY EMPLOYEE • SIX SHARED SERVICES',4600,2350,2000,'green');
const adm=[
['USER MANAGEMENT',['Create profile and employee ID','Assign designation / role(s) and permissions','Set department, office and reporting manager','Activate / deactivate / maintain profile','Authorised reset or access adjustment','Audit changes; notify affected user']],
['LOCATION & ATTENDANCE',['Set approved office coordinates and radius','Define working hours and grace rules','Monitor daily attendance records','Review late / absent / off-site flags','Resolve using evidence and explanation','Preserve original record and correction audit']],
['GLOBAL TASK OVERSIGHT',['Monitor active organisational work','Open selected task and review status','Intervention needed? Check authority','Update instructions / owner / stop assignment','Approve completed work only where authorised','Record reason, notify people and retain history']],
['SYSTEM SETTINGS',['Manage roles, designations and departments','Set delegated permissions and scope','Configure automated report timing','Configure email / notification templates','Save authorised configuration changes','Audit before / after values']],
['SECURITY & AUDIT VIEWER',['Access permitted security / activity records','Filter by date, user, action and active role','Review login and location / network history','Inspect work and account modification history','Investigate issues or refer technical incident','Export authorised report; logs remain read-only']],
['GLOBAL ANNOUNCEMENTS',['Create official notice or message','Select user, role, team or all-users audience','Set publication schedule and display duration','Publish to permitted dashboards','Recipients view notice / updates','Record publication, changes and expiry']]
];
const mgr=[
['TASK WORKFLOW',['Create task and define deliverables','Set priority and deadline','Check workload; assign employee; notify','Monitor progress and exceptions','Review submission / request corrections','Approve and close after review']],
['TEAM MANAGEMENT',['View team members','Open employee profiles','Review current assignments','Inspect workload and availability','Track progress / missing updates','Record guidance and follow-up']],
['PERFORMANCE MONITORING',['Review completion and on-time delivery','Inspect overdue / revision patterns','Identify performance concerns','Discuss context and blockers','Provide constructive feedback','Monitor improvement over time']],
['WORKLOAD MANAGEMENT',['View employee workloads','Identify high / overloaded capacity','Check availability and skills','Balance work with task owners','Reassign where required','Record reason and ownership history']],
['ATTENDANCE MANAGEMENT',['View team attendance','Review late / absent records','Review location exceptions','Review leave / permission requests','Approve / reject within mandate','Adjust workload where required']],
['TEAM COMMUNICATION',['Send team announcement','Send employee-specific message','Share task instructions','Send deadline reminders','Receive employee progress updates','Keep communication linked to work']],
['FEEDBACK & EVALUATION',['Receive employee feedback','Review submitted work and evidence','Provide specific corrections / guidance','Record evaluation and discussion','Track development actions','Review improvement and close actions']],
['ISSUES MANAGEMENT',['Identify linked issue / blocker','Assess severity and business impact','Responsible manager reviews','Resolve or escalate to higher authority','Audit decision and next review date','Monitor until resolution is confirmed']]
];
const emp=[
['WORK MANAGEMENT',['View own task queue and details','Check priority, deadline and deliverables','Start / continue; update progress','Record notes, effort and evidence','Raise issue if blocked; submit deliverable','Receive feedback; revise and resubmit']],
['ATTENDANCE & AVAILABILITY',['Check in; record time and location','Apply shift / leave / attendance rules','Set and update availability while working','Check out; record breaks where applicable','Calculate work hours from complete records','Store history; flag missing / inconsistent times']],
['REQUEST & SELF-SERVICE',['Choose leave / permission / scheduled request','Or request guidance / operational resources','Submit dates, reason and evidence','Manager / authorised reviewer decides','Approved / rejected / returned; notify user','Retain request, decision and approval history']],
['NOTIFICATION & COMMUNICATION',['New task / reassignment triggers notice','Approaching deadline triggers reminder','Overdue / escalation alerts reach owner','Manager feedback or request decision notifies','Announcement appears for target audience','Open linked record, respond and act']],
['PERFORMANCE & ACTIVITY',['View own activity summary','Review completion and target progress','Inspect personal attendance summary','Open task / work activity history','Review feedback and evaluation history','Use authorised personal reports']],
['PROFILE & SECURITY',['View personal profile','Inspect account and assignment details','Request controlled account changes','Change password securely','Review and end active sessions','Log out; retain session audit history']]
];
for(const [arr,start,cols,col]of [[adm,200,3,'blue'],[mgr,2400,4,'orange'],[emp,4600,3,'green']])arr.forEach((b,i)=>branch(b[0],start+(i%cols)*(2000/cols),2470+Math.floor(i/cols)*860,(2000/cols)-25,b[1],col,105));
box('ADMIN / SA / IT CONTROL BOUNDARY\nRoutine administration is delegated; high-level accounts and master permissions belong to SA / IT. Technical privilege alone does not approve leave, brokerage terms or business deliverables.',200,4160,2000,115,'blue');
box('MANAGER APPROVAL BOUNDARY\nLead, Senior and General Managers act within their assigned teams and mandate. Chairman inspects enterprise intelligence and strategic issues. Escalation follows configured responsibility, not assumed job-title ranking.',2400,4160,2000,115,'orange');
box('AVAILABILITY OPTIONS\nAvailable • Busy • In Meeting • On Break • In Training • Do Not Disturb • Working Remotely • On Leave • Absent • Offline\nAttendance, session activity and task effort remain separate records.',4600,4160,2000,115,'green');

header('SHARED WORK LIFECYCLE • EVERY ROLE’S OPERATIONAL ASSIGNMENTS USE THE SAME REVIEW AND AUDIT RULES',200,4360,6400);
const taskLabels=['Create task\nPurpose and responsible manager','Define deliverables\nAcceptance criteria / linked business record','Set priority & due date\nRecord original deadline','Check capacity & availability\nChoose employee and reviewer','Assign task & notify\nAssigned / Pending','Execute work\nProgress, notes, effort and evidence','Submit deliverables\nWaiting for Review'];
const task=taskLabels.map((t,i)=>box(t,200+i*925,4480,850,92,i<5?'orange':'green'));chain(task);
const review=box('Manager reviews submission\nUnder Review',5750,4700,850,92,'orange');edge(task[6],review);
const approved=box('Approved?',4900,4700,570,105,'orange','diamond');edge(review,approved);
const complete=box('Complete & close task\nRecord approval and final evidence',3820,4700,850,92,'green');edge(approved,complete,'Yes','green');
const corrections=box('Changes Requested\nManager records specific corrections; notify employee',4900,4910,700,92,'red');edge(approved,corrections,'No','red');
const revision=box('Employee revises and resubmits\nPreserve previous versions and feedback',5850,4910,750,92,'green');edge(corrections,revision);edge(revision,review,'Resubmit','green','exitX=1;exitY=0.5;entryX=1;entryY=0.5;');
box('WORK ACTIVITY ≠ TASK STATE\nProgress updates, work notes, effort entries and files are historical activity records. A reassignment is an ownership-change event; overdue is an exception flag on unfinished work. Cancellation is a separately authorised outcome.',200,4700,1700,160,'gray','note');
box('BUSINESS LINKAGE\nMember office / CRM lead / campaign / conference / IT incident references connect operational tasks to their business context. External parties provide inputs; IOTS records staff coordination and accountability.',2000,4700,1600,160,'gray','note');
box('MEMBERSHIP WORK\nBDE research → outreach → log response / next follow-up → GM meeting → agreement and fee coordination → review outcome.\nUnready prospects remain in a dated follow-up queue.',200,4910,1400,140,'green');
box('MEMBER DEAL & ROYALTY FOLLOW-UP\nCRM lead → receiving member accepts / rejects → proposal / negotiation → concluded deal → brokerage acceptance → verified royalty payment.\nIOTS tracks internal owners and evidence; unpaid amounts stay open.',1700,4910,1400,140,'orange');
box('CREATIVE & RESEARCH DELIVERY\nBrief / member research data → draft / proofread / design → review → corrections → approval → publish / print → evidence.\nRetain versions, final links and distribution records.',3200,4910,1400,140,'green');
const over=branch('OVERDUE & REASSIGNMENT',200,5100,2000,[
'Unfinished work reaches deadline → flag overdue; notify responsible manager',
'Manager reviews priority, impact, blocker and review-waiting context',
'Choose extension / reassignment / escalation; record decision and reason',
'Extension retains original due date. Reassignment checks capacity, selects new owner and transfers context',
'Notify affected people; preserve one task ID, owner history and next review date',
'Continue work; overdue and reassignment history remain visible'
],'orange',110);
const block=branch('ISSUES, BLOCKERS & ESCALATION',2400,5100,2000,[
'Employee raises linked issue with severity, evidence and business impact',
'Responsible manager reviews; technical faults route to IT System Analyst',
'Resolved within authority?',
'No: escalate to designated Senior / General Manager or specialist; keep follow-up owner',
'Verify resolution with affected employee; record decision, evidence and outcome',
'Notify owner and resume work. Unresolved cases stay open with a next review date'
],'red',110);diamond(block.ns[2],'Resolved within authority?');relabel(block.ns[2],block.ns[3],'No');edge(block.ns[2],block.ns[4],'Yes','green','exitX=1;exitY=0.5;entryX=1;entryY=0.5;sourceJettySize=750;targetJettySize=40;');
const service=branch('ATTENDANCE, REQUESTS & PERSONAL EXCEPTIONS',4600,5100,2000,[
'Attendance correction / leave / permission / scheduled remote work / resource request submitted',
'Authorised reviewer checks evidence, dates and employee explanation',
'Record approval, rejection or returned-for-detail decision; notify employee',
'Returned → employee adds details and resubmits. Approved absence updates availability and workload',
'Missing checkout / inconsistent hours remain flagged until reviewed; audit every correction',
'Session end is recorded separately; complete attendance timestamps calculate policy-based work hours'
],'green',110);
const allLog=box('B • ALL LAYER 2 INPUTS, ACTIONS & OUTCOMES\nEvery role, task, activity, attendance change, request, review, message, configuration, incident and decision writes a timestamped operational record and audit event.',1100,6030,4600,120,'purple');
[over.ns[5],block.ns[5],service.ns[5]].forEach(n=>edge(n,allLog,'Record outcome','purple'));
box('AUDIT CONTRACT • identity + active role + time + action + object + before/after values + reason + source (person/system). Records retain ownership transfers, deadline extensions, revisions and corrections. Audit history is append-only.',200,6210,6400,85,'purple','note');container=null;

const database=box('SHARED OPERATIONAL RECORDS & AUDIT DATABASE\n\nA • Layer 1 login, session and location records    +    B • All Layer 2 role, work and service records\n\nCurrent records + complete historical changes + file / evidence references\nLinked CRM lead, member, brokerage and payment status with source / verification time\n\nREAD OUTPUT → authorised analytics, reports, employee history, manager drill-down and Chairman appraisal\nWRITE INPUT → new actions and decisions continue the operational history',1650,6470,3500,310,'purple','database');
edge(allLog,database,'Store all operational inputs','purple');
const auditRail=box('A • Stored login audit',180,6440,850,80,'blue');edge(loginAudit,auditRail,'Layer 1 record stream','blue','exitX=0;exitY=0.5;entryX=0;entryY=0.5;sourceJettySize=90;targetJettySize=90;dashed=1;');edge(auditRail,database,'Authentication / location history','blue');
box('STORED RECORD FAMILIES\nUsers, roles and assignments\nTasks, states and activity\nEvidence and submission versions\nAttendance and availability\nRequests and approval history\nIssues, escalation and reassignment\nMessages and announcements\nSecurity, settings and technical incidents',200,6640,1300,270,'blue');
box('HISTORY & ACCESS GUARANTEES\nOne task identity across transfers\nKeep original and changed deadlines\nRetain corrections and decision reasons\nDo not duplicate CRM financial truth\nReport access follows role and data scope\nEvery aggregate can reach source evidence\nExport and report generation are audited',5300,6490,1300,270,'purple');
header('LAYER 3 • INTELLIGENCE, ANALYTICS & REPORTING FOR EVERY AUTHORISED USER',100,7020,6600,'purple');
const quality=box('Read permitted records → choose reporting period and scope → check completeness → aggregate tasks once → apply configured metrics, targets and rules',1550,7140,3700,95,'purple');edge(database,quality,'Read verified records','purple');
const analyses=[
['PERFORMANCE',['Completion rate with counts and denominator','On-time delivery / late completion','Elapsed duration versus active effort','Role-specific targets and achievement','Employee, manager and team performance']],
['TASK & WORKLOAD',['Assigned, pending, active, blocked and review queues','Overdue work by age, priority and owner','Reassignment events without duplicate tasks','Individual / team capacity and balance','Approaching deadlines and workload pressure']],
['ATTENDANCE',['Late arrival and absence trends','Approved leave separated from unexplained absence','Availability patterns and recorded durations','Working hours; incomplete records flagged','Office / remote / unknown-location trends']],
['EXCEPTION & RISK',['Overdue, recurring transfers and workload risk','Pending requests and unresolved blockers','Combine severity, duration and business impact','Configured Low / Medium / High rules','Explain each flag with linked source evidence']],
['TRENDS & HISTORY',['Day versus previous day','Week versus previous week','Month versus prior month / equivalent period','Performance, workload, attendance and risk movement','Preserve target, deadline and rule versions']],
['BUSINESS & RECOGNITION',['Verified deal flow and royalty due / collected','Membership outreach and follow-up outcomes','Campaign, report and event delivery','Role-specific monthly recognition standings','Three qualifying months → Chairman review']]
];
const analytic=[];analyses.forEach((b,i)=>{let a=branch(b[0],200+i*1080,7340,1000,b[1],'purple',100);edge(quality,a.head);analytic.push(a.ns[4]);});
const report=box('BUILD AUTHORISED REPORTS • Filter by period, employee, manager, team, role, department, branch, priority, status, request, attendance and risk\nTeam → Employee → Task / Request / Attendance → Activity → Evidence → Decision and audit history',1450,8040,3900,115,'purple');analytic.forEach(n=>edge(n,report));
const daily=box('DAILY REPORT\nToday’s completions, overdue tasks, blockers, attendance, availability and next priorities',200,8240,2000,115,'purple');
const weekly=box('WEEKLY REPORT\nTeam delivery, on-time completion, targets, workload balance, recurring issues and attendance trends',2400,8240,2000,115,'purple');
const monthly=box('MONTHLY / PERIOD REPORT\nPerformance trends, target variance, royalty status, appraisal evidence and recognition standings',4600,8240,2000,115,'purple');[daily,weekly,monthly].forEach(n=>edge(report,n));
const deliver=box('ENFORCE RECIPIENT SCOPE • Generate dashboard / PDF / Excel / authorised email • Apply configured report timing and appraisal template • Log delivery and export',1450,8440,3900,92,'purple');[daily,weekly,monthly].forEach(n=>edge(n,deliver));
const consumers=[
['CHAIRMAN','Enterprise health, royalty, attendance summaries, major risks, appraisal exports and award decisions'],
['GENERAL MANAGER','Organisation operations, Board / finance / compliance actions, member coordination and delivery'],
['SENIOR MANAGER','Cross-team capacity, comparative performance, deadline risk and escalated decisions'],
['LEAD MANAGER','Own teams: assignments, review queue, overdue work, requests, blockers and operational follow-ups'],
['ADMIN','Permitted account, attendance, location, organisational oversight and administrative audit reports'],
['SUPER ADMIN','Platform governance, master configuration, high-level access, full audit and export oversight'],
['IT SYSTEM ANALYST','Full platform audit plus service / API health, security events, incidents and deployment history'],
['EXECUTIVE','Own tasks, progress, work activity, attendance, feedback and personal performance'],
['BDE','Own outreach, calls, verified prospects, meetings, follow-ups, targets and personal services'],
['CREATIVES ASSOCIATE','Own content / design pipeline, versions, publication, proofreading, event assets and personal services']
];
const audiences=box('ROLE-SCOPED OUTPUTS • Select the relevant authorised audience below',1450,8570,3900,55,'purple','header');edge(deliver,audiences);
consumers.forEach(([t,d],i)=>box(t+'\n'+d,200+(i%5)*1300,8670+Math.floor(i/5)*205,1220,145,'purple'));
const action=box('REQUIRES ATTENTION → inspect why / who / evidence → authorised manager decides → intervention is recorded in Layer 2 → resolution returns to reporting\nRECOGNITION → validate monthly evidence → three consecutive qualifying months → Chairman sign-off → retain decision and announcement history',1100,9100,4600,120,'purple');
edge(deliver,action,'Authorised action','purple','exitX=0;exitY=0.5;entryX=0;entryY=0.5;sourceJettySize=1350;targetJettySize=1000;');
edge(action,allLog,'Record decision and follow-up','purple','exitX=1;exitY=0.5;entryX=1;entryY=0.5;sourceJettySize=1040;targetJettySize=1040;dashed=1;');
box('METRIC RULES • Zero denominator: N/A. Missing target: “Target not configured”. Approved leave and external blockers retain context. Reassignment never creates a new task count. Approved deadline changes retain original deadlines and prior overdue history. Rules flag risk; authorised people decide actions.',200,9290,6400,95,'gray','note');
box('POLICY SETTINGS • Approval / escalation mandates, shifts / grace / breaks, report schedules, appraisal template and recognition scoring remain configurable. CRM royalty uses agreed brokerage shares and lease days; CIRIL receives 7.5% of each party’s share. Integration/import must preserve verified CRM source records.\nSources: original Actual-FlowChart.drawio Layer 1; Construct.txt functional scope; final-version.drawio role and operational detail; referential-flowchart.jpeg visual theme.',200,9410,6400,105,'gray','note');

const xml=`<mxfile host="app.diagrams.net" compressed="false"><diagram id="iots-complete" name="IOTS — Complete three-layer operational architecture"><mxGraphModel dx="1700" dy="1100" grid="1" gridSize="10" page="1" pageScale="1" pageWidth="${W}" pageHeight="${H}" background="#FFFFFF"><root><mxCell id="0"/><mxCell id="1" parent="0"/>${background.join('')}${edges.join('')}${vertices.join('')}</root></mxGraphModel></diagram></mxfile>`;
fs.writeFileSync('new_final-version.drawio',xml);fs.writeFileSync('review/new-final-manifest.json',JSON.stringify({width:W,height:H,generatedNodes:nodes.size,generatedEdges:edges.length,retainedOriginalCells:auth.length},null,2));
console.log('Created new_final-version.drawio: one continuous canvas; '+nodes.size+' new/registered nodes; '+auth.length+' original Layer 1 cells.');
