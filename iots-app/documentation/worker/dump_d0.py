import xml.etree.ElementTree as ET

tree = ET.parse('Actual-FlowChart.drawio')
root = tree.getroot()
d0 = root.findall('diagram')[0]
model0 = d0.find('mxGraphModel')
root0 = model0.find('root')

print(f"=== Diagram 0: {d0.get('name')} ===")
for c in root0.findall('mxCell'):
    cid = c.get('id')
    val = c.get('value', '').replace('\n', ' ')
    style = c.get('style', '')
    v = c.get('vertex')
    e = c.get('edge')
    source = c.get('source')
    target = c.get('target')
    parent = c.get('parent')
    geom = c.find('mxGeometry')
    g_str = ""
    if geom is not None:
        g_str = f"x={geom.get('x')} y={geom.get('y')} w={geom.get('width')} h={geom.get('height')}"
    if v:
        print(f"V [{cid}] (P:{parent}) {g_str} :: {val}")
        print(f"    STYLE: {style}")
    elif e:
        print(f"E [{cid}] {source} -> {target} (P:{parent}) :: {val}")
        print(f"    STYLE: {style}")
