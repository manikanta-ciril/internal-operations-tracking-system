import xml.etree.ElementTree as ET
import base64
import zlib
from urllib.parse import unquote

tree = ET.parse('../Flowchart/Actual-FlowChart.drawio')
root = tree.getroot()

def get_mxgraphmodel(diagram):
    model = diagram.find('mxGraphModel')
    if model is None:
        content = diagram.text
        if content:
            decoded = base64.b64decode(content)
            decompressed = zlib.decompress(decoded, -15)
            xml_str = unquote(decompressed.decode('utf-8'))
            return ET.fromstring(xml_str)
    return model

for i, diagram in enumerate(root.findall('diagram')):
    model = get_mxgraphmodel(diagram)
    if model is not None:
        print(f"\n--- Diagram {i}: {diagram.get('name')} ---")
        shapes = set()
        count = 0
        for cell in model.iter('mxCell'):
            style = cell.get('style', '')
            val = cell.get('value', '')
            
            # Print the first 10 node shapes (not edges)
            if 'edge' not in cell.attrib and cell.get('id') not in ('0', '1'):
                count += 1
                if count <= 15:
                    geom = cell.find('mxGeometry')
                    if geom is not None:
                        print(f"[{count}] Value: {val[:30]} | Style: {style[:50]} | pos: {geom.get('x')}, {geom.get('y')} | size: {geom.get('width')}x{geom.get('height')}")
