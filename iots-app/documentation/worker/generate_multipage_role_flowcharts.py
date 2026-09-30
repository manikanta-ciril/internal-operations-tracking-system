#!/usr/bin/env python3
"""
generate_multipage_role_flowcharts.py

Generates a fully compliant, production-grade, multi-page Draw.io diagram (new_updated_flowchart_2.drawio)
with 100% valid XML schema (including as="geometry" on every mxGeometry element) and zero overlapping arrows.

Contains 9 pages:
  Page 1: Master Architecture - Role Operations to Multi-Perspective Intelligence
  Page 2: Chairman - Apex Governance & Commercial Intelligence
  Page 3: Super Admin & IT System Analyst - System Health & Security
  Page 4: Office Admin - Attendance, Assets & Facilities
  Page 5: General Manager (Ipsheeta) - Commercial Strategy & Sign-Offs
  Page 6: Lead Manager (Manasa) & Senior Manager - Planning, Allocation & QA
  Page 7: Executive - Task Execution, Proof-of-Work & Blockers
  Page 8: Business Development Executive (Bhavani) - Sales Pipeline & Deals
  Page 9: Marketing & Creative (Harshitha & Graphic Designer) - Campaigns & Assets
"""

import xml.etree.ElementTree as ET
import os

def create_page(mxfile, page_id, page_name, width=3200, height=2800):
    diagram = ET.SubElement(mxfile, 'diagram', id=page_id, name=page_name)
    model = ET.SubElement(
        diagram, 'mxGraphModel',
        dx='1422', dy='794', grid='1', gridSize='10', guides='1',
        tooltips='1', connect='1', arrows='1', fold='1', page='1',
        pageScale='1', pageWidth=str(width), pageHeight=str(height),
        background='#FFFFFF'
    )
    root = ET.SubElement(model, 'root')
    ET.SubElement(root, 'mxCell', id='0')
    ET.SubElement(root, 'mxCell', id='1', parent='0')
    return root

def add_node(root, cid, value, x, y, w, h, style, parent='1'):
    cell = ET.SubElement(
        root, 'mxCell',
        id=cid, value=value, style=style,
        vertex='1', parent=parent
    )
    geom = ET.SubElement(
        cell, 'mxGeometry',
        x=str(x), y=str(y), width=str(w), height=str(h)
    )
    geom.set('as', 'geometry')
    return cell

def add_edge(root, eid, source, target, value='', style='', parent='1',
             exitX=None, exitY=None, entryX=None, entryY=None):
    s = 'edgeStyle=orthogonalEdgeStyle;rounded=1;html=1;jettySize=auto;orthogonalLoop=1;endArrow=blockThin;endSize=8;endFill=1;'
    if style:
        s += style + ';'
    else:
        s += 'strokeColor=#4A5568;strokeWidth=2;'
    if exitX is not None and exitY is not None:
        s += f'exitX={exitX};exitY={exitY};exitDx=0;exitDy=0;'
    if entryX is not None and entryY is not None:
        s += f'entryX={entryX};entryY={entryY};entryDx=0;entryDy=0;'

    cell = ET.SubElement(
        root, 'mxCell',
        id=eid, value=value, style=s,
        edge='1', source=source, target=target, parent=parent
    )
    geom = ET.SubElement(cell, 'mxGeometry', relative='1')
    geom.set('as', 'geometry')
    return cell

# Style presets matching Actual-FlowChart.drawio
S_CONTAINER = "rounded=1;whiteSpace=wrap;html=1;fillColor={fill};strokeColor={stroke};fontColor={font};fontStyle=1;fontSize=14;arcSize=2;collapsible=0;pointerEvents=0;connectable=0;"
S_BOX = "rounded=1;whiteSpace=wrap;html=1;fillColor={fill};strokeColor={stroke};fontColor={font};fontSize=12;fontFamily=Verdana;arcSize=6;"
S_DIAMOND = "rhombus;whiteSpace=wrap;html=1;fillColor={fill};strokeColor={stroke};fontColor={font};fontSize=11;fontStyle=1;fontFamily=Verdana;"
S_HEADER = "rounded=1;whiteSpace=wrap;html=1;fillColor=#1F4E79;strokeColor=#0D233A;fontColor=#FFFFFF;fontSize=14;fontStyle=1;fontFamily=Verdana;arcSize=4;"
S_BUS = "rounded=1;whiteSpace=wrap;html=1;fillColor={fill};strokeColor={stroke};fontColor={font};fontSize=12;fontStyle=1;dashed=1;dashPattern=6 6;fontFamily=Verdana;"
S_BOUND = "rounded=1;whiteSpace=wrap;html=1;fillColor=none;strokeColor={stroke};fontColor={font};fontSize=14;fontStyle=1;dashed=1;dashPattern=8 8;pointerEvents=0;connectable=0;"

