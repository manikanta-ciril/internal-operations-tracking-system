import xml.etree.ElementTree as ET

def create_cell(id, value, style, parent, x, y, width, height, is_edge=False, source=None, target=None):
    cell = ET.Element('mxCell', id=id, parent=parent)
    if value is not None:
        cell.set('value', value)
    if style:
        cell.set('style', style)
    
    if is_edge:
        cell.set('edge', '1')
        if source: cell.set('source', source)
        if target: cell.set('target', target)
        geom = ET.SubElement(cell, 'mxGeometry', relative="1")
        geom.set('as', 'geometry')
    else:
        cell.set('vertex', '1')
        geom = ET.SubElement(cell, 'mxGeometry', x=str(x), y=str(y), width=str(width), height=str(height))
        geom.set('as', 'geometry')
    return cell

root = ET.Element('mxfile', version="22.1.2")
diagram = ET.SubElement(root, 'diagram', id="diag-1", name="CIRIL IOTS")
model = ET.SubElement(diagram, 'mxGraphModel', dx="1000", dy="1000", grid="1", gridSize="10", guides="1", tooltips="1", connect="1", arrows="1", fold="1", page="1", pageScale="1", pageWidth="1169", pageHeight="827", math="0", shadow="0")
mxroot = ET.SubElement(model, 'root')

ET.SubElement(mxroot, 'mxCell', id="0")
ET.SubElement(mxroot, 'mxCell', id="1", parent="0")

cells = []
edges = []
edge_counter = 1

def add_node(id, value, lane, col, row, shape="rect"):
    x = 120 + col * 180
    y = 45 + row * 120
    if shape == "rect":
        w, h = 140, 60
        style = "rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#333333;"
    elif shape == "diamond":
        w, h = 140, 80
        style = "rhombus;whiteSpace=wrap;html=1;fillColor=#ffffcc;strokeColor=#333333;"
    elif shape == "cylinder":
        w, h = 100, 70
        style = "shape=cylinder3;whiteSpace=wrap;html=1;fillColor=#e1d5e7;strokeColor=#9673a6;"
    cells.append(create_cell(id, value, style, lane, x, y, w, h))

def add_edge(source, target, label="", style="edgeStyle=orthogonalEdgeStyle;rounded=1;html=1;strokeColor=#333333;strokeWidth=2;"):
    global edge_counter
    eid = f"e{edge_counter}"
    edge_counter += 1
    edges.append(create_cell(eid, label, style, "1", 0, 0, 0, 0, is_edge=True, source=source, target=target))

# Lanes
lanes = [
    ("lane_auth", "Authentication & Authorization", 0, 300, "#f5f5f5"),
    ("lane_admin", "Management Layer: Admin", 300, 450, "#ffe6cc"),
    ("lane_manager", "Management Layer: Manager", 750, 600, "#d5e8d4"),
    ("lane_emp", "Management Layer: Employee", 1350, 600, "#dae8fc"),
    ("lane_analytics", "Intelligence & Analytics Layer", 1950, 300, "#e1d5e7")
]

for lid, title, y, h, color in lanes:
    style = f"swimlane;horizontal=0;startSize=110;fillColor={color};html=1;"
    cells.append(create_cell(lid, f"<b>{title}</b>", style, "1", 0, y, 2200, h))

# Auth nodes
add_node("auth_in", "User Logs In", "lane_auth", 0, 0)
add_node("auth_val", "Validate Credentials", "lane_auth", 1, 0)
add_node("auth_valid", "Valid?", "lane_auth", 2, 0, "diamond")
add_node("auth_inv", "Invalid Login", "lane_auth", 2, 1)
add_node("auth_loc", "Validate Location", "lane_auth", 3, 0)
add_node("auth_loc_ok", "Recognized?", "lane_auth", 4, 0, "diamond")
add_node("auth_rem", "Mark Off-Site", "lane_auth", 4, 1)
add_node("auth_audit", "Audit Context", "lane_auth", 5, 0)
add_node("auth_role", "Determine Roles", "lane_auth", 6, 0)
add_node("auth_route", "Route to Workspace", "lane_auth", 7, 0)
add_node("auth_switch", "Workspace Switcher", "lane_auth", 7, 1)

