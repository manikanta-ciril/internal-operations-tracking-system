import sys
import xml.etree.ElementTree as ET

sys.stdout.reconfigure(encoding='utf-8')

tree = ET.parse('codex-design/new_final-version.drawio')
root = tree.getroot()

# Let's inspect all major section headers and containers
print("=== ALL CONTAINERS AND MAJOR HEADERS ===")
for cell in root.iter('mxCell'):
    style = cell.get('style', '')
    val = cell.get('value', '').replace('\n', ' ')
    geo = cell.find('mxGeometry')
    if geo is not None:
        w = float(geo.get('width', 0))
        h = float(geo.get('height', 0))
        x = float(geo.get('x', 0))
        y = float(geo.get('y', 0))
        if w >= 1500 or 'swimlane' in style or 'fontStyle=1' in style:
            val_clean = val[:60]
            print(f"[{cell.get('id'):10}] parent={cell.get('parent'):10} x={x:6.1f} y={y:6.1f} w={w:6.1f} h={h:6.1f} | {val_clean}")