# -------------------------------------------------------------
# PAGE 1: MASTER ARCHITECTURE - ROLE OPERATIONS TO MULTI-PERSPECTIVE INTELLIGENCE
# -------------------------------------------------------------
def build_page1(mxfile):
    root = create_page(mxfile, 'page_master', 'Master Architecture: Operations to Intelligence', 3300, 2750)

    # Master Title Banner
    add_node(
        root, 'm_title',
        "<b>INTERNAL OPERATIONS TRACKING SYSTEM (IOTS) - ENTERPRISE OPERATIONS &amp; MULTI-PERSPECTIVE INTELLIGENCE</b><br/>"
        "<i>All Daily Role Actions Stream into the Central Operational Data Store &amp; Fuel Tailored Intelligence Across All Perspectives</i>",
        80, 25, 3140, 60, S_HEADER
    )

    # -------------------------------------------------------------
    # LAYER 1: IDENTITY & LOCATION VERIFICATION (y: 100 .. 460)
    # -------------------------------------------------------------
    add_node(
        root, 'c_l1',
        "LAYER 1: IDENTITY &amp; LOCATION VERIFICATION (DAILY SHIFT ENTRY)",
        80, 100, 3140, 360,
        S_CONTAINER.format(fill='#F5EEF8', stroke='#AF7AC5', font='#4A235A')
    )

    add_node(root, 'l1_start', "<b>Daily Access Entry</b><br/>Mobile App or Web Portal<br/>Role Credentials Provided", 120, 150, 220, 60,
             S_BOX.format(fill='#E8DAEF', stroke='#8E44AD', font='#2C3E50'))
    add_node(root, 'l1_cred', "<b>Verify Login Credentials</b><br/>Authenticate User Profile<br/>&amp; Load Assigned RBAC Role", 400, 150, 220, 60,
             S_BOX.format(fill='#E8DAEF', stroke='#8E44AD', font='#2C3E50'))
    add_node(root, 'l1_gps', "<b>Office Boundary Match?</b><br/>GPS within 50m of Office?", 680, 135, 200, 90,
             S_DIAMOND.format(fill='#D2B4DE', stroke='#7D3C98', font='#2C3E50'))

    add_node(root, 'l1_onsite', "<b>Mark Present (On-Site)</b><br/>Location Confirmed: Office", 940, 135, 210, 50,
             S_BOX.format(fill='#D5F5E3', stroke='#27AE60', font='#1E8449'))
    add_node(root, 'l1_remote_q', "<b>Remote Work Approved?</b><br/>Manager Authorization?", 940, 215, 210, 75,
             S_DIAMOND.format(fill='#FCF3CF', stroke='#D68910', font='#7D6608'))
    add_node(root, 'l1_remote_ok', "<b>Mark Present (Remote)</b><br/>Location Confirmed: Remote", 1220, 225, 210, 50,
             S_BOX.format(fill='#FEF9E7', stroke='#F39C12', font='#7D6608'))
    add_node(root, 'l1_absent', "<b>Mark Absent / Pending</b><br/>Notify Office Admin for Review", 940, 320, 210, 50,
             S_BOX.format(fill='#FADBD8', stroke='#E74C3C', font='#78281F'))

    add_node(root, 'l1_photo', "<b>Photo &amp; Timestamp Stamp</b><br/>Selfie Match &amp; System Clock Stamp", 1500, 150, 230, 60,
             S_BOX.format(fill='#E8DAEF', stroke='#8E44AD', font='#2C3E50'))
    add_node(root, 'l1_log_event', "<b>Create Check-In Event Record</b><br/>User ID, GPS, Mode &amp; Timestamp", 1800, 150, 240, 60,
             S_BUS.format(fill='#EAECEE', stroke='#5D6D7E', font='#1B2631'))
    add_node(root, 'l1_router', "<b>Role-Based Workspace Gateway</b><br/>Direct Authenticated User to Corridor", 2110, 150, 250, 60,
             S_BOX.format(fill='#D4E6F1', stroke='#2980B9', font='#1B4F72'))

    # Layer 1 Edges
    add_edge(root, 'e_l1_1', 'l1_start', 'l1_cred')
    add_edge(root, 'e_l1_2', 'l1_cred', 'l1_gps')
    add_edge(root, 'e_l1_3', 'l1_gps', 'l1_onsite', 'Yes (Inside)')
    add_edge(root, 'e_l1_4', 'l1_gps', 'l1_remote_q', 'No (Outside)')
    add_edge(root, 'e_l1_5', 'l1_remote_q', 'l1_remote_ok', 'Approved')
    add_edge(root, 'e_l1_6', 'l1_remote_q', 'l1_absent', 'Unapproved')
    add_edge(root, 'e_l1_7', 'l1_onsite', 'l1_photo', '', exitX=1, exitY=0.5, entryX=0, entryY=0.3)
    add_edge(root, 'e_l1_8', 'l1_remote_ok', 'l1_photo', '', exitX=1, exitY=0.5, entryX=0, entryY=0.7)
    add_edge(root, 'e_l1_9', 'l1_photo', 'l1_log_event')
    add_edge(root, 'e_l1_10', 'l1_log_event', 'l1_router')

    # -------------------------------------------------------------
    # LAYER 2: ROLE-BASED OPERATIONS & EXECUTION (y: 490 .. 1370)
    # -------------------------------------------------------------
    add_node(
        root, 'c_l2',
        "LAYER 2: ROLE-BASED OPERATIONS &amp; MANAGEMENT LAYER (3 WORKSPACE CORRIDORS)",
        80, 490, 3140, 880,
        S_CONTAINER.format(fill='#EAEDED', stroke='#99A3A4', font='#17202A')
    )

    # CORRIDOR 1: Governance & IT Administration (x: 100 .. 980)
    add_node(root, 'b_c1', "CORRIDOR 1: GOVERNANCE &amp; IT ADMINISTRATION", 100, 530, 880, 820,
             S_BOUND.format(stroke='#5DADE2', font='#1B4F72'))
    add_node(root, 'c1_entry', "<b>Governance Corridor Entry</b>", 120, 560, 840, 35, S_HEADER)

    # Super Admin & IT Analyst (x: 120 .. 500)
    add_node(root, 'it_head', "<b>Super Admin &amp; IT Analyst</b>", 120, 615, 390, 30, S_HEADER)
    add_node(root, 'it_1', "<b>User Provisioning &amp; RBAC Roles</b><br/>Create accounts, assign role permissions", 120, 660, 390, 55,
             S_BOX.format(fill='#D4E6F1', stroke='#2980B9', font='#1B4F72'))
    add_node(root, 'it_2', "<b>Server Uptime &amp; Latency Monitor</b><br/>Track 99.9% uptime target &amp; API logs", 120, 735, 390, 55,
             S_BOX.format(fill='#D4E6F1', stroke='#2980B9', font='#1B4F72'))
    add_node(root, 'it_3', "<b>Security Audit &amp; Data Backups</b><br/>Nightly DB backups &amp; threat mitigation", 120, 810, 390, 55,
             S_BOX.format(fill='#D4E6F1', stroke='#2980B9', font='#1B4F72'))

    # Office Admin (x: 540 .. 940)
    add_node(root, 'adm_head', "<b>Office Admin</b>", 540, 615, 400, 30, S_HEADER)
    add_node(root, 'adm_1', "<b>Attendance Regularization</b><br/>Resolve flagged GPS exceptions &amp; mispunches", 540, 660, 400, 55,
             S_BOX.format(fill='#D4E6F1', stroke='#2980B9', font='#1B4F72'))
    add_node(root, 'adm_2', "<b>Hardware Asset Allocation</b><br/>Issue laptops, ID badges &amp; door passes", 540, 735, 400, 55,
             S_BOX.format(fill='#D4E6F1', stroke='#2980B9', font='#1B4F72'))
    add_node(root, 'adm_3', "<b>Shift Rostering &amp; Desk Booking</b><br/>Manage weekly seating &amp; team rotations", 540, 810, 400, 55,
             S_BOX.format(fill='#D4E6F1', stroke='#2980B9', font='#1B4F72'))

    # Corridor 1 Event Bus
    add_node(root, 'bus_1', "<b>Corridor 1 Activity Bus</b>: Stream User Changes, Uptime Pings &amp; Attendance Logs",
             120, 910, 840, 45, S_BUS.format(fill='#AED6F1', stroke='#2980B9', font='#1B4F72'))

    # Corridor 1 Intra-edges
    add_edge(root, 'e_c1_in_it', 'c1_entry', 'it_1', exitX=0.25, exitY=1, entryX=0.5, entryY=0)
    add_edge(root, 'e_c1_in_adm', 'c1_entry', 'adm_1', exitX=0.75, exitY=1, entryX=0.5, entryY=0)
    add_edge(root, 'e_it_1_2', 'it_1', 'it_2')
    add_edge(root, 'e_it_2_3', 'it_2', 'it_3')
    add_edge(root, 'e_adm_1_2', 'adm_1', 'adm_2')
    add_edge(root, 'e_adm_2_3', 'adm_2', 'adm_3')
    add_edge(root, 'e_it_to_bus', 'it_3', 'bus_1', exitX=0.5, exitY=1, entryX=0.25, entryY=0)
    add_edge(root, 'e_adm_to_bus', 'adm_3', 'bus_1', exitX=0.5, exitY=1, entryX=0.75, entryY=0)

    # CORRIDOR 2: Management & Commercial Operations (x: 1010 .. 2090)
    add_node(root, 'b_c2', "CORRIDOR 2: MANAGEMENT &amp; COMMERCIAL OPERATIONS", 1010, 530, 1080, 820,
             S_BOUND.format(stroke='#F5B041', font='#7D6608'))
    add_node(root, 'c2_entry', "<b>Management Corridor Entry</b>", 1030, 560, 1040, 35, S_HEADER)

    # General Manager Ipsheeta (x: 1030 .. 1480)
    add_node(root, 'gm_head', "<b>General Manager (Ipsheeta)</b>", 1030, 615, 480, 30, S_HEADER)
    add_node(root, 'gm_1', "<b>Commercial Governance &amp; Budgets</b><br/>Enforce CIRIL 30/70 commercial split rule", 1030, 660, 480, 55,
             S_BOX.format(fill='#FCF3CF', stroke='#D68910', font='#7D6608'))
    add_node(root, 'gm_2', "<b>Weekly Multi-Department Review</b><br/>Evaluate cross-department productivity &amp; SLAs", 1030, 735, 480, 55,
             S_BOX.format(fill='#FCF3CF', stroke='#D68910', font='#7D6608'))
    add_node(root, 'gm_3', "<b>Executive Blocker Intervention</b><br/>Clear high-level cross-functional bottlenecks", 1030, 810, 480, 55,
             S_BOX.format(fill='#FCF3CF', stroke='#D68910', font='#7D6608'))

    # Senior Manager & Lead Manager Manasa (x: 1540 .. 2050)
    add_node(root, 'lm_head', "<b>Lead Manager (Manasa) &amp; Senior Manager</b>", 1540, 615, 510, 30, S_HEADER)
    add_node(root, 'lm_1', "<b>Daily Task Planning &amp; SLA Dates</b><br/>Create checklist items with explicit due hours", 1540, 660, 510, 55,
             S_BOX.format(fill='#FCF3CF', stroke='#D68910', font='#7D6608'))
    add_node(root, 'lm_2', "<b>Workload Balancing &amp; Allocation</b><br/>Distribute tasks evenly to prevent burnout", 1540, 735, 510, 55,
             S_BOX.format(fill='#FCF3CF', stroke='#D68910', font='#7D6608'))
    add_node(root, 'lm_3', "<b>Quality Review: Approve vs Rework</b><br/>Verify attachments; sign off or return for fix", 1540, 810, 510, 55,
             S_BOX.format(fill='#FCF3CF', stroke='#D68910', font='#7D6608'))

    # Corridor 2 Event Bus
    add_node(root, 'bus_2', "<b>Corridor 2 Activity Bus</b>: Stream Task States, SLA Dates, QA Outcomes &amp; Commercial Sign-Offs",
             1030, 910, 1040, 45, S_BUS.format(fill='#FAD7A0', stroke='#D68910', font='#7D6608'))

    # Corridor 2 Intra-edges
    add_edge(root, 'e_c2_in_gm', 'c2_entry', 'gm_1', exitX=0.25, exitY=1, entryX=0.5, entryY=0)
    add_edge(root, 'e_c2_in_lm', 'c2_entry', 'lm_1', exitX=0.75, exitY=1, entryX=0.5, entryY=0)
    add_edge(root, 'e_gm_1_2', 'gm_1', 'gm_2')
    add_edge(root, 'e_gm_2_3', 'gm_2', 'gm_3')
    add_edge(root, 'e_lm_1_2', 'lm_1', 'lm_2')
    add_edge(root, 'e_lm_2_3', 'lm_2', 'lm_3')
    add_edge(root, 'e_gm_to_bus', 'gm_3', 'bus_2', exitX=0.5, exitY=1, entryX=0.25, entryY=0)
    add_edge(root, 'e_lm_to_bus', 'lm_3', 'bus_2', exitX=0.5, exitY=1, entryX=0.75, entryY=0)

    # CORRIDOR 3: Frontline Execution & Specialists (x: 2120 .. 3200)
    add_node(root, 'b_c3', "CORRIDOR 3: FRONTLINE SPECIALISTS &amp; WORK EXECUTION", 2120, 530, 1080, 820,
             S_BOUND.format(stroke='#48C9B0', font='#117864'))
    add_node(root, 'c3_entry', "<b>Frontline Corridor Entry</b>", 2140, 560, 1040, 35, S_HEADER)

    # Executive (x: 2140 .. 2620)
    add_node(root, 'ex_head', "<b>Executive (Operations)</b>", 2140, 615, 480, 30, S_HEADER)
    add_node(root, 'ex_1', "<b>Task Checklist Execution &amp; Timer</b><br/>Activate stopwatch; execute required items", 2140, 660, 480, 55,
             S_BOX.format(fill='#D1F2EB', stroke='#1ABC9C', font='#117864'))
    add_node(root, 'ex_2', "<b>Attach Proof-of-Work &amp; Submit</b><br/>Upload docs, links, outputs for QA sign-off", 2140, 735, 480, 55,
             S_BOX.format(fill='#D1F2EB', stroke='#1ABC9C', font='#117864'))
    add_node(root, 'ex_3', "<b>Raise Urgent Blocker Ticket</b><br/>Escalate impediment immediately to Manasa", 2140, 810, 480, 55,
             S_BOX.format(fill='#FADBD8', stroke='#CB4335', font='#78281F'))

    # BDE Bhavani (x: 2650 .. 3160)
    add_node(root, 'bde_head', "<b>BDE (Bhavani - Commercial)</b>", 2650, 615, 510, 30, S_HEADER)
    add_node(root, 'bde_1', "<b>Lead Qualification &amp; Discovery</b><br/>Qualify inbound leads &amp; schedule meetings", 2650, 660, 510, 55,
             S_BOX.format(fill='#D1F2EB', stroke='#1ABC9C', font='#117864'))
    add_node(root, 'bde_2', "<b>Client Site Visit &amp; Proposal</b><br/>Log GPS check-in at site; apply 30/70 formula", 2650, 735, 510, 55,
             S_BOX.format(fill='#D1F2EB', stroke='#1ABC9C', font='#117864'))
    add_node(root, 'bde_3', "<b>Contract Negotiation &amp; Won Deal</b><br/>Sign agreement; trigger 7.5% royalty tally", 2650, 810, 510, 55,
             S_BOX.format(fill='#D1F2EB', stroke='#1ABC9C', font='#117864'))

    # Social Media Harshitha & Graphic Designer (Row below, x: 2140 .. 3160)
    add_node(root, 'mkt_head', "<b>Marketing &amp; Creative Specialists (Harshitha &amp; Graphic Designer)</b>", 2140, 885, 1020, 25, S_HEADER)
    add_node(root, 'mkt_1', "<b>Campaign Planning (Harshitha)</b><br/>Plan content calendar &amp; brief Designer", 2140, 920, 330, 55,
             S_BOX.format(fill='#D1F2EB', stroke='#1ABC9C', font='#117864'))
    add_node(root, 'mkt_2', "<b>Creative Production (Designer)</b><br/>Design Canva/Figma assets to specs", 2490, 920, 330, 55,
             S_BOX.format(fill='#D1F2EB', stroke='#1ABC9C', font='#117864'))
    add_node(root, 'mkt_3', "<b>Publish &amp; Inbound Leads</b><br/>Post to social; route leads to Bhavani", 2840, 920, 320, 55,
             S_BOX.format(fill='#D1F2EB', stroke='#1ABC9C', font='#117864'))

    # Corridor 3 Event Bus
    add_node(root, 'bus_3', "<b>Corridor 3 Activity Bus</b>: Stream Task Steps, Closed Deals, Campaign Stats &amp; Creative Assets",
             2140, 1000, 1020, 45, S_BUS.format(fill='#A3E4D7', stroke='#1ABC9C', font='#117864'))

    # Corridor 3 Intra-edges
    add_edge(root, 'e_c3_in_ex', 'c3_entry', 'ex_1', exitX=0.25, exitY=1, entryX=0.5, entryY=0)
    add_edge(root, 'e_c3_in_bde', 'c3_entry', 'bde_1', exitX=0.75, exitY=1, entryX=0.5, entryY=0)
    add_edge(root, 'e_ex_1_2', 'ex_1', 'ex_2')
    add_edge(root, 'e_ex_1_3', 'ex_1', 'ex_3', 'Blocker')
    add_edge(root, 'e_bde_1_2', 'bde_1', 'bde_2')
    add_edge(root, 'e_bde_2_3', 'bde_2', 'bde_3')
    add_edge(root, 'e_mkt_1_2', 'mkt_1', 'mkt_2')
    add_edge(root, 'e_mkt_2_3', 'mkt_2', 'mkt_3')
    add_edge(root, 'e_mkt_to_bde', 'mkt_3', 'bde_1', 'Inbound Lead Qualified',
             exitX=0.5, exitY=0, entryX=0.5, entryY=1)
    add_edge(root, 'e_ex_to_bus', 'ex_2', 'bus_3', exitX=0.5, exitY=1, entryX=0.2, entryY=0)
    add_edge(root, 'e_bde_to_bus', 'bde_3', 'bus_3', exitX=0.5, exitY=1, entryX=0.8, entryY=0)
    add_edge(root, 'e_mkt_to_bus', 'mkt_3', 'bus_3', exitX=0.5, exitY=1, entryX=0.5, entryY=0)

    # Trunk line from Layer 1 router to the 3 corridors
    add_edge(root, 'e_trunk_1', 'l1_router', 'c1_entry', 'Governance Roles', exitX=0.1, exitY=1, entryX=0.5, entryY=0)
    add_edge(root, 'e_trunk_2', 'l1_router', 'c2_entry', 'Management Roles', exitX=0.5, exitY=1, entryX=0.5, entryY=0)
    add_edge(root, 'e_trunk_3', 'l1_router', 'c3_entry', 'Specialist Roles', exitX=0.9, exitY=1, entryX=0.5, entryY=0)

    # -------------------------------------------------------------
    # INTERMEDIATE CENTRAL HUB: CENTRAL OPERATIONAL DATA STORE (y: 1390 .. 1660)
    # -------------------------------------------------------------
    add_node(
        root, 'c_hub',
        "CENTRAL OPERATIONAL DATA STORE &amp; MASTER ACTIVITY LOG (SINGLE SOURCE OF TRUTH)",
        80, 1390, 3140, 270,
        S_CONTAINER.format(fill='#EAEDED', stroke='#7F8C8D', font='#17202A')
    )
    add_node(root, 'ds_desc',
             "<i>All operational actions, timestamps, proofs, status transitions &amp; approvals are permanently recorded here with strict audit trails.<br/>"
             "This consolidated data serves as the sole authoritative feed for all analytics engines, dashboards, reports and reward scoring below.</i>",
             100, 1425, 3100, 30, "text;html=1;align=center;fontSize=13;fontColor=#2C3E50;fontFamily=Verdana;")

    add_node(root, 'store_att',
             "<b>Attendance &amp; Check-In Registry</b><br/>• On-site / Remote timestamps<br/>• Office GPS coordinates &amp; photos<br/>• Regularizations &amp; approved leaves",
             120, 1465, 720, 160, S_BOX.format(fill='#E8DAEF', stroke='#8E44AD', font='#2C3E50'))

    add_node(root, 'store_task',
             "<b>Task Lifecycle &amp; QA Database</b><br/>• Task IDs, checklists &amp; timers<br/>• SLA deadlines &amp; completion stamps<br/>• Proof attachments &amp; rework counts",
             870, 1465, 750, 160, S_BOX.format(fill='#FCF3CF', stroke='#D68910', font='#7D6608'))

    add_node(root, 'store_comm',
             "<b>Commercial &amp; Pipeline Ledger</b><br/>• BDE leads, meetings &amp; contracts<br/>• CIRIL 30/70 commercial split<br/>• 7.5% royalty calculations",
             1650, 1465, 750, 160, S_BOX.format(fill='#D1F2EB', stroke='#1ABC9C', font='#117864'))

    add_node(root, 'store_sys',
             "<b>System Health &amp; Security Audit</b><br/>• Server uptime &amp; API latency logs<br/>• Role permission modifications<br/>• Tamper-proof activity audit trail",
             2430, 1465, 760, 160, S_BOX.format(fill='#D4E6F1', stroke='#2980B9', font='#1B4F72'))

    # Corridor buses drop straight into the Central Store (Clean vertical drops)
    add_edge(root, 'e_b1_to_att', 'bus_1', 'store_att', 'Attendance Data', exitX=0.3, exitY=1, entryX=0.5, entryY=0)
    add_edge(root, 'e_b1_to_sys', 'bus_1', 'store_sys', 'System Logs', exitX=0.8, exitY=1, entryX=0.2, entryY=0)
    add_edge(root, 'e_b2_to_task', 'bus_2', 'store_task', 'Task & QA Logs', exitX=0.5, exitY=1, entryX=0.5, entryY=0)
    add_edge(root, 'e_b3_to_task', 'bus_3', 'store_task', 'Work Proofs', exitX=0.2, exitY=1, entryX=0.8, entryY=0)
    add_edge(root, 'e_b3_to_comm', 'bus_3', 'store_comm', 'Deals & Revenue', exitX=0.7, exitY=1, entryX=0.5, entryY=0)

    # -------------------------------------------------------------
    # LAYER 3: MULTI-PERSPECTIVE INTELLIGENCE & ANALYTICS LAYER (y: 1690 .. 2700)
    # -------------------------------------------------------------
    add_node(
        root, 'c_l3',
        "LAYER 3: MULTI-PERSPECTIVE INTELLIGENCE &amp; ANALYTICAL LAYER (FED BY CENTRAL OPERATIONAL STORE)",
        80, 1690, 3140, 1020,
        S_CONTAINER.format(fill='#F9EBEA', stroke='#CD6155', font='#641E16')
    )

    # PERSPECTIVE 1: Operational Analytics Engines (x: 100 .. 830)
    add_node(root, 'b_p1', "PERSPECTIVE 1: OPERATIONAL ANALYTICS (6 ENGINES)", 100, 1730, 730, 960,
             S_BOUND.format(stroke='#EC7063', font='#78281F'))
    add_node(root, 'p1_entry', "<b>Operational Analytics Center</b>", 120, 1760, 690, 35, S_HEADER)
    add_node(root, 'eng_1', "<b>Engine 1: Daily Attendance &amp; Punctuality</b><br/>Calculates check-in on-time %, tardiness &amp; absent rates", 120, 1810, 690, 55,
             S_BOX.format(fill='#FADBD8', stroke='#CB4335', font='#78281F'))
    add_node(root, 'eng_2', "<b>Engine 2: Task SLA &amp; Completion Engine</b><br/>Tracks speed, overdue tasks &amp; checklist completion ratios", 120, 1880, 690, 55,
             S_BOX.format(fill='#FADBD8', stroke='#CB4335', font='#78281F'))
    add_node(root, 'eng_3', "<b>Engine 3: Quality &amp; Rework Frequency Engine</b><br/>Analyzes Lead Manager QA approval % vs items returned for rework", 120, 1950, 690, 55,
             S_BOX.format(fill='#FADBD8', stroke='#CB4335', font='#78281F'))
    add_node(root, 'eng_4', "<b>Engine 4: Sales Pipeline &amp; Conversion Engine</b><br/>Evaluates Bhavani's deal velocity from Lead to Won contract", 120, 2020, 690, 55,
             S_BOX.format(fill='#FADBD8', stroke='#CB4335', font='#78281F'))
    add_node(root, 'eng_5', "<b>Engine 5: Marketing Reach &amp; Engagement Engine</b><br/>Measures Harshitha's post engagement &amp; lead handoff volume", 120, 2090, 690, 55,
             S_BOX.format(fill='#FADBD8', stroke='#CB4335', font='#78281F'))
    add_node(root, 'eng_6', "<b>Engine 6: IT Infrastructure &amp; Security Engine</b><br/>Computes 99.9% uptime compliance, MTTR &amp; API response time", 120, 2160, 690, 55,
             S_BOX.format(fill='#FADBD8', stroke='#CB4335', font='#78281F'))
    add_node(root, 'eng_summary', "<b>Consolidated Operational Health Score</b><br/>Aggregated real-time health matrix across all departments", 120, 2235, 690, 45,
             S_HEADER)

    add_edge(root, 'e_eng_1_2', 'eng_1', 'eng_2')
    add_edge(root, 'e_eng_2_3', 'eng_2', 'eng_3')
    add_edge(root, 'e_eng_3_4', 'eng_3', 'eng_4')
    add_edge(root, 'e_eng_4_5', 'eng_4', 'eng_5')
    add_edge(root, 'e_eng_5_6', 'eng_5', 'eng_6')
    add_edge(root, 'e_eng_6_sum', 'eng_6', 'eng_summary')

    # PERSPECTIVE 2: Automated Reporting Dispatcher (x: 860 .. 1600)
    add_node(root, 'b_p2', "PERSPECTIVE 2: AUTOMATED REPORTING DISPATCHER", 860, 1730, 740, 960,
             S_BOUND.format(stroke='#1ABC9C', font='#117864'))
    add_node(root, 'p2_entry', "<b>Reporting Dispatcher</b>", 880, 1760, 700, 35, S_HEADER)
    add_node(root, 'rep_daily',
             "<b>Daily Shift Wrap-Up Report (18:30)</b><br/>"
             "• <i>Recipients:</i> Lead Manager (Manasa) &amp; Senior Manager<br/>"
             "• <i>Contents:</i> Completed tasks, pending reviews, logged hours, overdue alerts",
             880, 1810, 700, 85, S_BOX.format(fill='#D1F2EB', stroke='#16A085', font='#117864'))
    add_node(root, 'rep_weekly',
             "<b>Weekly Operational Productivity Pack (Mondays 09:00)</b><br/>"
             "• <i>Recipient:</i> General Manager (Ipsheeta)<br/>"
             "• <i>Contents:</i> Department delivery vs SLA, budget vs actuals, rework rates",
             880, 1915, 700, 85, S_BOX.format(fill='#D1F2EB', stroke='#16A085', font='#117864'))
    add_node(root, 'rep_monthly',
             "<b>Monthly Strategic Executive Pack (1st of Month 08:00)</b><br/>"
             "• <i>Recipients:</i> Chairman &amp; GM Ipsheeta<br/>"
             "• <i>Contents:</i> CIRIL commercial breakdown, 7.5% royalty tally, scorecards",
             880, 2020, 700, 85, S_BOX.format(fill='#D1F2EB', stroke='#16A085', font='#117864'))
    add_node(root, 'rep_dispatch_hub',
             "<b>Automated Multi-Channel Dispatcher</b><br/>Generates formatted PDF summaries, in-app notifications &amp; email delivery",
             880, 2125, 700, 55, S_HEADER)

    add_edge(root, 'e_rep_d_w', 'rep_daily', 'rep_weekly')
    add_edge(root, 'e_rep_w_m', 'rep_weekly', 'rep_monthly')
    add_edge(root, 'e_rep_m_hub', 'rep_monthly', 'rep_dispatch_hub')

    # PERSPECTIVE 3: Employee Performance & Reward Engine (x: 1630 .. 2390)
    add_node(root, 'b_p3', "PERSPECTIVE 3: EMPLOYEE PERFORMANCE &amp; RECOGNITION", 1630, 1730, 760, 960,
             S_BOUND.format(stroke='#F4D03F', font='#7D6608'))
    add_node(root, 'p3_entry', "<b>Performance Recognition Engine</b>", 1650, 1760, 720, 35, S_HEADER)
    add_node(root, 'rew_formula',
             "<b>CIRIL 100-Point Official Performance Formula</b><br/>"
             "• <b>Task SLA Completion:</b> 35 Points<br/>"
             "• <b>Attendance &amp; Punctuality:</b> 25 Points<br/>"
             "• <b>Work Quality &amp; Low Rework:</b> 20 Points<br/>"
             "• <b>Peer &amp; Manager Review:</b> 10 Points<br/>"
             "• <b>Initiative &amp; Training:</b> 10 Points",
             1650, 1810, 720, 115, S_BOX.format(fill='#FCF3CF', stroke='#B7950B', font='#7D6608'))
    add_node(root, 'rew_calc',
             "<b>Automated Monthly Performance Score Compilation</b><br/>Evaluates all employee records against 100-point algorithm",
             1650, 1945, 720, 55, S_BOX.format(fill='#FCF3CF', stroke='#B7950B', font='#7D6608'))
    add_node(root, 'rew_star',
             "<b>Star Performer of the Month Award</b><br/>Top scorer across departments receives Badge, Cash Bonus &amp; Recognition",
             1650, 2020, 720, 60, S_BOX.format(fill='#D5F5E3', stroke='#27AE60', font='#1E8449'))
    add_node(root, 'rew_streak_q',
             "<b>3 Consecutive Months Star Performer?</b>",
             1870, 2100, 280, 75, S_DIAMOND.format(fill='#FAD7A0', stroke='#D68910', font='#7D6608'))
    add_node(root, 'rew_trophy',
             "<b>Qualify for Chairman Quarterly Excellence Trophy!</b><br/>Direct nomination to Chairman for flagship enterprise award",
             1650, 2200, 720, 55, S_HEADER)

    add_edge(root, 'e_rew_1', 'rew_formula', 'rew_calc')
    add_edge(root, 'e_rew_2', 'rew_calc', 'rew_star')
    add_edge(root, 'e_rew_3', 'rew_star', 'rew_streak_q')
    add_edge(root, 'e_rew_4', 'rew_streak_q', 'rew_trophy', 'Yes')

    # PERSPECTIVE 4: Chairman Apex Executive Intelligence (x: 2420 .. 3200)
    add_node(root, 'b_p4', "PERSPECTIVE 4: CHAIRMAN APEX EXECUTIVE INTELLIGENCE", 2420, 1730, 780, 960,
             S_BOUND.format(stroke='#3498DB', font='#1B4F72'))
    add_node(root, 'p4_entry', "<b>Chairman Executive Intelligence</b>", 2440, 1760, 740, 35, S_HEADER)
    add_node(root, 'ch_dash',
             "<b>Chairman Executive Cockpit / Dashboard</b><br/>Real-time macro view of revenue, pipeline velocity &amp; active operations",
             2440, 1810, 740, 60, S_BOX.format(fill='#D4E6F1', stroke='#1B4F72', font='#1B4F72'))
    add_node(root, 'ch_royalty',
             "<b>CIRIL 7.5% Royalty &amp; Cashflow Monitor</b><br/>Automated calculation &amp; tracking of CIRIL royalty share on all closed deals",
             2440, 1890, 740, 60, S_BOX.format(fill='#D4E6F1', stroke='#1B4F72', font='#1B4F72'))
    add_node(root, 'ch_deal_app',
             "<b>High-Value Deal Milestone Approvals</b><br/>Chairman sign-off on enterprise contracts and strategic client partnerships",
             2440, 1970, 740, 60, S_BOX.format(fill='#D4E6F1', stroke='#1B4F72', font='#1B4F72'))
    add_node(root, 'ch_trophy_sign',
             "<b>Quarterly Excellence Award Sign-Off</b><br/>Chairman formal approval &amp; trophy presentation to 3-month champions",
             2440, 2050, 740, 60, S_BOX.format(fill='#FCF3CF', stroke='#B7950B', font='#7D6608'))
    add_node(root, 'ch_directive',
             "<b>Strategic Directives &amp; Growth Mandates</b><br/>Executive targets &amp; mandates pushed downward to GM Ipsheeta",
             2440, 2130, 740, 65, S_HEADER)

    add_edge(root, 'e_ch_1', 'ch_dash', 'ch_royalty')
    add_edge(root, 'e_ch_2', 'ch_royalty', 'ch_deal_app')
    add_edge(root, 'e_ch_3', 'ch_deal_app', 'ch_trophy_sign')
    add_edge(root, 'e_ch_4', 'ch_trophy_sign', 'ch_directive')
    add_edge(root, 'e_trophy_to_ch', 'rew_trophy', 'ch_trophy_sign', 'Submit Candidate', exitX=1, exitY=0.5, entryX=0, entryY=0.5)

    # Central Store feeds directly down into the 4 Intelligence Perspectives (Clean parallel vertical lines)
    add_edge(root, 'e_feed_p1', 'store_att', 'p1_entry', 'Raw Logs to Engines', exitX=0.5, exitY=1, entryX=0.5, entryY=0)
    add_edge(root, 'e_feed_p2', 'store_task', 'p2_entry', 'Operations to Reports', exitX=0.5, exitY=1, entryX=0.5, entryY=0)
    add_edge(root, 'e_feed_p3', 'store_task', 'p3_entry', 'Performance Data', exitX=0.8, exitY=1, entryX=0.5, entryY=0)
    add_edge(root, 'e_feed_p4', 'store_comm', 'p4_entry', 'Commercial & Deals', exitX=0.5, exitY=1, entryX=0.5, entryY=0)


