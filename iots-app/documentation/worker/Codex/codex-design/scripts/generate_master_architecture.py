import xml.etree.ElementTree as ET
import os

CANVAS_WIDTH = 5200
CANVAS_HEIGHT = 7560

root = ET.Element('mxfile', host="Electron", pages="1")
diagram = ET.SubElement(root, 'diagram', id="gemini-iots-architecture", name="CIRIL IOTS — Complete Operational Architecture")
model = ET.SubElement(diagram, 'mxGraphModel', 
                      dx="3024", dy="1456", grid="1", gridSize="10", 
                      guides="1", tooltips="1", connect="1", arrows="1", 
                      fold="1", page="1", pageScale="1", 
                      pageWidth=str(CANVAS_WIDTH), pageHeight=str(CANVAS_HEIGHT), 
                      background="#FFFFFF", math="0", shadow="0")
mxroot = ET.SubElement(model, 'root')

ET.SubElement(mxroot, 'mxCell', id="0")
ET.SubElement(mxroot, 'mxCell', id="1", parent="0")

edge_counter = 1

def add_vertex(cid, label, style, parent, x, y, w, h):
    cell = ET.Element('mxCell', id=cid, value=label, style=style, parent=parent, vertex="1")
    geom = ET.SubElement(cell, 'mxGeometry', x=str(x), y=str(y), width=str(w), height=str(h))
    geom.set('as', 'geometry')
    mxroot.append(cell)
    return cell

def add_edge(source, target, label="", style=None, parent="1", exitX=None, exitY=None, entryX=None, entryY=None):
    global edge_counter
    cid = f"edge_{edge_counter}"
    edge_counter += 1
    if style is None:
        style = "edgeStyle=orthogonalEdgeStyle;rounded=1;html=1;fontFamily=Segoe UI, Arial;fontSize=11;strokeColor=#4A5568;strokeWidth=1.5;labelBackgroundColor=#FFFFFF;"
    if exitX is not None and exitY is not None:
        style += f"exitX={exitX};exitY={exitY};"
    if entryX is not None and entryY is not None:
        style += f"entryX={entryX};entryY={entryY};"
        
    cell = ET.Element('mxCell', id=cid, value=label, style=style, parent=parent, edge="1", source=source, target=target)
    geom = ET.SubElement(cell, 'mxGeometry', relative="1")
    geom.set('as', 'geometry')
    mxroot.append(cell)
    return cell

FONT_BASE = "fontFamily=Segoe UI, -apple-system, Roboto, Helvetica, Arial, sans-serif;"

def banner_style(fill, text_color="#FFFFFF", font_size=18):
    return f"rounded=1;whiteSpace=wrap;html=1;fillColor={fill};strokeColor={fill};fontColor={text_color};fontSize={font_size};fontStyle=1;align=center;verticalAlign=middle;{FONT_BASE}"

def card_style(fill, stroke, font_color="#1A202C", font_size=12, bold=False):
    style = f"rounded=1;arcSize=10;whiteSpace=wrap;html=1;fillColor={fill};strokeColor={stroke};fontColor={font_color};fontSize={font_size};spacing=8;strokeWidth=1.5;{FONT_BASE}"
    if bold:
        style += "fontStyle=1;"
    return style

def diamond_style(fill, stroke, font_color="#1A202C"):
    return f"rhombus;whiteSpace=wrap;html=1;fillColor={fill};strokeColor={stroke};fontColor={font_color};fontSize=12;fontStyle=1;spacing=6;strokeWidth=1.5;{FONT_BASE}"

def container_style(fill, stroke, title_color="#FFFFFF", start_size=40):
    return f"swimlane;startSize={start_size};rounded=1;arcSize=8;whiteSpace=wrap;html=1;fillColor={fill};strokeColor={stroke};fontColor={title_color};fontSize=14;fontStyle=1;swimlaneFillColor={fill};swimlaneLine=0;strokeWidth=2;{FONT_BASE}"

def cylinder_style(fill, stroke, font_color="#FFFFFF"):
    return f"shape=cylinder3;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;size=15;fillColor={fill};strokeColor={stroke};fontColor={font_color};fontSize=13;fontStyle=1;{FONT_BASE}"

print("Step 1: Creating Main Headers...")
add_vertex("hdr_main", "CIRIL • INTERNAL OPERATIONS TRACKING SYSTEM (IOTS) — ARCHITECTURAL BLUEPRINT", 
           banner_style("#1A365D", "#FFFFFF", 22), "1", 60, 40, 5080, 65)

add_vertex("hdr_sub", "Complete End-to-End Operational Architecture: Authentication & Location Layer (Top) → Management & Operational Workspaces (Middle) → Shared Records Database → Intelligence, Analytics & Chairman Oversight (Bottom)", 
           card_style("#F7FAFC", "#CBD5E0", "#2D3748", 13, True), "1", 60, 115, 5080, 45)

# =========================================================================
# LAYER 1: AUTHENTICATION, LOCATION AUDIT & WORKSPACE ROUTING
# =========================================================================
print("Step 2: Building Layer 1...")
add_vertex("sec_layer1", "LAYER 1 • AUTHENTICATION, LOCATION AUDIT & ROLE WORKSPACE ROUTING", 
           container_style("#F0F4F8", "#2B6CB0", "#FFFFFF", 40), "1", 60, 180, 5080, 720)

add_vertex("l1_start", "START • Corporate Login", card_style("#1A365D", "#1A365D", "#FFFFFF", 14, True), "sec_layer1", 100, 70, 240, 65)
add_vertex("l1_input", "User Enters Credentials<br><b>Corporate Email / ID + Password</b><br><i>*Strictly No Public Registration</i>", card_style("#EBF8FF", "#3182CE", "#2B6CB0", 12), "sec_layer1", 380, 70, 300, 65)
add_vertex("l1_val_cred", "Credentials<br>Valid?", diamond_style("#FEFCBF", "#D69E2E", "#744210"), "sec_layer1", 720, 57, 160, 90)

add_vertex("l1_err_cred", "Authentication Failed<br><b>Show Error & Increment Counter</b><br>Lockout / Admin Password Reset", card_style("#FFF5F5", "#E53E3E", "#9B2C2C", 11), "sec_layer1", 720, 180, 260, 65)
add_vertex("l1_chk_active", "Account<br>Active?", diamond_style("#FEFCBF", "#D69E2E", "#744210"), "sec_layer1", 930, 57, 160, 90)
add_vertex("l1_err_deact", "Account Suspended / Inactive<br><b>Access Prohibited</b><br>Contact Super Admin Governance", card_style("#FFF5F5", "#E53E3E", "#9B2C2C", 11), "sec_layer1", 930, 180, 260, 65)

