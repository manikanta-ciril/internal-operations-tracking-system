import xml.etree.ElementTree as ET
import sys
sys.stdout.reconfigure(encoding='utf-8')

tree = ET.parse(r'C:\Users\ciril\OneDrive\Desktop\Manikanta-Files\Git\monitoring-portal\internal-operations-tracking-system\iots-app\documentation\worker\Codex\codex-design\new_final-version.drawio')
root = tree.getroot()
diag = root.find('diagram')
model = diag.find('mxGraphModel')
mxroot = model.find('root')

print("--- Searching for Shared Work Lifecycle elements ---")
lifecycle_cells = []
for cell in mxroot.findall('mxCell'):
    cid = cell.get('id')
    val = cell.get('value', '').replace('\n', ' ')
    style = cell.get('style', '')
    geom = cell.find('mxGeometry')
    parent = cell.get('parent')
    
    # check y position or text around y=3100-3850
    if geom is not None and geom.get('y'):
        try:
            y = float(geom.get('y'))
            if 3100 <= y <= 3890:
                lifecycle_cells.append((cid, parent, geom.get('x'), geom.get('y'), geom.get('width'), geom.get('height'), val[:80], style[:40]))
        except ValueError:
            pass
    elif "shared work lifecycle" in val.lower() or "lifecycle" in val.lower():
        lifecycle_cells.append((cid, parent, None, None, None, None, val[:80], style[:40]))

print(f"Found {len(lifecycle_cells)} cells in the lifecycle Y range (3100 - 3890):")
for item in sorted(lifecycle_cells, key=lambda x: (float(x[3]) if x[3] else 0, float(x[2]) if x[2] else 0)):
    print(f"[{item[0]}] parent={item[1]} x={item[2]} y={item[3]} w={item[4]} h={item[5]} | val={item[6]}")

# Also check edges connected to these cells
cell_ids = {item[0] for item in lifecycle_cells}
print("\n--- Edges connecting lifecycle cells ---")
for cell in mxroot.findall('mxCell'):
    if cell.get('edge') == '1':
        src = cell.get('source')
        tgt = cell.get('target')
        val = cell.get('value', '')
        if src in cell_ids or tgt in cell_ids:
            print(f"Edge [{cell.get('id')}]: {src} -> {tgt} (val='{val}') style='{cell.get('style')[:60]}'")