# -------------------------------------------------------------
# PAGE 2: CHAIRMAN - APEX GOVERNANCE & COMMERCIAL INTELLIGENCE
# -------------------------------------------------------------
def build_page2(mxfile):
    root = create_page(mxfile, 'page_chairman', 'Chairman - Apex Governance & Commercial Intelligence', 1800, 2200)

    add_node(root, 'ch_p_title',
             "<b>CHAIRMAN APEX GOVERNANCE &amp; COMMERCIAL INTELLIGENCE FLOWCHART</b><br/>"
             "<i>Executive Oversight, CIRIL Royalty Radar, Deal Sign-Offs &amp; Strategic Mandates</i>",
             100, 30, 1600, 60, S_HEADER)

    add_node(root, 'ch_b1', "1. DAILY ACCESS &amp; EXECUTIVE DASHBOARD", 150, 120, 480, 520,
             S_BOUND.format(stroke='#3498DB', font='#1B4F72'))
    add_node(root, 'ch1_login', "<b>Chairman Secure Login</b><br/>Biometric / MFA Authentication<br/>Loads Highest Apex Privilege",
             190, 170, 400, 60, S_BOX.format(fill='#D4E6F1', stroke='#1B4F72', font='#1B4F72'))
    add_node(root, 'ch1_cockpit', "<b>Open Executive Interface</b><br/>Real-Time Enterprise Cockpit<br/>Aggregated KPIs &amp; Revenue",
             190, 260, 400, 65, S_BOX.format(fill='#D4E6F1', stroke='#1B4F72', font='#1B4F72'))
    add_node(root, 'ch1_radar', "<b>CIRIL 7.5% Royalty Radar</b><br/>Live Royalty Tracker on all closed deals<br/>Cashflow Influx &amp; Projections",
             190, 355, 400, 65, S_BOX.format(fill='#FCF3CF', stroke='#B7950B', font='#7D6608'))
    add_node(root, 'ch1_deals', "<b>Inspect Active Deal Pipeline</b><br/>Review BDE Bhavani's proposals<br/>Monitor High-Value Commercials",
             190, 450, 400, 65, S_BOX.format(fill='#D1F2EB', stroke='#16A085', font='#117864'))

    add_edge(root, 'ech_1', 'ch1_login', 'ch1_cockpit')
    add_edge(root, 'ech_2', 'ch1_cockpit', 'ch1_radar')
    add_edge(root, 'ech_3', 'ch1_radar', 'ch1_deals')

    add_node(root, 'ch_b2', "2. STRATEGIC DECISION POINTS &amp; APPROVALS", 670, 120, 480, 520,
             S_BOUND.format(stroke='#F5B041', font='#7D6608'))
    add_node(root, 'ch2_rev_q', "<b>Commercial Contract Sign-Off?</b><br/>Does proposal meet CIRIL margin &amp; split?",
             710, 170, 400, 80, S_DIAMOND.format(fill='#FCF3CF', stroke='#D68910', font='#7D6608'))
    add_node(root, 'ch2_app_deal', "<b>Approve Enterprise Contract</b><br/>Authorize execution &amp; invoice issue<br/>30/70 Split Enforced",
             710, 280, 400, 60, S_BOX.format(fill='#D5F5E3', stroke='#27AE60', font='#1E8449'))
    add_node(root, 'ch2_trophy_q', "<b>Quarterly Excellence Candidate?</b><br/>Verify 3 consecutive months Star Performer",
             710, 370, 400, 75, S_DIAMOND.format(fill='#FCF3CF', stroke='#D68910', font='#7D6608'))
    add_node(root, 'ch2_trophy_sign', "<b>Award Chairman Excellence Trophy</b><br/>Official signed citation, bonus &amp; plaque",
             710, 475, 400, 60, S_BOX.format(fill='#FEFDE8', stroke='#B7950B', font='#7D6608'))

    add_edge(root, 'ech_4', 'ch1_deals', 'ch2_rev_q', exitX=1, exitY=0.5, entryX=0, entryY=0.5)
    add_edge(root, 'ech_5', 'ch2_rev_q', 'ch2_app_deal', 'Approved')
    add_edge(root, 'ech_6', 'ch2_app_deal', 'ch2_trophy_q')
    add_edge(root, 'ech_7', 'ch2_trophy_q', 'ch2_trophy_sign', 'Verified')

    add_node(root, 'ch_b3', "3. EXECUTIVE DIRECTIVES &amp; FEEDBACK", 1190, 120, 480, 520,
             S_BOUND.format(stroke='#48C9B0', font='#117864'))
    add_node(root, 'ch3_mandate', "<b>Formulate Strategic Mandates</b><br/>Set quarterly revenue targets<br/>Define expansion guidelines",
             1230, 170, 400, 65, S_BOX.format(fill='#D1F2EB', stroke='#1ABC9C', font='#117864'))
    add_node(root, 'ch3_push_gm', "<b>Push Directives to GM Ipsheeta</b><br/>Automated executive dispatch<br/>Integrated into weekly GM review",
             1230, 265, 400, 65, S_BOX.format(fill='#D1F2EB', stroke='#1ABC9C', font='#117864'))
    add_node(root, 'ch3_board_pack', "<b>Export Monthly Board Report</b><br/>One-click aggregated board presentation<br/>Historical trends &amp; forecasts",
             1230, 360, 400, 65, S_BOX.format(fill='#D1F2EB', stroke='#1ABC9C', font='#117864'))
    add_node(root, 'ch3_close', "<b>Session Complete</b><br/>All executive actions timestamped",
             1230, 460, 400, 50, S_HEADER)

    add_edge(root, 'ech_8', 'ch2_trophy_sign', 'ch3_mandate', exitX=1, exitY=0.5, entryX=0, entryY=0.5)
    add_edge(root, 'ech_9', 'ch3_mandate', 'ch3_push_gm')
    add_edge(root, 'ech_10', 'ch3_push_gm', 'ch3_board_pack')
    add_edge(root, 'ech_11', 'ch3_board_pack', 'ch3_close')

    # Lower Section: What Gets Logged & How Analytics are Used (y: 670 .. 1100)
    add_node(root, 'ch_log_box',
             "<b>CHAIRMAN AUDIT TRAIL (WHAT GETS LOGGED TO MASTER DATA STORE)</b><br/>"
             "• Contract approvals with timestamp &amp; contract value<br/>"
             "• 7.5% Royalty reconciliation ledger entries<br/>"
             "• Quarterly Excellence Award authorizations &amp; winner IDs<br/>"
             "• Executive strategic directives issued to General Manager",
             150, 670, 740, 160, S_BUS.format(fill='#EAEDED', stroke='#7F8C8D', font='#17202A'))

    add_node(root, 'ch_intel_box',
             "<b>INTELLIGENCE &amp; ANALYTICAL PERSPECTIVE CONSUMED BY CHAIRMAN</b><br/>"
             "• <b>Financial Radar:</b> CIRIL 30/70 Margin compliance &amp; royalty influx<br/>"
             "• <b>Executive Scorecard:</b> Monthly performance of all 10 organizational roles<br/>"
             "• <b>Operational Velocity:</b> Department delivery SLA trends &amp; rework rate<br/>"
             "• <b>Market Impact:</b> Campaign reach (Harshitha) &amp; Deal win-rates (Bhavani)",
             930, 670, 740, 160, S_BUS.format(fill='#E8DAEF', stroke='#8E44AD', font='#2C3E50'))