add_vertex("l1_req_loc", "Validate Location Context<br><b>Browser / Device Geolocation Call</b><br>Query BigDataCloud Geocoding API", card_style("#EBF8FF", "#3182CE", "#2B6CB0", 12), "sec_layer1", 1140, 70, 300, 65)
add_vertex("l1_eval_geo", "Compare GPS Coordinates against<br>Approved Office Geofence Radius", card_style("#EBF8FF", "#3182CE", "#2B6CB0", 12), "sec_layer1", 1480, 70, 300, 65)
add_vertex("l1_dec_geo", "Location<br>Recognized?", diamond_style("#FEFCBF", "#D69E2E", "#744210"), "sec_layer1", 1820, 57, 160, 90)

add_vertex("l1_geo_on", "Inside Approved Perimeter<br><b>Session Tag: ON-SITE</b><br>Standard Office Context", card_style("#F0FFF4", "#38A169", "#22543D", 12, True), "sec_layer1", 2040, 50, 260, 60)
add_vertex("l1_geo_off", "Outside Approved Perimeter<br><b>Session Tag: REMOTE / OFF-SITE</b><br>Prompt Reason for Attendance Audit", card_style("#FFFAF0", "#DD6B20", "#7B341E", 12, True), "sec_layer1", 2040, 125, 260, 60)
add_vertex("l1_geo_unk", "Location Denied / Inaccurate<br><b>Session Tag: UNKNOWN LOCATION</b><br>Flagged for Admin Location Audit", card_style("#FFF5F5", "#E53E3E", "#9B2C2C", 12, True), "sec_layer1", 2040, 200, 260, 60)

add_vertex("l1_audit_log", "Session Audit & Context Capture<br><b>Immutable Audit Record Written:</b><br>User ID • Timestamp • GPS • IP • Session Tag", card_style("#EBF8FF", "#2B6CB0", "#1A365D", 12, True), "sec_layer1", 2360, 70, 340, 65)
add_vertex("l1_eval_roles", "RBAC Engine: Evaluate Authorized Roles<br><b>1 Identity → Multiple Authorized Roles</b><br>Detect Primary Workspace & Role Scope", card_style("#FAF5FF", "#805AD5", "#44337A", 12, True), "sec_layer1", 2740, 70, 340, 65)

add_vertex("l1_role_dec", "Multiple<br>Roles?", diamond_style("#FEFCBF", "#D69E2E", "#744210"), "sec_layer1", 3120, 57, 160, 90)
add_vertex("l1_primary_land", "Default Landing:<br><b>Primary Role Workspace Dashboard</b><br>Enforce Authorized Permission Boundaries", card_style("#EBF8FF", "#3182CE", "#2B6CB0", 12), "sec_layer1", 3340, 50, 300, 65)
add_vertex("l1_ctx_switcher", "Instant Context Switcher Enabled:<br><b>Global Navigation 1-Click Role Switch</b><br>Switch Workspaces without Re-authenticating", card_style("#FAF5FF", "#805AD5", "#44337A", 12, True), "sec_layer1", 3340, 130, 320, 65)

add_vertex("l1_audit_segreg", "Session & Audit Segregation:<br><b>Every Operational Action is Tagged With:</b><br>[Employee Identity] + [Active Role Context]", card_style("#FAF5FF", "#805AD5", "#44337A", 12, True), "sec_layer1", 3700, 70, 340, 65)
add_vertex("l1_dispatch", "WORKSPACE DISPATCH ROUTER:<br><b>Route User to Active Operational Lane</b><br>Admin Lane • Management Lane • Execution Lane", card_style("#1A365D", "#1A365D", "#FFFFFF", 13, True), "sec_layer1", 4080, 70, 360, 65)

# Layer 1 Edges
add_edge("l1_start", "l1_input")
add_edge("l1_input", "l1_val_cred")
add_edge("l1_val_cred", "l1_err_cred", "No")
add_edge("l1_err_cred", "l1_input", "Retry", exitX=0, exitY=0.5, entryX=0.5, entryY=1)
add_edge("l1_val_cred", "l1_chk_active", "Yes")
add_edge("l1_chk_active", "l1_err_deact", "No")
add_edge("l1_chk_active", "l1_req_loc", "Yes")
add_edge("l1_req_loc", "l1_eval_geo")
add_edge("l1_eval_geo", "l1_dec_geo")
add_edge("l1_dec_geo", "l1_geo_on", "Inside")
add_edge("l1_dec_geo", "l1_geo_off", "Outside")
add_edge("l1_dec_geo", "l1_geo_unk", "Denied")
add_edge("l1_geo_on", "l1_audit_log")
add_edge("l1_geo_off", "l1_audit_log")
add_edge("l1_geo_unk", "l1_audit_log")
add_edge("l1_audit_log", "l1_eval_roles")
add_edge("l1_eval_roles", "l1_role_dec")
add_edge("l1_role_dec", "l1_primary_land", "Single")
add_edge("l1_role_dec", "l1_ctx_switcher", "Multi-Role")
add_edge("l1_primary_land", "l1_audit_segreg")
add_edge("l1_ctx_switcher", "l1_audit_segreg", "Role Switch")
add_edge("l1_audit_segreg", "l1_dispatch")

add_vertex("l1_note", "MULTI-ROLE ARCHITECTURAL PRINCIPLE: Unified authentication guarantees single employee identity without separate accounts. Dual-role profiles (e.g. Harshitha acting as Creatives Associate + Executive) operate seamlessly via context switching, preserving individual accountability and audit integrity across all organizational activities.", 
           card_style("#EDF2F7", "#CBD5E0", "#4A5568", 12), "sec_layer1", 100, 630, 4880, 45)

# =========================================================================
# LAYER 2: MANAGEMENT, OPERATIONS & WORK DELIVERY LAYER
# =========================================================================
print("Step 3: Building Layer 2...")
add_vertex("sec_layer2", "LAYER 2 • MANAGEMENT, OPERATIONS & WORK DELIVERY LAYER", 
           container_style("#FFFFFF", "#2D3748", "#FFFFFF", 45), "1", 60, 930, 5080, 4000)

# Lane 1: Administrative Governance
add_vertex("lane_admin", "ADMINISTRATIVE GOVERNANCE WORKSPACE (Admin • Super Admin • IT System Analyst)", 
           container_style("#EBF8FF", "#2B6CB0", "#FFFFFF", 40), "sec_layer2", 80, 70, 1600, 1800)

