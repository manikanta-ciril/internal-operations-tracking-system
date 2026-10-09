import xml.etree.ElementTree as ET

tree = ET.parse('new_final-version.drawio')
root = tree.getroot()

for diag in root.findall('diagram'):
    print(f"Diagram: {diag.get('name')} (id: {diag.get('id')})")
    model = diag.find('mxGraphModel')
    if model is not None:
        print(f"Canvas: {model.get('pageWidth')} x {model.get('pageHeight')}, background: {model.get('background')}")
        mxroot = model.find('root')
        top_cells = []
        for cell in mxroot.findall('mxCell'):
            if cell.get('parent') == '1':
                val = cell.get('value', '').strip()
                style = cell.get('style', '')
                geom = cell.find('mxGeometry')
                coords = f"x={geom.get('x')}, y={geom.get('y')}, w={geom.get('width')}, h={geom.get('height')}" if geom is not None else "no geom"
                top_cells.append((cell.get('id'), val[:60], style[:40], coords))
        print(f"Top-level groups/cells under parent='1': {len(top_cells)}")
        for cid, val, st, coords in top_cells[:35]:
            print(f" - [{cid}] val='{val}' | style='{st}' | {coords}")