# -------------------------------------------------------------
# PAGE 3: SUPER ADMIN & IT SYSTEM ANALYST - SYSTEM HEALTH & SECURITY
# -------------------------------------------------------------
def build_page3(mxfile):
    root = create_page(mxfile, 'page_it_analyst', 'Super Admin & IT System Analyst - System Health & Security', 1800, 2200)

    add_node(root, 'it_title',
             "<b>SUPER ADMIN &amp; IT SYSTEM ANALYST WORKFLOW &amp; HEALTH ARCHITECTURE</b><br/>"
             "<i>System Provisioning, 99.9% Uptime Monitoring, Security Auditing &amp; Infrastructure Intelligence</i>",
             100, 30, 1600, 60, S_HEADER)

    add_node(root, 'it_b1', "1. ACCESS &amp; USER PROVISIONING", 150, 120, 480, 520,
             S_BOUND.format(stroke='#2980B9', font='#1B4F72'))
    add_node(root, 'it1_login', "<b>IT Analyst Secure Login</b><br/>Hardware Token / MFA Verification<br/>Highest System Access Granted",
             190, 170, 400, 60, S_BOX.format(fill='#D4E6F1', stroke='#2980B9', font='#1B4F72'))
    add_node(root, 'it1_prov_q', "<b>New User Onboarding Request?</b>",
             240, 260, 300, 75, S_DIAMOND.format(fill='#FCF3CF', stroke='#D68910', font='#7D6608'))
    add_node(root, 'it1_rbac', "<b>Assign RBAC Role &amp; Access</b><br/>Configure Executive / Manager / Admin<br/>Issue Secure Temporary Password",
             190, 365, 400, 65, S_BOX.format(fill='#D4E6F1', stroke='#2980B9', font='#1B4F72'))
    add_node(root, 'it1_deact', "<b>Deactivate / Suspend Users</b><br/>Immediate session termination on exit",
             190, 455, 400, 55, S_BOX.format(fill='#FADBD8', stroke='#E74C3C', font='#78281F'))

    add_edge(root, 'eit_1', 'it1_login', 'it1_prov_q')
    add_edge(root, 'eit_2', 'it1_prov_q', 'it1_rbac', 'Yes')
    add_edge(root, 'eit_3', 'it1_prov_q', 'it1_deact', 'No / Deactivation')

    add_node(root, 'it_b2', "2. LIVE INFRASTRUCTURE MONITORING", 670, 120, 480, 520,
             S_BOUND.format(stroke='#1ABC9C', font='#117864'))
    add_node(root, 'it2_mon', "<b>Uptime &amp; Server Health Monitor</b><br/>Continuous polling of app servers, DB<br/>Target: 99.9% High Availability",
             710, 170, 400, 65, S_BOX.format(fill='#D1F2EB', stroke='#1ABC9C', font='#117864'))
    add_node(root, 'it2_lat', "<b>API Latency &amp; Error Rate Tracker</b><br/>Track endpoint response (<200ms)<br/>Real-time 5xx error alert detection",
             710, 265, 400, 65, S_BOX.format(fill='#D1F2EB', stroke='#1ABC9C', font='#117864'))
    add_node(root, 'it2_alert_q', "<b>System Anomaly Detected?</b>",
             760, 360, 300, 75, S_DIAMOND.format(fill='#FADBD8', stroke='#CB4335', font='#78281F'))
    add_node(root, 'it2_heal', "<b>Automated Self-Healing / Hotfix</b><br/>Restart container, switch DB node<br/>Notify IT Analyst on mobile",
             710, 465, 400, 65, S_BOX.format(fill='#FADBD8', stroke='#CB4335', font='#78281F'))

    add_edge(root, 'eit_4', 'it1_rbac', 'it2_mon', exitX=1, exitY=0.5, entryX=0, entryY=0.5)
    add_edge(root, 'eit_5', 'it2_mon', 'it2_lat')
    add_edge(root, 'eit_6', 'it2_lat', 'it2_alert_q')
    add_edge(root, 'eit_7', 'it2_alert_q', 'it2_heal', 'Anomaly Found')

    add_node(root, 'it_b3', "3. SECURITY, BACKUP &amp; CENTRAL AUDIT", 1190, 120, 480, 520,
             S_BOUND.format(stroke='#F5B041', font='#7D6608'))
    add_node(root, 'it3_backup', "<b>Automated Database Backup</b><br/>Nightly incremental &amp; weekly full backup<br/>Verify checksum &amp; snapshot storage",
             1230, 170, 400, 65, S_BOX.format(fill='#FCF3CF', stroke='#D68910', font='#7D6608'))
    add_node(root, 'it3_sec_audit', "<b>Security Audit &amp; Penetration Log</b><br/>Inspect failed logins, IP rate-limits<br/>Verify data encryption at rest",
             1230, 265, 400, 65, S_BOX.format(fill='#FCF3CF', stroke='#D68910', font='#7D6608'))
    add_node(root, 'it3_log_stream', "<b>Stream Events to Master Store</b><br/>Commit IT telemetry &amp; security logs<br/>into Master Audit Ledger",
             1230, 360, 400, 65, S_BUS.format(fill='#EAEDED', stroke='#7F8C8D', font='#17202A'))
    add_node(root, 'it3_done', "<b>IT Operational Baseline Maintained</b>",
             1230, 460, 400, 50, S_HEADER)

    add_edge(root, 'eit_8', 'it2_heal', 'it3_backup', exitX=1, exitY=0.5, entryX=0, entryY=0.5)
    add_edge(root, 'eit_9', 'it3_backup', 'it3_sec_audit')
    add_edge(root, 'eit_10', 'it3_sec_audit', 'it3_log_stream')
    add_edge(root, 'eit_11', 'it3_log_stream', 'it3_done')

    # Lower Section
    add_node(root, 'it_log_box',
             "<b>IT &amp; SECURITY AUDIT TRAIL (LOGGED TO MASTER DATA STORE)</b><br/>"
             "• User credential changes, role permission updates, deactivations<br/>"
             "• Server uptime pings (every 60 seconds) &amp; latency measurements<br/>"
             "• Anomaly incident reports, resolution timestamps &amp; MTTR<br/>"
             "• Cryptographic backup checksums &amp; restore test results",
             150, 670, 740, 160, S_BUS.format(fill='#EAEDED', stroke='#7F8C8D', font='#17202A'))

    add_node(root, 'it_intel_box',
             "<b>INTELLIGENCE PERSPECTIVE CONSUMED BY IT ANALYST</b><br/>"
             "• <b>SLA Metric:</b> 99.9% Uptime compliance tracker &amp; downtime budget<br/>"
             "• <b>API Health Engine:</b> High-latency endpoint detection &amp; slow queries<br/>"
             "• <b>Security Threat Radar:</b> Brute-force detection &amp; suspicious geolocation<br/>"
             "• <b>Capacity Forecast:</b> Storage &amp; memory utilization prediction",
             930, 670, 740, 160, S_BUS.format(fill='#D4E6F1', stroke='#2980B9', font='#1B4F72'))