add_vertex("adm_1", "1. User Provisioning & Account Management (Admin)<br>• Manual creation: Emp ID, Designation, Dept, Office, Role, Manager<br>• Strictly no public registration; accounts activated upon review<br>• Super Admin holds sole authority to deactivate high-level accounts", card_style("#FFFFFF", "#3182CE", "#1A365D", 12), "lane_admin", 40, 60, 1520, 80)
add_vertex("adm_2", "2. Geofence Perimeter & Location Control (Admin)<br>• Configure approved office GPS coordinates and allowable radius boundaries<br>• Define working hours, grace periods, and shift attendance rules<br>• Location audit review: investigate off-site/unknown location logs", card_style("#FFFFFF", "#3182CE", "#1A365D", 12), "lane_admin", 40, 160, 1520, 80)
add_vertex("adm_3", "3. Global Task Oversight & Archival (Admin)<br>• Global monitoring of active organizational queues; identify abandoned tasks<br>• Change assignment, update instructions, or stop assignments where authorized<br>• Business approvals strictly require explicit management permission", card_style("#FFFFFF", "#3182CE", "#1A365D", 12), "lane_admin", 40, 260, 1520, 80)
add_vertex("adm_4", "4. Master Organization & RBAC Configurations (Super Admin)<br>• Master org hierarchy, department definitions, designation taxonomies<br>• Configures Role-Based Access Control (RBAC) permission matrices<br>• Manages data export covenants, compliance frameworks, and retention policies", card_style("#FFFFFF", "#3182CE", "#1A365D", 12), "lane_admin", 40, 360, 1520, 80)
add_vertex("adm_5", "5. Application & Infrastructure Health (IT System Analyst)<br>• Equal platform privileges to Super Admin; tailored for technical monitoring<br>• Real-time server uptime, database response latency, and frontend health<br>• Track BigDataCloud geocoding API, mail server rate-limits, storage quotas", card_style("#FFFFFF", "#3182CE", "#1A365D", 12), "lane_admin", 40, 460, 1520, 80)
add_vertex("adm_6", "6. Security Auditing & Technical Incident Response (IT System Analyst)<br>• Analyze anomalous login attempts, sudden location jumps, session timeouts<br>• Log and resolve platform bugs, database deadlocks, webhook delivery failures<br>• Deployment tracking: system version updates, environment vars, schema migrations", card_style("#FFFFFF", "#3182CE", "#1A365D", 12), "lane_admin", 40, 560, 1520, 80)
add_vertex("adm_7", "7. Security & Immutable Audit Viewer (Super Admin / IT Analyst)<br>• Inspect full, immutable activity logs: filter by date, user, role, action<br>• Review login history, modification diffs, and network/location events<br>• Export authorized security and audit compliance reports", card_style("#FFFFFF", "#3182CE", "#1A365D", 12), "lane_admin", 40, 660, 1520, 80)
add_vertex("adm_8", "8. Enterprise Communications & Announcements (Admin)<br>• Draft official company notices; select target audience (team/dept/all)<br>• Set display schedule and broadcast duration; publish to employee portals<br>• Archive notice history, expiry events, and recipient acknowledgment status", card_style("#FFFFFF", "#3182CE", "#1A365D", 12), "lane_admin", 40, 760, 1520, 80)

add_vertex("adm_auth_note", "GOVERNANCE BOUNDARY: IT Analyst & Super Admin possess equal platform technical authority. However, IT Analysts cannot approve business decisions (e.g. employee annual leave, commercial fee splits, or budget allocations).", 
           card_style("#EBF8FF", "#3182CE", "#2B6CB0", 12, True), "lane_admin", 40, 860, 1520, 55)

# Lane 2: Operational Management Workspace
add_vertex("lane_mgr", "OPERATIONAL MANAGEMENT WORKSPACE (General Manager • Senior Manager • Lead Manager)", 
           container_style("#FFFAF0", "#DD6B20", "#FFFFFF", 40), "sec_layer2", 1740, 70, 1600, 1800)

add_vertex("mgr_1", "1. Overall Operations & Board Coordination (General Manager)<br>• Oversee day-to-day branch execution; ensure smooth operational continuity<br>• Coordinate with Board of Directors for meetings, agendas, minutes & follow-ups<br>• Accounts & finance: track invoices, vendor payments, and operational expenses", card_style("#FFFFFF", "#DD6B20", "#7B341E", 12), "lane_mgr", 40, 60, 1520, 80)
add_vertex("mgr_2", "2. Compliance, Legal & Conferences (General Manager)<br>• Statutory compliance filings and coordination with Auditor<br>• Legal: membership agreements, contracts, NDAs, and documentation<br>• Organize Annual & Zonal Conferences: hotels, vendors, members, speakers", card_style("#FFFFFF", "#DD6B20", "#7B341E", 12), "lane_mgr", 40, 160, 1520, 80)
add_vertex("mgr_3", "3. Prospective Member Presentations (General Manager)<br>• Conduct virtual discussions with prospective commercial brokerages<br>• Present CIRIL's value proposition and expand member office network<br>• Support BDE outreach conversions with executive leadership engagement", card_style("#FFFFFF", "#DD6B20", "#7B341E", 12), "lane_mgr", 40, 260, 1520, 80)
add_vertex("mgr_4", "4. Cross-Team Workload Balancing & SLA Risk (Senior Manager)<br>• Monitor workload distribution across operations, BD, and creative associates<br>• Identify tasks at risk of missing client or member deadlines; balance capacity<br>• Evaluate high-impact escalations; analyze comparative productivity trends", card_style("#FFFFFF", "#DD6B20", "#7B341E", 12), "lane_mgr", 40, 360, 1520, 80)
add_vertex("mgr_5", "5. Member Office Deals & Royalty Coordination (Lead Manager - Manasa)<br>• Coordinate with member offices regarding concluded commercial deals<br>• Follow up rigorously on CIRIL's 7.5% royalty payment obligations<br>• Member office agreements and annual membership fee collection tracking", card_style("#FFFFFF", "#DD6B20", "#7B341E", 12), "lane_mgr", 40, 460, 1520, 80)
add_vertex("mgr_6", "6. Vertical Calls & Lead Exchange Coordination (Lead Manager - Manasa)<br>• Manage zone-wise vertical calls: Retail, Logistics & Warehousing, Land, Hotel<br>• Direct client call handling across commercial verticals<br>• Prepare quarterly lead exchange details and business statistics across member offices", card_style("#FFFFFF", "#DD6B20", "#7B341E", 12), "lane_mgr", 40, 560, 1520, 80)
add_vertex("mgr_7", "7. Portals, Website & Collaterals Coordination (Lead Manager - Manasa)<br>• Upload listings to Office Space portal; distribute incoming inquiries to members<br>• Coordinate website updates and changes with vendor Bitra<br>• Printing & stationery coordination for market research reports & conference collateral", card_style("#FFFFFF", "#DD6B20", "#7B341E", 12), "lane_mgr", 40, 660, 1520, 80)
add_vertex("mgr_8", "8. Task Planning, Delegation & Review (Lead / Senior Manager)<br>• Define task deliverables, priority, due date, and acceptance criteria<br>• Check employee capacity and assign; monitor progress through delivery<br>• Review submitted work: Approve & Close OR Changes Requested revision cycle", card_style("#FFFFFF", "#DD6B20", "#7B341E", 12), "lane_mgr", 40, 760, 1520, 80)

