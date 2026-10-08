import sys
import xml.etree.ElementTree as ET

sys.stdout.reconfigure(encoding='utf-8')

tree = ET.parse('codex-design/new_final-version.drawio')
root = tree.getroot()

print("--- Diagram overview ---")
for diagram in root.iter('diagram'):
    print("Diagram name:", diagram.get('name'))

print("\n--- Key Layout Columns / Sections ---")
for cid in ['layer1', 'layer2', 'layer3', 'new-363', 'new-388', 'new-389', 'new-390', 'new-391', 'new-392', 'new-393', 'new-406', 'new-420']:
    cell = root.find(f'.//mxCell[@id="{cid}"]')
    if cell is not None:
        geo = cell.find('mxGeometry')
        if geo is not None:
            print(f"{cid:10} x={geo.get('x')} y={geo.get('y')} w={geo.get('width')} h={geo.get('height')} val={cell.get('value','')[:40]}")
        else:
            print(f"{cid:10} (no geometry) val={cell.get('value','')[:40]}")

print("\n--- Check all incoming / outgoing edges to lifecycle nodes ---")
lifecycle_ids = set([f"new-{i}" for i in range(363, 393)])
for cell in root.iter('mxCell'):
    src = cell.get('source')
    tgt = cell.get('target')
    if src in lifecycle_ids or tgt in lifecycle_ids:
        print(f"Edge {cell.get('id')}: {src} -> {tgt} (label: '{cell.get('value','')}')")