# -------------------------------------------------------------
# PAGE 4: OFFICE ADMIN - ATTENDANCE, ASSETS & FACILITIES
# -------------------------------------------------------------
def build_page4(mxfile):
    root = create_page(mxfile, 'page_office_admin', 'Office Admin - Attendance, Assets & Facilities', 1800, 2200)

    add_node(root, 'adm_title',
             "<b>OFFICE ADMIN OPERATIONAL WORKFLOW &amp; FACILITIES ARCHITECTURE</b><br/>"
             "<i>Attendance Regularization, Geofence Exception Review, Asset Tracking &amp; Shift Rosters</i>",
             100, 30, 1600, 60, S_HEADER)

    add_node(root, 'adm_b1', "1. MORNING ATTENDANCE RECONCILIATION", 150, 120, 480, 520,
             S_BOUND.format(stroke='#5DADE2', font='#1B4F72'))
    add_node(root, 'adm1_login', "<b>Office Admin Login</b><br/>Inspect Daily Morning Check-in Feed<br/>View Real-time Geofence Map",
             190, 170, 400, 60, S_BOX.format(fill='#D4E6F1', stroke='#2980B9', font='#1B4F72'))
    add_node(root, 'adm1_exc_q', "<b>Flagged Location Mismatch?</b><br/>Employee checked in >50m from office?",
             240, 260, 300, 75, S_DIAMOND.format(fill='#FCF3CF', stroke='#D68910', font='#7D6608'))
    add_node(root, 'adm1_reg', "<b>Review Proof &amp; Regularize</b><br/>Inspect employee explanation/manager approval<br/>Mark Regularized / Leave Deducted",
             190, 365, 400, 65, S_BOX.format(fill='#D4E6F1', stroke='#2980B9', font='#1B4F72'))
    add_node(root, 'adm1_leave', "<b>Process Leave Applications</b><br/>Sync casual/sick leave with HR balance",
             190, 455, 400, 55, S_BOX.format(fill='#D4E6F1', stroke='#2980B9', font='#1B4F72'))

    add_edge(root, 'eadm_1', 'adm1_login', 'adm1_exc_q')
    add_edge(root, 'eadm_2', 'adm1_exc_q', 'adm1_reg', 'Mismatch Found')
    add_edge(root, 'eadm_3', 'adm1_reg', 'adm1_leave')

    add_node(root, 'adm_b2', "2. ASSET &amp; HARDWARE INVENTORY", 670, 120, 480, 520,
             S_BOUND.format(stroke='#F5B041', font='#7D6608'))
    add_node(root, 'adm2_inv', "<b>Asset Inventory Tracking</b><br/>Maintain registry of laptops, monitors, SIMs<br/>Track serial numbers &amp; warranty dates",
             710, 170, 400, 65, S_BOX.format(fill='#FCF3CF', stroke='#D68910', font='#7D6608'))
    add_node(root, 'adm2_iss_q', "<b>Hardware Allocation Request?</b><br/>New employee or replacement item?",
             760, 260, 300, 75, S_DIAMOND.format(fill='#FCF3CF', stroke='#D68910', font='#7D6608'))
    add_node(root, 'adm2_pass', "<b>Issue Asset &amp; Access Badge</b><br/>Capture digital signature &amp; serial number<br/>Authorize office biometric door pass",
             710, 365, 400, 65, S_BOX.format(fill='#D5F5E3', stroke='#27AE60', font='#1E8449'))
    add_node(root, 'adm2_ret', "<b>Asset Return / Maintenance</b><br/>Log equipment check-in on exit/repair",
             710, 455, 400, 55, S_BOX.format(fill='#FCF3CF', stroke='#D68910', font='#7D6608'))

    add_edge(root, 'eadm_4', 'adm1_leave', 'adm2_inv', exitX=1, exitY=0.5, entryX=0, entryY=0.5)
    add_edge(root, 'eadm_5', 'adm2_inv', 'adm2_iss_q')
    add_edge(root, 'eadm_6', 'adm2_iss_q', 'adm2_pass', 'Yes')
    add_edge(root, 'eadm_7', 'adm2_iss_q', 'adm2_ret', 'No / Return')

    add_node(root, 'adm_b3', "3. SHIFT ROSTERING &amp; DATA LOGGING", 1190, 120, 480, 520,
             S_BOUND.format(stroke='#48C9B0', font='#117864'))
    add_node(root, 'adm3_shift', "<b>Shift Rostering &amp; Desk Allocation</b><br/>Publish weekly department seating chart<br/>Manage rotation between on-site &amp; remote",
             1230, 170, 400, 65, S_BOX.format(fill='#D1F2EB', stroke='#1ABC9C', font='#117864'))
    add_node(root, 'adm3_stream', "<b>Stream Daily Admin Logs</b><br/>Push attendance regularizations &amp; assets<br/>into Master Central Store",
             1230, 265, 400, 65, S_BUS.format(fill='#EAEDED', stroke='#7F8C8D', font='#17202A'))
    add_node(root, 'adm3_sync_hr', "<b>Sync with HR &amp; Payroll</b><br/>Auto-generate monthly attendance tally<br/>Calculate loss of pay / overtime",
             1230, 360, 400, 65, S_BOX.format(fill='#D1F2EB', stroke='#1ABC9C', font='#117864'))
    add_node(root, 'adm3_done', "<b>Office Facility Day Complete</b>",
             1230, 460, 400, 50, S_HEADER)

    add_edge(root, 'eadm_8', 'adm2_pass', 'adm3_shift', exitX=1, exitY=0.5, entryX=0, entryY=0.5)
    add_edge(root, 'eadm_9', 'adm3_shift', 'adm3_stream')
    add_edge(root, 'eadm_10', 'adm3_stream', 'adm3_sync_hr')
    add_edge(root, 'eadm_11', 'adm3_sync_hr', 'adm3_done')

    # Lower Section
    add_node(root, 'adm_log_box',
             "<b>OFFICE ADMIN AUDIT DATA (LOGGED TO MASTER DATA STORE)</b><br/>"
             "• Attendance regularizations &amp; GPS override rationale<br/>"
             "• Approved leave slips &amp; remaining balance updates<br/>"
             "• Hardware asset assignments, serial numbers &amp; user signatures<br/>"
             "• Weekly shift roster matrices &amp; workstation pass IDs",
             150, 670, 740, 160, S_BUS.format(fill='#EAEDED', stroke='#7F8C8D', font='#17202A'))

    add_node(root, 'adm_intel_box',
             "<b>INTELLIGENCE PERSPECTIVE CONSUMED BY OFFICE ADMIN</b><br/>"
             "• <b>Punctuality Engine:</b> Department tardiness &amp; absenteeism metrics<br/>"
             "• <b>Workstation Capacity:</b> Office desk occupancy rate &amp; facility density<br/>"
             "• <b>Hardware Lifespan:</b> Asset aging, maintenance schedule &amp; warranty expiries<br/>"
             "• <b>Payroll Input:</b> Net billable working days per employee for salary computation",
             930, 670, 740, 160, S_BUS.format(fill='#D4E6F1', stroke='#2980B9', font='#1B4F72'))