add_edge("auth_in", "auth_val")
add_edge("auth_val", "auth_valid")
add_edge("auth_valid", "auth_inv", "No")
add_edge("auth_valid", "auth_loc", "Yes")
add_edge("auth_loc", "auth_loc_ok")
add_edge("auth_loc_ok", "auth_rem", "No")
add_edge("auth_rem", "auth_audit")
add_edge("auth_loc_ok", "auth_audit", "Yes")
add_edge("auth_audit", "auth_role")
add_edge("auth_role", "auth_route")
add_edge("auth_route", "auth_switch", "Context Switch")
add_edge("auth_switch", "auth_role")

# Admin nodes
add_node("adm_start", "Admin Functions", "lane_admin", 0, 0)
add_node("adm_usr1", "User Management", "lane_admin", 1, 0)
add_node("adm_usr2", "Create User", "lane_admin", 2, 0)
add_node("adm_usr3", "Assign Roles", "lane_admin", 3, 0)
add_node("adm_usr4", "Activate", "lane_admin", 4, 0)

add_node("adm_loc1", "Location Control", "lane_admin", 1, 1)
add_node("adm_loc2", "Review Exceptions", "lane_admin", 2, 1)
add_node("adm_loc3", "Resolve", "lane_admin", 3, 1)

add_node("adm_task1", "Global Task Oversight", "lane_admin", 1, 2)
add_node("adm_task2", "Intervention", "lane_admin", 2, 2)

add_node("adm_sys1", "System Settings", "lane_admin", 4, 1)
add_node("adm_sys2", "Configure", "lane_admin", 5, 1)

add_node("adm_sec", "Security & Audit", "lane_admin", 5, 2)
add_node("adm_ann", "Global Announcements", "lane_admin", 6, 0)
add_node("adm_audit", "Audit Actions", "lane_admin", 6, 1, "cylinder")

add_edge("auth_route", "adm_start", "Role = Admin")
add_edge("adm_start", "adm_usr1")
add_edge("adm_start", "adm_loc1")
add_edge("adm_start", "adm_task1")
add_edge("adm_start", "adm_sys1")
add_edge("adm_start", "adm_sec")
add_edge("adm_start", "adm_ann")

add_edge("adm_usr1", "adm_usr2")
add_edge("adm_usr2", "adm_usr3")
add_edge("adm_usr3", "adm_usr4")
add_edge("adm_usr4", "adm_audit")

add_edge("adm_loc1", "adm_loc2")
add_edge("adm_loc2", "adm_loc3")
add_edge("adm_loc3", "adm_audit")

add_edge("adm_task1", "adm_task2")
add_edge("adm_task2", "adm_audit")

add_edge("adm_sys1", "adm_sys2")
add_edge("adm_sys2", "adm_audit")

# Manager nodes
add_node("mgr_start", "Manager Functions", "lane_manager", 0, 0)
add_node("mgr_task1", "Create Task", "lane_manager", 1, 0)
add_node("mgr_task2", "Assign Employee", "lane_manager", 2, 0)
add_node("mgr_task3", "Monitor Progress", "lane_manager", 3, 0)
add_node("mgr_task4", "Review Work", "lane_manager", 4, 0)
add_node("mgr_task5", "Approved?", "lane_manager", 5, 0, "diamond")
add_node("mgr_task6", "Complete", "lane_manager", 6, 0)
add_node("mgr_task7", "Provide Feedback", "lane_manager", 5, 1)

add_node("mgr_over", "Overdue / Issue", "lane_manager", 3, 1)
add_node("mgr_reassign", "Reassign/Extend", "lane_manager", 4, 1)

