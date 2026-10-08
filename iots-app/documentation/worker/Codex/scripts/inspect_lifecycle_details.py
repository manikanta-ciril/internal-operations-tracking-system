import sys
import xml.etree.ElementTree as ET

sys.stdout.reconfigure(encoding='utf-8')

tree = ET.parse('codex-design/new_final-version.drawio')
root = tree.getroot()

lifecycle_cell_ids = [
    'new-363', # Banner
    'new-364', # Create task
    'new-365', # Define deliverables
    'new-366', # Set priority & due date
    'new-367', # Check capacity & availability
    'new-368', # Assign task & notify
    'new-369', # Execute work
    'new-370', # Submit deliverables
    'new-377', # Manager reviews submission
    'new-379', # Approved?
    'new-381', # Complete & close task
    'new-383', # Changes Requested
    'new-385', # Employee revises and resubmits
    'new-388', # WORK ACTIVITY ≠ TASK STATE
    'new-389', # BUSINESS LINKAGE
    'new-390', # MEMBERSHIP WORK
    'new-391', # MEMBER DEAL & ROYALTY FOLLOW-UP
    'new-392', # CREATIVE & RESEARCH DELIVERY
]

print("=== LIFECYCLE CELLS DETAIL ===")
for cid in lifecycle_cell_ids:
    c = root.find(f'.//mxCell[@id="{cid}"]')
    if c is not None:
        geo = c.find('mxGeometry')
        print(f"ID: {cid}")
        print(f"  Value: {repr(c.get('value'))}")
        print(f"  Style: {repr(c.get('style'))}")
        if geo is not None:
            print(f"  Geometry: x={geo.get('x')} y={geo.get('y')} w={geo.get('width')} h={geo.get('height')}")
        print()

print("=== LIFECYCLE EDGES DETAIL ===")
for c in root.iter('mxCell'):
    if c.get('edge') == '1':
        src = c.get('source')
        tgt = c.get('target')
        if src in lifecycle_cell_ids or tgt in lifecycle_cell_ids:
            print(f"ID: {c.get('id')}: {src} -> {tgt}")
            print(f"  Value: {repr(c.get('value'))}")
            print(f"  Style: {repr(c.get('style'))}")
            geo = c.find('mxGeometry')
            if geo is not None:
                pts = geo.find('Array')
                if pts is not None:
                    print(f"  Waypoints: {[p.attrib for p in pts.findall('mxPoint')]}")
            print()