add_vertex("mgr_scope_note", "MANAGEMENT ROLE DELINEATION: General Manager provides overall operational governance and Board/Finance alignment; Senior Manager drives cross-team capacity and risk mitigation; Lead Manager (Manasa) drives day-to-day vertical operations, deal royalty follow-up, and vendor coordination.", 
           card_style("#FFFAF0", "#DD6B20", "#7B341E", 12, True), "lane_mgr", 40, 860, 1520, 55)

# Lane 3: Execution & Deliverables Workspace
add_vertex("lane_exec", "EXECUTION & WORK DELIVERABLES WORKSPACE (Executive • BDE • Creatives Associate)", 
           container_style("#F0FFF4", "#276749", "#FFFFFF", 40), "sec_layer2", 3400, 70, 1600, 1800)

add_vertex("exe_1", "1. Focused Task Execution (Executive)<br>• Personal task queue: clear deliverables, due dates, and priority rank<br>• Start/continue work with zero distractions; update progress percentage<br>• Record activity notes, log effort time, and attach versioned deliverables", card_style("#FFFFFF", "#38A169", "#1C4532", 12), "lane_exec", 40, 60, 1520, 80)
add_vertex("exe_2", "2. Issue & Blocker Reporting (Executive)<br>• Encounter operational impediment → raise linked Blocker Ticket<br>• Assign severity (Low / Medium / High / Critical) and impact description<br>• Work paused until manager intervention; resume work upon resolution", card_style("#FFFFFF", "#38A169", "#1C4532", 12), "lane_exec", 40, 160, 1520, 80)
add_vertex("exe_3", "3. Submission & Revision Cycles (Executive)<br>• Submit deliverables for manager review (Status: Waiting for Review)<br>• Incorporate manager feedback if changes requested; preserve version history<br>• Resubmit corrected deliverables until final approval and closure", card_style("#FFFFFF", "#38A169", "#1C4532", 12), "lane_exec", 40, 260, 1520, 80)
add_vertex("exe_4", "4. Broker Prospect Research (Business Development Executive - Bhavani)<br>• Research and compile verified commercial broker contacts from RERA portals<br>• Commercial directories and Google prospect sourcing across target territories<br>• Maintain verified prospect database with contact details and brokerage scale", card_style("#FFFFFF", "#38A169", "#1C4532", 12), "lane_exec", 40, 360, 1520, 80)
add_vertex("exe_5", "5. Outreach Campaigns & Pipeline Management (BDE - Bhavani)<br>• Daily cold calls and structured email outreach to prospective member brokerages<br>• Professional WhatsApp campaigns introducing CIRIL's pan-India network<br>• Operate Upturnly lead generation portal and 99acres commercial portal", card_style("#FFFFFF", "#38A169", "#1C4532", 12), "lane_exec", 40, 460, 1520, 80)
add_vertex("exe_6", "6. Meeting Scheduling & Follow-Up Rigor (BDE - Bhavani)<br>• Maintain rigorous follow-up queue; log call outcomes and next contact date<br>• Schedule virtual pitch meetings for General Manager with qualified prospects<br>• Track pipeline progression from Initial Contact → Interested → Pitch → Closed", card_style("#FFFFFF", "#38A169", "#1C4532", 12), "lane_exec", 40, 560, 1520, 80)
add_vertex("exe_7", "7. End-to-End Social Media Management (Creatives Associate - Harshitha)<br>• Brand campaign management across LinkedIn, Instagram, YouTube, and corporate channels<br>• Content production pipeline: Brief → Drafting → Review → Changes → Approved → Published<br>• Track engagement analytics and campaign performance metrics", card_style("#FFFFFF", "#38A169", "#1C4532", 12), "lane_exec", 40, 660, 1520, 80)
add_vertex("exe_8", "8. Graphic Design & Collateral Production (Creatives Associate - Harshitha)<br>• Transform raw concepts & data into polished, institutional-grade visual assets<br>• Strict versioning control on iterative drafts (v1.0, v1.1, v2.0)<br>• Design conference collaterals, ID badges, banners, and keynote presentation decks", card_style("#FFFFFF", "#38A169", "#1C4532", 12), "lane_exec", 40, 760, 1520, 80)
add_vertex("exe_9", "9. Market Reports & Vertical Calls Support (Creatives Associate - Harshitha)<br>• Proofread & format quarterly market research publications for brand alignment<br>• Support Lead Manager on Office Vertical calls and zone-wise client updates<br>• Multi-role profile: acts as Social Media Manager + Executive seamlessly", card_style("#FFFFFF", "#38A169", "#1C4532", 12), "lane_exec", 40, 860, 1520, 80)

add_vertex("exe_multi_note", "MULTI-ROLE EXECUTION REALITY: Harshitha executes dual responsibilities—Brand/Social Media Manager and Office Vertical Executive. She utilizes the Global Nav Context Switcher to switch active workspace contexts under one corporate account without permission overlap.", 
           card_style("#F0FFF4", "#38A169", "#1C4532", 12, True), "lane_exec", 40, 960, 1520, 55)

# Connect Layer 1 Dispatch to Layer 2 Lanes
add_edge("l1_dispatch", "lane_admin", "Admin Context", exitX=0.2, exitY=1, entryX=0.5, entryY=0)
add_edge("l1_dispatch", "lane_mgr", "Manager Context", exitX=0.5, exitY=1, entryX=0.5, entryY=0)
add_edge("l1_dispatch", "lane_exec", "Execution Context", exitX=0.8, exitY=1, entryX=0.5, entryY=0)

# =========================================================================
# CROSS-CUTTING WORKFLOW PIPELINES (Within Layer 2)
# =========================================================================
print("Step 4: Building Cross-Cutting Workflow Pipelines...")

