import xml.etree.ElementTree as ET

tree = ET.parse('flowchart-detailed/updated_new_flowchart.drawio')
root = tree.getroot()
model = root.find('.//mxGraphModel')
root_cell = model.find('root')

node_ids = set()
edges = []

for c in root_cell.findall('mxCell'):
    cid = c.get('id')
    v = c.get('vertex')
    e = c.get('edge')
    src = c.get('source')
    tgt = c.get('target')
    if v == '1':
        node_ids.add(cid)
    elif e == '1':
        edges.append((cid, src, tgt, c.get('value', '')))

print(f"Total Vertices: {len(node_ids)}")
print(f"Total Edges: {len(edges)}")

invalid_sources = [e for e in edges if e[1] not in node_ids]
invalid_targets = [e for e in edges if e[2] not in node_ids]

print(f"Edges with invalid sources: {len(invalid_sources)}")
if invalid_sources:
    for e in invalid_sources:
        print("  Invalid src:", e)

print(f"Edges with invalid targets: {len(invalid_targets)}")
if invalid_targets:
    for e in invalid_targets:
        print("  Invalid tgt:", e)

if not invalid_sources and not invalid_targets:
    print("SUCCESS: ALL EDGES HAVE 100% VALID SOURCES AND TARGETS!")
