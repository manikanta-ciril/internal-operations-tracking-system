import xml.etree.ElementTree as ET
import sys
sys.stdout.reconfigure(encoding='utf-8')

tree = ET.parse(r'C:\Users\ciril\OneDrive\Desktop\Manikanta-Files\Git\monitoring-portal\internal-operations-tracking-system\iots-app\documentation\worker\Codex\codex-design\new_final-version.drawio')
root = tree.getroot()
diag = root.find('diagram')
model = diag.find('mxGraphModel')
mxroot = model.find('root')

cells_by_id = {cell.get('id'): cell for cell in mxroot.findall('mxCell')}

print("=== Major Structure and Groupings ===")
for cell in mxroot.findall('mxCell'):
    cid = cell.get('id')
    val = cell.get('value', '').replace('\n', ' ')
    style = cell.get('style', '')
    geom = cell.find('mxGeometry')
    if geom is not None and geom.get('width') and float(geom.get('width', 0)) > 500:
        y = geom.get('y', '0')
        x = geom.get('x', '0')
        w = geom.get('width')
        h = geom.get('height')
        parent = cell.get('parent')
        print(f"[{cid}] (parent: {parent}, x={x}, y={y}, w={w}, h={h}): {val[:80]}")