# Pipeline 1: Shared Task Lifecycle
add_vertex("p1_box", "PIPELINE A • SHARED WORK LIFECYCLE: PLAN → ASSIGN → DELIVER → REVIEW → CLOSE", 
           container_style("#F7FAFC", "#4A5568", "#1A202C", 35), "sec_layer2", 80, 2020, 1600, 1880)

add_vertex("tk_1", "1. Create Task Definition<br>Define clear purpose, deliverables,<br>due date, and acceptance criteria", card_style("#FFFAF0", "#DD6B20", "#7B341E", 12, True), "p1_box", 40, 60, 340, 75)
add_vertex("tk_2", "2. Workload & Availability Check<br>Evaluate staff capacity, active queues,<br>and current attendance status", card_style("#FFFAF0", "#DD6B20", "#7B341E", 12), "p1_box", 420, 60, 360, 75)
add_vertex("tk_3", "3. Assign Employee & Set Reviewer<br>Status: ASSIGNED / PENDING<br>Push notification to employee queue", card_style("#FFFAF0", "#DD6B20", "#7B341E", 12, True), "p1_box", 820, 60, 360, 75)
add_vertex("tk_4", "4. Employee Opens Task Queue<br>Review instructions, deadlines,<br>and confirm deliverable scope", card_style("#F0FFF4", "#38A169", "#1C4532", 12), "p1_box", 1220, 60, 340, 75)

add_vertex("tk_5", "5. Start Execution<br>Status: IN PROGRESS<br>Work commences on task", card_style("#F0FFF4", "#38A169", "#1C4532", 12, True), "p1_box", 1220, 180, 340, 70)
add_vertex("tk_6", "6. Log Progress & Work Activity<br>Record progress %, work notes, time entry<br>Attach versioned evidence files (v1.0, etc.)", card_style("#F0FFF4", "#38A169", "#1C4532", 12), "p1_box", 820, 180, 360, 70)
add_vertex("tk_7", "7. Submit Work for Verification<br>Status: WAITING FOR REVIEW<br>Deliverables locked; notify manager", card_style("#F0FFF4", "#38A169", "#1C4532", 12, True), "p1_box", 420, 180, 360, 70)
add_vertex("tk_8", "8. Manager Review & Audit<br>Status: UNDER REVIEW<br>Inspect submission against criteria", card_style("#FFFAF0", "#DD6B20", "#7B341E", 12), "p1_box", 40, 180, 340, 70)

add_vertex("tk_dec", "Deliverables<br>Approved?", diamond_style("#FEFCBF", "#D69E2E", "#744210"), "p1_box", 120, 290, 180, 100)
add_vertex("tk_close", "APPROVED & CLOSED<br><b>Work Completed Successfully</b><br>Retain delivery history & audit stamp", card_style("#F0FFF4", "#38A169", "#1C4532", 13, True), "p1_box", 40, 440, 340, 75)
add_vertex("tk_revise", "CHANGES REQUESTED<br><b>Manager Enters Specific Feedback</b><br>Returned to employee queue for revision", card_style("#FFF5F5", "#E53E3E", "#9B2C2C", 12, True), "p1_box", 420, 302, 360, 75)
add_vertex("tk_resubmit", "Employee Revises Deliverables<br>Increment version (v1.1); resubmit for review", card_style("#F0FFF4", "#38A169", "#1C4532", 12), "p1_box", 820, 302, 360, 75)

add_vertex("p1_rule_note", "WORK ACTIVITY PRINCIPLE: Work notes, progress %, time spent, and uploaded evidence are historical activity records. They do not create spurious task states. Only legitimate lifecycle transitions change the status.", 
           card_style("#EDF2F7", "#CBD5E0", "#4A5568", 11), "p1_box", 40, 560, 1520, 45)

add_edge("tk_1", "tk_2")
add_edge("tk_2", "tk_3")
add_edge("tk_3", "tk_4")
add_edge("tk_4", "tk_5")
add_edge("tk_5", "tk_6")
add_edge("tk_6", "tk_7")
add_edge("tk_7", "tk_8")
add_edge("tk_8", "tk_dec")
add_edge("tk_dec", "tk_close", "Yes")
add_edge("tk_dec", "tk_revise", "No")
add_edge("tk_revise", "tk_resubmit")
add_edge("tk_resubmit", "tk_7", "Resubmit")

# Pipeline 2: Exception, Overdue & Controlled Reassignment Engine
add_vertex("p2_box", "PIPELINE B • EXCEPTION HANDLING: OVERDUE, REASSIGNMENT & BLOCKER RESOLUTION", 
           container_style("#FFF5F5", "#E53E3E", "#9B2C2C", 35), "sec_layer2", 1740, 2020, 1600, 1880)

add_vertex("ex_ov_1", "Task Approaching Deadline<br>Automated deadline reminder notification<br>pushed to employee and manager", card_style("#FFFAF0", "#DD6B20", "#7B341E", 12), "p2_box", 40, 60, 460, 75)
add_vertex("ex_ov_2", "Deadline Reached While Unfinished<br>Status: OVERDUE (Exception Flag)<br>Record overdue age, priority, and owner", card_style("#FFF5F5", "#E53E3E", "#9B2C2C", 12, True), "p2_box", 540, 60, 480, 75)
add_vertex("ex_ov_3", "Manager Overdue Intervention<br>Assess reason: employee delay, external waiting,<br>or scope blockage; select resolution path", card_style("#FFFAF0", "#DD6B20", "#7B341E", 12), "p2_box", 1060, 60, 480, 75)

add_vertex("ex_ov_ext", "Option A: Extend Deadline<br>Save legitimate reason + new target date<br>Retain original due date in history", card_style("#FFFAF0", "#DD6B20", "#7B341E", 12), "p2_box", 1060, 180, 480, 75)
add_vertex("ex_re_1", "Option B: Controlled Reassignment<br>Task requires rebalancing or reallocation<br><b>*Preserve Existing Task ID throughout</b>", card_style("#FFFAF0", "#DD6B20", "#7B341E", 12, True), "p2_box", 540, 180, 480, 75)
add_vertex("ex_re_2", "Check Capacity & Assign New Owner<br>Record transfer reason; handover notes<br>Notify previous and newly assigned owner", card_style("#FFFAF0", "#DD6B20", "#7B341E", 12), "p2_box", 40, 180, 460, 75)

