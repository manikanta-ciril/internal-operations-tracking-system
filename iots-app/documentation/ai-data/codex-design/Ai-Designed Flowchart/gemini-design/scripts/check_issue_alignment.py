import xml.etree.ElementTree as ET
import sys
sys.stdout.reconfigure(encoding='utf-8')

tree = ET.parse(r'C:\Users\ciril\OneDrive\Desktop\Manikanta-Files\Git\monitoring-portal\internal-operations-tracking-system\iots-app\documentation\worker\Codex\codex-design\new_final-version.drawio')
root = tree.getroot()

diag = root.find('diagram')
model = diag.find('mxGraphModel')
mxroot = model.find('root')

print(f"Diagram Name: {diag.get('name')}")
print(f"Canvas size: {model.get('pageWidth')} x {model.get('pageHeight')}")

# Collect all text nodes
nodes = []
edges = []
for cell in mxroot.findall('mxCell'):
    val = cell.get('value', '').strip()
    cid = cell.get('id')
    style = cell.get('style', '')
    if cell.get('edge') == '1':
        edges.append((cid, val, cell.get('source'), cell.get('target')))
    elif val:
        nodes.append((cid, val, style))

print(f"Total labeled nodes: {len(nodes)}")
print(f"Total edges: {len(edges)}")

# Key themes from Issue #2 to check:
themes = {
    "1. Authentication & Authorization": ["login", "credentials", "authenticate", "geofence", "location", "session"],
    "2. Role Separation (Admin, Manager, Employee)": ["admin", "manager", "employee", "super admin", "chairman", "lead manager", "bde", "executive"],
    "3. Organizational Activities (Users, Tasks, Attendance, Leave, Requests, Comm, Approvals)": ["attendance", "leave", "request", "announcement", "approval", "task"],
    "4. Task Lifecycle (Assign, Progress, Blockers, Overdue, Reassignment, Review, Correction, Closure)": ["assigned", "in progress", "blocker", "overdue", "reassign", "review", "correction", "close", "complete"],
    "5. Work Recording (Progress, Notes, Time/Effort, Evidence)": ["effort", "notes", "evidence", "progress %", "time entry", "work activity"],
    "6. Exception & Escalation Handling": ["escalat", "exception", "overdue", "blocker", "interven"],
    "7. Operational Information to Intelligence/Analytics": ["intelligence", "analytics", "report", "kpi", "performance", "trend", "risk"],
    "8. Traceability & Auditing": ["audit", "traceab", "immutable", "history", "log"]
}

for theme, keywords in themes.items():
    print(f"\n--- Checking: {theme} ---")
    matches = []
    for cid, val, style in nodes:
        val_lower = val.lower()
        if any(k in val_lower for k in keywords):
            matches.append((cid, val.replace('\n', ' ')[:90]))
    print(f"Found {len(matches)} matching nodes.")
    for cid, text in matches[:5]:
        print(f"  • [{cid}] {text}")