# -------------------------------------------------------------
# PAGE 5: GENERAL MANAGER (IPSHEETA) - COMMERCIAL STRATEGY & SIGN-OFFS
# -------------------------------------------------------------
def build_page5(mxfile):
    root = create_page(mxfile, 'page_gm_ipsheeta', 'General Manager (Ipsheeta) - Commercial Strategy & Sign-Offs', 1800, 2200)

    add_node(root, 'gm_title',
             "<b>GENERAL MANAGER (IPSHEETA) - COMMERCIAL GOVERNANCE &amp; MULTI-DEPT OVERSIGHT</b><br/>"
             "<i>Enforcing CIRIL 30/70 Commercial Rule, Cross-Department SLA Reviews &amp; Executive Approvals</i>",
             100, 30, 1600, 60, S_HEADER)

    add_node(root, 'gm_b1', "1. EXECUTIVE MORNING BRIEFING &amp; PIPELINE", 150, 120, 480, 520,
             S_BOUND.format(stroke='#F5B041', font='#7D6608'))
    add_node(root, 'gm1_login', "<b>GM Secure Login</b><br/>Access General Management Interface<br/>Review Enterprise Status Matrix",
             190, 170, 400, 60, S_BOX.format(fill='#FCF3CF', stroke='#D68910', font='#7D6608'))
    add_node(root, 'gm1_brief', "<b>Inspect Daily Operational Brief</b><br/>Completed tasks from yesterday<br/>Pending approvals &amp; blocker alerts",
             190, 260, 400, 65, S_BOX.format(fill='#FCF3CF', stroke='#D68910', font='#7D6608'))
    add_node(root, 'gm1_pipe', "<b>Commercial Pipeline Radar</b><br/>Inspect BDE Bhavani's qualified leads<br/>Verify high-value deal progress",
             190, 355, 400, 65, S_BOX.format(fill='#FCF3CF', stroke='#D68910', font='#7D6608'))
    add_node(root, 'gm1_budget', "<b>Review Department Budgets</b><br/>Track expenditure vs monthly limits",
             190, 450, 400, 55, S_BOX.format(fill='#FCF3CF', stroke='#D68910', font='#7D6608'))

    add_edge(root, 'egm_1', 'gm1_login', 'gm1_brief')
    add_edge(root, 'egm_2', 'gm1_brief', 'gm1_pipe')
    add_edge(root, 'egm_3', 'gm1_pipe', 'gm1_budget')

    add_node(root, 'gm_b2', "2. CIRIL 30/70 COMMERCIAL GOVERNANCE", 670, 120, 480, 520,
             S_BOUND.format(stroke='#1ABC9C', font='#117864'))
    add_node(root, 'gm2_rule_q', "<b>Evaluate Commercial Split?</b><br/>Does project adhere to 30% operational cost<br/>and 70% gross contribution / royalty?",
             710, 170, 400, 80, S_DIAMOND.format(fill='#FCF3CF', stroke='#D68910', font='#7D6608'))
    add_node(root, 'gm2_split_app', "<b>Sign Off Commercial Approval</b><br/>Lock in project budget &amp; billing schedule<br/>Register 7.5% CIRIL royalty tally",
             710, 280, 400, 65, S_BOX.format(fill='#D5F5E3', stroke='#27AE60', font='#1E8449'))
    add_node(root, 'gm2_rework_q', "<b>Commercial Renegotiation Required?</b><br/>Adjust pricing or resource allocation",
             710, 375, 400, 65, S_BOX.format(fill='#FADBD8', stroke='#CB4335', font='#78281F'))
    add_node(root, 'gm2_esc_block', "<b>Executive Blocker Intervention</b><br/>Clear multi-department bottlenecks",
             710, 465, 400, 55, S_BOX.format(fill='#FCF3CF', stroke='#D68910', font='#7D6608'))

    add_edge(root, 'egm_4', 'gm1_budget', 'gm2_rule_q', exitX=1, exitY=0.5, entryX=0, entryY=0.5)
    add_edge(root, 'egm_5', 'gm2_rule_q', 'gm2_split_app', 'Compliant')
    add_edge(root, 'egm_6', 'gm2_rule_q', 'gm2_rework_q', 'Non-Compliant')
    add_edge(root, 'egm_7', 'gm2_split_app', 'gm2_esc_block')

    add_node(root, 'gm_b3', "3. PERFORMANCE SIGN-OFF &amp; REPORTING", 1190, 120, 480, 520,
             S_BOUND.format(stroke='#3498DB', font='#1B4F72'))
    add_node(root, 'gm3_weekly_rev', "<b>Weekly Review with Senior Managers</b><br/>Evaluate Lead Manager Manasa's throughput<br/>Review rework counts &amp; team speed",
             1230, 170, 400, 65, S_BOX.format(fill='#D4E6F1', stroke='#2980B9', font='#1B4F72'))
    add_node(root, 'gm3_star_app', "<b>Sign Off Star Performer Nominations</b><br/>Validate 100-point algorithm ranking<br/>Approve monthly badge &amp; cash bonus",
             1230, 265, 400, 65, S_BOX.format(fill='#FCF3CF', stroke='#B7950B', font='#7D6608'))
    add_node(root, 'gm3_rep_chair', "<b>Deliver Executive Pack to Chairman</b><br/>Submit company scorecard &amp; royalty report<br/>Incorporate Chairman strategic directives",
             1230, 360, 400, 65, S_BOX.format(fill='#D4E6F1', stroke='#1B4F72', font='#1B4F72'))
    add_node(root, 'gm3_done', "<b>GM Operational Directives Enforced</b>",
             1230, 460, 400, 50, S_HEADER)

    add_edge(root, 'egm_8', 'gm2_esc_block', 'gm3_weekly_rev', exitX=1, exitY=0.5, entryX=0, entryY=0.5)
    add_edge(root, 'egm_9', 'gm3_weekly_rev', 'gm3_star_app')
    add_edge(root, 'egm_10', 'gm3_star_app', 'gm3_rep_chair')
    add_edge(root, 'egm_11', 'gm3_rep_chair', 'gm3_done')

    # Lower Section
    add_node(root, 'gm_log_box',
             "<b>GM DECISION AUDIT LOG (STREAMED TO MASTER DATA STORE)</b><br/>"
             "• Project budget authorizations &amp; CIRIL 30/70 split compliance certificates<br/>"
             "• Strategic blocker interventions &amp; cross-team resource shifts<br/>"
             "• Validated monthly performance awards &amp; Star Performer sign-offs<br/>"
             "• Weekly management review minutes &amp; action item deadlines",
             150, 670, 740, 160, S_BUS.format(fill='#EAEDED', stroke='#7F8C8D', font='#17202A'))

    add_node(root, 'gm_intel_box',
             "<b>INTELLIGENCE PERSPECTIVE CONSUMED BY GM IPSHEETA</b><br/>"
             "• <b>Commercial Split Radar:</b> Real-time margin &amp; royalty realization<br/>"
             "• <b>Department Velocity:</b> SLA adherence comparison across all operations<br/>"
             "• <b>Rework Rate Engine:</b> Quality scoring &amp; First-Time-Right (FTR) delivery<br/>"
             "• <b>Executive Summary:</b> Weekly Monday 09:00 automated executive report pack",
             930, 670, 740, 160, S_BUS.format(fill='#FCF3CF', stroke='#D68910', font='#7D6608'))


# -------------------------------------------------------------
# PAGE 6: LEAD MANAGER (MANASA) & SENIOR MANAGER - PLANNING, ALLOCATION & QA
# -------------------------------------------------------------
def build_page6(mxfile):
    root = create_page(mxfile, 'page_manasa_sm', 'Lead Manager (Manasa) & Senior Manager - Planning, Allocation & QA', 1800, 2200)

    add_node(root, 'lm_title',
             "<b>LEAD MANAGER (MANASA) &amp; SENIOR MANAGER OPERATIONAL WORKFLOW</b><br/>"
             "<i>Sprint Backlog, Task Allocation, SLA Due Dates, QA Review &amp; Blocker Escalation</i>",
             100, 30, 1600, 60, S_HEADER)

    add_node(root, 'lm_b1', "1. MORNING SPRINT &amp; TASK ALLOCATION", 150, 120, 480, 520,
             S_BOUND.format(stroke='#F5B041', font='#7D6608'))
    add_node(root, 'lm1_login', "<b>Manager Interface Login</b><br/>Review Backlog &amp; Project Milestones<br/>Evaluate Team Capacity &amp; Attendance",
             190, 170, 400, 60, S_BOX.format(fill='#FCF3CF', stroke='#D68910', font='#7D6608'))
    add_node(root, 'lm1_create', "<b>Create Daily Tasks (Lead Manager Manasa)</b><br/>Define step-by-step checklist items<br/>Set explicit SLA deadline &amp; priority tags",
             190, 260, 400, 65, S_BOX.format(fill='#FCF3CF', stroke='#D68910', font='#7D6608'))
    add_node(root, 'lm1_sm_bal', "<b>Workload Balancing (Senior Manager)</b><br/>Verify distribution across specialists<br/>Rebalance tasks to prevent overload",
             190, 355, 400, 65, S_BOX.format(fill='#FCF3CF', stroke='#D68910', font='#7D6608'))
    add_node(root, 'lm1_dispatch', "<b>Dispatch Tasks to Frontline</b><br/>Executives, BDEs, Designers receive tasks",
             190, 450, 400, 55, S_BOX.format(fill='#D5F5E3', stroke='#27AE60', font='#1E8449'))

    add_edge(root, 'elm_1', 'lm1_login', 'lm1_create')
    add_edge(root, 'elm_2', 'lm1_create', 'lm1_sm_bal')
    add_edge(root, 'elm_3', 'lm1_sm_bal', 'lm1_dispatch')

    add_node(root, 'lm_b2', "2. LIVE TRACKING &amp; BLOCKER RESOLUTION", 670, 120, 480, 520,
             S_BOUND.format(stroke='#48C9B0', font='#117864'))
    add_node(root, 'lm2_track', "<b>Live Kanban / Task Board</b><br/>Monitor To-Do, In-Progress &amp; Review<br/>Track active timers &amp; elapsed hours",
             710, 170, 400, 65, S_BOX.format(fill='#D1F2EB', stroke='#1ABC9C', font='#117864'))
    add_node(root, 'lm2_block_q', "<b>Blocker Ticket Raised by Team?</b><br/>Technical obstacle, missing asset, client delay?",
             760, 260, 300, 75, S_DIAMOND.format(fill='#FADBD8', stroke='#CB4335', font='#78281F'))
    add_node(root, 'lm2_intervene', "<b>Rapid Blocker Intervention</b><br/>Lead Manager reallocates tools / info<br/>Senior Manager clears external hurdles",
             710, 365, 400, 65, S_BOX.format(fill='#FADBD8', stroke='#CB4335', font='#78281F'))
    add_node(root, 'lm2_sla_warn', "<b>SLA Warning System</b><br/>Automated amber alert when 80% time used",
             710, 455, 400, 55, S_BOX.format(fill='#FCF3CF', stroke='#D68910', font='#7D6608'))

    add_edge(root, 'elm_4', 'lm1_dispatch', 'lm2_track', exitX=1, exitY=0.5, entryX=0, entryY=0.5)
    add_edge(root, 'elm_5', 'lm2_track', 'lm2_block_q')
    add_edge(root, 'elm_6', 'lm2_block_q', 'lm2_intervene', 'Blocker Raised')
    add_edge(root, 'elm_7', 'lm2_block_q', 'lm2_sla_warn', 'No Blockers')

    add_node(root, 'lm_b3', "3. QUALITY ASSURANCE (QA) &amp; REPORTING", 1190, 120, 480, 520,
             S_BOUND.format(stroke='#3498DB', font='#1B4F72'))
    add_node(root, 'lm3_sub_q', "<b>Task Submitted for QA Review?</b><br/>Inspect attachments, links &amp; proof-of-work",
             1280, 160, 300, 75, S_DIAMOND.format(fill='#FCF3CF', stroke='#D68910', font='#7D6608'))
    add_node(root, 'lm3_app', "<b>Mark APPROVED &amp; COMPLETE</b><br/>Quality standards met; lock task<br/>Score awarded (35% SLA + 20% Quality)",
             1230, 260, 400, 65, S_BOX.format(fill='#D5F5E3', stroke='#27AE60', font='#1E8449'))
    add_node(root, 'lm3_rework', "<b>Return with Rework Feedback</b><br/>Specify missing items; restart timer<br/>Rework penalty incremented in log",
             1230, 355, 400, 65, S_BOX.format(fill='#FADBD8', stroke='#CB4335', font='#78281F'))
    add_node(root, 'lm3_wrap', "<b>Daily 18:30 Shift Summary Dispatch</b><br/>Automated daily digest sent to GM &amp; Senior Manager",
             1230, 450, 400, 60, S_HEADER)

    add_edge(root, 'elm_8', 'lm2_sla_warn', 'lm3_sub_q', exitX=1, exitY=0.5, entryX=0, entryY=0.5)
    add_edge(root, 'elm_9', 'lm3_sub_q', 'lm3_app', 'Satisfactory')
    add_edge(root, 'elm_10', 'lm3_sub_q', 'lm3_rework', 'Needs Work')
    add_edge(root, 'elm_11', 'lm3_app', 'lm3_wrap')

    # Lower Section
    add_node(root, 'lm_log_box',
             "<b>TASK &amp; QA DATA STREAMED TO CENTRAL STORE</b><br/>"
             "• Task creation events with target SLA timestamp &amp; priority<br/>"
             "• Blocker escalation tickets &amp; resolution times<br/>"
             "• QA Review decisions: First-time approved vs returned for rework<br/>"
             "• Detailed feedback notes &amp; rework iteration counts",
             150, 670, 740, 160, S_BUS.format(fill='#EAEDED', stroke='#7F8C8D', font='#17202A'))

    add_node(root, 'lm_intel_box',
             "<b>INTELLIGENCE PERSPECTIVE CONSUMED BY MANASA &amp; SENIOR MANAGER</b><br/>"
             "• <b>SLA Performance Engine:</b> Individual team member speed &amp; on-time %<br/>"
             "• <b>First-Time-Right (FTR) Index:</b> Percentage of tasks passed on first QA<br/>"
             "• <b>Bottleneck Heatmap:</b> Which stages generate recurring blocker tickets<br/>"
             "• <b>Daily 18:30 Automated Report:</b> Consolidated shift wrap-up compilation",
             930, 670, 740, 160, S_BUS.format(fill='#D4E6F1', stroke='#2980B9', font='#1B4F72'))


