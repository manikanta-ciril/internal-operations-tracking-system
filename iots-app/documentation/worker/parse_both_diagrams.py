import xml.etree.ElementTree as ET

tree = ET.parse('Actual-FlowChart.drawio')
root = tree.getroot()

for d in root.findall('diagram'):
    print(f"==================================================")
    print(f"Diagram: {d.get('name')}")
    print(f"==================================================")
    model = d.find('mxGraphModel')
    root_el = model.find('root')
    for cell in root_el.findall('mxCell'):
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
            print(f"NODE [{cid}] ({g_info}) | Style: {style[:40]} | Text: {val}")
        elif e == '1':
            print(f"EDGE [{cid}] ({src} -> {tgt}) | Style: {style[:40]} | Text: {val}")
