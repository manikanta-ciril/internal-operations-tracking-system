import os
import xml.etree.ElementTree as ET
import xml.dom.minidom as minidom

def generate_drawio_xml():
    # Style presets based on Actual-FlowChart.drawio and diagram.txt
    FONT_VERDANA = "fontFamily=Verdana;"
    FONT_ARCH = "fontFamily=Architects Daughter;fontSource=https://fonts.googleapis.com/css?family=Architects+Daughter;"
    
    # Layer Bounding Box Style
    STYLE_LAYER_BOX = (
        "rounded=0;whiteSpace=wrap;html=1;dashed=1;dashPattern=8 8;fillColor=none;"
        "strokeColor=#64748b;strokeWidth=2;verticalAlign=top;align=left;spacingLeft=25;spacingTop=15;"
        + FONT_ARCH + "fontSize=18;fontStyle=1;fontColor=#334155;"
    )
    
    # Start / End Ellipse Style
    STYLE_START = (
        "ellipse;whiteSpace=wrap;html=1;fillColor=#dcfce7;strokeColor=#16a34a;strokeWidth=2;"
        + FONT_VERDANA + "fontSize=13;fontStyle=1;fontColor=#14532d;align=center;verticalAlign=middle;"
    )
    
    # Decision Diamond Style
    STYLE_RHOMBUS = (
        "rhombus;whiteSpace=wrap;html=1;fillColor=#fef3c7;strokeColor=#d97706;strokeWidth=1.5;"
        + FONT_VERDANA + "fontSize=11;fontStyle=1;fontColor=#78350f;align=center;verticalAlign=middle;"
    )
    
    # Standard Action / Process Rounded Rect
    STYLE_PROCESS_NEUTRAL = (
        "rounded=1;whiteSpace=wrap;html=1;fillColor=#f8fafc;strokeColor=#94a3b8;strokeWidth=1.5;"
        + FONT_VERDANA + "fontSize=11;fontColor=#0f172a;align=center;verticalAlign=middle;"
    )
    
    # Warning / Invalid / Alert Rect
    STYLE_PROCESS_ALERT = (
        "rounded=1;whiteSpace=wrap;html=1;fillColor=#fee2e2;strokeColor=#ef4444;strokeWidth=1.5;"
        + FONT_VERDANA + "fontSize=11;fontColor=#991b1b;align=center;verticalAlign=middle;"
    )
    
    # Remote / Off-site Rect
    STYLE_PROCESS_WARNING = (
        "rounded=1;whiteSpace=wrap;html=1;fillColor=#ffedd5;strokeColor=#f97316;strokeWidth=1.5;"
        + FONT_VERDANA + "fontSize=11;fontColor=#9a3412;align=center;verticalAlign=middle;"
    )
    
    # Audit / Success Rect
    STYLE_PROCESS_SUCCESS = (
        "rounded=1;whiteSpace=wrap;html=1;fillColor=#e0f2fe;strokeColor=#0284c7;strokeWidth=1.5;"
        + FONT_VERDANA + "fontSize=11;fontColor=#0369a1;align=center;verticalAlign=middle;"
    )
    
    # Dashboard Header Styles
    STYLE_DASH_ADMIN = (
        "rounded=1;whiteSpace=wrap;html=1;fillColor=#ede9fe;strokeColor=#7c3aed;strokeWidth=2.5;"
        + FONT_VERDANA + "fontSize=14;fontStyle=1;fontColor=#4c1d95;align=center;verticalAlign=middle;shadow=1;"
    )
    STYLE_DASH_MGR = (
        "rounded=1;whiteSpace=wrap;html=1;fillColor=#dbeafe;strokeColor=#2563eb;strokeWidth=2.5;"
        + FONT_VERDANA + "fontSize=14;fontStyle=1;fontColor=#1e3a8a;align=center;verticalAlign=middle;shadow=1;"
    )
    STYLE_DASH_EMP = (
        "rounded=1;whiteSpace=wrap;html=1;fillColor=#ccfbf1;strokeColor=#0d9488;strokeWidth=2.5;"
        + FONT_VERDANA + "fontSize=14;fontStyle=1;fontColor=#134e4a;align=center;verticalAlign=middle;shadow=1;"
    )
    STYLE_DASH_CHAIRMAN = (
        "rounded=1;whiteSpace=wrap;html=1;fillColor=#fee2e2;strokeColor=#b91c1c;strokeWidth=2.5;"
        + FONT_VERDANA + "fontSize=13;fontStyle=1;fontColor=#7f1d1d;align=center;verticalAlign=middle;shadow=1;"
    )
    STYLE_DASH_REWARD = (
        "rounded=1;whiteSpace=wrap;html=1;fillColor=#fef08a;strokeColor=#ca8a04;strokeWidth=2.5;"
        + FONT_VERDANA + "fontSize=13;fontStyle=1;fontColor=#713f12;align=center;verticalAlign=middle;shadow=1;"
    )
    
    # Sub-Header Section Boxes
    STYLE_SUBHDR_PURPLE = (
        "rounded=1;whiteSpace=wrap;html=1;fillColor=#f5f3ff;strokeColor=#8b5cf6;strokeWidth=1.5;"
        + FONT_VERDANA + "fontSize=12;fontStyle=1;fontColor=#5b21b6;align=center;verticalAlign=middle;"
    )
    STYLE_SUBHDR_BLUE = (
        "rounded=1;whiteSpace=wrap;html=1;fillColor=#eff6ff;strokeColor=#3b82f6;strokeWidth=1.5;"
        + FONT_VERDANA + "fontSize=12;fontStyle=1;fontColor=#1d4ed8;align=center;verticalAlign=middle;"
    )
    STYLE_SUBHDR_TEAL = (
        "rounded=1;whiteSpace=wrap;html=1;fillColor=#f0fdfa;strokeColor=#14b8a6;strokeWidth=1.5;"
        + FONT_VERDANA + "fontSize=12;fontStyle=1;fontColor=#0f766e;align=center;verticalAlign=middle;"
    )
    STYLE_SUBHDR_AMBER = (
        "rounded=1;whiteSpace=wrap;html=1;fillColor=#fffbeb;strokeColor=#f59e0b;strokeWidth=1.5;"
        + FONT_VERDANA + "fontSize=12;fontStyle=1;fontColor=#b45309;align=center;verticalAlign=middle;"
    )
    STYLE_SUBHDR_RED = (
        "rounded=1;whiteSpace=wrap;html=1;fillColor=#fff1f2;strokeColor=#f43f5e;strokeWidth=1.5;"
        + FONT_VERDANA + "fontSize=12;fontStyle=1;fontColor=#be123c;align=center;verticalAlign=middle;"
    )

    # Callout style
    STYLE_CALLOUT = (
        "shape=wedgeCallout;whiteSpace=wrap;html=1;fillColor=#fef9c3;strokeColor=#ca8a04;strokeWidth=1;"
        + FONT_VERDANA + "fontSize=10;fontStyle=1;fontColor=#854d0e;align=center;verticalAlign=middle;"
    )

    # Gold Award Badge Style
    STYLE_AWARD_GOLD = (
        "rounded=1;whiteSpace=wrap;html=1;fillColor=#fef08a;strokeColor=#eab308;strokeWidth=2;"
        + FONT_VERDANA + "fontSize=11;fontStyle=1;fontColor=#713f12;align=center;verticalAlign=middle;shadow=1;"
    )

    # Immutable Audit Log at Bottom
    STYLE_AUDIT_TERMINUS = (
        "rounded=1;whiteSpace=wrap;html=1;fillColor=#0f172a;strokeColor=#38bdf8;strokeWidth=2.5;"
        + FONT_VERDANA + "fontSize=13;fontStyle=1;fontColor=#f8fafc;align=center;verticalAlign=middle;shadow=1;"
    )

    # Standard Edge Style
    STYLE_EDGE = (
        "edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;"
        "endArrow=blockThin;endSize=8;startSize=8;endFill=1;strokeWidth=1.5;strokeColor=#475569;"
    )
    STYLE_EDGE_DASHED_AUDIT = (
        "edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;dashed=1;dashPattern=6 4;"
        "endArrow=blockThin;endSize=8;startSize=8;endFill=1;strokeWidth=1.5;strokeColor=#64748b;"
    )
    STYLE_EDGE_TELEMETRY = (
        "edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;dashed=1;dashPattern=4 4;"
        "endArrow=blockThin;endSize=8;startSize=8;endFill=1;strokeWidth=1.5;strokeColor=#0284c7;"
    )

    # Edge Label Style
    STYLE_EDGE_LABEL = (
        "edgeLabel;html=1;align=center;verticalAlign=middle;resizable=0;points=[];"
        + FONT_ARCH + "fontSize=12;fontStyle=1;fontColor=#334155;backgroundColor=#ffffff;"
    )

    mxfile = ET.Element("mxfile", {
        "host": "app.diagrams.net",
        "modified": "2026-09-30T16:45:00.000Z",
        "agent": "CIRIL-Enterprise-Architect",
        "version": "24.0.0",
        "type": "device"
    })
    
    diagram = ET.SubElement(mxfile, "diagram", {
        "id": "IOTS_Enterprise_Architecture_V2",
        "name": "IOTS 3-Layer Enterprise Architecture Flowchart"
    })
    
    model = ET.SubElement(diagram, "mxGraphModel", {
        "dx": "2600",
        "dy": "1800",
        "grid": "1",
        "gridSize": "10",
        "guides": "1",
        "tooltips": "1",
        "connect": "1",
        "arrows": "1",
        "fold": "1",
        "page": "1",
        "pageScale": "1",
        "pageWidth": "2500",
        "pageHeight": "3600",
        "math": "0",
        "shadow": "0"
    })
    
    root = ET.SubElement(model, "root")
    ET.SubElement(root, "mxCell", {"id": "0"})
    ET.SubElement(root, "mxCell", {"id": "1", "parent": "0"})

    def add_node(cid, val, x, y, w, h, style, parent="1"):
        c = ET.SubElement(root, "mxCell", {
            "id": cid,
            "value": val,
            "style": style,
            "vertex": "1",
            "parent": parent
        })
        geom = ET.SubElement(c, "mxGeometry", {
            "x": str(x),
            "y": str(y),
            "width": str(w),
            "height": str(h),
            "as": "geometry"
        })
        return c

    def add_edge(eid, src, tgt, label="", style=STYLE_EDGE, exitX=None, exitY=None, entryX=None, entryY=None, points=None):
        edge_style = style
        if exitX is not None and exitY is not None:
            edge_style += f"exitX={exitX};exitY={exitY};exitDx=0;exitDy=0;"
        if entryX is not None and entryY is not None:
            edge_style += f"entryX={entryX};entryY={entryY};entryDx=0;entryDy=0;"
        
        c = ET.SubElement(root, "mxCell", {
            "id": eid,
            "value": "",
            "style": edge_style,
            "edge": "1",
            "parent": "1",
            "source": src,
            "target": tgt
        })
        geom = ET.SubElement(c, "mxGeometry", {
            "relative": "1",
            "as": "geometry"
        })
        if points:
            pts = ET.SubElement(geom, "Array", {"as": "points"})
            for px, py in points:
                ET.SubElement(pts, "mxPoint", {"x": str(px), "y": str(py)})

        if label:
            lbl = ET.SubElement(root, "mxCell", {
                "id": f"{eid}_lbl",
                "value": label,
                "style": STYLE_EDGE_LABEL,
                "vertex": "1",
                "connectable": "0",
                "parent": eid
            })
            ET.SubElement(lbl, "mxGeometry", {
                "x": "-0.1",
                "y": "0",
                "relative": "1",
                "as": "geometry"
            })
        return c

    # =========================================================================
    # MACRO CONTAINERS (THE THREE FOUNDATIONAL LAYERS)
    # =========================================================================
    # Layer 1: Authentication & Authorization (Top)
    add_node(
        "BOX_LAYER_1",
        "LAYER 1: The Authentication, Geolocation & Security Layer",
        50, 40, 2380, 720, STYLE_LAYER_BOX
    )
    
    # Layer 2: Management & Operations Layer (Middle)
    add_node(
        "BOX_LAYER_2",
        "LAYER 2: The Management, Operations & Execution Layer",
        50, 790, 2380, 1470, STYLE_LAYER_BOX
    )

    # Layer 3: Intelligence, Analytics & Reward Layer (Bottom)
    add_node(
        "BOX_LAYER_3",
        "LAYER 3: The Intelligence, Analytics & Performance Reward Layer",
        50, 2290, 2380, 960, STYLE_LAYER_BOX
    )

    # =========================================================================
    # LAYER 1: AUTHENTICATION & AUTHORIZATION NODES
    # Spine center at x = 1190
    # =========================================================================
    add_node("L1_START", "START", 1130, 80, 120, 45, STYLE_START)
    add_node("L1_LOGIN", "<b>User Logs into the System</b><br><font size=\"1\">(Single Unified Enterprise Gateway)</font>", 1050, 160, 280, 60, STYLE_PROCESS_NEUTRAL)
    add_node("L1_CRED_CHK", "Validate<br>Credentials", 1100, 260, 180, 90, STYLE_RHOMBUS)
    
    # Left Branch for Invalid Credentials
    add_node("L1_NOTIFY_INV", "<b>Notify: Invalid Credentials</b><br><font size=\"1\">(Trigger Security Audit & Lockout Monitor)</font>", 670, 275, 290, 60, STYLE_PROCESS_ALERT)
    
    # Valid Branch -> Validate Location
    add_node("L1_LOC_CHK", "Validate<br>Location", 1100, 395, 180, 90, STYLE_RHOMBUS)
    
    # Left Branch for Unknown Location
    add_node("L1_REMOTE_TAG", "<b>Mark the session as \"Remote/Off-site\"</b><br><font size=\"1\">(Contextual Notice & Manager Alert)</font>", 670, 410, 290, 60, STYLE_PROCESS_WARNING)
    
    # Known Location -> Audit Node
    add_node("L1_AUDIT_LOGIN", "<b>Audit log-in and location coordinates</b><br><font size=\"1\">(Reverse Geocode Address + Hardware GPS)</font>", 1040, 530, 300, 60, STYLE_PROCESS_SUCCESS)
    
    # Decide User Role Decision
    add_node("L1_DECIDE_ROLE", "Decide<br>User Role", 1100, 635, 180, 90, STYLE_RHOMBUS)
    
    # Callout floating near Decide User Role
    add_node("L1_CALLOUT_ROLE", "<b>Decides role based on<br>User Credentials & Profile</b>", 1330, 650, 230, 55, STYLE_CALLOUT)

    # Layer 1 Connections
    add_edge("E_L1_1", "L1_START", "L1_LOGIN")
    add_edge("E_L1_2", "L1_LOGIN", "L1_CRED_CHK")
    add_edge("E_L1_3", "L1_CRED_CHK", "L1_NOTIFY_INV", label="(Invalid)", exitX=0, exitY=0.5, entryX=1, entryY=0.5)
    add_edge("E_L1_4", "L1_NOTIFY_INV", "L1_START", label="(Retry)", exitX=0.5, exitY=0, entryX=0, entryY=0.5, points=[(815, 102)])
    add_edge("E_L1_5", "L1_CRED_CHK", "L1_LOC_CHK", label="(Valid)", exitX=0.5, exitY=1, entryX=0.5, entryY=0)
    add_edge("E_L1_6", "L1_LOC_CHK", "L1_REMOTE_TAG", label="(Unknown)", exitX=0, exitY=0.5, entryX=1, entryY=0.5)
    add_edge("E_L1_7", "L1_LOC_CHK", "L1_AUDIT_LOGIN", label="(Known)", exitX=0.5, exitY=1, entryX=0.5, entryY=0)
    add_edge("E_L1_8", "L1_REMOTE_TAG", "L1_AUDIT_LOGIN", label="(Off-site Audit)", exitX=0.5, exitY=1, entryX=0, entryY=0.5, points=[(815, 560)])
    add_edge("E_L1_9", "L1_AUDIT_LOGIN", "L1_DECIDE_ROLE")

    # Connections from Decide User Role to Dashboards
    add_edge("E_ROLE_ADMIN", "L1_DECIDE_ROLE", "DASH_ADMIN", label="(User: Admin)", exitX=0, exitY=0.5, entryX=0.5, entryY=0, points=[(425, 680)])
    add_edge("E_ROLE_MGR", "L1_DECIDE_ROLE", "DASH_MGR", label="(User: Manager)", exitX=0.5, exitY=1, entryX=0.5, entryY=0)
    add_edge("E_ROLE_EMP", "L1_DECIDE_ROLE", "DASH_EMP", label="(User: Employee)", exitX=1, exitY=0.5, entryX=0.5, entryY=0, points=[(2020, 680)])

    # =========================================================================
    # LAYER 2: TOP DASHBOARD HEADERS (y = 820)
    # Col 1: Admin (center 425)
    # Col 2: Manager (center 1210)
    # Col 3: Employee (center 2020)
    # =========================================================================
    add_node("DASH_ADMIN", "<b>[ADMIN - DASHBOARD]</b><br><font size=\"1\">Platform Oversight, User Governance & Configuration</font>", 230, 820, 390, 55, STYLE_DASH_ADMIN)
    add_node("DASH_MGR", "<b>[MANAGER - DASHBOARD]</b><br><font size=\"1\">Operational Command, Workload Balancing & QA Review</font>", 1015, 820, 390, 55, STYLE_DASH_MGR)
    add_node("DASH_EMP", "<b>[EMPLOYEE - DASHBOARD]</b><br><font size=\"1\">Task Execution, Work Activity Logging & Submissions</font>", 1825, 820, 390, 55, STYLE_DASH_EMP)

    # =========================================================================
    # COLUMN 1: ADMIN DASHBOARD (x = 120 to 730)
    # =========================================================================
    add_node("ADM_SEC_1", "<b>1. User Management & Access Provisioning</b>", 200, 905, 450, 35, STYLE_SUBHDR_PURPLE)
    add_node("ADM_UM_1", "Create New User Profile (Internal Provisioning)", 230, 955, 390, 32, STYLE_PROCESS_NEUTRAL)
    add_node("ADM_UM_2", "Set Roles, Data Scopes & Granular Permissions", 230, 997, 390, 32, STYLE_PROCESS_NEUTRAL)
    add_node("ADM_UM_3", "Activate / Deactivate User Accounts", 230, 1039, 390, 32, STYLE_PROCESS_NEUTRAL)
    add_node("ADM_UM_4", "Reset User Passwords & Manage Security Credentials", 230, 1081, 390, 32, STYLE_PROCESS_NEUTRAL)
    
    add_node("ADM_SEC_2", "<b>2. Global Task Management & Intervention</b>", 200, 1135, 450, 35, STYLE_SUBHDR_PURPLE)
    add_node("ADM_GTM_1", "Monitor All Tasks Across All Teams & Verticals", 230, 1185, 390, 32, STYLE_PROCESS_NEUTRAL)
    add_node("ADM_GTM_2", "Select Specific Task for Administrative Intervention", 230, 1227, 390, 32, STYLE_PROCESS_NEUTRAL)
    add_node("ADM_GTM_3", "Edit Task Details, Force Reassign, or Cancel Task", 230, 1269, 390, 32, STYLE_PROCESS_NEUTRAL)
    add_node("ADM_GTM_4", "Force-Approve Completed Work & Archive", 230, 1311, 390, 32, STYLE_PROCESS_NEUTRAL)

    add_node("ADM_SEC_3", "<b>3. Location & Attendance Control</b>", 200, 1365, 450, 35, STYLE_SUBHDR_PURPLE)
    add_node("ADM_LOC_1", "Set Office Geofence Coordinates & Radius Limits", 230, 1415, 390, 32, STYLE_PROCESS_NEUTRAL)
    add_node("ADM_LOC_2", "Define Standard Working Hours, Shifts & Grace Period", 230, 1457, 390, 32, STYLE_PROCESS_NEUTRAL)
    add_node("ADM_LOC_3", "Monitor Daily Workforce Attendance Records", 230, 1499, 390, 32, STYLE_PROCESS_NEUTRAL)
    add_node("ADM_LOC_4", "Review Flagged Off-Site & Anomalous Logins", 230, 1541, 390, 32, STYLE_PROCESS_NEUTRAL)

    add_node("ADM_SEC_4", "<b>4. System Settings & Security Audits</b>", 200, 1595, 450, 35, STYLE_SUBHDR_PURPLE)
    add_node("ADM_SYS_1", "Access System Registry & Manage Role Designations", 230, 1645, 390, 32, STYLE_PROCESS_NEUTRAL)
    add_node("ADM_SYS_2", "Manage Automated Report Schedules & Templates", 230, 1687, 390, 32, STYLE_PROCESS_NEUTRAL)
    add_node("ADM_SYS_3", "Publish Enterprise Broadcast Announcements", 230, 1729, 390, 32, STYLE_PROCESS_NEUTRAL)
    add_node("ADM_SYS_4", "Security & Audit Viewer (Inspect Immutable Logs)", 230, 1771, 390, 32, STYLE_PROCESS_NEUTRAL)

    # Connect Admin Modules Vertically
    add_edge("E_ADM_0", "DASH_ADMIN", "ADM_SEC_1")
    add_edge("E_ADM_1", "ADM_SEC_1", "ADM_UM_1")
    add_edge("E_ADM_2", "ADM_UM_1", "ADM_UM_2")
    add_edge("E_ADM_3", "ADM_UM_2", "ADM_UM_3")
    add_edge("E_ADM_4", "ADM_UM_3", "ADM_UM_4")
    add_edge("E_ADM_5", "ADM_UM_4", "ADM_SEC_2")
    add_edge("E_ADM_6", "ADM_SEC_2", "ADM_GTM_1")
    add_edge("E_ADM_7", "ADM_GTM_1", "ADM_GTM_2")
    add_edge("E_ADM_8", "ADM_GTM_2", "ADM_GTM_3")
    add_edge("E_ADM_9", "ADM_GTM_3", "ADM_GTM_4")
    add_edge("E_ADM_10", "ADM_GTM_4", "ADM_SEC_3")
    add_edge("E_ADM_11", "ADM_SEC_3", "ADM_LOC_1")
    add_edge("E_ADM_12", "ADM_LOC_1", "ADM_LOC_2")
    add_edge("E_ADM_13", "ADM_LOC_2", "ADM_LOC_3")
    add_edge("E_ADM_14", "ADM_LOC_3", "ADM_LOC_4")
    add_edge("E_ADM_15", "ADM_LOC_4", "ADM_SEC_4")
    add_edge("E_ADM_16", "ADM_SEC_4", "ADM_SYS_1")
    add_edge("E_ADM_17", "ADM_SYS_1", "ADM_SYS_2")
    add_edge("E_ADM_18", "ADM_SYS_2", "ADM_SYS_3")
    add_edge("E_ADM_19", "ADM_SYS_3", "ADM_SYS_4")

    # =========================================================================
    # COLUMN 2: MANAGER DASHBOARD (x = 830 to 1590)
    # =========================================================================
    add_node("MGR_SEC_TM", "<b>Team Management</b>", 850, 905, 340, 32, STYLE_SUBHDR_BLUE)
    add_node("MGR_TM_1", "View Team Members & Profiles", 870, 947, 300, 28, STYLE_PROCESS_NEUTRAL)
    add_node("MGR_TM_2", "View Current Assignments & Progress", 870, 982, 300, 28, STYLE_PROCESS_NEUTRAL)
    add_node("MGR_TM_3", "Track Live Workload & Availability", 870, 1017, 300, 28, STYLE_PROCESS_NEUTRAL)

    add_node("MGR_SEC_PM", "<b>Performance Monitoring</b>", 1230, 905, 340, 32, STYLE_SUBHDR_BLUE)
    add_node("MGR_PM_1", "Monitor Task Completion Rate & SLA", 1250, 947, 300, 28, STYLE_PROCESS_NEUTRAL)
    add_node("MGR_PM_2", "Review Overdue Tasks & Deadlines", 1250, 982, 300, 28, STYLE_PROCESS_NEUTRAL)
    add_node("MGR_PM_3", "Identify Performance Bottlenecks", 1250, 1017, 300, 28, STYLE_PROCESS_NEUTRAL)

    add_node("MGR_SEC_COMM", "<b>Team Communication</b>", 850, 1065, 340, 30, STYLE_SUBHDR_BLUE)
    add_node("MGR_COMM_1", "Send Broadcasts & Task Instructions", 870, 1105, 300, 28, STYLE_PROCESS_NEUTRAL)

    add_node("MGR_SEC_WM", "<b>Workload Management</b>", 1230, 1065, 340, 30, STYLE_SUBHDR_BLUE)
    add_node("MGR_WM_1", "Identify Overloaded Staff & Rebalance", 1250, 1105, 300, 28, STYLE_PROCESS_NEUTRAL)

    # Core Task Lifecycle Engine in Manager Column
    add_node("MGR_SEC_WF", "<b>Task Lifecycle Management & State Machine (Core Engine)</b>", 850, 1155, 720, 32, STYLE_SUBHDR_BLUE)
    add_node("MGR_WF_CREATE", "<b>Create a Task</b> (Define Scope & Deliverables)", 1030, 1200, 360, 35, STYLE_PROCESS_NEUTRAL)
    add_node("MGR_WF_SLA", "Set Priority, SLA Deadlines & Milestones", 1030, 1245, 360, 35, STYLE_PROCESS_NEUTRAL)
    add_node("MGR_WF_CAP", "Check Employee Workload & Bandwidth Capacity", 1030, 1290, 360, 35, STYLE_PROCESS_NEUTRAL)
    add_node("MGR_WF_ASSIGN", "Assign to Employee & Dispatch Notification", 1030, 1335, 360, 35, STYLE_PROCESS_NEUTRAL)
    
    # Task Status Decision
    add_node("MGR_WF_STATUS", "Task Status?", 1120, 1390, 180, 75, STYLE_RHOMBUS)
    add_node("MGR_WF_QUEUED", "Task Queued in Workspace<br><font size=\"1\">(Awaiting Employee Start)</font>", 870, 1490, 220, 40, STYLE_PROCESS_NEUTRAL)

    # Overdue Exception Handling
    add_node("MGR_OD_REVIEW", "<b>Manager Reviews Overdue Task</b><br><font size=\"1\">(Triggered by SLA Deadline Breach)</font>", 860, 1555, 250, 45, STYLE_PROCESS_ALERT)
    add_node("MGR_OD_RES", "Overdue<br>Resolution?", 905, 1625, 160, 70, STYLE_RHOMBUS)
    add_node("MGR_OD_EXT", "Grant Deadline Extension<br><font size=\"1\">(Mandatory Justification Memo)</font>", 850, 1720, 210, 40, STYLE_PROCESS_NEUTRAL)
    add_node("MGR_OD_REASS", "Reassign to Available Employee<br><font size=\"1\">(Workload Balanced)</font>", 850, 1780, 210, 40, STYLE_PROCESS_NEUTRAL)
    add_node("MGR_OD_ESCL", "Escalate to Senior Manager<br><font size=\"1\">(Cross-Department Unblocking)</font>", 850, 1840, 210, 40, STYLE_PROCESS_ALERT)

    # Manager Review & Approval Section
    add_node("MGR_QA_REVIEW", "<b>Manager Reviews Task Deliverables</b><br><font size=\"1\">(Inspects Uploaded Evidence & Files)</font>", 1160, 1555, 270, 45, STYLE_PROCESS_NEUTRAL)
    add_node("MGR_QA_APP", "Approved?", 1205, 1625, 180, 70, STYLE_RHOMBUS)
    add_node("MGR_QA_REVISION", "<b>Provide Feedback / Changes Requested</b><br><font size=\"1\">(Correction Cycle: Itemized Notes)</font>", 1280, 1720, 280, 45, STYLE_PROCESS_WARNING)
    add_node("MGR_QA_CLOSE", "<b>Complete & Close Task</b><br><font size=\"1\">(Approved, Performance Score Credited)</font>", 1110, 1815, 260, 45, STYLE_PROCESS_SUCCESS)

    # Manager Column Connections
    add_edge("E_MGR_0", "DASH_MGR", "MGR_SEC_WF")
    add_edge("E_MGR_WF1", "MGR_SEC_WF", "MGR_WF_CREATE")
    add_edge("E_MGR_WF2", "MGR_WF_CREATE", "MGR_WF_SLA")
    add_edge("E_MGR_WF3", "MGR_WF_SLA", "MGR_WF_CAP")
    add_edge("E_MGR_WF4", "MGR_WF_CAP", "MGR_WF_ASSIGN")
    add_edge("E_MGR_WF5", "MGR_WF_ASSIGN", "MGR_WF_STATUS")
    add_edge("E_MGR_STAT_ASS", "MGR_WF_STATUS", "MGR_WF_QUEUED", label="(Assigned)", exitX=0, exitY=0.5, entryX=0.5, entryY=0)
    add_edge("E_OD_1", "MGR_OD_REVIEW", "MGR_OD_RES")
    add_edge("E_OD_EXT", "MGR_OD_RES", "MGR_OD_EXT", label="(Extend)", exitX=0, exitY=0.5, entryX=0.5, entryY=0)
    add_edge("E_OD_REASS", "MGR_OD_RES", "MGR_OD_REASS", label="(Reassign)", exitX=0.5, exitY=1, entryX=0.5, entryY=0)
    add_edge("E_OD_ESCL", "MGR_OD_RES", "MGR_OD_ESCL", label="(Escalate)", exitX=1, exitY=0.5, entryX=0.5, entryY=0, points=[(1080, 1660), (1080, 1860)])
    add_edge("E_QA_1", "MGR_QA_REVIEW", "MGR_QA_APP")
    add_edge("E_QA_NO", "MGR_QA_APP", "MGR_QA_REVISION", label="(No: Revision)", exitX=1, exitY=0.5, entryX=0.5, entryY=0)
    add_edge("E_QA_YES", "MGR_QA_APP", "MGR_QA_CLOSE", label="(Yes: Approved)", exitX=0.5, exitY=1, entryX=0.5, entryY=0)

    # =========================================================================
    # COLUMN 3: EMPLOYEE DASHBOARD & EXECUTION (x = 1670 to 2370)
    # =========================================================================
    add_node("EMP_SEC_WM", "<b>Work Management & Queue Overview</b>", 1795, 905, 450, 35, STYLE_SUBHDR_TEAL)
    add_node("EMP_WM_1", "My Tasks Dashboard & Priority Queue", 1825, 955, 390, 32, STYLE_PROCESS_NEUTRAL)
    add_node("EMP_WM_2", "Get Task Details, Instructions & Briefs", 1825, 997, 390, 32, STYLE_PROCESS_NEUTRAL)
    add_node("EMP_WM_3", "Task Execution & Live Time Tracking", 1825, 1039, 390, 32, STYLE_PROCESS_NEUTRAL)
    add_node("EMP_WM_4", "Record Work Activity (Progress %, Notes, Hours)", 1825, 1081, 390, 32, STYLE_PROCESS_NEUTRAL)
    add_node("EMP_WM_5", "Task Submission (Upload Supporting Deliverables)", 1825, 1123, 390, 32, STYLE_PROCESS_NEUTRAL)

    # Execution Loop in Column 3
    add_node("EMP_EXEC_LOOP", "<b>Employee works and updates about task</b><br><font size=\"1\">(Logs Incremental Progress, Notes & Files)</font>", 1805, 1200, 430, 50, STYLE_PROCESS_NEUTRAL)
    add_node("EMP_DONE_CHK", "Task<br>Completed?", 1930, 1285, 180, 75, STYLE_RHOMBUS)

    # Blocker & Issue Exception Handling
    add_node("EMP_ISSUE_CHK", "Issue /<br>Blocker?", 1930, 1390, 180, 75, STYLE_RHOMBUS)
    add_node("EMP_ISSUE_RAISE", "<b>Raise Issue-Ticket</b><br><font size=\"1\">(Document Blocker & Business Impact)</font>", 1860, 1490, 320, 40, STYLE_PROCESS_ALERT)
    add_node("EMP_ISSUE_MGR", "Manager<br>Intervention?", 1930, 1555, 180, 70, STYLE_RHOMBUS)
    add_node("EMP_ISSUE_SEV", "Assign Issue Severity<br><font size=\"1\">(Low, Medium, High, Critical)</font>", 1860, 1650, 320, 35, STYLE_PROCESS_NEUTRAL)
    add_node("EMP_ISSUE_RES", "Issue<br>Resolution?", 1930, 1710, 180, 70, STYLE_RHOMBUS)
    add_node("EMP_ISSUE_RESOLVED", "<b>Manager Resolves Blocker</b><br><font size=\"1\">(Roadblock Cleared -> Resume Work)</font>", 1740, 1810, 240, 40, STYLE_PROCESS_SUCCESS)
    add_node("EMP_ISSUE_ESCL", "<b>Escalate to Higher Authority</b><br><font size=\"1\">(Senior Manager / GM Intervention)</font>", 2030, 1810, 250, 40, STYLE_PROCESS_ALERT)

    # Reassignment Handover in Employee Column
    add_node("EMP_REASSIGN_CHOOSE", "<b>Choose New Employee & Transfer Context</b><br><font size=\"1\">(Workload Check & Reassignment Memo)</font>", 1760, 1910, 450, 40, STYLE_PROCESS_WARNING)

    # Employee Column Connections
    add_edge("E_EMP_0", "DASH_EMP", "EMP_SEC_WM")
    add_edge("E_EMP_1", "EMP_SEC_WM", "EMP_WM_1")
    add_edge("E_EMP_2", "EMP_WM_1", "EMP_WM_2")
    add_edge("E_EMP_3", "EMP_WM_2", "EMP_WM_3")
    add_edge("E_EMP_4", "EMP_WM_3", "EMP_WM_4")
    add_edge("E_EMP_5", "EMP_WM_4", "EMP_WM_5")
    add_edge("E_EMP_6", "EMP_WM_5", "EMP_EXEC_LOOP")
    add_edge("E_MGR_TO_EMP", "MGR_WF_STATUS", "EMP_EXEC_LOOP", label="(Pending/In Progress)", exitX=1, exitY=0.5, entryX=0, entryY=0.5)
    add_edge("E_LOOP_1", "EMP_EXEC_LOOP", "EMP_DONE_CHK")
    add_edge("E_LOOP_NO", "EMP_DONE_CHK", "EMP_EXEC_LOOP", label="(No: Continue Work)", exitX=1, exitY=0.5, entryX=1, entryY=0.5, points=[(2260, 1322), (2260, 1225)])
    add_edge("E_LOOP_YES", "EMP_DONE_CHK", "MGR_QA_REVIEW", label="(Yes: Submit for QA)", exitX=0, exitY=0.5, entryX=1, entryY=0.5, points=[(1580, 1322), (1580, 1577)])
    add_edge("E_REVISION_LOOP", "MGR_QA_REVISION", "EMP_EXEC_LOOP", label="(Resubmit after Correction)", exitX=0.5, exitY=0, entryX=0.5, entryY=1, points=[(1420, 1365), (2020, 1365)])
    add_edge("E_TRIGGER_OD", "MGR_WF_STATUS", "MGR_OD_REVIEW", label="(Overdue Exception)", exitX=0, exitY=1, entryX=0.5, entryY=0, points=[(985, 1490)])
    add_edge("E_EXT_LOOP", "MGR_OD_EXT", "EMP_EXEC_LOOP", label="(SLA Extended -> Resume Work)", exitX=0, exitY=0.5, entryX=0.25, entryY=1, points=[(780, 1740), (780, 1365), (1912, 1365)])
    add_edge("E_REASS_TO_CHOOSE", "MGR_OD_REASS", "EMP_REASSIGN_CHOOSE", label="(Reassignment Handover)", exitX=0.5, exitY=1, entryX=0, entryY=0.5, points=[(955, 1930)])
    add_edge("E_CHOOSE_TO_WORK", "EMP_REASSIGN_CHOOSE", "EMP_EXEC_LOOP", label="(New Owner Starts Work)", exitX=0.5, exitY=0, entryX=0.75, entryY=1, points=[(1985, 1365), (2127, 1365)])
    add_edge("E_ISSUE_TRIG", "EMP_EXEC_LOOP", "EMP_ISSUE_CHK", exitX=0.5, exitY=1, entryX=0.5, entryY=0)
    add_edge("E_ISSUE_YES", "EMP_ISSUE_CHK", "EMP_ISSUE_RAISE", label="(Yes: Blocker Found)", exitX=0.5, exitY=1, entryX=0.5, entryY=0)
    add_edge("E_ISSUE_NO", "EMP_ISSUE_CHK", "EMP_EXEC_LOOP", label="(No Issues)", exitX=0, exitY=0.5, entryX=0, entryY=0.5, points=[(1810, 1427), (1810, 1250)])
    add_edge("E_ISSUE_RAISE_MGR", "EMP_ISSUE_RAISE", "EMP_ISSUE_MGR")
    add_edge("E_ISSUE_MGR_YES", "EMP_ISSUE_MGR", "EMP_ISSUE_SEV", label="(Yes)", exitX=0.5, exitY=1, entryX=0.5, entryY=0)
    add_edge("E_ISSUE_SEV_RES", "EMP_ISSUE_SEV", "EMP_ISSUE_RES")
    add_edge("E_ISSUE_RES_OK", "EMP_ISSUE_RES", "EMP_ISSUE_RESOLVED", label="(Resolve)", exitX=0, exitY=0.5, entryX=0.5, entryY=0)
    add_edge("E_ISSUE_RES_ESCL", "EMP_ISSUE_RES", "EMP_ISSUE_ESCL", label="(Escalate)", exitX=1, exitY=0.5, entryX=0.5, entryY=0)
    add_edge("E_RES_BACK_WORK", "EMP_ISSUE_RESOLVED", "EMP_EXEC_LOOP", label="(Blocker Cleared)", exitX=0.5, exitY=0, entryX=0.35, entryY=1, points=[(1860, 1365), (1955, 1365)])

    # =========================================================================
    # LAYER 3: THE INTELLIGENCE, ANALYTICS & REWARD LAYER (y = 2290 to 3250)
    # Divided into 4 Key Strategic Centers:
    # 1. Intelligence & Analytics Center (Left: x = 120..660)
    # 2. Automated Reporting Dispatcher (Center-Left: x = 700..1200)
    # 3. 100-Point Reward & Recognition Engine (Center-Right: x = 1240..1760)
    # 4. Chairman Apex Executive Cockpit (Right: x = 1800..2360)
    # =========================================================================
    
    # --- MODULE 1: INTELLIGENCE & ANALYTICS CENTER ---
    add_node("L3_SEC_ANALYTICS", "<b>[INTELLIGENCE & ANALYTICS CENTER]</b><br><font size=\"1\">The 6 Operational Analytics & Predictive Engines</font>", 180, 2340, 460, 50, STYLE_SUBHDR_AMBER)
    add_node("L3_ANA_1", "1. Performance & Velocity Engine (Task SLA, Delivery Duration)", 200, 2410, 420, 32, STYLE_PROCESS_NEUTRAL)
    add_node("L3_ANA_2", "2. Workload Distribution Radar (Capacity % & Burnout Warning)", 200, 2455, 420, 32, STYLE_PROCESS_NEUTRAL)
    add_node("L3_ANA_3", "3. Workforce Attendance & Location Health (Punctuality Index)", 200, 2500, 420, 32, STYLE_PROCESS_NEUTRAL)
    add_node("L3_ANA_4", "4. Historical Trend Analysis (MoM, QoQ Alliance Comparison)", 200, 2545, 420, 32, STYLE_PROCESS_NEUTRAL)
    add_node("L3_ANA_5", "5. 3-Tier Risk Engine (Low, Medium, Critical Risk Flags)", 200, 2590, 420, 32, STYLE_PROCESS_ALERT)
    add_node("L3_ANA_6", "6. Predictive Early Warning Signals (Pre-Breach SLA Alarms)", 200, 2635, 420, 32, STYLE_PROCESS_NEUTRAL)

    # --- MODULE 2: AUTOMATED REPORTING ENGINE ---
    add_node("L3_SEC_REPORTS", "<b>[AUTOMATED REPORTING DISPATCHER]</b><br><font size=\"1\">Cadenced Multi-Audience Reporting Rhythms</font>", 720, 2340, 460, 50, STYLE_SUBHDR_BLUE)
    add_node("L3_REP_DAILY", "<b>Daily Operational Digest (18:30 IST)</b><br><font size=\"1\">Completed tasks, blockers, tomorrow's priority queue</font>", 740, 2410, 420, 45, STYLE_PROCESS_NEUTRAL)
    add_node("L3_REP_WEEKLY", "<b>Weekly Scorecard (Monday 09:00 IST)</b><br><font size=\"1\">Team SLA on-time rate, workload distribution health</font>", 740, 2475, 420, 45, STYLE_PROCESS_NEUTRAL)
    add_node("L3_REP_MONTHLY", "<b>Monthly Executive Summary (1st of Month)</b><br><font size=\"1\">Alliance growth, royalty totals, reward candidate dossier</font>", 740, 2540, 420, 45, STYLE_PROCESS_NEUTRAL)
    add_node("L3_REP_DISPATCH", "Automated Multi-Channel Dispatch<br><font size=\"1\">(Role-Scoped Dashboard, Exportable PDF & Email Alerts)</font>", 740, 2605, 420, 40, STYLE_PROCESS_SUCCESS)

    # --- MODULE 3: PERFORMANCE REWARD & RECOGNITION SYSTEM ---
    add_node("L3_SEC_REWARDS", "<b>[PERFORMANCE REWARD & RECOGNITION]</b><br><font size=\"1\">Objective 100-Point Scoring & Continuous Honor Cycles</font>", 1260, 2340, 490, 50, STYLE_DASH_REWARD)
    add_node("L3_REW_FORMULA", "<b>100-Point Monthly Scoring Formula Engine</b><br><font size=\"1\">Velocity (35) + SLA (30) + Quality (15) + Location (10) + Initiative (10)</font>", 1280, 2410, 450, 45, STYLE_PROCESS_NEUTRAL)
    add_node("L3_REW_TIER", "Monthly Tier Evaluation: Gold (90-100) | Silver (80-89) | Bronze (70-79)", 1280, 2475, 450, 35, STYLE_PROCESS_NEUTRAL)
    add_node("L3_REW_MONTHLY_AWARD", "<b>Monthly Star Performer of the Month</b><br><font size=\"1\">(Gold Badge, Spot Cash Bonus & Corporate Spotlight)</font>", 1280, 2530, 450, 45, STYLE_AWARD_GOLD)
    add_node("L3_REW_3MO_CHK", "3 Consecutive<br>Gold Months?", 1415, 2595, 180, 75, STYLE_RHOMBUS)
    add_node("L3_REW_RESET", "Streak Reset / Increment Counter<br><font size=\"1\">(Requires Unwavering 90-Day Consistency)</font>", 1260, 2695, 230, 45, STYLE_PROCESS_NEUTRAL)
    add_node("L3_REW_QUARTERLY_AWARD", "<b>CHAIRMAN'S QUARTERLY EXCELLENCE AWARD</b><br><font size=\"1\">Prestigious Trophy, Substantial Bonus, Gold Profile Medallion</font>", 1510, 2695, 260, 50, STYLE_AWARD_GOLD)

    # --- MODULE 4: CHAIRMAN APEX EXECUTIVE COCKPIT ---
    add_node("L3_SEC_CHAIRMAN", "<b>[CHAIRMAN - EXECUTIVE COCKPIT]</b><br><font size=\"1\">Apex Radar, Commercial Deals, Royalties & Interventions</font>", 1820, 2340, 520, 50, STYLE_DASH_CHAIRMAN)
    add_node("L3_CHAIR_RADAR", "360-Degree Enterprise Operational Health Radar", 1845, 2410, 470, 32, STYLE_PROCESS_NEUTRAL)
    add_node("L3_CHAIR_COMMERCIAL", "Commercial Deal Pipeline & 7.5% Royalty Revenue Health", 1845, 2455, 470, 32, STYLE_PROCESS_NEUTRAL)
    add_node("L3_CHAIR_ATTN", "Executive \"Requires Attention\" Radar (Overdue >48h, Blockers)", 1845, 2500, 470, 32, STYLE_PROCESS_ALERT)
    add_node("L3_CHAIR_SECURITY", "Workforce Attendance, Remote Trends & Security Anomaly Radar", 1845, 2545, 470, 32, STYLE_PROCESS_NEUTRAL)
    add_node("L3_CHAIR_SIGN_OFF", "<b>Chairman Personal Sign-Off on Quarterly Excellence Awards</b>", 1845, 2600, 470, 40, STYLE_AWARD_GOLD)
    add_node("L3_CHAIR_ANNOUNCE", "Broadcast Enterprise-Wide Strategic Directives & Announcements", 1845, 2660, 470, 35, STYLE_PROCESS_NEUTRAL)
    add_node("L3_CHAIR_INTERVENE", "<b>Executive Strategic Intervention</b><br><font size=\"1\">(High-Impact Directives Rebalancing Operations)</font>", 1845, 2715, 470, 40, STYLE_PROCESS_ALERT)

    # Layer 3 Internal Connections
    # Analytics to Reports
    add_edge("E_L3_ANA_REP", "L3_ANA_4", "L3_REP_DISPATCH", label="(Intelligence Telemetry)", style=STYLE_EDGE_TELEMETRY, exitX=1, exitY=0.5, entryX=0, entryY=0.5)
    # Reports Dispatch to Chairman
    add_edge("E_L3_REP_CHAIR", "L3_REP_MONTHLY", "L3_CHAIR_RADAR", label="(Monthly Dossier)", exitX=1, exitY=0.5, entryX=0, entryY=0.5, points=[(1780, 2562), (1780, 2426)])
    
    # Rewards Flow
    add_edge("E_L3_REW_1", "L3_REW_FORMULA", "L3_REW_TIER")
    add_edge("E_L3_REW_2", "L3_REW_TIER", "L3_REW_MONTHLY_AWARD", label="(Score >= 90: Gold)")
    add_edge("E_L3_REW_3", "L3_REW_MONTHLY_AWARD", "L3_REW_3MO_CHK")
    add_edge("E_L3_REW_NO", "L3_REW_3MO_CHK", "L3_REW_RESET", label="(<3 Months)", exitX=0, exitY=0.5, entryX=0.5, entryY=0)
    add_edge("E_L3_REW_YES", "L3_REW_3MO_CHK", "L3_REW_QUARTERLY_AWARD", label="(3 Consec. Gold Months)", exitX=1, exitY=0.5, entryX=0.5, entryY=0)
    
    # Chairman Signs Off on Quarterly Award
    add_edge("E_L3_CHAIR_SIGN", "L3_REW_QUARTERLY_AWARD", "L3_CHAIR_SIGN_OFF", label="(Executive Dossier Approval)", exitX=1, exitY=0.5, entryX=0, entryY=0.5)
    
    # Telemetry Feeding from Layer 2 into Layer 3
    # 1. Manager QA Approved connects to Performance Scoring
    add_edge("E_L2_TO_L3_PERF", "MGR_QA_CLOSE", "L3_REW_FORMULA", label="(Completed Deliverables Telemetry)", style=STYLE_EDGE_TELEMETRY, exitX=0.5, exitY=1, entryX=0.25, entryY=0, points=[(1240, 2220), (1392, 2220)])
    # 2. Location & Attendance connects to Attendance Health
    add_edge("E_L2_TO_L3_ATT", "ADM_LOC_3", "L3_ANA_3", label="(Attendance Telemetry)", style=STYLE_EDGE_TELEMETRY, exitX=0.5, exitY=1, entryX=0.5, entryY=0, points=[(425, 2220), (410, 2220)])
    # 3. Overdue & Blocker Exceptions connect to Risk Engine & Chairman
    add_edge("E_L2_TO_L3_RISK", "MGR_OD_ESCL", "L3_ANA_5", label="(Exception Telemetry)", style=STYLE_EDGE_TELEMETRY, exitX=0.5, exitY=1, entryX=0.75, entryY=0, points=[(955, 2240), (515, 2240)])

    # Strategic Intervention loops back to Management Layer
    add_edge("E_L3_CHAIR_FEEDBACK", "L3_CHAIR_INTERVENE", "DASH_MGR", label="(Strategic Operational Directives)", exitX=0.5, exitY=0, entryX=0.8, entryY=1, points=[(2080, 2180), (1327, 2180)])

    # =========================================================================
    # THE IMMUTABLE AUDIT LOG (Bottom Anchor Node)
    # y = 3320, center x = 1240
    # =========================================================================
    add_node(
        "AUDIT_STORE",
        "<b>[LOCK] Store changes in audit log</b><br><font size=\"1\">Immutable, Tamper-Proof Activity &amp; Governance Ledger (All Layers Audited)</font>",
        920, 3320, 640, 65, STYLE_AUDIT_TERMINUS
    )

    # Route dashed provenance lines from critical events into Store changes in audit log
    # 1. From Layer 1 Login Audit
    add_edge("E_AUDIT_1", "L1_AUDIT_LOGIN", "AUDIT_STORE", label="(Login & Location Logged)", style=STYLE_EDGE_DASHED_AUDIT, exitX=0, exitY=0.5, entryX=0.15, entryY=0, points=[(60, 560), (60, 3280), (1016, 3280)])
    # 2. From Admin User Provisioning / Permission changes
    add_edge("E_AUDIT_2", "ADM_UM_2", "AUDIT_STORE", label="(Roles & Permissions Changed)", style=STYLE_EDGE_DASHED_AUDIT, exitX=1, exitY=0.5, entryX=0.3, entryY=0, points=[(780, 1013), (780, 2270), (700, 2270), (700, 3280), (1112, 3280)])
    # 3. From Task Completed & Closed
    add_edge("E_AUDIT_3", "MGR_QA_CLOSE", "AUDIT_STORE", label="(Task Completed & Closed)", style=STYLE_EDGE_DASHED_AUDIT, exitX=0.2, exitY=1, entryX=0.45, entryY=0, points=[(1162, 2270), (1208, 2270), (1208, 3280)])
    # 4. From Reassignment Decision
    add_edge("E_AUDIT_4", "MGR_OD_REASS", "AUDIT_STORE", label="(Task Reassigned Audit)", style=STYLE_EDGE_DASHED_AUDIT, exitX=0.5, exitY=1, entryX=0.4, entryY=0, points=[(955, 2250), (1176, 2250), (1176, 3280)])
    # 5. From Escalation to Higher Authority
    add_edge("E_AUDIT_5", "EMP_ISSUE_ESCL", "AUDIT_STORE", label="(Escalation Recorded)", style=STYLE_EDGE_DASHED_AUDIT, exitX=0.5, exitY=1, entryX=0.7, entryY=0, points=[(2155, 2270), (2280, 2270), (2280, 3280), (1368, 3280)])
    # 6. From Admin Force Approval
    add_edge("E_AUDIT_6", "ADM_GTM_4", "AUDIT_STORE", label="(Admin Force-Approval)", style=STYLE_EDGE_DASHED_AUDIT, exitX=1, exitY=0.5, entryX=0.25, entryY=0, points=[(760, 1327), (760, 2260), (680, 2260), (680, 3280), (1080, 3280)])
    # 7. From Chairman Award Sign-off (Layer 3 Audit)
    add_edge("E_AUDIT_7", "L3_CHAIR_SIGN_OFF", "AUDIT_STORE", label="(Award Conferral Logged)", style=STYLE_EDGE_DASHED_AUDIT, exitX=0.5, exitY=1, entryX=0.85, entryY=0, points=[(2080, 3280), (1464, 3280)])

    xml_str = ET.tostring(mxfile, encoding="utf-8")
    parsed = minidom.parseString(xml_str)
    pretty_xml = parsed.toprettyxml(indent="  ")
    
    # Clean up blank lines in XML
    clean_lines = [line for line in pretty_xml.split("\n") if line.strip()]
    final_xml = "\n".join(clean_lines)
    
    out_dir = os.path.join(".", "flowchart-detailed")
    os.makedirs(out_dir, exist_ok=True)
    out_file = os.path.join(out_dir, "updated_new_flowchart.drawio")
    
    with open(out_file, "w", encoding="utf-8") as f:
        f.write(final_xml)
        
    print(f"Successfully generated {out_file} (Bytes: {len(final_xml)})")
    return final_xml, out_file

if __name__ == "__main__":
    generate_drawio_xml()
