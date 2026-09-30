import xml.etree.ElementTree as ET

tree = ET.parse('Actual-FlowChart.drawio')
root = tree.getroot()
d0 = root.findall('diagram')[0]
model0 = d0.find('mxGraphModel')
root0 = model0.find('root')

print(f"=== Diagram 0: {d0.get('name')} ===")
for cell in root0.findall('mxCell'):
    val = cell.get('value', '').replace('\n', ' ')
    cid = cell.get('id')
    v = cell.get('vertex')
    e = cell.get('edge')
    src = cell.get('source')
    tgt = cell.get('target')
    style = cell.get('style', '')
    geom = cell.find('mxGeometry')
    g_info = ""
    if geom is not None:
        g_info = f"x={geom.get('x')} y={geom.get('y')} w={geom.get('width')} h={geom.get('height')}"
    if v == '1':
        print(f"NODE [{cid}] ({g_info}) | Style: {style[:50]} | Text: {val}")
    elif e == '1':
        print(f"EDGE [{cid}] ({src} -> {tgt}) | Text: {val}")