add_vertex("ex_blk_1", "Encounter Blocker / Impediment<br>Employee raises linked Blocker Ticket<br>Specify severity, details, and impact", card_style("#FFF5F5", "#E53E3E", "#9B2C2C", 12, True), "p2_box", 40, 300, 460, 75)
add_vertex("ex_blk_2", "Task Paused • Status: BLOCKED<br>Notify responsible manager immediately<br>Work halted until blocker resolution", card_style("#FFF5F5", "#E53E3E", "#9B2C2C", 12), "p2_box", 540, 300, 480, 75)
add_vertex("ex_blk_3", "Manager Evaluates Blocker<br>Can manager resolve internally?", diamond_style("#FEFCBF", "#D69E2E", "#744210"), "p2_box", 1060, 287, 180, 100)

add_vertex("ex_blk_res", "Internal Resolution<br>Manager unblocks resources/guidance<br>Mark Blocker Resolved → Resume Work", card_style("#F0FFF4", "#38A169", "#1C4532", 12), "p2_box", 1280, 300, 260, 75)
add_vertex("ex_blk_esc", "Escalate to Higher Authority<br>Technical issue → IT Analyst<br>High-impact business issue → Senior Mgr / GM", card_style("#FFF5F5", "#E53E3E", "#9B2C2C", 12, True), "p2_box", 1060, 420, 480, 75)
add_vertex("ex_blk_track", "Track Escalation in Chairman Dashboard<br>Appears in 'Requires Attention' interface<br>Unresolved blockers tracked until closed", card_style("#FAF5FF", "#805AD5", "#44337A", 12, True), "p2_box", 540, 420, 480, 75)

add_vertex("p2_rule_note", "EXCEPTION INTEGRITY RULE: Tasks NEVER disappear when deadlines expire. Overdue is an exception state requiring active decision-making. Reassignment transfers ownership under the same Task ID—it never deletes the old task to create a new one.", 
           card_style("#EDF2F7", "#CBD5E0", "#4A5568", 11), "p2_box", 40, 560, 1520, 45)

add_edge("ex_ov_1", "ex_ov_2")
add_edge("ex_ov_2", "ex_ov_3")
add_edge("ex_ov_3", "ex_ov_ext", "Extend")
add_edge("ex_ov_3", "ex_re_1", "Reassign")
add_edge("ex_re_1", "ex_re_2")
add_edge("ex_blk_1", "ex_blk_2")
add_edge("ex_blk_2", "ex_blk_3")
add_edge("ex_blk_3", "ex_blk_res", "Yes")
add_edge("ex_blk_3", "ex_blk_esc", "No")
add_edge("ex_blk_esc", "ex_blk_track")

# Pipeline 3: Commercial Deals, Royalty & People Services
add_vertex("p3_box", "PIPELINE C • COMMERCIAL DEALS, 7.5% ROYALTY RECONCILIATION & PEOPLE SERVICES", 
           container_style("#FAF5FF", "#805AD5", "#44337A", 35), "sec_layer2", 3400, 2020, 1600, 1880)

add_vertex("cm_1", "Commercial Deal Initiated in CIRIL CRM<br>Lead Giver member office records client requirement,<br>vertical, geography, and agreed fee sharing ratio", card_style("#FFFFFF", "#805AD5", "#44337A", 12), "p3_box", 40, 60, 460, 75)
add_vertex("cm_2", "Lead Routing & Acceptance<br>Receiving member office accepts lead;<br>negotiation and client site inspections proceed", card_style("#FFFFFF", "#805AD5", "#44337A", 12), "p3_box", 540, 60, 480, 75)
add_vertex("cm_3", "Deal Concluded & Brokerage Breakdown<br>Lease: ROUND(rate × area × lease days ÷ 30)<br>Sale: ROUND(1% × outright rate × area)", card_style("#FFFFFF", "#805AD5", "#44337A", 12), "p3_box", 1060, 60, 480, 75)

add_vertex("cm_4", "Calculate CIRIL 7.5% Royalty<br><b>Royalty = ROUND(7.5% × LG + 7.5% × LR)</b><br>Lead Manager (Manasa) follows up with offices", card_style("#FAF5FF", "#805AD5", "#44337A", 12, True), "p3_box", 1060, 180, 480, 75)
add_vertex("cm_5", "Accounts & Finance Verification<br>Verify payment proof & tax invoices;<br>reconcile royalty received vs. pending", card_style("#FFFFFF", "#805AD5", "#44337A", 12), "p3_box", 540, 180, 480, 75)
add_vertex("cm_6", "Reconcile into IOTS Records<br>Feed deal flow status into Executive Analytics<br>Chairman tracks 7.5% royalty collection health", card_style("#FAF5FF", "#805AD5", "#44337A", 12, True), "p3_box", 40, 180, 460, 75)

add_vertex("peo_1", "Attendance Punch (Check-In / Out)<br>Record in/out timestamps, calculate work hours,<br>validate geofence context for daily presence", card_style("#FFFFFF", "#3182CE", "#1A365D", 12), "p3_box", 40, 300, 460, 75)
add_vertex("peo_2", "Employee 10-State Availability Flags<br>Available • Busy • In Meeting • On Break • Training<br>DND • Remote • On Leave • Absent • Offline", card_style("#FFFFFF", "#3182CE", "#1A365D", 12), "p3_box", 540, 300, 480, 75)
add_vertex("peo_3", "Self-Service Requests Workflow<br>Leave • Permission • Resource • Guidance<br>Routed to Manager for approval / rejection", card_style("#FFFFFF", "#3182CE", "#1A365D", 12), "p3_box", 1060, 300, 480, 75)

add_vertex("peo_4", "Event-Driven Notifications Engine<br>New task assigned • Deadline reminder • Overdue flag<br>Review feedback • Request decision • Announcement", card_style("#FFFFFF", "#3182CE", "#1A365D", 12), "p3_box", 540, 420, 480, 75)

add_vertex("p3_rule_note", "COMMERCIAL INTEGRITY RULE: CIRIL CRM owns lead records and commercial transactions. IOTS tracks HYD coordination tasks, follow-up accountability, evidence collection, and 7.5% royalty health monitoring for the Chairman.", 
           card_style("#EDF2F7", "#CBD5E0", "#4A5568", 11), "p3_box", 40, 560, 1520, 45)

add_edge("cm_1", "cm_2")
add_edge("cm_2", "cm_3")
add_edge("cm_3", "cm_4")
add_edge("cm_4", "cm_5")
add_edge("cm_5", "cm_6")
add_edge("peo_1", "peo_2")
add_edge("peo_2", "peo_3")
add_edge("peo_3", "peo_4")

