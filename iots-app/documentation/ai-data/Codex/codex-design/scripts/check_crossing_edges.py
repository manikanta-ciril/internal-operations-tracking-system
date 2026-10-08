import sys
import xml.etree.ElementTree as ET

sys.stdout.reconfigure(encoding='utf-8')

tree = ET.parse('codex-design/new_final-version.drawio')
root = tree.getroot()

# Build map of id -> cell
cell_map = {}
for cell in root.iter('mxCell'):
    cell_map[cell.get('id')] = cell

crossing_edges = []
for cell in root.iter('mxCell'):
    if cell.get('edge') == '1':
        src_id = cell.get('source')
        tgt_id = cell.get('target')
        src = cell_map.get(src_id)
        tgt = cell_map.get(tgt_id)
        
        src_y = None
        tgt_y = None
        if src is not None:
            g = src.find('mxGeometry')
            if g is not None and g.get('y') is not None:
                src_y = float(g.get('y'))
        if tgt is not None:
            g = tgt.find('mxGeometry')
            if g is not None and g.get('y') is not None:
                tgt_y = float(g.get('y'))
                
        if src_y is not None and tgt_y is not None:
            if (src_y < 3900 and tgt_y >= 3900) or (src_y >= 3900 and tgt_y < 3900):
                crossing_edges.append((cell.get('id'), src_id, tgt_id, src_y, tgt_y, cell.get('value', '')))

print(f"Edges crossing y=3900: {len(crossing_edges)}")
for eid, sid, tid, sy, ty, val in crossing_edges:
    print(f"  {eid}: {sid} (y={sy}) -> {tid} (y={ty}) val='{val}'")
