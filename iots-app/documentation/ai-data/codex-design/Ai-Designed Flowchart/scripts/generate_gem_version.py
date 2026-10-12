import shutil
import xml.etree.ElementTree as ET
import os

source_path = 'codex-design/new_final-version.drawio'
target_path = 'codex-design/gem_new_final-version.drawio'

# 1. Copy original file to new target file
shutil.copyfile(source_path, target_path)
print(f"Copied {source_path} to {target_path}")

# 2. Parse the target file
tree = ET.parse(target_path)
root = tree.getroot()

# Find layer2
layer2 = root.find('.//mxCell[@id="layer2"]')
if layer2 is None:
    raise RuntimeError("layer2 not found")

# Helper to find or create cell
def get_cell(cid):
    c = root.find(f'.//mxCell[@id="{cid}"]')
    return c

# Define geometries, styles, and values for the updated cells

updates = {
    # Column 1: Governance & Rules
    'new-388': {
        'val': '<b>WORK ACTIVITY ≠ TASK STATE</b><br>Progress updates, work notes, effort entries and files are historical activity records. A reassignment is an ownership-change event; overdue is an exception flag on unfinished work. Cancellation is a separately authorised outcome.<br><br><b>State Machine Invariant:</b> Task states (Assigned → In Progress → Waiting for Review → Under Review → Closed) are strictly controlled by formal lifecycle transitions, never mutated directly by note additions or file uploads.',
        'x': 112, 'y': 3320, 'w': 1976, 'h': 260,
        'style': 'whiteSpace=wrap;html=1;fontFamily=Verdana;fontSize=16;spacing=12;strokeWidth=1.5;rounded=1;arcSize=8;align=left;fillColor=#F5F7FA;strokeColor=#728294;fontColor=#152735;'
    },
    'new-389': {
        'val': '<b>BUSINESS LINKAGE</b><br>Member office / CRM lead / campaign / conference / IT incident references connect operational tasks to their business context. External parties provide inputs; IOTS records staff coordination and accountability.<br><br><b>Traceability Contract:</b> Every task links to its originating business entity ID, ensuring end-to-end auditability across departments.',
        'x': 112, 'y': 3600, 'w': 1976, 'h': 260,
        'style': 'whiteSpace=wrap;html=1;fontFamily=Verdana;fontSize=16;spacing=12;strokeWidth=1.5;rounded=1;arcSize=8;align=left;fillColor=#F5F7FA;strokeColor=#728294;fontColor=#152735;'
    },

    # Column 2 Track 1: Initiation & Assignment (Vertical Flow)
    'new-364': {
        'val': '<b>1. Create Task</b><br>Purpose and responsible manager',
        'x': 2320, 'y': 3320, 'w': 760, 'h': 75,
        'style': 'whiteSpace=wrap;html=1;fontFamily=Verdana;fontSize=17;spacing=10;strokeWidth=1.5;rounded=1;arcSize=10;fillColor=#FFF1E4;strokeColor=#C66B17;fontColor=#152735;'
    },
    'new-365': {
        'val': '<b>2. Define Deliverables</b><br>Acceptance criteria / linked business record',
        'x': 2320, 'y': 3425, 'w': 760, 'h': 75,
        'style': 'whiteSpace=wrap;html=1;fontFamily=Verdana;fontSize=17;spacing=10;strokeWidth=1.5;rounded=1;arcSize=10;fillColor=#FFF1E4;strokeColor=#C66B17;fontColor=#152735;'
    },
    'new-366': {
        'val': '<b>3. Set Priority & Due Date</b><br>Record original deadline',
        'x': 2320, 'y': 3530, 'w': 760, 'h': 75,
        'style': 'whiteSpace=wrap;html=1;fontFamily=Verdana;fontSize=17;spacing=10;strokeWidth=1.5;rounded=1;arcSize=10;fillColor=#FFF1E4;strokeColor=#C66B17;fontColor=#152735;'
    },
    'new-367': {
        'val': '<b>4. Check Capacity & Availability</b><br>Choose employee and reviewer',
        'x': 2320, 'y': 3635, 'w': 760, 'h': 75,
        'style': 'whiteSpace=wrap;html=1;fontFamily=Verdana;fontSize=17;spacing=10;strokeWidth=1.5;rounded=1;arcSize=10;fillColor=#FFF1E4;strokeColor=#C66B17;fontColor=#152735;'
    },
    'new-368': {
        'val': '<b>5. Assign Task & Notify</b><br>State: Assigned / Pending',
        'x': 2320, 'y': 3740, 'w': 760, 'h': 75,
        'style': 'whiteSpace=wrap;html=1;fontFamily=Verdana;fontSize=17;spacing=10;strokeWidth=1.5;rounded=1;arcSize=10;fillColor=#FFF1E4;strokeColor=#C66B17;fontColor=#152735;'
    },

    # Column 2 Track 2: Execution, Review & Closure (Vertical Flow)
    'new-369': {
        'val': '<b>6. Execute Work</b><br>State: In Progress (notes, effort, evidence)',
        'x': 3140, 'y': 3320, 'w': 560, 'h': 75,
        'style': 'whiteSpace=wrap;html=1;fontFamily=Verdana;fontSize=17;spacing=10;strokeWidth=1.5;rounded=1;arcSize=10;fillColor=#E8F5EF;strokeColor=#2D7B5C;fontColor=#152735;'
    },
    'new-370': {
        'val': '<b>7. Submit Deliverables</b><br>State: Waiting for Review',
        'x': 3140, 'y': 3425, 'w': 560, 'h': 75,
        'style': 'whiteSpace=wrap;html=1;fontFamily=Verdana;fontSize=17;spacing=10;strokeWidth=1.5;rounded=1;arcSize=10;fillColor=#E8F5EF;strokeColor=#2D7B5C;fontColor=#152735;'
    },
    'new-377': {
        'val': '<b>8. Manager Reviews Submission</b><br>State: Under Review',
        'x': 3140, 'y': 3530, 'w': 560, 'h': 75,
        'style': 'whiteSpace=wrap;html=1;fontFamily=Verdana;fontSize=17;spacing=10;strokeWidth=1.5;rounded=1;arcSize=10;fillColor=#FFF1E4;strokeColor=#C66B17;fontColor=#152735;'
    },
    'new-379': {
        'val': '<b>Approved?</b>',
        'x': 3200, 'y': 3635, 'w': 440, 'h': 75,
        'style': 'whiteSpace=wrap;html=1;fontFamily=Verdana;fontSize=17;spacing=10;strokeWidth=1.5;rhombus;fillColor=#FFF1E4;strokeColor=#C66B17;fontColor=#152735;'
    },
    'new-381': {
        'val': '<b>Complete & Close Task</b><br>Record approval and final evidence',
        'x': 3140, 'y': 3740, 'w': 560, 'h': 75,
        'style': 'whiteSpace=wrap;html=1;fontFamily=Verdana;fontSize=17;spacing=10;strokeWidth=1.5;rounded=1;arcSize=10;fillColor=#E8F5EF;strokeColor=#2D7B5C;fontColor=#152735;'
    },
    'new-383': {
        'val': '<b>Changes Requested</b><br>Manager records corrections; notify employee',
        'x': 3730, 'y': 3635, 'w': 550, 'h': 75,
        'style': 'whiteSpace=wrap;html=1;fontFamily=Verdana;fontSize=17;spacing=10;strokeWidth=1.5;rounded=1;arcSize=10;fillColor=#FBEDED;strokeColor=#B35C65;fontColor=#152735;'
    },
    'new-385': {
        'val': '<b>Employee Revises & Resubmits</b><br>Preserve previous versions and feedback',
        'x': 3730, 'y': 3740, 'w': 550, 'h': 75,
        'style': 'whiteSpace=wrap;html=1;fontFamily=Verdana;fontSize=17;spacing=10;strokeWidth=1.5;rounded=1;arcSize=10;fillColor=#E8F5EF;strokeColor=#2D7B5C;fontColor=#152735;'
    },

    # Column 3: Domain Workflows
    'new-390': {
        'val': '<b>MEMBERSHIP WORK</b><br>BDE research → outreach → log response / next follow-up → GM meeting → agreement and fee coordination → review outcome.<br>Unready prospects remain in a dated follow-up queue.',
        'x': 4512, 'y': 3320, 'w': 1976, 'h': 165,
        'style': 'whiteSpace=wrap;html=1;fontFamily=Verdana;fontSize=16;spacing=12;strokeWidth=1.5;rounded=1;arcSize=10;fillColor=#E8F5EF;strokeColor=#2D7B5C;fontColor=#152735;'
    },
    'new-391': {
        'val': '<b>MEMBER DEAL & ROYALTY FOLLOW-UP</b><br>CRM lead → receiving member accepts / rejects → proposal / negotiation → concluded deal → brokerage acceptance → verified royalty payment.<br>IOTS tracks internal owners and evidence; unpaid amounts stay open.',
        'x': 4512, 'y': 3505, 'w': 1976, 'h': 165,
        'style': 'whiteSpace=wrap;html=1;fontFamily=Verdana;fontSize=16;spacing=12;strokeWidth=1.5;rounded=1;arcSize=10;fillColor=#FFF1E4;strokeColor=#C66B17;fontColor=#152735;'
    },
    'new-392': {
        'val': '<b>CREATIVE & RESEARCH DELIVERY</b><br>Brief / member research data → draft / proofread / design → review → corrections → approval → publish / print → evidence.<br>Retain versions, final links and distribution records.',
        'x': 4512, 'y': 3690, 'w': 1976, 'h': 165,
        'style': 'whiteSpace=wrap;html=1;fontFamily=Verdana;fontSize=16;spacing=12;strokeWidth=1.5;rounded=1;arcSize=10;fillColor=#E8F5EF;strokeColor=#2D7B5C;fontColor=#152735;'
    },
}

