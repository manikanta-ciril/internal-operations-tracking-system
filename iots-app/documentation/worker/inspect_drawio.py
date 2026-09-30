import xml.etree.ElementTree as ET

tree = ET.parse('Actual-FlowChart.drawio')
root = tree.getroot()
for i, d in enumerate(root.findall('diagram')):
    name = d.get('name')
    did = d.get('id')
    print(f"\n==========================================")
    print(f"=== Diagram {i}: {name} (id={did}) ===")
    print(f"==========================================")
    model = d.find('mxGraphModel')
    if model is not None:
        root_cell = model.find('root')
        cells = list(root_cell.findall('mxCell'))
        print(f"Total cells: {len(cells)}")
        vertices = [c for c in cells if c.get('vertex') == '1']
        edges = [c for c in cells if c.get('edge') == '1']
        print(f"Vertices: {len(vertices)}, Edges: {len(edges)}")
        
        # Let's inspect vertices
        print("\n--- Sample Vertices ---")
        for c in vertices:
            val = c.get('value', '').replace('\n', ' ')
            style = c.get('style', '')
            geom = c.find('mxGeometry')
            g_str = f"x={geom.get('x')} y={geom.get('y')} w={geom.get('width')} h={geom.get('height')}" if geom is not None else ""
            parent = c.get('parent')
            print(f"ID: {c.get('id'):<25} | P:{parent:<10} | {g_str:<30} | Val: {val[:40]!r}")
            # print style if interesting
            # print(f"    Style: {style}")