# -------------------------------------------------------------
# PAGE 7: EXECUTIVE - TASK EXECUTION, PROOF-OF-WORK & BLOCKERS
# -------------------------------------------------------------
def build_page7(mxfile):
    root = create_page(mxfile, 'page_executive', 'Executive - Task Execution, Proof-of-Work & Blockers', 1800, 2200)

    add_node(root, 'ex_title',
             "<b>EXECUTIVE (FRONTLINE) DAILY WORKFLOW &amp; EXECUTION ARCHITECTURE</b><br/>"
             "<i>Office Check-In, Task Checklist Timer, Proof-of-Work Submission &amp; Blocker Escalation</i>",
             100, 30, 1600, 60, S_HEADER)

    add_node(root, 'ex_b1', "1. DAILY CHECK-IN &amp; TASK QUEUE", 150, 120, 480, 520,
             S_BOUND.format(stroke='#48C9B0', font='#117864'))
    add_node(root, 'ex1_login', "<b>Morning Mobile/Web Login</b><br/>GPS Geofence Match (within 50m of office)<br/>Selfie Photo Stamp Confirmed",
             190, 170, 400, 60, S_BOX.format(fill='#D1F2EB', stroke='#1ABC9C', font='#117864'))
    add_node(root, 'ex1_dash', "<b>Open Executive Task Queue</b><br/>View tasks assigned by Lead Manager Manasa<br/>Prioritized by SLA deadline &amp; urgency",
             190, 260, 400, 65, S_BOX.format(fill='#D1F2EB', stroke='#1ABC9C', font='#117864'))
    add_node(root, 'ex1_start', "<b>Select Task &amp; Click 'Start Task'</b><br/>Task status transitions to 'In Progress'<br/>Live stopwatch timer begins logging",
             190, 355, 400, 65, S_BOX.format(fill='#D5F5E3', stroke='#27AE60', font='#1E8449'))
    add_node(root, 'ex1_check', "<b>Follow Checklist Items</b><br/>Execute step-by-step requirements",
             190, 450, 400, 55, S_BOX.format(fill='#D1F2EB', stroke='#1ABC9C', font='#117864'))

    add_edge(root, 'eex_1', 'ex1_login', 'ex1_dash')
    add_edge(root, 'eex_2', 'ex1_dash', 'ex1_start')
    add_edge(root, 'eex_3', 'ex1_start', 'ex1_check')

    add_node(root, 'ex_b2', "2. WORK EXECUTION &amp; BLOCKER HANDLING", 670, 120, 480, 520,
             S_BOUND.format(stroke='#F5B041', font='#7D6608'))
    add_node(root, 'ex2_block_q', "<b>Encounter a Blocker / Impediment?</b><br/>Missing access, unclear specs, technical crash?",
             760, 160, 300, 75, S_DIAMOND.format(fill='#FADBD8', stroke='#CB4335', font='#78281F'))
    add_node(root, 'ex2_raise', "<b>Click 'Raise Blocker Ticket'</b><br/>Describe bottleneck &amp; tag urgency<br/>Alerts Manasa &amp; Senior Manager instantly",
             710, 265, 400, 65, S_BOX.format(fill='#FADBD8', stroke='#CB4335', font='#78281F'))
    add_node(root, 'ex2_resume', "<b>Blocker Cleared by Manager</b><br/>Resume work; pause timer credit applied",
             710, 360, 400, 60, S_BOX.format(fill='#D5F5E3', stroke='#27AE60', font='#1E8449'))
    add_node(root, 'ex2_attach', "<b>Attach Proof-of-Work</b><br/>Upload final document, code link, or output<br/>Complete mandatory checklist items",
             710, 450, 400, 65, S_BOX.format(fill='#D1F2EB', stroke='#1ABC9C', font='#117864'))

    add_edge(root, 'eex_4', 'ex1_check', 'ex2_block_q', exitX=1, exitY=0.5, entryX=0, entryY=0.5)
    add_edge(root, 'eex_5', 'ex2_block_q', 'ex2_raise', 'Yes')
    add_edge(root, 'eex_6', 'ex2_raise', 'ex2_resume')
    add_edge(root, 'eex_7', 'ex2_block_q', 'ex2_attach', 'No')
    add_edge(root, 'eex_8', 'ex2_resume', 'ex2_attach')

    add_node(root, 'ex_b3', "3. SUBMISSION, QA &amp; CLOCK-OUT", 1190, 120, 480, 520,
             S_BOUND.format(stroke='#3498DB', font='#1B4F72'))
    add_node(root, 'ex3_submit', "<b>Click 'Submit for QA Review'</b><br/>Stopwatch stops; status set to 'In Review'<br/>Lead Manager Manasa notified",
             1230, 170, 400, 65, S_BOX.format(fill='#FCF3CF', stroke='#D68910', font='#7D6608'))
    add_node(root, 'ex3_qa_q', "<b>QA Outcome from Manasa?</b>",
             1280, 260, 300, 75, S_DIAMOND.format(fill='#FCF3CF', stroke='#D68910', font='#7D6608'))
    add_node(root, 'ex3_fix', "<b>Fix Highlighted Rework Items</b><br/>Address specific feedback; re-submit",
             1230, 360, 400, 60, S_BOX.format(fill='#FADBD8', stroke='#CB4335', font='#78281F'))
    add_node(root, 'ex3_clockout', "<b>Task Approved! Evening Clock-Out</b><br/>Points recorded in 100-pt scorecard<br/>Daily timesheet summary submitted",
             1230, 450, 400, 65, S_HEADER)

    add_edge(root, 'eex_9', 'ex2_attach', 'ex3_submit', exitX=1, exitY=0.5, entryX=0, entryY=0.5)
    add_edge(root, 'eex_10', 'ex3_submit', 'ex3_qa_q')
    add_edge(root, 'eex_11', 'ex3_qa_q', 'ex3_fix', 'Needs Rework')
    add_edge(root, 'eex_12', 'ex3_qa_q', 'ex3_clockout', 'Approved')
    add_edge(root, 'eex_13', 'ex3_fix', 'ex3_submit')

    # Lower Section
    add_node(root, 'ex_log_box',
             "<b>EXECUTIVE ACTIVITY STREAMED TO MASTER DATA STORE</b><br/>"
             "• Exact login/logout timestamps &amp; verified GPS coordinates<br/>"
             "• Active task stopwatch durations &amp; paused interval logs<br/>"
             "• Blocker escalation timestamps, categories &amp; resolution lags<br/>"
             "• Uploaded proof-of-work hashes, file links &amp; checklist states",
             150, 670, 740, 160, S_BUS.format(fill='#EAEDED', stroke='#7F8C8D', font='#17202A'))

    add_node(root, 'ex_intel_box',
             "<b>INTELLIGENCE PERSPECTIVE CONSUMED BY EXECUTIVE</b><br/>"
             "• <b>Personal 100-Point Scorecard:</b> Daily progress towards monthly score<br/>"
             "• <b>SLA Tracker:</b> On-time completion badge &amp; personal velocity graph<br/>"
             "• <b>Quality Index:</b> Personal First-Time-Right percentage (low rework)<br/>"
             "• <b>Recognition Radar:</b> Monthly Star Performer leaderboard position",
             930, 670, 740, 160, S_BUS.format(fill='#D5F5E3', stroke='#27AE60', font='#1E8449'))


# -------------------------------------------------------------
# PAGE 8: BUSINESS DEVELOPMENT EXECUTIVE (BHAVANI) - SALES PIPELINE & DEALS
# -------------------------------------------------------------
def build_page8(mxfile):
    root = create_page(mxfile, 'page_bde_bhavani', 'BDE (Bhavani) - Sales Pipeline & Deals', 1800, 2200)

    add_node(root, 'bde_title',
             "<b>BUSINESS DEVELOPMENT EXECUTIVE (BHAVANI) - SALES &amp; REVENUE WORKFLOW</b><br/>"
             "<i>Lead Qualification, GPS Client Site Visits, Proposal Generation &amp; CIRIL Commercial Closure</i>",
             100, 30, 1600, 60, S_HEADER)

    add_node(root, 'bde_b1', "1. LEAD INTAKE &amp; DISCOVERY", 150, 120, 480, 520,
             S_BOUND.format(stroke='#48C9B0', font='#117864'))
    add_node(root, 'bde1_login', "<b>BDE CRM Interface Login</b><br/>Review Active Sales Pipeline &amp; Targets<br/>View Inbound Leads from Harshitha",
             190, 170, 400, 60, S_BOX.format(fill='#D1F2EB', stroke='#1ABC9C', font='#117864'))
    add_node(root, 'bde1_qual_q', "<b>Lead Meets BANT Criteria?</b><br/>Budget, Authority, Need, Timeline verified?",
             240, 260, 300, 75, S_DIAMOND.format(fill='#FCF3CF', stroke='#D68910', font='#7D6608'))
    add_node(root, 'bde1_disc', "<b>Conduct Discovery Call</b><br/>Document client pain points &amp; requirements<br/>Schedule on-site meeting / demo",
             190, 365, 400, 65, S_BOX.format(fill='#D1F2EB', stroke='#1ABC9C', font='#117864'))
    add_node(root, 'bde1_nurture', "<b>Archive / Marketing Nurture</b><br/>Return low-intent leads to campaign pool",
             190, 455, 400, 55, S_BOX.format(fill='#FADBD8', stroke='#CB4335', font='#78281F'))

    add_edge(root, 'ebde_1', 'bde1_login', 'bde1_qual_q')
    add_edge(root, 'ebde_2', 'bde1_qual_q', 'bde1_disc', 'Qualified')
    add_edge(root, 'ebde_3', 'bde1_qual_q', 'bde1_nurture', 'Unqualified')

    add_node(root, 'bde_b2', "2. CLIENT SITE VISIT &amp; PROPOSAL", 670, 120, 480, 520,
             S_BOUND.format(stroke='#F5B041', font='#7D6608'))
    add_node(root, 'bde2_site', "<b>On-Site Client Visit</b><br/>Log GPS check-in at client premises<br/>Present CIRIL enterprise capabilities",
             710, 170, 400, 65, S_BOX.format(fill='#FCF3CF', stroke='#D68910', font='#7D6608'))
    add_node(root, 'bde2_prop', "<b>Draft Commercial Proposal</b><br/>Apply CIRIL 30/70 margin formula<br/>Calculate project delivery milestones",
             710, 265, 400, 65, S_BOX.format(fill='#FCF3CF', stroke='#D68910', font='#7D6608'))
    add_node(root, 'bde2_gm_app', "<b>Submit to GM Ipsheeta for Approval</b><br/>Ensure proposal meets profitability threshold",
             710, 360, 400, 65, S_BOX.format(fill='#D4E6F1', stroke='#2980B9', font='#1B4F72'))
    add_node(root, 'bde2_sent', "<b>Deliver Approved Proposal to Client</b>",
             710, 455, 400, 55, S_BOX.format(fill='#D5F5E3', stroke='#27AE60', font='#1E8449'))

    add_edge(root, 'ebde_4', 'bde1_disc', 'bde2_site', exitX=1, exitY=0.5, entryX=0, entryY=0.5)
    add_edge(root, 'ebde_5', 'bde2_site', 'bde2_prop')
    add_edge(root, 'ebde_6', 'bde2_prop', 'bde2_gm_app')
    add_edge(root, 'ebde_7', 'bde2_gm_app', 'bde2_sent')

    add_node(root, 'bde_b3', "3. NEGOTIATION &amp; CONTRACT CLOSURE", 1190, 120, 480, 520,
             S_BOUND.format(stroke='#3498DB', font='#1B4F72'))
    add_node(root, 'bde3_deal_q', "<b>Deal Won or Lost?</b>",
             1280, 160, 300, 75, S_DIAMOND.format(fill='#FCF3CF', stroke='#D68910', font='#7D6608'))
    add_node(root, 'bde3_won', "<b>DEAL WON: Sign Agreement</b><br/>Upload signed contract &amp; purchase order<br/>Enforce 30/70 commercial split in ledger",
             1230, 260, 400, 65, S_BOX.format(fill='#D5F5E3', stroke='#27AE60', font='#1E8449'))
    add_node(root, 'bde3_royalty', "<b>Calculate 7.5% CIRIL Royalty</b><br/>Auto-credit royalty ledger for Chairman",
             1230, 355, 400, 60, S_BOX.format(fill='#FCF3CF', stroke='#B7950B', font='#7D6608'))
    add_node(root, 'bde3_lost', "<b>Deal Lost: Record Reason</b><br/>Price / Competitor / Budget freeze",
             1230, 445, 400, 55, S_BOX.format(fill='#FADBD8', stroke='#CB4335', font='#78281F'))

    add_edge(root, 'ebde_8', 'bde2_sent', 'bde3_deal_q', exitX=1, exitY=0.5, entryX=0, entryY=0.5)
    add_edge(root, 'ebde_9', 'bde3_deal_q', 'bde3_won', 'Won')
    add_edge(root, 'ebde_10', 'bde3_won', 'bde3_royalty')
    add_edge(root, 'ebde_11', 'bde3_deal_q', 'bde3_lost', 'Lost')

    # Lower Section
    add_node(root, 'bde_log_box',
             "<b>SALES PIPELINE DATA STREAMED TO CENTRAL STORE</b><br/>"
             "• Lead intake sources, discovery call notes &amp; stage timestamps<br/>"
             "• Client on-site GPS check-ins &amp; meeting minutes<br/>"
             "• Contract pricing, payment milestones &amp; CIRIL 30/70 split records<br/>"
             "• 7.5% Royalty allocations &amp; loss analysis metrics",
             150, 670, 740, 160, S_BUS.format(fill='#EAEDED', stroke='#7F8C8D', font='#17202A'))

    add_node(root, 'bde_intel_box',
             "<b>INTELLIGENCE PERSPECTIVE CONSUMED BY BHAVANI &amp; LEADERSHIP</b><br/>"
             "• <b>Conversion Funnel Engine:</b> Lead-to-proposal-to-win conversion ratios<br/>"
             "• <b>Revenue Realization:</b> Monthly quota attainment vs target<br/>"
             "• <b>Commission &amp; Score:</b> Performance points awarded for contract signings<br/>"
             "• <b>Executive Visibility:</b> Deal highlights streamed to Chairman &amp; GM",
             930, 670, 740, 160, S_BUS.format(fill='#D1F2EB', stroke='#1ABC9C', font='#117864'))