# Apply updates to vertices
for cid, info in updates.items():
    c = get_cell(cid)
    if c is not None:
        c.set('value', info['val'])
        c.set('style', info['style'])
        geo = c.find('mxGeometry')
        if geo is not None:
            geo.set('x', str(info['x']))
            geo.set('y', str(info['y']))
            geo.set('width', str(info['w']))
            geo.set('height', str(info['h']))

# Add sub-headers under the main banner (y=3250)
subheaders = [
    {
        'id': 'subhdr-lifecycle-col1',
        'val': 'OPERATIONAL GOVERNANCE & ARCHITECTURAL RULES',
        'x': 100, 'y': 3250, 'w': 2000, 'h': 45,
        'style': 'whiteSpace=wrap;html=1;fontFamily=Verdana;spacing=8;strokeWidth=1.5;rounded=1;fontStyle=1;fontSize=18;fillColor=#EAF3F9;strokeColor=#32749A;fontColor=#152735;'
    },
    {
        'id': 'subhdr-lifecycle-col2',
        'val': 'UNIFIED WORK LIFECYCLE • VERTICAL PROCESS FLOW',
        'x': 2300, 'y': 3250, 'w': 2000, 'h': 45,
        'style': 'whiteSpace=wrap;html=1;fontFamily=Verdana;spacing=8;strokeWidth=1.5;rounded=1;fontStyle=1;fontSize=18;fillColor=#FFF1E4;strokeColor=#C66B17;fontColor=#152735;'
    },
    {
        'id': 'subhdr-lifecycle-col3',
        'val': 'DOMAIN WORKFLOW IMPLEMENTATIONS (SAME LIFECYCLE ENGINE)',
        'x': 4500, 'y': 3250, 'w': 2000, 'h': 45,
        'style': 'whiteSpace=wrap;html=1;fontFamily=Verdana;spacing=8;strokeWidth=1.5;rounded=1;fontStyle=1;fontSize=18;fillColor=#E8F5EF;strokeColor=#2D7B5C;fontColor=#152735;'
    }
]