# =========================================================================
# CENTRAL DATA BRIDGE: SHARED OPERATIONAL RECORDS & AUDIT DATABASE
# =========================================================================
print("Step 5: Building Central Data Bridge...")
add_vertex("sec_data_bridge", "CENTRAL DATA BRIDGE • SHARED OPERATIONAL RECORDS & IMMUTABLE SYSTEM AUDIT LOG", 
           container_style("#FAF5FF", "#553C9A", "#FFFFFF", 40), "1", 60, 4950, 5080, 360)

add_vertex("db_audit", "IMMUTABLE AUDIT LOG<br>Every action captures:<br>• Employee Identity<br>• Active Role Context<br>• Timestamp & GPS<br>• Action & Object<br>• Before / After State<br>• Completely Tamper-Proof", 
           card_style("#FFFFFF", "#805AD5", "#44337A", 12, True), "sec_data_bridge", 100, 60, 1400, 140)

add_vertex("db_store", "CENTRAL OPERATIONAL ACTIVITY STORE<br>Shared Normalized Database Capturing All System Activity:<br>User Profiles • Geofence Perimeters • Task Lifecycle Events • Revision Versions<br>Time / Effort Logs • Uploaded Evidence • Attendance Records • Requests & Decisions<br>CRM Deal Reconciliations • 7.5% Royalty Collections • Company Announcements", 
           cylinder_style("#553C9A", "#44337A", "#FFFFFF"), "sec_data_bridge", 1600, 60, 1900, 140)

add_vertex("db_guarantee", "SYSTEM ARCHITECTURAL GUARANTEES<br>• Single Task Identity: One ID preserved across all transfers/extensions<br>• Append-Only Activities: Work notes & evidence don't alter state<br>• Session Segregation: Audit log isolates role context per transaction<br>• Reassignment Integrity: Transfers retain full previous ownership history", 
           card_style("#FFFFFF", "#805AD5", "#44337A", 12, True), "sec_data_bridge", 3600, 60, 1400, 140)

# Connect Layer 2 Outputs to Central Data Bridge
add_edge("p1_box", "db_store", "Record Task Closures & Evidence", exitX=0.5, exitY=1, entryX=0.2, entryY=0)
add_edge("p2_box", "db_store", "Record Overdue & Reassignment Events", exitX=0.5, exitY=1, entryX=0.5, entryY=0)
add_edge("p3_box", "db_store", "Record Attendance, Requests & Royalty Status", exitX=0.5, exitY=1, entryX=0.8, entryY=0)

# =========================================================================
# LAYER 3: INTELLIGENCE, ANALYTICS & CHAIRMAN OVERSIGHT
# =========================================================================
print("Step 6: Building Layer 3...")
add_vertex("sec_layer3", "LAYER 3 • INTELLIGENCE, ANALYTICS & EXECUTIVE OVERSIGHT LAYER", 
           container_style("#F7FAFC", "#44337A", "#FFFFFF", 45), "1", 60, 5340, 5080, 2140)

# Connect Central Data Bridge to Layer 3
add_edge("db_store", "sec_layer3", "ETL Stream: Feed Verified Operational Records", exitX=0.5, exitY=1, entryX=0.5, entryY=0)

# 6 Analytics Engines (width 790 each, gap 30)
engines = [
    ("eng_1", "1. PERFORMANCE ANALYTICS<br>• Task completion rate (counts & %)<br>• On-time delivery vs. late completions<br>• Elapsed calendar time vs. active effort<br>• Individual, manager & team productivity", "#EBF8FF", "#3182CE", "#1A365D"),
    ("eng_2", "2. WORKLOAD & CAPACITY<br>• Active, assigned, blocked & review queues<br>• Individual vs. team capacity utilization<br>• Overdue task aging distribution by owner<br>• Workload balancing & bottleneck alerts", "#FFFAF0", "#DD6B20", "#7B341E"),
    ("eng_3", "3. ATTENDANCE & LOCATION<br>• Punctuality, tardiness & absence trends<br>• Approved leaves separated from unexcused<br>• Remote vs. unknown location jump trends<br>• Work hour calculations & shift compliance", "#F0FFF4", "#38A169", "#1C4532"),
    ("eng_4", "4. EXCEPTION & RISK HEATMAPS<br>• Chronic task reassignment clusters<br>• Unresolved departmental blocker tickets<br>• SLA breach probabilities on key verticals<br>• Low / Medium / High severity risk matrix", "#FFF5F5", "#E53E3E", "#9B2C2C"),
    ("eng_5", "5. HISTORICAL TRAJECTORIES<br>• Day-over-day operational throughput<br>• Week-over-week team velocity changes<br>• Month-over-month target achievement<br>• Comparative trend tracking over quarters", "#FAF5FF", "#805AD5", "#44337A"),
    ("eng_6", "6. COMMERCIAL & RECOGNITION<br>• Commercial deal velocity & pipeline size<br>• 7.5% royalty health (due vs. collected)<br>• Monthly KPI standings by employee role<br>• 3-month excellence commendation tracking", "#FEFCBF", "#D69E2E", "#744210")
]

x_cursor = 80
for eid, elabel, efill, estroke, efont in engines:
    add_vertex(eid, elabel, card_style(efill, estroke, efont, 12, True), "sec_layer3", x_cursor, 70, 790, 110)
    x_cursor += 820

# Multi-Tier Report Generation
add_vertex("rep_banner", "REPORT GENERATION ENGINE • SCOPED AUTOMATED EXPORTS ACROSS REPORTING PERIODS", 
           card_style("#EDF2F7", "#CBD5E0", "#2D3748", 13, True), "sec_layer3", 80, 205, 4920, 40)

add_vertex("rep_daily", "DAILY OPERATIONAL DIGEST<br>• Today's completed tasks & active deliverables<br>• Newly overdue tasks & active blocker tickets<br>• Daily attendance summary & off-site location flags", card_style("#FFFFFF", "#4A5568", "#1A202C", 12), "sec_layer3", 80, 260, 1600, 80)
add_vertex("rep_weekly", "WEEKLY MANAGEMENT SUMMARY<br>• Team delivery throughput & on-time percentages<br>• Workload distribution & capacity rebalancing needs<br>• Deal coordination progress & blocker resolution rates", card_style("#FFFFFF", "#4A5568", "#1A202C", 12), "sec_layer3", 1740, 260, 1600, 80)
add_vertex("rep_monthly", "MONTHLY / PERIOD APPRAISAL REPORT<br>• Role-specific KPI achievement against baselines<br>• Monthly performance standing calculations<br>• Comprehensive appraisal report format exports (PDF/Excel)", card_style("#FFFFFF", "#4A5568", "#1A202C", 12), "sec_layer3", 3400, 260, 1600, 80)