add_node("mgr_team1", "Team Management", "lane_manager", 1, 2)
add_node("mgr_team2", "Balance Workload", "lane_manager", 2, 2)

add_node("mgr_att1", "Attendance Mgt", "lane_manager", 1, 3)
add_node("mgr_att2", "Approve Requests", "lane_manager", 2, 3)

add_node("mgr_comm", "Team Comm", "lane_manager", 3, 2)

add_edge("auth_route", "mgr_start", "Role = Manager")
add_edge("mgr_start", "mgr_task1")
add_edge("mgr_start", "mgr_team1")
add_edge("mgr_start", "mgr_att1")
add_edge("mgr_start", "mgr_comm")

add_edge("mgr_task1", "mgr_task2")
add_edge("mgr_task2", "mgr_task3")
add_edge("mgr_task3", "mgr_task4")
add_edge("mgr_task4", "mgr_task5")
add_edge("mgr_task5", "mgr_task6", "Yes")
add_edge("mgr_task5", "mgr_task7", "No")

add_edge("mgr_task3", "mgr_over", "Deadline Passed")
add_edge("mgr_over", "mgr_reassign")

add_edge("mgr_team1", "mgr_team2")
add_edge("mgr_att1", "mgr_att2")

# Employee nodes
add_node("emp_start", "Employee Functions", "lane_emp", 0, 0)
add_node("emp_task1", "Task Queue", "lane_emp", 1, 0)
add_node("emp_task2", "Start Work", "lane_emp", 2, 0)
add_node("emp_task3", "Update Progress", "lane_emp", 3, 0)
add_node("emp_task4", "Issue?", "lane_emp", 4, 0, "diamond")
add_node("emp_task5", "Submit Work", "lane_emp", 5, 0)
add_node("emp_issue1", "Raise Blocker", "lane_emp", 4, 1)

add_node("emp_att1", "Check-In / Out", "lane_emp", 1, 2)
add_node("emp_att2", "Set Availability", "lane_emp", 2, 2)

add_node("emp_req1", "Create Request", "lane_emp", 1, 3)
add_node("emp_req2", "Manager Review", "lane_emp", 2, 3)

add_edge("auth_route", "emp_start", "Role = Employee")
add_edge("emp_start", "emp_task1")
add_edge("emp_start", "emp_att1")
add_edge("emp_start", "emp_req1")

add_edge("mgr_task2", "emp_task1", "Assign")
add_edge("emp_task1", "emp_task2")
add_edge("emp_task2", "emp_task3")
add_edge("emp_task3", "emp_task4")
add_edge("emp_task4", "emp_task5", "No")
add_edge("emp_task4", "emp_issue1", "Yes")
add_edge("emp_issue1", "mgr_over", "Escalate")
add_edge("emp_task5", "mgr_task4", "Submit")
add_edge("mgr_task7", "emp_task3", "Revise")

add_edge("emp_att1", "emp_att2")
add_edge("emp_req1", "emp_req2")
add_edge("emp_req2", "mgr_att2", "Review")

# Analytics Layer
add_node("anl_start", "Operational Records", "lane_analytics", 0, 0, "cylinder")
add_node("anl_eng", "Analytics Engine", "lane_analytics", 1, 0)
add_node("anl_rep", "Reports & Dashboards", "lane_analytics", 2, 0)
add_node("anl_exec", "Executive Insights (Chairman)", "lane_analytics", 3, 0)

add_edge("emp_task3", "anl_start", "Log Activity")
add_edge("mgr_task6", "anl_start", "Log Completion")
add_edge("adm_audit", "anl_start", "Log Actions")
add_edge("anl_start", "anl_eng")
add_edge("anl_eng", "anl_rep")
add_edge("anl_rep", "anl_exec")


for cell in cells + edges:
    mxroot.append(cell)

tree = ET.ElementTree(root)
tree.write('gemini-design/file.drawio', encoding='utf-8', xml_declaration=True)
print("Saved to gemini-design/file.drawio")