# Check if subheaders already exist or need adding to layer2
root_model = root.find('.//root')
for sh in subheaders:
    existing = root.find(f'.//mxCell[@id="{sh["id"]}"]')
    if existing is None:
        new_el = ET.Element('mxCell', {
            'id': sh['id'],
            'value': sh['val'],
            'style': sh['style'],
            'parent': 'layer2',
            'vertex': '1'
        })
        geo = ET.SubElement(new_el, 'mxGeometry', {
            'x': str(sh['x']),
            'y': str(sh['y']),
            'width': str(sh['w']),
            'height': str(sh['h']),
            'as': 'geometry'
        })
        root_model.append(new_el)

# Update Edges
edge_updates = {
    # Phase 1: Straight vertical downward edges
    'edge-371': {
        'style': 'edgeStyle=orthogonalEdgeStyle;rounded=1;endArrow=block;endFill=1;html=1;fontFamily=Verdana;fontSize=15;strokeWidth=1.5;strokeColor=#728294;exitX=0.5;exitY=1;entryX=0.5;entryY=0;',
        'val': '',
        'points': []
    },
    'edge-372': {
        'style': 'edgeStyle=orthogonalEdgeStyle;rounded=1;endArrow=block;endFill=1;html=1;fontFamily=Verdana;fontSize=15;strokeWidth=1.5;strokeColor=#728294;exitX=0.5;exitY=1;entryX=0.5;entryY=0;',
        'val': '',
        'points': []
    },
    'edge-373': {
        'style': 'edgeStyle=orthogonalEdgeStyle;rounded=1;endArrow=block;endFill=1;html=1;fontFamily=Verdana;fontSize=15;strokeWidth=1.5;strokeColor=#728294;exitX=0.5;exitY=1;entryX=0.5;entryY=0;',
        'val': '',
        'points': []
    },
    'edge-374': {
        'style': 'edgeStyle=orthogonalEdgeStyle;rounded=1;endArrow=block;endFill=1;html=1;fontFamily=Verdana;fontSize=15;strokeWidth=1.5;strokeColor=#728294;exitX=0.5;exitY=1;entryX=0.5;entryY=0;',
        'val': '',
        'points': []
    },
    # Transition from Track 1 (Step 5, Assign) to Track 2 (Step 6, Execute):
    # Leaves Step 5 at exitX=1;exitY=0.5, enters Step 6 at entryX=0;entryY=0.5
    'edge-375': {
        'style': 'edgeStyle=orthogonalEdgeStyle;rounded=1;endArrow=block;endFill=1;html=1;fontFamily=Verdana;fontSize=14;strokeWidth=1.5;strokeColor=#2D7B5C;fontColor=#2D7B5C;exitX=1;exitY=0.5;entryX=0;entryY=0.5;',
        'val': 'Hand off to Assignee',
        'points': [(3110, 3777), (3110, 3357)]
    },
    # Phase 2: Straight vertical downward edges
    'edge-376': {
        'style': 'edgeStyle=orthogonalEdgeStyle;rounded=1;endArrow=block;endFill=1;html=1;fontFamily=Verdana;fontSize=15;strokeWidth=1.5;strokeColor=#728294;exitX=0.5;exitY=1;entryX=0.5;entryY=0;',
        'val': '',
        'points': []
    },
    'edge-378': {
        'style': 'edgeStyle=orthogonalEdgeStyle;rounded=1;endArrow=block;endFill=1;html=1;fontFamily=Verdana;fontSize=15;strokeWidth=1.5;strokeColor=#728294;exitX=0.5;exitY=1;entryX=0.5;entryY=0;',
        'val': '',
        'points': []
    },
    'edge-380': {
        'style': 'edgeStyle=orthogonalEdgeStyle;rounded=1;endArrow=block;endFill=1;html=1;fontFamily=Verdana;fontSize=15;strokeWidth=1.5;strokeColor=#728294;exitX=0.5;exitY=1;entryX=0.5;entryY=0;',
        'val': '',
        'points': []
    },
    # Approved? -> Complete & close task (Yes, downward)
    'edge-382': {
        'style': 'edgeStyle=orthogonalEdgeStyle;rounded=1;endArrow=block;endFill=1;html=1;fontFamily=Verdana;fontSize=15;strokeWidth=1.5;strokeColor=#2D7B5C;fontColor=#2D7B5C;exitX=0.5;exitY=1;entryX=0.5;entryY=0;',
        'val': 'Yes',
        'points': []
    },
    # Approved? -> Changes Requested (No, right branch)
    'edge-384': {
        'style': 'edgeStyle=orthogonalEdgeStyle;rounded=1;endArrow=block;endFill=1;html=1;fontFamily=Verdana;fontSize=15;strokeWidth=1.5;strokeColor=#B35C65;fontColor=#B35C65;exitX=1;exitY=0.5;entryX=0;entryY=0.5;',
        'val': 'No',
        'points': []
    },
    # Changes Requested -> Employee revises (downward)
    'edge-386': {
        'style': 'edgeStyle=orthogonalEdgeStyle;rounded=1;endArrow=block;endFill=1;html=1;fontFamily=Verdana;fontSize=15;strokeWidth=1.5;strokeColor=#728294;exitX=0.5;exitY=1;entryX=0.5;entryY=0;',
        'val': '',
        'points': []
    },
    # Employee revises -> loops back up to Manager reviews submission
    'edge-387': {
        'style': 'edgeStyle=orthogonalEdgeStyle;rounded=1;endArrow=block;endFill=1;html=1;fontFamily=Verdana;fontSize=14;strokeWidth=1.5;strokeColor=#2D7B5C;fontColor=#2D7B5C;exitX=1;exitY=0.5;entryX=1;entryY=0.5;',
        'val': 'Resubmit for Review',
        'points': [(4320, 3777), (4320, 3567)]
    }
}

for eid, info in edge_updates.items():
    e = get_cell(eid)
    if e is not None:
        e.set('style', info['style'])
        e.set('value', info['val'])
        geo = e.find('mxGeometry')
        if geo is not None:
            # Clear old Array of points
            old_arr = geo.find('Array')
            if old_arr is not None:
                geo.remove(old_arr)
            # Add new points if specified
            if info['points']:
                arr = ET.SubElement(geo, 'Array', {'as': 'points'})
                for px, py in info['points']:
                    ET.SubElement(arr, 'mxPoint', {'x': str(px), 'y': str(py)})

# Save modified tree to target_path with UTF-8 XML declaration
tree.write(target_path, encoding='utf-8', xml_declaration=True)
print(f"Successfully generated {target_path}")