# 10 Role-Scoped Dashboards
add_vertex("dash_banner", "ROLE-BASED DASHBOARD PROJECTIONS • DYNAMIC DATA VIEWS FILTERED BY ACTIVE ROLE CONTEXT", 
           card_style("#EDF2F7", "#CBD5E0", "#2D3748", 13, True), "sec_layer3", 80, 360, 4920, 40)

roles_dash = [
    ("CHAIRMAN (Vijay Sir)", "Bird's-eye enterprise health, 7.5% royalty collections, attendance summaries, 'Requires Attention' cluster, award sign-off"),
    ("GENERAL MANAGER", "Branch operations, Board items, statutory audit compliance, finance tracking, prospective member discussions"),
    ("SENIOR MANAGER", "Cross-team capacity balancing, SLA/deadline risk mitigation, high-impact escalation approval queue, comparative stats"),
    ("LEAD MANAGER (Manasa)", "Own vertical team queues, deal royalty follow-up, Retail/L&W/Land/Hotel calls, Bitra website updates, lead exchange"),
    ("SUPER ADMIN", "Platform governance, master organization config, RBAC security, high-level account control, compliance audit viewer"),
    ("IT SYSTEM ANALYST", "Technical infrastructure, server uptime, API rate limits, database deadlocks, anomalous login security logs, bug fixes"),
    ("ADMIN", "User profile provisioning, approved geofence perimeter coordinates, attendance exceptions, global queue cleanup, announcements"),
    ("EXECUTIVE", "Personal assigned work queue, time & progress entry, evidence attachment, blocker raising, manager revision cycles"),
    ("BDE (Bhavani)", "Prospect broker research, Upturnly & 99acres portal queues, WhatsApp outreach campaigns, cold calling logs, follow-up queue"),
    ("CREATIVES ASSOCIATE (Harshitha)", "Social media channels, content pipeline (Brief→Published), v1.0/v1.1 graphics versioning, Office calls, report proofreading")
]

dash_x = 80
dash_y = 415
for rname, rdesc in roles_dash[:5]:
    add_vertex(f"dash_{dash_x}", f"<b>{rname}</b><br>{rdesc}", card_style("#FFFFFF", "#718096", "#1A202C", 11), "sec_layer3", dash_x, dash_y, 960, 75)
    dash_x += 990

dash_x = 80
dash_y = 500
for rname, rdesc in roles_dash[5:]:
    add_vertex(f"dash_{dash_x}_b", f"<b>{rname}</b><br>{rdesc}", card_style("#FFFFFF", "#718096", "#1A202C", 11), "sec_layer3", dash_x, dash_y, 960, 75)
    dash_x += 990

# Chairman Executive Interface (Vijay Sir)
add_vertex("ch_container", "CHAIRMAN EXECUTIVE INTERFACE • STRATEGIC OVERSIGHT & GOVERNANCE (Vijay Sir)", 
           container_style("#FFFFF0", "#B7791F", "#744210", 40), "sec_layer3", 80, 600, 4920, 650)

add_vertex("ch_panel_1", "1. BIRD'S-EYE OPERATIONAL & COMMERCIAL INTELLIGENCE<br>• Complete visibility across HYD branch and multi-office coordination<br>• Monitors high-level commercial deal flow & 7.5% royalty health<br>• Inspects company-wide attendance audits, remote/unknown GPS trends<br>• Evaluates vertical performance trends (Retail, Land, Hotel, Logistics)", 
           card_style("#FFFFFF", "#D69E2E", "#744210", 12, True), "ch_container", 40, 60, 1560, 130)

add_vertex("ch_panel_2", "2. EXECUTIVE 'REQUIRES ATTENTION' INTERFACE<br>• Real-time aggregation of systemic operational bottlenecks:<br>  - Overdue task clusters missing client/member deadlines<br>  - Repeated task reassignments signaling capability/capacity failure<br>  - Unresolved departmental blocker tickets escalated from managers<br>• Inspect underlying evidence & direct follow-ups to responsible GM/Managers", 
           card_style("#FFF5F5", "#E53E3E", "#9B2C2C", 12, True), "ch_container", 1660, 60, 1600, 130)

add_vertex("ch_panel_3", "3. QUARTERLY REWARD, RECOGNITION & ANNOUNCEMENTS<br>• Reviews monthly performance standings across verified objective KPIs<br>• Personally signs off on 3-consecutive-month excellence commendations<br>• Publishes official enterprise-wide announcements to all workspaces<br>• Exports comprehensive employee reports in tailored appraisal formats", 
           card_style("#FFFFFF", "#D69E2E", "#744210", 12, True), "ch_container", 3320, 60, 1560, 130)

add_vertex("ch_governance_boundary", "CHAIRMAN STRATEGIC GOVERNANCE BOUNDARY:<br>Vijay Sir holds executive bird's-eye oversight, strategic intervention authority, appraisal sign-off, and company-wide broadcast rights. In accordance with system governance, the Chairman CANNOT reset routine employee passwords or perform everyday task reassignments—operational delegation remains strictly with authorized Admins and Lead/Senior Managers.", 
           card_style("#FFFFF0", "#B7791F", "#744210", 13, True), "ch_container", 40, 210, 4840, 60)

# Connect Reporting to Chairman Panels
add_edge("rep_daily", "ch_panel_2", "Escalate Overdue Clusters")
add_edge("rep_weekly", "ch_panel_1", "Feed Operational Summaries")
add_edge("rep_monthly", "ch_panel_3", "Feed Monthly KPI Standings")

# Footer
add_vertex("ftr_main", "CIRIL INTERNAL OPERATIONS TRACKING SYSTEM (IOTS) • ARCHITECTURAL COMPLIANCE VERIFICATION<br>Designed strictly adhering to ciril_crm_detail.pdf, Construct.txt, and system requirements. Unifies 10 organizational roles, provides dynamic multi-role context switching, enforces zero orphaned tasks, guarantees single immutable task identity, reconciles 7.5% commercial royalties, and delivers real-time executive intelligence for the Chairman.", 
           card_style("#1A365D", "#1A365D", "#FFFFFF", 12, True), "1", 60, 7500, 5080, 50)

# Save to destination
output_path = "gemini-design/file.drawio"
os.makedirs(os.path.dirname(output_path), exist_ok=True)
tree = ET.ElementTree(root)
tree.write(output_path, encoding='utf-8', xml_declaration=True)
print(f"SUCCESS: Masterpiece generated and written to {output_path} (Size: {os.path.getsize(output_path)} bytes)")