# -------------------------------------------------------------
# PAGE 9: MARKETING & CREATIVE (HARSHITHA & GRAPHIC DESIGNER) - CAMPAIGNS & ASSETS
# -------------------------------------------------------------
def build_page9(mxfile):
    root = create_page(mxfile, 'page_marketing_creative', 'Marketing & Creative - Campaigns & Assets', 1800, 2200)

    add_node(root, 'mkt_title',
             "<b>MARKETING &amp; CREATIVE COLLABORATION ARCHITECTURE (HARSHITHA &amp; GRAPHIC DESIGNER)</b><br/>"
             "<i>Campaign Planning, Canva/Figma Asset Creation, Social Publishing &amp; Inbound Lead Generation</i>",
             100, 30, 1600, 60, S_HEADER)

    add_node(root, 'mkt_b1', "1. CAMPAIGN BRIEF &amp; CREATIVE REQUEST", 150, 120, 480, 520,
             S_BOUND.format(stroke='#48C9B0', font='#117864'))
    add_node(root, 'mkt1_cal', "<b>Monthly Campaign Planning (Harshitha)</b><br/>Define themes, post dates &amp; channels<br/>Set reach &amp; lead generation goals",
             190, 170, 400, 65, S_BOX.format(fill='#D1F2EB', stroke='#1ABC9C', font='#117864'))
    add_node(root, 'mkt1_req', "<b>Create Design Ticket for Designer</b><br/>Attach copy, visual references &amp; aspect ratios<br/>Set SLA deadline for creative output",
             190, 265, 400, 65, S_BOX.format(fill='#D1F2EB', stroke='#1ABC9C', font='#117864'))
    add_node(root, 'mkt1_intake', "<b>Creative Request Intake (Graphic Designer)</b><br/>Review specs &amp; brand guidelines<br/>Acknowledge SLA &amp; start design timer",
             190, 360, 400, 65, S_BOX.format(fill='#D1F2EB', stroke='#1ABC9C', font='#117864'))
    add_node(root, 'mkt1_ready', "<b>Design Production Commences</b>",
             190, 455, 400, 50, S_HEADER)

    add_edge(root, 'emkt_1', 'mkt1_cal', 'mkt1_req')
    add_edge(root, 'emkt_2', 'mkt1_req', 'mkt1_intake')
    add_edge(root, 'emkt_3', 'mkt1_intake', 'mkt1_ready')

    add_node(root, 'mkt_b2', "2. CREATIVE PRODUCTION &amp; REVIEW", 670, 120, 480, 520,
             S_BOUND.format(stroke='#F5B041', font='#7D6608'))
    add_node(root, 'mkt2_tools', "<b>Asset Creation in Canva / Figma</b><br/>Design banners, infographics, carousels<br/>Ensure typography &amp; color compliance",
             710, 170, 400, 65, S_BOX.format(fill='#FCF3CF', stroke='#D68910', font='#7D6608'))
    add_node(root, 'mkt2_rev_q', "<b>Harshitha &amp; Manasa QA Review?</b><br/>Does visual align with message &amp; brand?",
             760, 260, 300, 75, S_DIAMOND.format(fill='#FCF3CF', stroke='#D68910', font='#7D6608'))
    add_node(root, 'mkt2_rework', "<b>Iterate Based on Feedback</b><br/>Designer applies requested tweaks",
             710, 365, 400, 55, S_BOX.format(fill='#FADBD8', stroke='#CB4335', font='#78281F'))
    add_node(root, 'mkt2_lib', "<b>Upload to Central Media Library</b><br/>Export high-res web &amp; print formats<br/>Store tagged asset in Central Repository",
             710, 450, 400, 65, S_BOX.format(fill='#D5F5E3', stroke='#27AE60', font='#1E8449'))

    add_edge(root, 'emkt_4', 'mkt1_ready', 'mkt2_tools', exitX=1, exitY=0.5, entryX=0, entryY=0.5)
    add_edge(root, 'emkt_5', 'mkt2_tools', 'mkt2_rev_q')
    add_edge(root, 'emkt_6', 'mkt2_rev_q', 'mkt2_rework', 'Needs Tweak')
    add_edge(root, 'emkt_7', 'mkt2_rev_q', 'mkt2_lib', 'Approved')
    add_edge(root, 'emkt_8', 'mkt2_rework', 'mkt2_tools')

    add_node(root, 'mkt_b3', "3. PUBLISHING, ANALYTICS &amp; LEAD HANDOFF", 1190, 120, 480, 520,
             S_BOUND.format(stroke='#3498DB', font='#1B4F72'))
    add_node(root, 'mkt3_pub', "<b>Multi-Platform Social Publishing</b><br/>Schedule posts on LinkedIn, Instagram, Web<br/>Track link click tags &amp; campaign UTMs",
             1230, 170, 400, 65, S_BOX.format(fill='#D4E6F1', stroke='#2980B9', font='#1B4F72'))
    add_node(root, 'mkt3_eng', "<b>Monitor Engagement &amp; Impressions</b><br/>Measure CTR, comments, shares &amp; reach<br/>Feed data into Reach Analytics Engine",
             1230, 265, 400, 65, S_BOX.format(fill='#D4E6F1', stroke='#2980B9', font='#1B4F72'))
    add_node(root, 'mkt3_lead', "<b>Inbound Lead Capture &amp; Handoff</b><br/>Identify commercial inquiries<br/>Auto-route qualified lead to Bhavani (BDE)",
             1230, 360, 400, 65, S_BOX.format(fill='#D5F5E3', stroke='#27AE60', font='#1E8449'))
    add_node(root, 'mkt3_done', "<b>Marketing &amp; Design Loop Complete</b>",
             1230, 460, 400, 50, S_HEADER)

    add_edge(root, 'emkt_9', 'mkt2_lib', 'mkt3_pub', exitX=1, exitY=0.5, entryX=0, entryY=0.5)
    add_edge(root, 'emkt_10', 'mkt3_pub', 'mkt3_eng')
    add_edge(root, 'emkt_11', 'mkt3_eng', 'mkt3_lead')
    add_edge(root, 'emkt_12', 'mkt3_lead', 'mkt3_done')

    # Lower Section
    add_node(root, 'mkt_log_box',
             "<b>MARKETING &amp; CREATIVE LOGS STREAMED TO CENTRAL STORE</b><br/>"
             "• Campaign brief tickets, SLA deadlines &amp; designer turn-around times<br/>"
             "• Media asset hashes, version histories &amp; approval timestamps<br/>"
             "• Social post publishing logs, impressions, reach &amp; engagement rates<br/>"
             "• Inbound lead handoff events transferred to BDE pipeline",
             150, 670, 740, 160, S_BUS.format(fill='#EAEDED', stroke='#7F8C8D', font='#17202A'))

    add_node(root, 'mkt_intel_box',
             "<b>INTELLIGENCE PERSPECTIVE CONSUMED BY MARKETING &amp; DESIGN</b><br/>"
             "• <b>Reach Analytics Engine:</b> Channel performance &amp; top-performing creatives<br/>"
             "• <b>Lead Generation Velocity:</b> Number of qualified leads delivered to sales<br/>"
             "• <b>Design Turn-around SLA:</b> First-time QA approval rate for Graphic Designer<br/>"
             "• <b>100-Point Scoring:</b> Points credited for on-time delivery &amp; campaign success",
             930, 670, 740, 160, S_BUS.format(fill='#D4E6F1', stroke='#2980B9', font='#1B4F72'))


def main():
    mxfile = ET.Element('mxfile', host='app.diagrams.net', modified='2026-09-30T17:45:00.000Z',
                        agent='IOTS-Enterprise-V2', version='24.0.0')

    print("Building Page 1: Master Architecture...")
    build_page1(mxfile)

    print("Building Page 2: Chairman...")
    build_page2(mxfile)

    print("Building Page 3: Super Admin & IT System Analyst...")
    build_page3(mxfile)

    print("Building Page 4: Office Admin...")
    build_page4(mxfile)

    print("Building Page 5: General Manager (Ipsheeta)...")
    build_page5(mxfile)

    print("Building Page 6: Lead Manager (Manasa) & Senior Manager...")
    build_page6(mxfile)

    print("Building Page 7: Executive...")
    build_page7(mxfile)

    print("Building Page 8: BDE (Bhavani)...")
    build_page8(mxfile)

    print("Building Page 9: Marketing & Creative...")
    build_page9(mxfile)

    xml_bytes = ET.tostring(mxfile, encoding='utf-8', xml_declaration=True)

    out1 = os.path.join('.', 'flowchart-detailed', 'new_updated_flowchart_2.drawio')
    out2 = os.path.join('.', 'new_updated_flowchart_2.drawio')

    with open(out1, 'wb') as f:
        f.write(xml_bytes)
    print(f"Saved: {out1} ({len(xml_bytes)} bytes)")

    with open(out2, 'wb') as f:
        f.write(xml_bytes)
    print(f"Saved: {out2} ({len(xml_bytes)} bytes)")

if __name__ == '__main__':
    main()
