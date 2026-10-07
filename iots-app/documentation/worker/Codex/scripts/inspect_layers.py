import xml.etree.ElementTree as ET
import sys
sys.stdout.reconfigure(encoding='utf-8')

tree = ET.parse('new_final-version.drawio')
root = tree.getroot()

diag = root.find('diagram')
model = diag.find('mxGraphModel')
mxroot = model.find('root')

print("=== Major Swimlanes / Containers ===")
for cell in mxroot.findall('mxCell'):
    style = cell.get('style', '')
    val = cell.get('value', '').replace('\n', ' ')
    if 'swimlane' in style or 'group' in style or cell.get('parent') == '1':
        geom = cell.find('mxGeometry')
        if geom is not None and geom.get('width'):
            print(f"ID: {cell.get('id'):20} | Parent: {cell.get('parent'):10} | w={geom.get('width'):5} h={geom.get('height'):5} x={geom.get('x'):5} y={geom.get('y'):5} | val={val[:60]}")
