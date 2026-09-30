import os
import xml.etree.ElementTree as ET
import xml.dom.minidom as minidom

def build_role_specific_flowchart():
    # Style constants
    FONT_VERDANA = "fontFamily=Verdana;"
    FONT_ARCH = "fontFamily=Architects Daughter;"
    
    # Layer Bounding Box Style
    STYLE_LAYER_BOX = (
        "rounded=0;whiteSpace=wrap;html=1;dashed=1;dashPattern=8 8;fillColor=none;"
        "strokeColor=#64748b;strokeWidth=2;verticalAlign=top;align=left;spacingLeft=30;spacingTop=20;"
        + FONT_ARCH + "fontSize=20;fontStyle=1;fontColor=#334155;"
    )
    
    # Sub-Domain Container Box (for grouping roles with plenty of breathing room)
    STYLE_DOMAIN_BOX = (
        "rounded=1;whiteSpace=wrap;html=1;dashed=1;dashPattern=4 4;fillColor=#f8fafc;strokeColor=#cbd5e1;strokeWidth=1.5;"
        "verticalAlign=top;align=center;spacingTop=15;"
        + FONT_VERDANA + "fontSize=13;fontStyle=1;fontColor=#475569;"
    )

    # Start / End Ellipse
    STYLE_START = (
        "ellipse;whiteSpace=wrap;html=1;fillColor=#dcfce7;strokeColor=#16a34a;strokeWidth=2;"
        + FONT_VERDANA + "fontSize=13;fontStyle=1;fontColor=#14532d;align=center;verticalAlign=middle;"
    )
    
    # Decision Diamond
    STYLE_RHOMBUS = (
        "rhombus;whiteSpace=wrap;html=1;fillColor=#fef3c7;strokeColor=#d97706;strokeWidth=1.5;"
        + FONT_VERDANA + "fontSize=11;fontStyle=1;fontColor=#78350f;align=center;verticalAlign=middle;"
    )
    
    # Standard Action Box (Simple English)
    STYLE_PROCESS = (
        "rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#94a3b8;strokeWidth=1.5;"
        + FONT_VERDANA + "fontSize=11;fontColor=#0f172a;align=center;verticalAlign=middle;shadow=0;"
    )
    
    # Role Headers
    STYLE_HDR_ADMIN = "rounded=1;whiteSpace=wrap;html=1;fillColor=#ede9fe;strokeColor=#7c3aed;strokeWidth=2;fontFamily=Verdana;fontSize=13;fontStyle=1;fontColor=#4c1d95;align=center;verticalAlign=middle;shadow=1;"
    STYLE_HDR_TECH = "rounded=1;whiteSpace=wrap;html=1;fillColor=#f1f5f9;strokeColor=#475569;strokeWidth=2;fontFamily=Verdana;fontSize=13;fontStyle=1;fontColor=#0f172a;align=center;verticalAlign=middle;shadow=1;"
    STYLE_HDR_GM = "rounded=1;whiteSpace=wrap;html=1;fillColor=#e0e7ff;strokeColor=#4338ca;strokeWidth=2;fontFamily=Verdana;fontSize=13;fontStyle=1;fontColor=#312e81;align=center;verticalAlign=middle;shadow=1;"
    STYLE_HDR_SRMGR = "rounded=1;whiteSpace=wrap;html=1;fillColor=#dbeafe;strokeColor=#1d4ed8;strokeWidth=2;fontFamily=Verdana;fontSize=13;fontStyle=1;fontColor=#1e3a8a;align=center;verticalAlign=middle;shadow=1;"
    STYLE_HDR_LEADMGR = "rounded=1;whiteSpace=wrap;html=1;fillColor=#e0f2fe;strokeColor=#0284c7;strokeWidth=2;fontFamily=Verdana;fontSize=13;fontStyle=1;fontColor=#0369a1;align=center;verticalAlign=middle;shadow=1;"
    STYLE_HDR_EXEC = "rounded=1;whiteSpace=wrap;html=1;fillColor=#ccfbf1;strokeColor=#0f766e;strokeWidth=2;fontFamily=Verdana;fontSize=13;fontStyle=1;fontColor=#134e4a;align=center;verticalAlign=middle;shadow=1;"
    STYLE_HDR_BDE = "rounded=1;whiteSpace=wrap;html=1;fillColor=#fef3c7;strokeColor=#d97706;strokeWidth=2;fontFamily=Verdana;fontSize=13;fontStyle=1;fontColor=#78350f;align=center;verticalAlign=middle;shadow=1;"
    STYLE_HDR_SM = "rounded=1;whiteSpace=wrap;html=1;fillColor=#fce7f3;strokeColor=#db2777;strokeWidth=2;fontFamily=Verdana;fontSize=13;fontStyle=1;fontColor=#831843;align=center;verticalAlign=middle;shadow=1;"
    STYLE_HDR_DESIGN = "rounded=1;whiteSpace=wrap;html=1;fillColor=#fae8ff;strokeColor=#a21caf;strokeWidth=2;fontFamily=Verdana;fontSize=13;fontStyle=1;fontColor=#701a75;align=center;verticalAlign=middle;shadow=1;"
    STYLE_HDR_CHAIRMAN = "rounded=1;whiteSpace=wrap;html=1;fillColor=#fee2e2;strokeColor=#b91c1c;strokeWidth=2.5;fontFamily=Verdana;fontSize=14;fontStyle=1;fontColor=#7f1d1d;align=center;verticalAlign=middle;shadow=1;"
    STYLE_HDR_REWARD = "rounded=1;whiteSpace=wrap;html=1;fillColor=#fef08a;strokeColor=#ca8a04;strokeWidth=2.5;fontFamily=Verdana;fontSize=14;fontStyle=1;fontColor=#713f12;align=center;verticalAlign=middle;shadow=1;"

    # Alert / Exception Box
    STYLE_ALERT = "rounded=1;whiteSpace=wrap;html=1;fillColor=#fee2e2;strokeColor=#ef4444;strokeWidth=1.5;fontFamily=Verdana;fontSize=11;fontColor=#991b1b;align=center;verticalAlign=middle;"
    # Success / Approval Box
    STYLE_SUCCESS = "rounded=1;whiteSpace=wrap;html=1;fillColor=#dcfce7;strokeColor=#16a34a;strokeWidth=1.5;fontFamily=Verdana;fontSize=11;fontColor=#14532d;align=center;verticalAlign=middle;"
    # Warning / Notice Box
    STYLE_WARNING = "rounded=1;whiteSpace=wrap;html=1;fillColor=#ffedd5;strokeColor=#f97316;strokeWidth=1.5;fontFamily=Verdana;fontSize=11;fontColor=#9a3412;align=center;verticalAlign=middle;"
    # Callout
    STYLE_CALLOUT = "shape=wedgeCallout;whiteSpace=wrap;html=1;fillColor=#fef9c3;strokeColor=#ca8a04;strokeWidth=1;fontFamily=Verdana;fontSize=10;fontStyle=1;fontColor=#854d0e;align=center;verticalAlign=middle;"
    # Master Audit Terminus
    STYLE_AUDIT_TERMINUS = "rounded=1;whiteSpace=wrap;html=1;fillColor=#0f172a;strokeColor=#38bdf8;strokeWidth=2.5;fontFamily=Verdana;fontSize=13;fontStyle=1;fontColor=#f8fafc;align=center;verticalAlign=middle;shadow=1;"

    # Orthogonal Edges
    STYLE_EDGE = "edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;endArrow=blockThin;endSize=8;startSize=8;endFill=1;strokeWidth=1.5;strokeColor=#475569;"
    STYLE_EDGE_DASHED = "edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;dashed=1;dashPattern=6 4;endArrow=blockThin;endSize=8;startSize=8;endFill=1;strokeWidth=1.5;strokeColor=#64748b;"
    STYLE_EDGE_DATA = "edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;dashed=1;dashPattern=4 4;endArrow=blockThin;endSize=8;startSize=8;endFill=1;strokeWidth=1.5;strokeColor=#0284c7;"
    STYLE_EDGE_LABEL = "edgeLabel;html=1;align=center;verticalAlign=middle;resizable=0;points=[];" + FONT_ARCH + "fontSize=11;fontStyle=1;fontColor=#334155;backgroundColor=#ffffff;"

    mxfile = ET.Element("mxfile", {
        "host": "app.diagrams.net",
        "modified": "2026-09-30T17:00:00.000Z",
        "agent": "CIRIL-Enterprise-Architect",
        "version": "24.0.0",
        "type": "device"
    })
    
    diagram = ET.SubElement(mxfile, "diagram", {
        "id": "IOTS_Role_Architecture_V2",
        "name": "IOTS Role-Specific Enterprise Operations Flowchart"
    })
    
    model = ET.SubElement(diagram, "mxGraphModel", {
        "dx": "3200", "dy": "2200", "grid": "1", "gridSize": "10",
        "guides": "1", "tooltips": "1", "connect": "1", "arrows": "1",
        "fold": "1", "page": "1", "pageScale": "1",
        "pageWidth": "3300", "pageHeight": "4800", "math": "0", "shadow": "0"
    })
    
    root = ET.SubElement(model, "root")
    ET.SubElement(root, "mxCell", {"id": "0"})
    ET.SubElement(root, "mxCell", {"id": "1", "parent": "0"})

    def add_node(cid, val, x, y, w, h, style, parent="1"):
        c = ET.SubElement(root, "mxCell", {
            "id": cid, "value": val, "style": style, "vertex": "1", "parent": parent
        })
        ET.SubElement(c, "mxGeometry", {
            "x": str(x), "y": str(y), "width": str(w), "height": str(h), "as": "geometry"
        })
        return c

    def add_edge(eid, src, tgt, label="", style=STYLE_EDGE, exitX=None, exitY=None, entryX=None, entryY=None, points=None):
        edge_style = style
        if exitX is not None and exitY is not None:
            edge_style += f"exitX={exitX};exitY={exitY};exitDx=0;exitDy=0;"
        if entryX is not None and entryY is not None:
            edge_style += f"entryX={entryX};entryY={entryY};entryDx=0;entryDy=0;"
        c = ET.SubElement(root, "mxCell", {
            "id": eid, "value": "", "style": edge_style, "edge": "1", "parent": "1", "source": src, "target": tgt
        })
        geom = ET.SubElement(c, "mxGeometry", {"relative": "1", "as": "geometry"})
        if points:
            pts = ET.SubElement(geom, "Array", {"as": "points"})
            for px, py in points:
                ET.SubElement(pts, "mxPoint", {"x": str(px), "y": str(py)})
        if label:
            lbl = ET.SubElement(root, "mxCell", {
                "id": f"{eid}_lbl", "value": label, "style": STYLE_EDGE_LABEL, "vertex": "1", "connectable": "0", "parent": eid
            })
            ET.SubElement(lbl, "mxGeometry", {"x": "-0.1", "y": "0", "relative": "1", "as": "geometry"})
        return c

    # Canvas width: 3300. Usable area x = 60 to 3240 (width 3180). Center is x = 1650.
    
    # =========================================================================
    # LAYER 1: AUTHENTICATION, GEOLOCATION & IDENTITY ROUTING (Top: y = 40..680)
    # =========================================================================
    add_node(
        "BOX_L1",
        "LAYER 1: The Secure Login, Location Verification & Role Routing Layer",
        60, 40, 3180, 640, STYLE_LAYER_BOX
    )
    
    # Spine centered at x = 1650
    add_node("L1_START", "START", 1590, 75, 120, 40, STYLE_START)
    add_node("L1_LOGIN", "<b>Employee Logs In</b><br><font size=\"1\">(Single Company Portal for All 11 Roles)</font>", 1490, 140, 320, 50, STYLE_PROCESS)
    add_node("L1_CHECK_CRED", "Check<br>Credentials?", 1560, 220, 180, 80, STYLE_RHOMBUS)
    
    # Invalid loop
    add_node("L1_INVALID_NOTICE", "<b>Notice: Wrong Details</b><br><font size=\"1\">(Record Failed Attempt &amp; Protect Account)</font>", 1160, 235, 280, 50, STYLE_ALERT)
    
    # Valid -> Location check
    add_node("L1_CHECK_LOC", "Verify Physical<br>Location on Map?", 1560, 335, 180, 80, STYLE_RHOMBUS)
    add_node("L1_OFFSITE_NOTICE", "<b>Mark Session as &quot;Remote / Off-Site&quot;</b><br><font size=\"1\">(Friendly Notice: Working from Home or Client Site)</font>", 1160, 350, 300, 50, STYLE_WARNING)
    add_node("L1_AUDIT_LOG_ENTRY", "<b>Record Login &amp; Location History</b><br><font size=\"1\">(Saves Map Address &amp; Exact Time to Daily Register)</font>", 1490, 450, 320, 50, STYLE_SUCCESS)
    
    # Decide Role
    add_node("L1_DECIDE_ROLE", "Identify Authorized<br>Employee Role?", 1560, 535, 180, 80, STYLE_RHOMBUS)
    add_node("L1_CALLOUT_MULTI", "<b>Multi-Role Support:</b><br><font size=\"1\">Employees with dual duties (e.g. Harshitha)<br>switch workspaces with 1-click inside portal.</font>", 1800, 545, 270, 60, STYLE_CALLOUT)

    # Connections Layer 1
    add_edge("E1_1", "L1_START", "L1_LOGIN")
    add_edge("E1_2", "L1_LOGIN", "L1_CHECK_CRED")
    add_edge("E1_3", "L1_CHECK_CRED", "L1_INVALID_NOTICE", label="(Wrong Details)", exitX=0, exitY=0.5, entryX=1, entryY=0.5)
    add_edge("E1_4", "L1_INVALID_NOTICE", "L1_START", label="(Try Again)", exitX=0.5, exitY=0, entryX=0, entryY=0.5, points=[(1300, 95)])
    add_edge("E1_5", "L1_CHECK_CRED", "L1_CHECK_LOC", label="(Valid Details)", exitX=0.5, exitY=1, entryX=0.5, entryY=0)
    add_edge("E1_6", "L1_CHECK_LOC", "L1_OFFSITE_NOTICE", label="(Outside Office)", exitX=0, exitY=0.5, entryX=1, entryY=0.5)
    add_edge("E1_7", "L1_CHECK_LOC", "L1_AUDIT_LOG_ENTRY", label="(In Approved Office)", exitX=0.5, exitY=1, entryX=0.5, entryY=0)
    add_edge("E1_8", "L1_OFFSITE_NOTICE", "L1_AUDIT_LOG_ENTRY", label="(Audit Off-Site)", exitX=0.5, exitY=1, entryX=0, entryY=0.5, points=[(1310, 475)])
    add_edge("E1_9", "L1_AUDIT_LOG_ENTRY", "L1_DECIDE_ROLE")

    # =========================================================================
    # LAYER 2: THE MANAGEMENT, OPERATIONS & EXECUTION LAYER (y = 720..2520)
    # Structured into 3 Distinct Role Columns across 3180 px:
    # 
    # Left Column (x = 80..840, width 760): GOVERNANCE & OFFICE ADMINISTRATION
    #   - Super Admin & IT System Analyst
    #   - Office Admin
    #
    # Center Column (x = 880..2020, width 1140): OPERATIONAL & COMMERCIAL MANAGEMENT
    #   - General Manager (Ipsheeta)
    #   - Senior Manager
    #   - Lead Manager (Manasa) - Core Task Engine & QA Reviews
    #
    # Right Column (x = 2060..3200, width 1140): FRONTLINE OPERATIONS & SPECIALISTS
    #   - Operational Executive
    #   - Business Development Executive (Bhavani)
    #   - Social Media Manager (Harshitha)
    #   - Graphic Designer
    # =========================================================================
    add_node(
        "BOX_L2",
        "LAYER 2: Management, Operations & Frontline Execution Layer (Role-Specific Workflows)",
        60, 720, 3180, 1820, STYLE_LAYER_BOX
    )

    # -------------------------------------------------------------------------
    # LEFT COLUMN: GOVERNANCE & OFFICE ADMINISTRATION (x = 100 to 820)
    # -------------------------------------------------------------------------
    add_node("DOM_GOV_BOX", "<b>GOVERNANCE &amp; SYSTEM ADMINISTRATION DOMAIN</b>", 100, 780, 720, 1720, STYLE_DOMAIN_BOX)
    
    # Role: Super Admin & IT System Analyst (Equal System Authority)
    add_node("ROLE_TECH_HDR", "<b>1. SUPER ADMIN &amp; IT SYSTEM ANALYST</b><br><font size=\"1\">(System Rules, Security Control &amp; Technical Health)</font>", 140, 830, 640, 50, STYLE_HDR_TECH)
    add_node("TECH_ACT_1", "Configure Master System Rules &amp; Role Permissions", 170, 900, 580, 35, STYLE_PROCESS)
    add_node("TECH_ACT_2", "Monitor Server Speed, Database Health &amp; Map Services", 170, 950, 580, 35, STYLE_PROCESS)
    add_node("TECH_ACT_3", "Watch for Security Warnings (Sudden Location Jumps, Double Logins)", 170, 1000, 580, 35, STYLE_PROCESS)
    add_node("TECH_ACT_4", "Review Full System Audit Trails &amp; Export Regulatory Reports", 170, 1050, 580, 35, STYLE_PROCESS)
    add_node("TECH_ACT_5", "1-Click Safety Logoff for Suspicious Sessions with Incident Note", 170, 1100, 580, 35, STYLE_ALERT)

    add_edge("E_TECH_1", "ROLE_TECH_HDR", "TECH_ACT_1")
    add_edge("E_TECH_2", "TECH_ACT_1", "TECH_ACT_2")
    add_edge("E_TECH_3", "TECH_ACT_2", "TECH_ACT_3")
    add_edge("E_TECH_4", "TECH_ACT_3", "TECH_ACT_4")
    add_edge("E_TECH_5", "TECH_ACT_4", "TECH_ACT_5")

    # Role: Office Admin (Routine Administration)
    add_node("ROLE_ADMIN_HDR", "<b>2. OFFICE ADMIN</b><br><font size=\"1\">(Staff Accounts, Office Locations &amp; Company Notices)</font>", 140, 1190, 640, 50, STYLE_HDR_ADMIN)
    add_node("ADM_ACT_1", "Create New Staff Profiles (Employee ID, Branch, Reporting Manager)", 170, 1260, 580, 35, STYLE_PROCESS)
    add_node("ADM_ACT_2", "Set Office Boundaries on Map (Geofence Distance in Meters)", 170, 1310, 580, 35, STYLE_PROCESS)
    add_node("ADM_ACT_3", "Define Standard Office Shifts (9:30 AM - 6:30 PM &amp; 15-Min Grace)", 170, 1360, 580, 35, STYLE_PROCESS)
    add_node("ADM_ACT_4", "Review Daily Attendance &amp; Flag Repeated Late Logins (>3 Times)", 170, 1410, 580, 35, STYLE_PROCESS)
    add_node("ADM_ACT_5", "Oversee Company-Wide Tasks &amp; Clean Up Abandoned Items", 170, 1460, 580, 35, STYLE_PROCESS)
    add_node("ADM_ACT_6", "Publish Official Company Notices to All Staff or Selected Teams", 170, 1510, 580, 35, STYLE_PROCESS)

    add_edge("E_ADM_1", "ROLE_ADMIN_HDR", "ADM_ACT_1")
    add_edge("E_ADM_2", "ADM_ACT_1", "ADM_ACT_2")
    add_edge("E_ADM_3", "ADM_ACT_2", "ADM_ACT_3")
    add_edge("E_ADM_4", "ADM_ACT_3", "ADM_ACT_4")
    add_edge("E_ADM_5", "ADM_ACT_4", "ADM_ACT_5")
    add_edge("E_ADM_6", "ADM_ACT_5", "ADM_ACT_6")

    # -------------------------------------------------------------------------
    # CENTER COLUMN: OPERATIONAL & COMMERCIAL MANAGEMENT (x = 880 to 2040)
    # -------------------------------------------------------------------------
    add_node("DOM_MGR_BOX", "<b>OPERATIONAL &amp; COMMERCIAL MANAGEMENT DOMAIN</b>", 880, 780, 1160, 1720, STYLE_DOMAIN_BOX)

    # Role: General Manager (Staff: Ipsheeta)
    add_node("ROLE_GM_HDR", "<b>3. GENERAL MANAGER (Staff: Ipsheeta)</b><br><font size=\"1\">(Board Governance, Accounts &amp; Finance, Legal &amp; Expansion)</font>", 920, 830, 520, 50, STYLE_HDR_GM)
    add_node("GM_ACT_1", "Coordinate Board Meetings, Agendas &amp; Track Agreed Decisions", 940, 900, 480, 35, STYLE_PROCESS)
    add_node("GM_ACT_2", "Track Fee Invoices, Member Royalty Remittances (7.5%) &amp; Expenses", 940, 950, 480, 35, STYLE_PROCESS)
    add_node("GM_ACT_3", "Ensure Legal Agreements, NDAs &amp; Regulatory Filings are on Schedule", 940, 1000, 480, 35, STYLE_PROCESS)
    add_node("GM_ACT_4", "Lead Expansion Presentations to New Brokerage Member Candidates", 940, 1050, 480, 35, STYLE_PROCESS)
    add_node("GM_ACT_5", "Oversee Annual &amp; Zonal Real Estate Conferences &amp; Resolve Senior Disputes", 940, 1100, 480, 35, STYLE_PROCESS)

    add_edge("E_GM_1", "ROLE_GM_HDR", "GM_ACT_1")
    add_edge("E_GM_2", "GM_ACT_1", "GM_ACT_2")
    add_edge("E_GM_3", "GM_ACT_2", "GM_ACT_3")
    add_edge("E_GM_4", "GM_ACT_3", "GM_ACT_4")
    add_edge("E_GM_5", "GM_ACT_4", "GM_ACT_5")

    # Role: Senior Manager
    add_node("ROLE_SRMGR_HDR", "<b>4. SENIOR MANAGER</b><br><font size=\"1\">(Cross-Team Workload Balancing &amp; SLA Delivery Assurance)</font>", 1480, 830, 520, 50, STYLE_HDR_SRMGR)
    add_node("SRMGR_ACT_1", "Compare Workload Distribution Across Operations, BD &amp; Creative", 1500, 900, 480, 35, STYLE_PROCESS)
    add_node("SRMGR_ACT_2", "Early Warning Check: Identify Teams at Risk of Missing Deadlines", 1500, 950, 480, 35, STYLE_PROCESS)
    add_node("SRMGR_ACT_3", "Evaluate Major Extension Requests (>3 Days) Escalated by Lead Managers", 1500, 1000, 480, 35, STYLE_PROCESS)
    add_node("SRMGR_ACT_4", "Rebalance Staffing Resources Between Overloaded &amp; Free Teams", 1500, 1050, 480, 35, STYLE_PROCESS)
    add_node("SRMGR_ACT_5", "Escalate Unresolvable Commercial Blockers to General Manager", 1500, 1100, 480, 35, STYLE_ALERT)

    add_edge("E_SR_1", "ROLE_SRMGR_HDR", "SRMGR_ACT_1")
    add_edge("E_SR_2", "SRMGR_ACT_1", "SRMGR_ACT_2")
    add_edge("E_SR_3", "SRMGR_ACT_2", "SRMGR_ACT_3")
    add_edge("E_SR_4", "SRMGR_ACT_3", "SRMGR_ACT_4")
    add_edge("E_SR_5", "SRMGR_ACT_4", "SRMGR_ACT_5")

    # Role: Lead Manager (Staff: Manasa) - The Direct Team Command & Task Engine
    add_node("ROLE_LEADMGR_HDR", "<b>5. LEAD MANAGER (Staff: Manasa) \u2013 DIRECT TEAM COMMAND &amp; TASK ENGINE</b><br><font size=\"1\">(Daily Work Allocation, Workload Radar, QA Quality Reviews &amp; Overdue Resolution)</font>", 920, 1190, 1080, 55, STYLE_HDR_LEADMGR)
    
    # Lead Manager's Operational Functions (Left side of sub-panel)
    add_node("LM_TEAM_RADAR", "<b>Live Team Radar &amp; Availability:</b><br><font size=\"1\">View Available, Busy, On Break, or On Leave Staff</font>", 940, 1270, 320, 45, STYLE_PROCESS)
    add_node("LM_DEAL_SPLIT", "<b>Commercial Deals &amp; Royalty Verification:</b><br><font size=\"1\">Verify 30/70 Fee Split &amp; 7.5% CIRIL Royalty</font>", 940, 1335, 320, 45, STYLE_PROCESS)
    add_node("LM_LEAVE_APP", "<b>Review Leave &amp; Permission Requests:</b><br><font size=\"1\">1-Click Approve or Decline with Note</font>", 940, 1400, 320, 45, STYLE_PROCESS)

    # Lead Manager's Core Task Lifecycle Engine (Center & Right of sub-panel)
    add_node("LM_TASK_CREATE", "<b>1. Create Task:</b> Set Scope, Deliverables &amp; Clear Acceptance Criteria", 1300, 1270, 680, 40, STYLE_PROCESS)
    add_node("LM_TASK_SLA", "<b>2. Set Target Deadline &amp; Priority Level:</b> Low, Normal, High, or Urgent", 1300, 1330, 680, 40, STYLE_PROCESS)
    add_node("LM_TASK_CAP", "<b>3. Check Employee Workload Capacity:</b> Prevent Loading Overburdened Staff", 1300, 1390, 680, 40, STYLE_PROCESS)
    add_node("LM_TASK_ASSIGN", "<b>4. Assign to Employee:</b> Real-Time Notification &amp; Workspace Handover", 1300, 1450, 680, 40, STYLE_PROCESS)
    
    add_node("LM_TASK_STATUS_CHK", "Task State?", 1550, 1515, 180, 70, STYLE_RHOMBUS)
    add_node("LM_TASK_QUEUED", "Task Queued in Staff Workspace<br><font size=\"1\">(Awaiting Employee Start)</font>", 1300, 1615, 230, 45, STYLE_PROCESS)

    # Overdue Task Resolution (Lead Manager)
    add_node("LM_OD_ALERT", "<b>Deadline Passed (OVERDUE Alarm)</b><br><font size=\"1\">System Demands Mandatory Manager Action</font>", 940, 1680, 320, 45, STYLE_ALERT)
    add_node("LM_OD_DECIDE", "Overdue<br>Intervention?", 1010, 1750, 180, 70, STYLE_RHOMBUS)
    add_node("LM_OD_EXTEND", "Grant Deadline Extension<br><font size=\"1\">(Requires Mandatory Business Reason)</font>", 940, 1845, 320, 40, STYLE_PROCESS)
    add_node("LM_OD_REASSIGN", "Reassign to Available Staff<br><font size=\"1\">(Handover Context &amp; New Deadline)</font>", 940, 1905, 320, 40, STYLE_WARNING)

    # Quality Review & Approval Workflow (Lead Manager)
    add_node("LM_QA_INSPECT", "<b>Review Finished Deliverables</b><br><font size=\"1\">(Inspects Uploaded Files, Reports, or Spreadsheets)</font>", 1400, 1680, 480, 45, STYLE_PROCESS)
    add_node("LM_QA_DECIDE", "Deliverables Meet<br>Standards?", 1550, 1750, 180, 70, STYLE_RHOMBUS)
    add_node("LM_QA_REVISE", "<b>Return for Corrections:</b><br><font size=\"1\">Provide Itemized Change Notes (Revision Cycle)</font>", 1680, 1845, 300, 45, STYLE_WARNING)
    add_node("LM_QA_APPROVE", "<b>Approve &amp; Close Task:</b><br><font size=\"1\">Credit 100-Point Monthly Performance Points</font>", 1330, 1845, 310, 45, STYLE_SUCCESS)

    # Connections Lead Manager
    add_edge("E_LM_0", "ROLE_LEADMGR_HDR", "LM_TASK_CREATE")
    add_edge("E_LM_T1", "ROLE_LEADMGR_HDR", "LM_TEAM_RADAR")
    add_edge("E_LM_T2", "LM_TEAM_RADAR", "LM_DEAL_SPLIT")
    add_edge("E_LM_T3", "LM_DEAL_SPLIT", "LM_LEAVE_APP")
    add_edge("E_LM_1", "LM_TASK_CREATE", "LM_TASK_SLA")
    add_edge("E_LM_2", "LM_TASK_SLA", "LM_TASK_CAP")
    add_edge("E_LM_3", "LM_TASK_CAP", "LM_TASK_ASSIGN")
    add_edge("E_LM_4", "LM_TASK_ASSIGN", "LM_TASK_STATUS_CHK")
    add_edge("E_LM_ST_Q", "LM_TASK_STATUS_CHK", "LM_TASK_QUEUED", label="(Assigned)", exitX=0, exitY=0.5, entryX=0.5, entryY=0)
    add_edge("E_LM_OD_TRIG", "LM_TASK_STATUS_CHK", "LM_OD_ALERT", label="(Overdue)", exitX=0, exitY=1, entryX=0.5, entryY=0, points=[(1100, 1575)])
    add_edge("E_LM_OD_1", "LM_OD_ALERT", "LM_OD_DECIDE")
    add_edge("E_LM_OD_EXT", "LM_OD_DECIDE", "LM_OD_EXTEND", label="(Extend)", exitX=0.5, exitY=1, entryX=0.5, entryY=0)
    add_edge("E_LM_OD_REASS", "LM_OD_DECIDE", "LM_OD_REASSIGN", label="(Reassign)", exitX=0, exitY=0.5, entryX=0, entryY=0.5, points=[(910, 1785), (910, 1925)])
    add_edge("E_LM_QA_1", "LM_QA_INSPECT", "LM_QA_DECIDE")
    add_edge("E_LM_QA_NO", "LM_QA_DECIDE", "LM_QA_REVISE", label="(Needs Work)", exitX=1, exitY=0.5, entryX=0.5, entryY=0)
    add_edge("E_LM_QA_YES", "LM_QA_DECIDE", "LM_QA_APPROVE", label="(Approved)", exitX=0, exitY=0.5, entryX=0.5, entryY=0)

    # -------------------------------------------------------------------------
    # RIGHT COLUMN: FRONTLINE OPERATIONS & SPECIALISTS (x = 2100 to 3220)
    # -------------------------------------------------------------------------
    add_node("DOM_EXEC_BOX", "<b>FRONTLINE OPERATIONS &amp; EXECUTION SPECIALISTS DOMAIN</b>", 2100, 780, 1120, 1720, STYLE_DOMAIN_BOX)

    # Role: Operational Executive (Core Execution Loop)
    add_node("ROLE_EXEC_HDR", "<b>6. OPERATIONAL EXECUTIVE</b><br><font size=\"1\">(Task Delivery, Daily Progress Updates &amp; Time Tracking)</font>", 2140, 830, 520, 50, STYLE_HDR_EXEC)
    add_node("EXEC_ACT_1", "Open Priority Queue &amp; Review Assignment Brief", 2160, 900, 480, 35, STYLE_PROCESS)
    add_node("EXEC_ACT_2", "<b>Execute Work &amp; Record Daily Activity:</b><br><font size=\"1\">Update Progress Slider (0-100%), Log Notes &amp; Hours</font>", 2160, 950, 480, 45, STYLE_PROCESS)
    add_node("EXEC_ACT_3", "Upload Completed Deliverables &amp; Evidence Files", 2160, 1010, 480, 35, STYLE_PROCESS)
    add_node("EXEC_DONE_CHK", "Work Ready<br>for Review?", 2310, 1060, 180, 70, STYLE_RHOMBUS)

    add_edge("E_EX_1", "ROLE_EXEC_HDR", "EXEC_ACT_1")
    add_edge("E_EX_2", "EXEC_ACT_1", "EXEC_ACT_2")
    add_edge("E_EX_3", "EXEC_ACT_2", "EXEC_ACT_3")
    add_edge("E_EX_4", "EXEC_ACT_3", "EXEC_DONE_CHK")
    add_edge("E_EX_NO", "EXEC_DONE_CHK", "EXEC_ACT_2", label="(Keep Working)", exitX=1, exitY=0.5, entryX=1, entryY=0.5, points=[(2570, 1095), (2570, 972)])
    # Ready for review connects leftwards into Lead Manager QA Inspect
    add_edge("E_EX_SUBMIT_QA", "EXEC_DONE_CHK", "LM_QA_INSPECT", label="(Submit for QA)", exitX=0, exitY=0.5, entryX=1, entryY=0.5, points=[(2050, 1095), (2050, 1702)])

    # Role: Business Development Executive (Staff: Bhavani)
    add_node("ROLE_BDE_HDR", "<b>7. BUSINESS DEVELOPMENT EXECUTIVE (Staff: Bhavani)</b><br><font size=\"1\">(Alliance Expansion Outreach, Broker Prospecting &amp; Portals)</font>", 2680, 830, 520, 50, STYLE_HDR_BDE)
    add_node("BDE_ACT_1", "Prospect Research from Official Real Estate Registers &amp; Google", 2700, 900, 480, 35, STYLE_PROCESS)
    add_node("BDE_ACT_2", "Operate Commercial Portals (Upturnly &amp; 99acres Listing Hubs)", 2700, 950, 480, 35, STYLE_PROCESS)
    add_node("BDE_ACT_3", "Execute Daily Cold Calls &amp; WhatsApp Intro Sequences", 2700, 1000, 480, 35, STYLE_PROCESS)
    add_node("BDE_ACT_4", "Maintain Follow-Up Schedule &amp; Book Intro Presentation Meetings", 2700, 1050, 480, 35, STYLE_PROCESS)
    add_node("BDE_ACT_5", "Handover Qualified Prospective Members to General Manager", 2700, 1100, 480, 35, STYLE_SUCCESS)

    add_edge("E_BD_1", "ROLE_BDE_HDR", "BDE_ACT_1")
    add_edge("E_BD_2", "BDE_ACT_1", "BDE_ACT_2")
    add_edge("E_BD_3", "BDE_ACT_2", "BDE_ACT_3")
    add_edge("E_BD_4", "BDE_ACT_3", "BDE_ACT_4")
    add_edge("E_BD_5", "BDE_ACT_4", "BDE_ACT_5")
    # Handover to GM
    add_edge("E_BD_TO_GM", "BDE_ACT_5", "GM_ACT_4", label="(Prospect Handover)", exitX=0, exitY=0.5, entryX=1, entryY=0.5, points=[(2660, 1117), (2050, 1117), (2050, 1067)])

    # Role: Social Media Manager (Staff: Harshitha)
    add_node("ROLE_SM_HDR", "<b>8. SOCIAL MEDIA MANAGER (Staff: Harshitha)</b><br><font size=\"1\">(Content Pipeline, Quarterly Reports Proofreading &amp; Office Calls)</font>", 2140, 1190, 520, 50, STYLE_HDR_SM)
    add_node("SM_ACT_1", "Manage Content Pipeline: Brief \u2192 Draft \u2192 Review \u2192 Approved \u2192 Published", 2160, 1260, 480, 35, STYLE_PROCESS)
    add_node("SM_ACT_2", "Schedule Monthly Content Calendar (LinkedIn, YouTube, Instagram)", 2160, 1310, 480, 35, STYLE_PROCESS)
    add_node("SM_ACT_3", "Proofread Quarterly Market Research Publications for Accuracy", 2160, 1360, 480, 35, STYLE_PROCESS)
    add_node("SM_ACT_4", "Coordinate Zone-Wise Office Client Review Calls", 2160, 1410, 480, 35, STYLE_PROCESS)
    add_node("SM_ACT_5", "Request Creative Banners &amp; Thumbnails from Graphic Designer", 2160, 1460, 480, 35, STYLE_PROCESS)

    add_edge("E_SM_1", "ROLE_SM_HDR", "SM_ACT_1")
    add_edge("E_SM_2", "SM_ACT_1", "SM_ACT_2")
    add_edge("E_SM_3", "SM_ACT_2", "SM_ACT_3")
    add_edge("E_SM_4", "SM_ACT_3", "SM_ACT_4")
    add_edge("E_SM_5", "SM_ACT_4", "SM_ACT_5")

    # Role: Graphic Designer
    add_node("ROLE_DES_HDR", "<b>9. GRAPHIC DESIGNER</b><br><font size=\"1\">(Brand Collaterals, Multi-Version Asset Vault &amp; Conference Kits)</font>", 2680, 1190, 520, 50, STYLE_HDR_DESIGN)
    add_node("DES_ACT_1", "Receive Creative Brief with Requirements &amp; Due Date", 2700, 1260, 480, 35, STYLE_PROCESS)
    add_node("DES_ACT_2", "Produce Iterative Drafts in Version Vault (v1.0, v1.1, v2.0)", 2700, 1310, 480, 35, STYLE_PROCESS)
    add_node("DES_ACT_3", "Design Conference Banners, Nameplates &amp; Badges for Print Vendors", 2700, 1360, 480, 35, STYLE_PROCESS)
    add_node("DES_ACT_4", "Format Quarterly Research Reports into Institutional Decks", 2700, 1410, 480, 35, STYLE_PROCESS)
    add_node("DES_ACT_5", "Submit Visual Assets for Lead Manager Review &amp; Client Release", 2700, 1460, 480, 35, STYLE_PROCESS)

    add_edge("E_DES_1", "ROLE_DES_HDR", "DES_ACT_1")
    add_edge("E_DES_2", "DES_ACT_1", "DES_ACT_2")
    add_edge("E_DES_3", "DES_ACT_2", "DES_ACT_3")
    add_edge("E_DES_4", "DES_ACT_3", "DES_ACT_4")
    add_edge("E_DES_5", "DES_ACT_4", "DES_ACT_5")
    # Social Media Manager requests creative from Designer
    add_edge("E_SM_TO_DES", "SM_ACT_5", "DES_ACT_1", label="(Design Request)", exitX=1, exitY=0.5, entryX=0, entryY=0.5)

    # Roadblock & Issue Exception Handling (Frontline Staff)
    add_node("BLOCK_SUB_BOX", "<b>ROOFBLOCK &amp; ISSUE ESCALATION HANDLING (All Frontline Staff)</b>", 2140, 1570, 1040, 420, STYLE_DOMAIN_BOX)
    add_node("ISSUE_ENCOUNTER", "Roadblock /<br>Issue Found?", 2310, 1630, 180, 70, STYLE_RHOMBUS)
    add_node("ISSUE_TICKET", "<b>Raise Issue Ticket:</b><br><font size=\"1\">Work is Paused; Alert Sent Directly to Lead Manager</font>", 2240, 1730, 320, 45, STYLE_ALERT)
    add_node("ISSUE_SEVERITY", "Assign Severity: Low, Medium, High, or Urgent", 2240, 1805, 320, 35, STYLE_PROCESS)
    add_node("ISSUE_RES_CHK", "Issue Resolution<br>Pathway?", 2310, 1870, 180, 70, STYLE_RHOMBUS)
    add_node("ISSUE_CLEARED", "<b>Lead Manager Resolves Blocker:</b><br><font size=\"1\">Roadblock Cleared \u2192 Staff Resumes Work</font>", 2160, 1965, 230, 45, STYLE_SUCCESS)
    add_node("ISSUE_ESCALATED", "<b>Escalate to Senior Manager:</b><br><font size=\"1\">Vendor or Inter-Department Bottleneck</font>", 2430, 1965, 240, 45, STYLE_ALERT)

    # Reassignment Target Box
    add_node("REASSIGN_TARGET", "<b>Reassignment Receiver:</b> New Employee Accepts Task with Context Memo", 2700, 1730, 460, 45, STYLE_WARNING)

    # Issue Connections
    add_edge("E_ISSUE_0", "EXEC_ACT_2", "ISSUE_ENCOUNTER", exitX=0.5, exitY=1, entryX=0.5, entryY=0)
    add_edge("E_ISSUE_YES", "ISSUE_ENCOUNTER", "ISSUE_TICKET", label="(Yes: Roadblock)", exitX=0.5, exitY=1, entryX=0.5, entryY=0)
    add_edge("E_ISSUE_NO", "ISSUE_ENCOUNTER", "EXEC_ACT_2", label="(No Issues)", exitX=0, exitY=0.5, entryX=0, entryY=0.5, points=[(2120, 1665), (2120, 972)])
    add_edge("E_ISSUE_1", "ISSUE_TICKET", "ISSUE_SEVERITY")
    add_edge("E_ISSUE_2", "ISSUE_SEVERITY", "ISSUE_RES_CHK")
    add_edge("E_ISSUE_OK", "ISSUE_RES_CHK", "ISSUE_CLEARED", label="(Resolved)", exitX=0, exitY=0.5, entryX=0.5, entryY=0)
    add_edge("E_ISSUE_ESCL", "ISSUE_RES_CHK", "ISSUE_ESCALATED", label="(Escalate)", exitX=1, exitY=0.5, entryX=0.5, entryY=0)
    add_edge("E_ISSUE_RESUME", "ISSUE_CLEARED", "EXEC_ACT_2", label="(Resume Work)", exitX=0.5, exitY=0, entryX=0.25, entryY=1, points=[(2275, 1140)])
    add_edge("E_ESCL_TO_SRMGR", "ISSUE_ESCALATED", "SRMGR_ACT_5", label="(Escalation)", exitX=0.5, exitY=0, entryX=0.5, entryY=1, points=[(2550, 1160), (1740, 1160)])

    # Connecting Reassignment from Lead Manager to Reassignment Target
    add_edge("E_LM_TO_REASS", "LM_OD_REASSIGN", "REASSIGN_TARGET", label="(Handover to Available Staff)", exitX=1, exitY=0.5, entryX=0, entryY=0.5, points=[(2050, 1925), (2050, 1752)])
    add_edge("E_REASS_TO_EXEC", "REASSIGN_TARGET", "EXEC_ACT_1", label="(Starts Work as New Owner)", exitX=0.5, exitY=0, entryX=1, entryY=0.5, points=[(2930, 917)])

    # Revision Loop from Lead Manager back to Execution
    add_edge("E_LM_REV_TO_EX", "LM_QA_REVISE", "EXEC_ACT_2", label="(Resubmit after Corrections)", exitX=1, exitY=0.5, entryX=0.75, entryY=1, points=[(2050, 1867), (2050, 1140), (2520, 1140)])

    # Connect Layer 1 Role Decision to Domain Headers
    add_edge("E_ROUTE_TECH", "L1_DECIDE_ROLE", "ROLE_TECH_HDR", label="(Super Admin / IT Analyst)", exitX=0, exitY=0.5, entryX=0.5, entryY=0, points=[(460, 575)])
    add_edge("E_ROUTE_ADMIN", "L1_DECIDE_ROLE", "ROLE_ADMIN_HDR", label="(Office Admin)", exitX=0, exitY=0.75, entryX=0, entryY=0.5, points=[(100, 595), (100, 1215)])
    add_edge("E_ROUTE_MGR", "L1_DECIDE_ROLE", "ROLE_LEADMGR_HDR", label="(Managers)", exitX=0.5, exitY=1, entryX=0.5, entryY=0)
    add_edge("E_ROUTE_EXEC", "L1_DECIDE_ROLE", "ROLE_EXEC_HDR", label="(Execution Staff)", exitX=1, exitY=0.5, entryX=0.5, entryY=0, points=[(2400, 575)])

    # =========================================================================
    # LAYER 3: INTELLIGENCE, ANALYTICS & REWARD LAYER (y = 2600 to 3650)
    # Divided into 4 Key Strategic Centers across 3180 px:
    # 
    # Center 1 (x = 100..820): Analytics & Predictive Intelligence Center
    # Center 2 (x = 880..1640): Automated Scheduled Reporting Dispatcher
    # Center 3 (x = 1680..2440): Employee Performance & Reward System
    # Center 4 (x = 2480..3220): Chairman Apex Executive Interface & Strategy
    # =========================================================================
    add_node(
        "BOX_L3",
        "LAYER 3: The Intelligence, Analytics & Employee Reward Layer (Leadership & Recognition)",
        60, 2600, 3180, 1080, STYLE_LAYER_BOX
    )

    # Center 1: Analytics & Predictive Intelligence Center
    add_node("L3_ANA_BOX", "<b>1. OPERATIONAL ANALYTICS &amp; PREDICTIVE CENTER</b>", 100, 2660, 720, 980, STYLE_DOMAIN_BOX)
    add_node("L3_ANA_1", "<b>Work Delivery Speed &amp; SLA Tracking:</b><br><font size=\"1\">Measures average turnaround time and on-time completion rates</font>", 140, 2730, 640, 45, STYLE_PROCESS)
    add_node("L3_ANA_2", "<b>Workload Balance &amp; Burnout Prevention Radar:</b><br><font size=\"1\">Alerts when an employee logs >10 hours/day or capacity >100%</font>", 140, 2800, 640, 45, STYLE_PROCESS)
    add_node("L3_ANA_3", "<b>Staff Attendance &amp; Office vs. Remote Patterns:</b><br><font size=\"1\">Tracks punctuality index and off-site work frequency</font>", 140, 2870, 640, 45, STYLE_PROCESS)
    add_node("L3_ANA_4", "<b>Commercial Trends &amp; Growth Analysis:</b><br><font size=\"1\">Quarter-over-Quarter comparison of deal closings and royalty pool</font>", 140, 2940, 640, 45, STYLE_PROCESS)
    add_node("L3_ANA_5", "<b>3-Level Risk Warning Engine:</b><br><font size=\"1\">Low (informational), Medium (manager action), Critical (senior alert)</font>", 140, 3010, 640, 45, STYLE_ALERT)
    add_node("L3_ANA_6", "<b>Early Deadline Warning Alarms:</b><br><font size=\"1\">Warns managers before deadlines are missed based on past delivery speed</font>", 140, 3080, 640, 45, STYLE_PROCESS)

    add_edge("E_L3_A1", "L3_ANA_1", "L3_ANA_2")
    add_edge("E_L3_A2", "L3_ANA_2", "L3_ANA_3")
    add_edge("E_L3_A3", "L3_ANA_3", "L3_ANA_4")
    add_edge("E_L3_A4", "L3_ANA_4", "L3_ANA_5")
    add_edge("E_L3_A5", "L3_ANA_5", "L3_ANA_6")

    # Center 2: Automated Scheduled Reporting Dispatcher
    add_node("L3_REP_BOX", "<b>2. AUTOMATED SCHEDULED REPORTING ENGINE</b>", 880, 2660, 760, 980, STYLE_DOMAIN_BOX)
    add_node("L3_REP_DAILY", "<b>Daily Summary Report (Sent at 6:30 PM):</b><br><font size=\"1\">Tasks completed today, open roadblocks, and priority tasks for tomorrow.<br>Delivered to Frontline Staff &amp; Lead Managers.</font>", 920, 2730, 680, 55, STYLE_PROCESS)
    add_node("L3_REP_WEEKLY", "<b>Weekly Team Scorecard (Sent Every Monday at 9:00 AM):</b><br><font size=\"1\">Team on-time delivery rates, workload balance, and open issues.<br>Delivered to Senior Managers &amp; General Manager.</font>", 920, 2815, 680, 55, STYLE_PROCESS)
    add_node("L3_REP_MONTHLY", "<b>Monthly Executive Briefing (Sent on 1st of Month):</b><br><font size=\"1\">Total company deal closings, 7.5% royalty health &amp; award candidates.<br>Delivered to Chairman &amp; Board of Directors.</font>", 920, 2900, 680, 55, STYLE_PROCESS)
    add_node("L3_REP_DISPATCH", "<b>Multi-Channel Automatic Delivery:</b><br><font size=\"1\">Available in personal dashboard, exportable PDF, and email alerts</font>", 920, 2985, 680, 45, STYLE_SUCCESS)

    add_edge("E_L3_R1", "L3_REP_DAILY", "L3_REP_WEEKLY")
    add_edge("E_L3_R2", "L3_REP_WEEKLY", "L3_REP_MONTHLY")
    add_edge("E_L3_R3", "L3_REP_MONTHLY", "L3_REP_DISPATCH")

    # Center 3: Employee Performance & Reward System
    add_node("L3_REW_BOX", "<b>3. EMPLOYEE PERFORMANCE REWARD &amp; RECOGNITION</b>", 1680, 2660, 760, 980, STYLE_DOMAIN_BOX)
    add_node("L3_REW_HDR", "<b>100-POINT OBJECTIVE SCORING FORMULA</b>", 1720, 2720, 680, 40, STYLE_HDR_REWARD)
    add_node("L3_REW_MATH", "<b>Automated Math Evaluation at Month End:</b><br><font size=\"1\">Completion Speed (35) + On-Time Delivery (30) + First-Time Quality (15) +<br>Attendance &amp; Location (10) + Initiative &amp; Blocker Solving (10)</font>", 1720, 2780, 680, 50, STYLE_PROCESS)
    add_node("L3_REW_TIER", "<b>Performance Tier Ranking:</b><br><font size=\"1\">Gold Tier (90-100 pts) | Silver (80-89) | Bronze (70-79) | Needs Coaching (&lt;70)</font>", 1720, 2850, 680, 45, STYLE_PROCESS)
    add_node("L3_REW_STAR", "<b>Monthly Honor: &quot;Star Performer of the Month&quot;</b><br><font size=\"1\">Awarded to Gold Tier achievers: Digital Profile Badge + Spot Cash Bonus</font>", 1720, 2915, 680, 45, STYLE_HDR_REWARD)
    
    add_node("L3_REW_3MO_CHK", "3 Consecutive<br>Gold Months?", 1970, 2985, 180, 70, STYLE_RHOMBUS)
    add_node("L3_REW_RESET", "Streak Counter: 1 or 2 Months<br><font size=\"1\">(Score dip in Month 3 resets counter to zero)</font>", 1720, 3080, 310, 45, STYLE_PROCESS)
    add_node("L3_REW_CHAIR_HONOR", "<b>CHAIRMAN'S QUARTERLY EXCELLENCE AWARD</b><br><font size=\"1\">Permanent Gold Star Profile Medallion, Substantial Cash Incentive,<br>and Physical Trophy presented at Annual Conference</font>", 2070, 3080, 330, 55, STYLE_HDR_REWARD)

    add_edge("E_L3_W1", "L3_REW_HDR", "L3_REW_MATH")
    add_edge("E_L3_W2", "L3_REW_MATH", "L3_REW_TIER")
    add_edge("E_L3_W3", "L3_REW_TIER", "L3_REW_STAR", label="(Score >= 90: Gold)")
    add_edge("E_L3_W4", "L3_REW_STAR", "L3_REW_3MO_CHK")
    add_edge("E_L3_W_NO", "L3_REW_3MO_CHK", "L3_REW_RESET", label="(<3 Months)", exitX=0, exitY=0.5, entryX=0.5, entryY=0)
    add_edge("E_L3_W_YES", "L3_REW_3MO_CHK", "L3_REW_CHAIR_HONOR", label="(3 Consec. Gold Months)", exitX=1, exitY=0.5, entryX=0.5, entryY=0)

    # Center 4: Chairman Apex Executive Interface & Strategy
    add_node("L3_CHAIR_BOX", "<b>4. CHAIRMAN \u2013 APEX EXECUTIVE INTERFACE</b>", 2480, 2660, 720, 980, STYLE_DOMAIN_BOX)
    add_node("L3_CHAIR_HDR", "<b>ROLE 10: CHAIRMAN (Apex Executive Leadership)</b><br><font size=\"1\">(360-Degree Bird's-Eye View, Commercial Revenue &amp; Strategic Interventions)</font>", 2520, 2720, 640, 50, STYLE_HDR_CHAIRMAN)
    add_node("CHAIR_ACT_1", "<b>360-Degree Company Pulse:</b> Real-time operational health across all branches", 2540, 2790, 600, 35, STYLE_PROCESS)
    add_node("CHAIR_ACT_2", "<b>Commercial Deals &amp; 7.5% Royalty Radar:</b> Live tracking of revenue collections", 2540, 2845, 600, 35, STYLE_PROCESS)
    add_node("CHAIR_ACT_3", "<b>&quot;Requires Attention&quot; Alerts:</b> Overdue tasks >48h &amp; unresolved blockers", 2540, 2900, 600, 35, STYLE_ALERT)
    add_node("CHAIR_ACT_4", "<b>Workforce Location &amp; Safety Review:</b> Check remote work trends &amp; travel flags", 2540, 2955, 600, 35, STYLE_PROCESS)
    add_node("CHAIR_ACT_5", "<b>Personal Sign-Off on Quarterly Excellence Awards:</b> Formally approves candidates", 2540, 3010, 600, 40, STYLE_HDR_REWARD)
    add_node("CHAIR_ACT_6", "<b>Broadcast Strategic Directives:</b> Company-wide Chairman Announcements", 2540, 3070, 600, 35, STYLE_PROCESS)
    add_node("CHAIR_ACT_7", "<b>Strategic Operational Intervention:</b> High-impact directives back to General Manager", 2540, 3125, 600, 40, STYLE_ALERT)

    add_edge("E_CH_1", "L3_CHAIR_HDR", "CHAIR_ACT_1")
    add_edge("E_CH_2", "CHAIR_ACT_1", "CHAIR_ACT_2")
    add_edge("E_CH_3", "CHAIR_ACT_2", "CHAIR_ACT_3")
    add_edge("E_CH_4", "CHAIR_ACT_3", "CHAIR_ACT_4")
    add_edge("E_CH_5", "CHAIR_ACT_4", "CHAIR_ACT_5")
    add_edge("E_CH_6", "CHAIR_ACT_5", "CHAIR_ACT_6")
    add_edge("E_CH_7", "CHAIR_ACT_6", "CHAIR_ACT_7")

    # Connect Award Candidate to Chairman Sign-Off
    add_edge("E_L3_TO_SIGN", "L3_REW_CHAIR_HONOR", "CHAIR_ACT_5", label="(Executive Approval Dossier)", exitX=1, exitY=0.5, entryX=0, entryY=0.5)

    # Strategic Intervention feedback loop from Chairman back to General Manager & Senior Manager
    add_edge("E_CHAIR_TO_MGR", "CHAIR_ACT_7", "ROLE_GM_HDR", label="(Strategic Directives to Management)", exitX=0, exitY=0.5, entryX=0.5, entryY=1, points=[(2450, 3145), (2450, 2550), (1180, 2550)])

    # Telemetry connections from Layer 2 to Layer 3
    # 1. Approved task deliverable feeds performance math
    add_edge("E_L2_QA_TO_L3", "LM_QA_APPROVE", "L3_REW_MATH", label="(Approved Task Telemetry)", style=STYLE_EDGE_DATA, exitX=0.5, exitY=1, entryX=0.5, entryY=0, points=[(1485, 2560), (2060, 2560)])
    # 2. Daily attendance records feed analytics center
    add_edge("E_L2_ATT_TO_L3", "ADM_ACT_4", "L3_ANA_3", label="(Attendance Telemetry)", style=STYLE_EDGE_DATA, exitX=0.5, exitY=1, entryX=0.5, entryY=0, points=[(460, 2560), (460, 2870)])
    # 3. Monthly briefing feeds Chairman
    add_edge("E_L3_REP_TO_CHAIR", "L3_REP_MONTHLY", "CHAIR_ACT_1", label="(Monthly Alliance Briefing)", style=STYLE_EDGE_DATA, exitX=1, exitY=0.5, entryX=0, entryY=0.5, points=[(1640, 2927), (1660, 2927), (1660, 2807)])

    # =========================================================================
    # THE MASTER IMMUTABLE ACTIVITY LOG (Bottom Anchor: y = 3740)
    # =========================================================================
    add_node(
        "MASTER_AUDIT_LOG",
        "<b>[LOCK] STORE CHANGES IN MASTER ACTIVITY LOG</b><br><font size=\"1\">Tamper-Proof, Unalterable Audit Ledger Recording Every Login, Task Event, Approval, Reassignment &amp; Award</font>",
        1250, 3740, 800, 65, STYLE_AUDIT_TERMINUS
    )

    # Dashed provenance lines converging from all layers into the master audit log
    # 1. From Layer 1 Login & Location Audit
    add_edge("E_AUD_1", "L1_AUDIT_LOG_ENTRY", "MASTER_AUDIT_LOG", label="(Login & Location Logged)", style=STYLE_EDGE_DASHED, exitX=0, exitY=0.5, entryX=0.1, entryY=0, points=[(80, 475), (80, 3700), (1330, 3700)])
    # 2. From Admin User Provisioning
    add_edge("E_AUD_2", "ADM_ACT_1", "MASTER_AUDIT_LOG", label="(User Account Created/Modified)", style=STYLE_EDGE_DASHED, exitX=0, exitY=0.5, entryX=0.2, entryY=0, points=[(120, 1277), (120, 3700), (1410, 3700)])
    # 3. From Lead Manager Reassignment
    add_edge("E_AUD_3", "LM_OD_REASSIGN", "MASTER_AUDIT_LOG", label="(Task Reassigned Audit)", style=STYLE_EDGE_DASHED, exitX=0.5, exitY=1, entryX=0.35, entryY=0, points=[(1100, 2550), (1100, 3700), (1530, 3700)])
    # 4. From Task Approved & Closed
    add_edge("E_AUD_4", "LM_QA_APPROVE", "MASTER_AUDIT_LOG", label="(Task Approved & Points Credited)", style=STYLE_EDGE_DASHED, exitX=0.5, exitY=1, entryX=0.5, entryY=0, points=[(1485, 3700), (1650, 3700)])
    # 5. From Issue Escalated
    add_edge("E_AUD_5", "ISSUE_ESCALATED", "MASTER_AUDIT_LOG", label="(Blocker Escalation Recorded)", style=STYLE_EDGE_DASHED, exitX=0.5, exitY=1, entryX=0.65, entryY=0, points=[(2550, 2550), (2470, 2550), (2470, 3700), (1770, 3700)])
    # 6. From Chairman Award Sign-off
    add_edge("E_AUD_6", "CHAIR_ACT_5", "MASTER_AUDIT_LOG", label="(Chairman Award Signed & Logged)", style=STYLE_EDGE_DASHED, exitX=0.5, exitY=1, entryX=0.85, entryY=0, points=[(2840, 3700), (1930, 3700)])

    xml_str = ET.tostring(mxfile, encoding="utf-8")
    parsed = minidom.parseString(xml_str)
    pretty_xml = parsed.toprettyxml(indent="  ")
    clean_lines = [line for line in pretty_xml.split("\n") if line.strip()]
    final_xml = "\n".join(clean_lines)

    # Save to both target locations requested
    out_files = [
        os.path.join(".", "flowchart-detailed", "new_updated_flowchart_2.drawio"),
        os.path.join(".", "new_updated_flowchart_2.drawio")
    ]
    for of in out_files:
        with open(of, "w", encoding="utf-8") as f:
            f.write(final_xml)
        print(f"Saved: {of} ({len(final_xml)} bytes)")

    return final_xml

if __name__ == "__main__":
    build_role_specific_flowchart()
